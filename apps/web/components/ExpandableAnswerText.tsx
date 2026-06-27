"use client";

import { Minus, Plus, Zap } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { ContextualFlowPlanner } from "@/lib/contextual-flow";
import type { SpanRecord } from "@/lib/store";

const contextualFlowPlanner = new ContextualFlowPlanner();

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  position?: {
    start?: { offset?: number };
    end?: { offset?: number };
  };
};

function rehypeAnswerSpans(spans: SpanRecord[]) {
  return (tree: HastNode) => {
    function splitTextNode(node: HastNode) {
      const startOffset = node.position?.start?.offset;
      const endOffset = node.position?.end?.offset;
      if (typeof startOffset !== "number" || typeof endOffset !== "number" || !node.value) {
        return [node];
      }

      const applicableSpans = spans
        .filter((span) => span.startOffset >= startOffset && span.endOffset <= endOffset && span.startOffset < span.endOffset)
        .sort((a, b) => a.startOffset - b.startOffset);

      const nodes: HastNode[] = [];
      let cursor = 0;
      let absoluteCursor = startOffset;

      for (const span of applicableSpans) {
        if (span.startOffset < absoluteCursor) continue;
        const relativeStart = span.startOffset - startOffset;
        const relativeEnd = span.endOffset - startOffset;
        if (relativeStart > cursor) {
          nodes.push({ type: "text", value: node.value.slice(cursor, relativeStart) });
        }
        nodes.push({
          type: "element",
          tagName: "span",
          properties: {
            "data-forks-span-id": span.id ?? `${span.startOffset}-${span.endOffset}`,
            "data-forks-span-text": span.text,
            "data-forks-span-definition": span.shortDefinition ?? "",
            "data-forks-span-start": String(span.startOffset),
            "data-forks-span-end": String(span.endOffset)
          },
          children: [{ type: "text", value: node.value.slice(relativeStart, relativeEnd) }]
        });
        cursor = relativeEnd;
        absoluteCursor = span.endOffset;
      }

      if (cursor < node.value.length) {
        nodes.push({ type: "text", value: node.value.slice(cursor) });
      }

      return nodes.length > 0 ? nodes : [node];
    }

    function visit(node: HastNode, skipFormattingSurface = false) {
      const shouldSkip =
        skipFormattingSurface ||
        node.tagName === "code" ||
        node.tagName === "pre" ||
        (typeof node.properties?.className === "string" && node.properties.className.includes("katex")) ||
        (Array.isArray(node.properties?.className) && node.properties.className.includes("katex"));

      if (!node.children || shouldSkip) return;

      node.children = node.children.flatMap((child) => {
        if (child.type === "text") {
          return splitTextNode(child);
        }
        visit(child, shouldSkip);
        return [child];
      });
    }

    visit(tree);
  };
}

