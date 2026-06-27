import { getPoweredContextInsertText, type PoweredContextPayload } from "./powered-context";

export type ComposerChunk = {
  id: string;
  kind: "POWERED_CONTEXT";
  text: string;
  sourceProjectId: string;
  sourceThreadId: string;
  sourceNodeId?: string;
  sourceSpanId?: string;
  displayLabel?: string;
  createdAt: Date;
};

function createChunkId() {
  return `chunk_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

export function createPoweredComposerChunk(payload: PoweredContextPayload, createdAt = new Date()): ComposerChunk {
  return {
    id: createChunkId(),
    kind: "POWERED_CONTEXT",
    text: getPoweredContextInsertText(payload),
    sourceProjectId: payload.projectId,
    sourceThreadId: payload.sourceThreadId,
    sourceNodeId: payload.sourceNodeId,
    sourceSpanId: payload.sourceSpanId,
    displayLabel: payload.displayLabel,
    createdAt
  };
}

export function serializeComposerChunk(chunk: ComposerChunk) {
  return JSON.stringify({ ...chunk, createdAt: chunk.createdAt.toISOString() });
}

export function parseComposerChunk(serialized: string): ComposerChunk | null {
  try {
    const parsed = JSON.parse(serialized) as Partial<ComposerChunk> & { createdAt?: string };
    if (parsed.kind !== "POWERED_CONTEXT" || !parsed.id || !parsed.text || !parsed.sourceProjectId || !parsed.sourceThreadId || !parsed.createdAt) {
      return null;
    }
    return {
      id: parsed.id,
      kind: "POWERED_CONTEXT",
      text: parsed.text,
      sourceProjectId: parsed.sourceProjectId,
      sourceThreadId: parsed.sourceThreadId,
      sourceNodeId: parsed.sourceNodeId,
      sourceSpanId: parsed.sourceSpanId,
      displayLabel: parsed.displayLabel,
      createdAt: new Date(parsed.createdAt)
    };
  } catch {
    return null;
  }
}
