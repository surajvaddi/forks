import { Pin } from "lucide-react";
import { splitTextBySpans } from "@/lib/render-spans";
import { togglePinAction } from "@/app/actions";
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
  const parts = splitTextBySpans(node.content, spans);
  const definitionMap = new Map(spans.map((span) => [span.id, span.shortDefinition ?? `${span.text}: a useful concept to expand.`]));

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
      <p className="text-[15px] leading-7">
        {parts.map((part, index) =>
          part.type === "text" ? (
            <span key={index}>{part.text}</span>
          ) : (
            <span key={part.span.id ?? index} className="group relative inline-block">
              <mark className="rounded bg-skywash px-1 text-ink underline decoration-moss decoration-2 underline-offset-4">{part.text}</mark>
              <span className="invisible absolute left-0 top-7 z-20 w-72 rounded border border-line bg-ink p-3 text-sm leading-5 text-paper opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                <strong className="block text-white">{part.text}</strong>
                {definitionMap.get(part.span.id ?? "")}
              </span>
            </span>
          )
        )}
      </p>
    </article>
  );
}
