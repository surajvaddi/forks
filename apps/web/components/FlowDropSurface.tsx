"use client";

import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { createThreadFromPoweredContextAction } from "@/app/actions";
import { hasPoweredContext, parsePoweredContext, type PoweredContextPayload } from "@/lib/powered-context";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, [contenteditable='true']"));
}

function createFlowPreviewTitle(payload: PoweredContextPayload) {
  const label = payload.displayLabel || payload.selectedText;
  const normalized = label.replace(/\s+/g, " ").trim();
  return `Flow: ${normalized.length > 38 ? `${normalized.slice(0, 35)}...` : normalized}`;
}

export function FlowDropSurface({ children, className }: { children: ReactNode; className: string }) {
  const [isPoweredDragOver, setIsPoweredDragOver] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<PoweredContextPayload | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  function clearPreview() {
    setIsPoweredDragOver(false);
    setPreviewPayload(null);
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (previewTimerRef.current !== null) {
        window.clearTimeout(previewTimerRef.current);
      }
    };
  }, []);

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (!hasPoweredContext(event.dataTransfer)) return;
    if (isEditableTarget(event.target)) {
      clearPreview();
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsPoweredDragOver(true);

    if (previewTimerRef.current === null) {
      previewTimerRef.current = window.setTimeout(() => {
        previewTimerRef.current = null;
        setPreviewPayload(parsePoweredContext(event.dataTransfer));
      }, 400);
    }
  }

  async function handleDrop(event: DragEvent<HTMLElement>) {
    if (isEditableTarget(event.target)) {
      clearPreview();
      return;
    }

    const payload = parsePoweredContext(event.dataTransfer);
    if (!payload) {
      clearPreview();
      return;
    }

    event.preventDefault();
    clearPreview();
    // TODO: Route this through ContextualFlowPlanner.planCombination or
    // planConsolidation when dropping onto existing threads, notes, or branches.
    const target = await createThreadFromPoweredContextAction(payload);
    if (target) {
      window.location.assign(`/?project=${target.projectId}&thread=${target.threadId}`);
    }
  }

  return (
    <div
      className={`${className} ${isPoweredDragOver ? "ring-2 ring-inset ring-moss/60" : ""}`}
      data-testid="flow-drop-surface"
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          clearPreview();
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {previewPayload ? (
        <div className="pointer-events-none absolute right-6 top-6 z-30 w-72 rounded border border-moss bg-white/95 p-3 text-sm shadow-lg" data-testid="thread-drop-preview">
          <p className="text-xs font-semibold uppercase tracking-wide text-moss">Create new flow</p>
          <p className="mt-1 font-semibold">{createFlowPreviewTitle(previewPayload)}</p>
          <p className="mt-1 line-clamp-2 text-xs text-neutral-600">{previewPayload.contextualText || previewPayload.selectedText}</p>
        </div>
      ) : null}
    </div>
  );
}
