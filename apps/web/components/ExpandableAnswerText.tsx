"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { ContextualFlowPlanner } from "@/lib/contextual-flow";
import { splitTextBySpans } from "@/lib/render-spans";
import type { SpanRecord } from "@/lib/store";

const contextualFlowPlanner = new ContextualFlowPlanner();

export function ExpandableAnswerText({ content, spans }: { content: string; spans: SpanRecord[] }) {
  const [expandedSpanIds, setExpandedSpanIds] = useState<Set<string>>(new Set());
  const parts = splitTextBySpans(content, spans);

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

  return (
    <p className="text-[15px] leading-7">
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.text}</span>;
        }

        const spanId = part.span.id ?? `${part.span.startOffset}-${part.span.endOffset}`;
        const definition = part.span.shortDefinition ?? `${part.text}: a useful concept to expand.`;
        const insertionPlan = contextualFlowPlanner.planInsertion({
          paragraph: content,
          selectedText: part.text,
          supportingText: definition,
          startOffset: part.span.startOffset,
          endOffset: part.span.endOffset,
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
                aria-label={`Condense definition for ${part.text}`}
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
            <mark className="rounded bg-skywash px-1 text-ink underline decoration-moss decoration-2 underline-offset-4">{part.text}</mark>
            <span className="invisible absolute left-0 top-7 z-20 w-72 rounded border border-line bg-ink p-3 pr-10 text-sm leading-5 text-paper opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 bg-white text-ink hover:bg-skywash"
                aria-label={`Add definition for ${part.text} to text`}
                title="Add to text"
                onClick={() => expandSpan(spanId)}
              >
                <Plus size={13} />
              </button>
              <strong className="block pr-3 text-white">{part.text}</strong>
              <span>{definition}</span>
            </span>
          </span>
        );
      })}
    </p>
  );
}
