"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { ComposerForm } from "./ComposerForm";
import { PromptTextarea } from "./PromptTextarea";
import { SubmitButton } from "./SubmitButton";

export function ChatComposer({ projectId, threadId }: { projectId: string; threadId: string }) {
  const [prompt, setPrompt] = useState("");

  return (
    <ComposerForm onSubmitted={() => setPrompt("")}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="threadId" value={threadId} />
      <div className="flex gap-3">
        <PromptTextarea value={prompt} onChange={setPrompt} />
        <SubmitButton className="grid h-16 w-16 place-items-center rounded bg-ink text-paper" aria-label="Send prompt">
          <Send size={18} />
        </SubmitButton>
      </div>
    </ComposerForm>
  );
}
