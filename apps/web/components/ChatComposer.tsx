"use client";

import { Send } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { ComposerForm } from "./ComposerForm";
import { PromptTextarea } from "./PromptTextarea";
import { SubmitButton } from "./SubmitButton";
import type { ComposerChunk } from "@/lib/composer-chunk";
import { clampComposerHeight, defaultComposerHeight } from "@/lib/composer-resize";

export function ChatComposer({ projectId, threadId }: { projectId: string; threadId: string }) {
  const [prompt, setPrompt] = useState("");
  const [chunks, setChunks] = useState<ComposerChunk[]>([]);
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
      <ComposerForm
        className="h-full"
        onSubmitted={() => {
          setPrompt("");
          setChunks([]);
        }}
      >
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="threadId" value={threadId} />
        <div className="flex h-full min-h-0 flex-col gap-2">
          {chunks.length > 0 ? (
            <div className="flex shrink-0 flex-wrap gap-2" data-testid="composer-context-row">
              {chunks.map((chunk) => (
                <div key={chunk.id} className="inline-flex max-w-full items-center gap-2 rounded border border-line bg-white px-2 py-1 text-xs text-neutral-600">
                  <span className="max-w-48 truncate">
                    Context: <span className="font-medium text-ink">{chunk.displayLabel ?? chunk.text}</span>
                  </span>
                  <span className="hidden text-neutral-400 sm:inline">from {chunk.sourceThreadId}</span>
                  <button
                    type="button"
                    className="rounded px-1 text-neutral-400 hover:bg-[#f4d7ce] hover:text-rust"
                    aria-label={`Remove context ${chunk.displayLabel ?? chunk.text}`}
                    onClick={() => setChunks((current) => current.filter((item) => item.id !== chunk.id))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex min-h-0 flex-1 gap-3">
          <PromptTextarea value={prompt} onChange={setPrompt} onChunkCreated={(chunk) => setChunks((current) => [...current, chunk])} />
          <SubmitButton className="grid h-16 w-16 shrink-0 place-items-center rounded bg-ink text-paper" aria-label="Send prompt">
            <Send size={18} />
          </SubmitButton>
          </div>
        </div>
      </ComposerForm>
    </section>
  );
}
