import { Pin } from "lucide-react";
import { togglePinAction } from "@/app/actions";
import { ExpandableAnswerText } from "./ExpandableAnswerText";
import { SubmitButton } from "./SubmitButton";
import type { NodeRecord, SpanRecord } from "@/lib/store";

export function AnswerNode({
  node,
  spans,
  projectId,
  threadId,
  isPinned
}: {
  node: NodeRecord;
  spans: SpanRecord[];
  projectId: string;
  threadId: string;
  isPinned: boolean;
}) {
  return (
    <article className="rounded border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-moss">Assistant answer</p>
          <h2 className="mt-1 text-xl font-semibold">{node.title}</h2>
        </div>
        <form action={togglePinAction}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="threadId" value={threadId} />
          <input type="hidden" name="targetId" value={node.id} />
          <input type="hidden" name="targetType" value="NODE" />
          <input type="hidden" name="label" value={node.title ?? "Assistant answer"} />
          <SubmitButton className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 text-sm ${isPinned ? "border-moss bg-skywash" : "border-line bg-paper"}`}>
            <Pin size={14} /> {isPinned ? "Pinned" : "Pin"}
          </SubmitButton>
        </form>
      </div>
      <ExpandableAnswerText content={node.content} spans={spans} projectId={projectId} sourceThreadId={threadId} />
    </article>
  );
}
