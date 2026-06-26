import { Send } from "lucide-react";
import { submitPromptAction } from "@/app/actions";
import { PromptTextarea } from "./PromptTextarea";
import { SubmitButton } from "./SubmitButton";

export function ChatComposer({ projectId, threadId }: { projectId: string; threadId: string }) {
  return (
    <form action={submitPromptAction} className="border-t border-line bg-paper p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="threadId" value={threadId} />
      <div className="flex gap-3">
        <PromptTextarea />
        <SubmitButton className="grid h-16 w-16 place-items-center rounded bg-ink text-paper" aria-label="Send prompt">
          <Send size={18} />
        </SubmitButton>
      </div>
    </form>
  );
}
