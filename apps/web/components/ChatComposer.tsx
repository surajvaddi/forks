"use client";

import { Send } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { ComposerForm } from "./ComposerForm";
import { PromptTextarea } from "./PromptTextarea";
import { SubmitButton } from "./SubmitButton";
import { clampComposerHeight, defaultComposerHeight } from "@/lib/composer-resize";

export function ChatComposer({ projectId, threadId }: { projectId: string; threadId: string }) {
  const [prompt, setPrompt] = useState("");
  const [composerHeight, setComposerHeight] = useState(defaultComposerHeight);
  const resizeStartRef = useRef<{ pointerId: number; startY: number; startHeight: number } | null>(null);

  function handleResizeStart(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStartRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startHeight: composerHeight
    };
  }

  function handleResizeMove(event: PointerEvent<HTMLButtonElement>) {
    const resizeStart = resizeStartRef.current;
    if (!resizeStart || resizeStart.pointerId !== event.pointerId) return;
    const nextHeight = resizeStart.startHeight + resizeStart.startY - event.clientY;
    setComposerHeight(clampComposerHeight(nextHeight, window.innerHeight));
  }

  function handleResizeEnd(event: PointerEvent<HTMLButtonElement>) {
    const resizeStart = resizeStartRef.current;
    if (!resizeStart || resizeStart.pointerId !== event.pointerId) return;
    resizeStartRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <section
      className="relative shrink-0"
      data-testid="chat-composer"
      style={{ height: composerHeight }}
      aria-label="Resizable chat composer"
    >
      <button
        type="button"
        className="absolute -top-2 left-0 right-0 z-10 hidden h-4 cursor-ns-resize items-center justify-center text-neutral-400 outline-none hover:text-moss focus-visible:text-moss md:flex"
        aria-label="Resize chat composer"
        data-testid="composer-resize-handle"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
      >
        <span className="h-1 w-12 rounded-full bg-current" />
      </button>
      <ComposerForm className="h-full" onSubmitted={() => setPrompt("")}>
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="threadId" value={threadId} />
        <div className="flex h-full min-h-0 gap-3">
          <PromptTextarea value={prompt} onChange={setPrompt} />
          <SubmitButton className="grid h-16 w-16 shrink-0 place-items-center rounded bg-ink text-paper" aria-label="Send prompt">
            <Send size={18} />
          </SubmitButton>
        </div>
      </ComposerForm>
    </section>
  );
}
