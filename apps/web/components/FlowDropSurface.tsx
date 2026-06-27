"use client";

import { useState, type DragEvent, type ReactNode } from "react";
import { createThreadFromPoweredContextAction } from "@/app/actions";
import { hasPoweredContext, parsePoweredContext } from "@/lib/powered-context";

export function FlowDropSurface({ children, className }: { children: ReactNode; className: string }) {
  const [isPoweredDragOver, setIsPoweredDragOver] = useState(false);

  function handleDragOver(event: DragEvent<HTMLElement>) {
    if (hasPoweredContext(event.dataTransfer)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      setIsPoweredDragOver(true);
    }
  }

  async function handleDrop(event: DragEvent<HTMLElement>) {
    const payload = parsePoweredContext(event.dataTransfer);
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
