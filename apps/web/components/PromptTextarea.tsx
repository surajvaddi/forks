"use client";

import { useLayoutEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { usePoweredTextChunkDrop } from "@/hooks/usePoweredTextChunkDrop";
import { createPoweredComposerChunk } from "@/lib/composer-chunk";
import { ContextualFlowPlanner } from "@/lib/contextual-flow";
import type { PoweredContextPayload } from "@/lib/powered-context";
import { insertTextAtCaret } from "@/lib/text-insertion";

const contextualFlowPlanner = new ContextualFlowPlanner();

export function PromptTextarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingCaretOffset, setPendingCaretOffset] = useState<number | null>(null);
  const { isPoweredContextOver, poweredContextDropHandlers } = usePoweredTextChunkDrop<HTMLTextAreaElement>({
    onDrop: insertPoweredContext
  });

  useLayoutEffect(() => {
    if (pendingCaretOffset === null) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(pendingCaretOffset, pendingCaretOffset);
    setPendingCaretOffset(null);
  }, [pendingCaretOffset, value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  function insertPoweredContext(payload: PoweredContextPayload, event: DragEvent<HTMLTextAreaElement>) {
    const textarea = textareaRef.current ?? event.currentTarget;
    const selectionStart = textarea.selectionStart ?? value.length;
    const selectionEnd = textarea.selectionEnd ?? selectionStart;
    const chunk = createPoweredComposerChunk(payload);
    // TODO: Replace plain text insertion with a structured composer document
    // model so powered chunks can preserve provenance, collapse/expand metadata,
    // and show source hover affordances without losing natural text editing.
    // TODO: Preserve ComposerChunk records in composer state, render them as
    // inline tokens, and serialize them alongside the submitted prompt.
    // TODO: Allow inserted powered chunks to collapse/expand and expose source
    // project/thread/node/span metadata on hover.
    // TODO: Use ContextualFlowPlanner.planInsertion to adapt chunk text to the
    // surrounding prompt, including grammar, punctuation, and user intent.
    const insertionPlan = contextualFlowPlanner.planInsertion({
      paragraph: value,
      selectedText: chunk.text,
      startOffset: selectionStart,
      endOffset: selectionEnd,
      operation: "INSERTION"
    });
    const insertion = insertTextAtCaret(value, insertionPlan.contextualText, selectionStart, selectionEnd);

    onChange(insertion.value);
    setPendingCaretOffset(insertion.caretOffset);
  }

  return (
    <textarea
      ref={textareaRef}
      name="prompt"
      className={`min-h-0 flex-1 resize-none rounded border bg-white px-3 py-3 text-sm shadow-sm outline-none transition ${
        isPoweredContextOver ? "border-moss ring-2 ring-moss/25" : "border-line focus:border-moss"
      }`}
      placeholder={isPoweredContextOver ? "Drop to insert context" : "Ask a question inside this project..."}
      aria-label="Chat prompt"
      required
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      {...poweredContextDropHandlers}
      onKeyDown={handleKeyDown}
    />
  );
}
