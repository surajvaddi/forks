import type { SpanDraft } from "./domain";

export type TextPart =
  | { type: "text"; text: string }
  | { type: "span"; text: string; span: SpanDraft & { id?: string } };

export function splitTextBySpans(content: string, spans: Array<SpanDraft & { id?: string }>): TextPart[] {
  const valid = [...spans]
    .filter((span) => span.startOffset >= 0 && span.endOffset <= content.length && span.startOffset < span.endOffset)
    .sort((a, b) => a.startOffset - b.startOffset);

  const parts: TextPart[] = [];
  let cursor = 0;

  for (const span of valid) {
    if (span.startOffset < cursor) {
      continue;
    }

    if (span.startOffset > cursor) {
      parts.push({ type: "text", text: content.slice(cursor, span.startOffset) });
    }

    parts.push({ type: "span", text: content.slice(span.startOffset, span.endOffset), span });
    cursor = span.endOffset;
  }

  if (cursor < content.length) {
    parts.push({ type: "text", text: content.slice(cursor) });
  }

  return parts;
}
