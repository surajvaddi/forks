import type { ContextualFlowOperation } from "./contextual-flow";

export const poweredContextMimeType = "application/x-forks-context";

export type PoweredContextPayload = {
  projectId: string;
  sourceThreadId: string;
  selectedText: string;
  operation: ContextualFlowOperation;
  sourceNodeId?: string;
  sourceSpanId?: string;
  displayLabel?: string;
  contextualText?: string;
};

type TransferLike = {
  getData(type: string): string;
  types: ArrayLike<string> | DOMStringList;
};

function hasTransferType(types: ArrayLike<string> | DOMStringList, type: string) {
  if (typeof (types as DOMStringList).contains === "function") {
    return (types as DOMStringList).contains(type);
  }
  return Array.from(types as ArrayLike<string>).includes(type);
}

function isPoweredContextPayload(value: unknown): value is PoweredContextPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<PoweredContextPayload>;
  return (
    typeof payload.projectId === "string" &&
    payload.projectId.length > 0 &&
    typeof payload.sourceThreadId === "string" &&
    payload.sourceThreadId.length > 0 &&
    typeof payload.selectedText === "string" &&
    payload.selectedText.length > 0 &&
    (payload.operation === "INSERTION" || payload.operation === "EXTRACTION" || payload.operation === "COMBINATION" || payload.operation === "CONSOLIDATION")
  );
}

export function serializePoweredContext(payload: PoweredContextPayload) {
  return JSON.stringify(payload);
}

export function hasPoweredContext(dataTransfer: TransferLike) {
  return hasTransferType(dataTransfer.types, poweredContextMimeType);
}

export function parsePoweredContext(dataTransfer: TransferLike): PoweredContextPayload | null {
  if (!hasPoweredContext(dataTransfer)) return null;
  const raw = dataTransfer.getData(poweredContextMimeType);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isPoweredContextPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function getPoweredContextInsertText(payload: PoweredContextPayload) {
  return payload.contextualText?.trim() || payload.selectedText;
}
