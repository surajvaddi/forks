"use client";

import { useState, type DragEvent } from "react";
import { hasPoweredContext, parsePoweredContext, type PoweredContextPayload } from "@/lib/powered-context";

export function usePoweredTextChunkDrop<TElement extends HTMLElement>({
  onDrop,
  stopPropagation = true
}: {
  onDrop: (payload: PoweredContextPayload, event: DragEvent<TElement>) => void;
  stopPropagation?: boolean;
}) {
  const [isPoweredContextOver, setIsPoweredContextOver] = useState(false);

  function handleDragEnter(event: DragEvent<TElement>) {
    if (hasPoweredContext(event.dataTransfer)) {
      setIsPoweredContextOver(true);
    }
  }

  function handleDragOver(event: DragEvent<TElement>) {
    if (!hasPoweredContext(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsPoweredContextOver(true);
  }

  function handleDragLeave() {
    setIsPoweredContextOver(false);
  }

  function handleDrop(event: DragEvent<TElement>) {
    const payload = parsePoweredContext(event.dataTransfer);
    if (!payload) {
      setIsPoweredContextOver(false);
      return;
    }

    event.preventDefault();
    if (stopPropagation) {
      event.stopPropagation();
    }
    setIsPoweredContextOver(false);
    onDrop(payload, event);
  }

  return {
    isPoweredContextOver,
    poweredContextDropHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  };
}
