import { Send } from "lucide-react";
import { submitPromptAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";

export function ChatComposer({ projectId, threadId }: { projectId: string; threadId: string }) {
  return (
    <form action={submitPromptAction} className="border-t border-line bg-paper p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="threadId" value={threadId} />
      <div className="flex gap-3">
        <textarea
          name="prompt"
          className="min-h-16 flex-1 resize-none rounded border border-line bg-white px-3 py-3 text-sm shadow-sm outline-none focus:border-moss"
          placeholder="Ask a question inside this project..."
          aria-label="Chat prompt"
          required
        />
        <SubmitButton className="grid h-16 w-16 place-items-center rounded bg-ink text-paper" aria-label="Send prompt">
          <Send size={18} />
        </SubmitButton>
      </div>
    </form>
  );
}
