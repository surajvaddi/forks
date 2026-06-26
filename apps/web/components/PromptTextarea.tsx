"use client";

import { type KeyboardEvent } from "react";

export function PromptTextarea() {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <textarea
      name="prompt"
      className="min-h-16 flex-1 resize-none rounded border border-line bg-white px-3 py-3 text-sm shadow-sm outline-none focus:border-moss"
      placeholder="Ask a question inside this project..."
      aria-label="Chat prompt"
      required
      onKeyDown={handleKeyDown}
    />
  );
}
