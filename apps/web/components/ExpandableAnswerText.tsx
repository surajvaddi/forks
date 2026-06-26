"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { splitTextBySpans } from "@/lib/render-spans";
import type { SpanRecord } from "@/lib/store";

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
        const isExpanded = expandedSpanIds.has(spanId);

        if (isExpanded) {
          return (
            <span key={spanId} className="mx-0.5 inline rounded-md border border-moss/40 bg-skywash px-1.5 py-1 shadow-[0_0_0_2px_rgba(141,166,139,0.12)]">
              <mark className="rounded bg-transparent text-ink underline decoration-moss decoration-2 underline-offset-4">{part.text}</mark>
              <span className="ml-1 text-sm leading-6 text-neutral-700">{definition}</span>
              <button
                type="button"
                className="ml-1 inline-flex h-5 w-5 translate-y-0.5 items-center justify-center rounded border border-line bg-white text-neutral-600 hover:border-moss hover:text-ink"
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
            <span className="invisible absolute left-0 top-7 z-20 w-72 rounded border border-line bg-ink p-3 text-sm leading-5 text-paper opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <strong className="block text-white">{part.text}</strong>
              <span>{definition}</span>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1 rounded border border-white/20 bg-white px-2 py-1 text-xs font-medium text-ink hover:bg-skywash"
                aria-label={`Add definition for ${part.text} to text`}
                onClick={() => expandSpan(spanId)}
              >
                <Plus size={12} /> Add to text
              </button>
            </span>
          </span>
        );
      })}
    </p>
  );
}
