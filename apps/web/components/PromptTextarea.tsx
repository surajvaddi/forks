"use client";

import { useLayoutEffect, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { ContextualFlowPlanner } from "@/lib/contextual-flow";
import { getPoweredContextInsertText, hasPoweredContext, parsePoweredContext } from "@/lib/powered-context";

const contextualFlowPlanner = new ContextualFlowPlanner();

function insertTextAtSelection(value: string, insertText: string, selectionStart: number, selectionEnd: number) {
  return `${value.slice(0, selectionStart)}${insertText}${value.slice(selectionEnd)}`;
}

export function PromptTextarea({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPoweredContextOver, setIsPoweredContextOver] = useState(false);
  const [pendingCaretOffset, setPendingCaretOffset] = useState<number | null>(null);

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

  function handleDragOver(event: DragEvent<HTMLTextAreaElement>) {
    if (!hasPoweredContext(event.dataTransfer)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsPoweredContextOver(true);
  }

  function handleDragEnter(event: DragEvent<HTMLTextAreaElement>) {
    if (hasPoweredContext(event.dataTransfer)) {
      setIsPoweredContextOver(true);
    }
  }

  function handleDragLeave() {
    setIsPoweredContextOver(false);
  }

  function handleDrop(event: DragEvent<HTMLTextAreaElement>) {
    const payload = parsePoweredContext(event.dataTransfer);
    if (!payload) {
      setIsPoweredContextOver(false);
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setIsPoweredContextOver(false);

    const textarea = textareaRef.current ?? event.currentTarget;
    const selectionStart = textarea.selectionStart ?? value.length;
    const selectionEnd = textarea.selectionEnd ?? selectionStart;
    const rawChunkText = getPoweredContextInsertText(payload);
    // TODO: Replace plain text insertion with a structured composer document
    // model so powered chunks can preserve provenance, collapse/expand metadata,
    // and show source hover affordances without losing natural text editing.
    // TODO: Use ContextualFlowPlanner.planInsertion to adapt chunk text to the
    // surrounding prompt, including grammar, punctuation, and user intent.
    const insertionPlan = contextualFlowPlanner.planInsertion({
      paragraph: value,
      selectedText: rawChunkText,
      startOffset: selectionStart,
      endOffset: selectionEnd,
      operation: "INSERTION"
    });
    const nextValue = insertTextAtSelection(value, insertionPlan.contextualText, selectionStart, selectionEnd);
    const nextCaret = selectionStart + insertionPlan.contextualText.length;

    onChange(nextValue);
    setPendingCaretOffset(nextCaret);
  }

  return (
    <textarea
      ref={textareaRef}
      name="prompt"
      className={`min-h-16 flex-1 resize-none rounded border bg-white px-3 py-3 text-sm shadow-sm outline-none transition ${
        isPoweredContextOver ? "border-moss ring-2 ring-moss/25" : "border-line focus:border-moss"
      }`}
      placeholder={isPoweredContextOver ? "Drop to insert context" : "Ask a question inside this project..."}
      aria-label="Chat prompt"
      required
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
    />
  );
}