export function ExpandableAnswerText({
  content,
  spans,
  projectId,
  sourceThreadId
}: {
  content: string;
  spans: SpanRecord[];
  projectId: string;
  sourceThreadId: string;
}) {
  const [expandedSpanIds, setExpandedSpanIds] = useState<Set<string>>(new Set());
  const [poweredSelection, setPoweredSelection] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  function expandSpan(spanId: string) {
    setExpandedSpanIds((current) => new Set(current).add(spanId));
  }

  function condenseSpan(spanId: string) {
    setExpandedSpanIds((current) => {
      const next = new Set(current);
      next.delete(spanId);
      return next;
    });
  }

  function powerSelectedText() {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? "";
    const answerContent = contentRef.current;

    if (!selection || !selectedText || !answerContent || !answerContent.contains(selection.anchorNode) || !answerContent.contains(selection.focusNode)) {
      setPoweredSelection("");
      return;
    }

    // TODO: Replace raw selected text with ContextualFlowPlanner.planExtraction
    // output so powered context can carry structured provenance, references,
    // and surrounding paragraph context.
    setPoweredSelection(selectedText);
  }

  function handlePoweredDragStart(event: DragEvent<HTMLButtonElement>) {
    const startOffset = content.indexOf(poweredSelection);
    const extractionPlan = contextualFlowPlanner.planExtraction({
      paragraph: content,
      selectedText: poweredSelection,
      startOffset,
      endOffset: startOffset + poweredSelection.length,
      operation: "EXTRACTION"
    });

    // TODO: Support COMBINATION and CONSOLIDATION when several powered
    // selections are dragged together or dropped onto an existing flow.
    const payload = {
      projectId,
      sourceThreadId,
      selectedText: extractionPlan.contextualText,
      operation: extractionPlan.operation
    };

    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-forks-context", JSON.stringify(payload));
    event.dataTransfer.setData("text/plain", extractionPlan.contextualText);
  }

  return (
    <>
      <div
        ref={contentRef}
        data-testid="answer-text"
        className={`forks-markdown text-[15px] leading-7 transition ${poweredSelection ? "rounded bg-skywash/35 shadow-[0_0_0_3px_rgba(141,166,139,0.16)]" : ""}`}
        onMouseUp={powerSelectedText}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeAnswerSpans, spans], rehypeKatex]}
          components={{
            code({ className, children, ...props }) {
              const isBlock = className?.includes("language-");
              return (
                <code className={isBlock ? className : "rounded bg-[#eee9dd] px-1.5 py-0.5 font-mono text-[0.92em] text-ink"} {...props}>
                  {children}
                </code>
              );
            },
            pre({ children }) {
              return (
                <pre className="my-4 overflow-x-auto rounded border border-line bg-[#171717] p-4 text-sm leading-6 text-paper">
                  {children}
                </pre>
              );
            },
            span({ children, ...props }) {
              const spanProps = props as Record<string, unknown>;
              const spanId = typeof spanProps["data-forks-span-id"] === "string" ? spanProps["data-forks-span-id"] : "";
              if (!spanId) {
                return <span {...props}>{children}</span>;
              }

              const spanText = typeof spanProps["data-forks-span-text"] === "string" ? spanProps["data-forks-span-text"] : String(children);
              const definition =
                typeof spanProps["data-forks-span-definition"] === "string" && spanProps["data-forks-span-definition"]
                  ? spanProps["data-forks-span-definition"]
                  : `${spanText}: a useful concept to expand.`;
              const startOffset = Number(spanProps["data-forks-span-start"] ?? content.indexOf(spanText));
              const endOffset = Number(spanProps["data-forks-span-end"] ?? startOffset + spanText.length);
              const insertionPlan = contextualFlowPlanner.planInsertion({
                paragraph: content,
                selectedText: spanText,
                supportingText: definition,
                startOffset,
                endOffset,
                operation: "INSERTION"
              });
              const isExpanded = expandedSpanIds.has(spanId);

              if (isExpanded) {
                return (
                  <span key={spanId} className="group/expanded inline" data-testid="expanded-definition">
                    <mark className="rounded bg-transparent text-ink underline decoration-moss decoration-2 underline-offset-4">{insertionPlan.displayedText}</mark>
                    <span className="ml-1 text-sm leading-6 text-neutral-600">{insertionPlan.contextualText}</span>
                    <button
                      type="button"
                      className="invisible ml-1 inline-flex h-5 w-5 translate-y-0.5 items-center justify-center rounded border border-line bg-white text-neutral-600 opacity-0 transition group-hover/expanded:visible group-hover/expanded:opacity-100 group-focus-within/expanded:visible group-focus-within/expanded:opacity-100 hover:border-moss hover:text-ink"
                      aria-label={`Condense definition for ${spanText}`}
                      title="Condense definition"
                      onClick={() => condenseSpan(spanId)}
                    >
                      <Minus size={12} />
                    </button>
                  </span>
                );
              }

              return (
                <span key={spanId} className="group relative inline-block">
                  <mark className="rounded bg-skywash px-1 text-ink underline decoration-moss decoration-2 underline-offset-4">{children}</mark>
                  <span className="invisible absolute left-0 top-7 z-20 w-72 rounded border border-line bg-ink p-3 pr-10 text-sm leading-5 text-paper opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <button
                      type="button"
                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 bg-white text-ink hover:bg-skywash"
                      aria-label={`Add definition for ${spanText} to text`}
                      title="Add to text"
                      onClick={() => expandSpan(spanId)}
                    >
                      <Plus size={13} />
                    </button>
                    <strong className="block pr-3 text-white">{spanText}</strong>
                    <span>{definition}</span>
                  </span>
                </span>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {poweredSelection ? (
        <button
          type="button"
          draggable
          data-testid="powered-selection"
          className="mt-3 inline-flex cursor-grab items-center gap-2 rounded border border-moss bg-white px-3 py-2 text-xs font-semibold text-ink shadow-[0_0_0_3px_rgba(141,166,139,0.14)] active:cursor-grabbing"
          onDragStart={handlePoweredDragStart}
        >
          <Zap size={13} /> Powered context: {poweredSelection}
        </button>
      ) : null}
    </>
  );
}
