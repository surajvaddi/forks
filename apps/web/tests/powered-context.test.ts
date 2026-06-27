import { describe, expect, it } from "vitest";
import {
  getPoweredContextInsertText,
  hasPoweredContext,
  parsePoweredContext,
  poweredContextMimeType,
  serializePoweredContext,
  type PoweredContextPayload
} from "@/lib/powered-context";

function transferWith(data: Record<string, string>) {
  return {
    types: Object.keys(data),
    getData(type: string) {
      return data[type] ?? "";
    }
  };
}

describe("powered context payload helpers", () => {
  const payload: PoweredContextPayload = {
    projectId: "project_1",
    sourceThreadId: "thread_1",
    selectedText: "core concept",
    contextualText: "core concept with surrounding context",
    operation: "EXTRACTION",
    sourceNodeId: "node_1",
    sourceSpanId: "span_1",
    displayLabel: "core concept"
  };

  it("parses valid powered-context drag payloads", () => {
    const transfer = transferWith({ [poweredContextMimeType]: serializePoweredContext(payload) });

    expect(hasPoweredContext(transfer)).toBe(true);
    expect(parsePoweredContext(transfer)).toEqual(payload);
  });

  it("rejects malformed JSON", () => {
    const transfer = transferWith({ [poweredContextMimeType]: "{nope" });

    expect(parsePoweredContext(transfer)).toBeNull();
  });

  it("rejects missing required fields", () => {
    const transfer = transferWith({ [poweredContextMimeType]: JSON.stringify({ projectId: "project_1", selectedText: "core concept" }) });

    expect(parsePoweredContext(transfer)).toBeNull();
  });

  it("preserves contextual text separately from display text", () => {
    const transfer = transferWith({ [poweredContextMimeType]: serializePoweredContext(payload) });
    const parsed = parsePoweredContext(transfer);

    expect(parsed?.selectedText).toBe("core concept");
    expect(parsed?.contextualText).toBe("core concept with surrounding context");
    expect(getPoweredContextInsertText(parsed!)).toBe("core concept with surrounding context");
  });
});
