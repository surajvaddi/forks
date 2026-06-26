import { describe, expect, it } from "vitest";
import { splitTextBySpans } from "@/lib/render-spans";

describe("splitTextBySpans", () => {
  it("splits content around valid spans", () => {
    const parts = splitTextBySpans("A distributed job queue retries work.", [
      {
        id: "span_1",
        text: "distributed job queue",
        startOffset: 2,
        endOffset: 23,
        importanceScore: 0.9,
        ambiguityScore: 0.4
      }
    ]);

    expect(parts).toEqual([
      { type: "text", text: "A " },
      {
        type: "span",
        text: "distributed job queue",
        span: expect.objectContaining({ id: "span_1" })
      },
      { type: "text", text: " retries work." }
    ]);
  });

  it("ignores overlapping and invalid spans", () => {
    const parts = splitTextBySpans("abcdef", [
      { text: "abc", startOffset: 0, endOffset: 3, importanceScore: 1, ambiguityScore: 0 },
      { text: "bc", startOffset: 1, endOffset: 3, importanceScore: 1, ambiguityScore: 0 },
      { text: "nope", startOffset: 10, endOffset: 12, importanceScore: 1, ambiguityScore: 0 }
    ]);

    expect(parts.map((part) => part.text).join("")).toBe("abcdef");
    expect(parts.filter((part) => part.type === "span")).toHaveLength(1);
  });
});
