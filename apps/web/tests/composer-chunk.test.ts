import { describe, expect, it } from "vitest";
import { createPoweredComposerChunk, parseComposerChunk, serializeComposerChunk } from "@/lib/composer-chunk";
import type { PoweredContextPayload } from "@/lib/powered-context";

describe("composer chunks", () => {
  const payload: PoweredContextPayload = {
    projectId: "project_1",
    sourceThreadId: "thread_1",
    sourceNodeId: "node_1",
    sourceSpanId: "span_1",
    selectedText: "core concept",
    contextualText: "core concept with context",
    displayLabel: "core concept",
    operation: "EXTRACTION"
  };

  it("creates a powered context chunk from a drag payload", () => {
    const chunk = createPoweredComposerChunk(payload, new Date("2026-06-27T12:00:00.000Z"));

    expect(chunk.kind).toBe("POWERED_CONTEXT");
    expect(chunk.text).toBe("core concept with context");
    expect(chunk.sourceProjectId).toBe("project_1");
    expect(chunk.sourceThreadId).toBe("thread_1");
    expect(chunk.sourceNodeId).toBe("node_1");
    expect(chunk.sourceSpanId).toBe("span_1");
    expect(chunk.displayLabel).toBe("core concept");
  });

  it("serializes powered chunk provenance", () => {
    const chunk = createPoweredComposerChunk(payload, new Date("2026-06-27T12:00:00.000Z"));
    const parsed = parseComposerChunk(serializeComposerChunk(chunk));

    expect(parsed).toMatchObject({
      id: chunk.id,
      kind: "POWERED_CONTEXT",
      text: "core concept with context",
      sourceProjectId: "project_1",
      sourceThreadId: "thread_1",
      sourceNodeId: "node_1",
      sourceSpanId: "span_1"
    });
    expect(parsed?.createdAt.toISOString()).toBe("2026-06-27T12:00:00.000Z");
  });
});
