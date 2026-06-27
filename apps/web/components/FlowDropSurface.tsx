"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { createThreadFromPoweredContextAction } from "@/app/actions";

type PoweredContextPayload = {
  projectId: string;
  sourceThreadId: string;
  selectedText: string;
};

function readPoweredContext(event: DragEvent<HTMLElement>): PoweredContextPayload | null {
  const raw = event.dataTransfer.getData("application/x-forks-context");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PoweredContextPayload;
    return parsed.projectId && parsed.sourceThreadId && parsed.selectedText ? parsed : null;
  } catch {
    return null;
  }
}

export function FlowDropSurface({ children, className }: { children: ReactNode; className: string }) {
  const [isPoweredDragOver, setIsPoweredDragOver] = useState(false);

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (event.dataTransfer.types.includes("application/x-forks-context")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      setIsPoweredDragOver(true);
    }
  }

  async function handleDrop(event: DragEvent<HTMLElement>) {
    const payload = readPoweredContext(event);
    if (!payload) {
      setIsPoweredDragOver(false);
      return;
    }

    event.preventDefault();
    setIsPoweredDragOver(false);
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
      onDragLeave={() => setIsPoweredDragOver(false)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}
