import { ChatComposer } from "./ChatComposer";
import { AnswerNode } from "./AnswerNode";
import { mergeSpinOffBackAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import type { ChatTurnRecord, NodeRecord, PinRecord, SpanRecord, ThreadLinkRecord, ThreadRecord } from "@/lib/store";

export function ChatThread({
  thread,
  turns,
  nodes,
  spans,
  pins,
  projectId,
  threadLinks,
  threads
}: {
  thread: ThreadRecord;
  turns: ChatTurnRecord[];
  nodes: NodeRecord[];
  spans: SpanRecord[];
  pins: PinRecord[];
  projectId: string;
  threadLinks: ThreadLinkRecord[];
  threads: ThreadRecord[];
}) {
  const sourceLink = threadLinks.find((link) => link.targetThreadId === thread.id && link.type === "SPUN_OFF_FROM");
  const sourceThread = sourceLink ? threads.find((item) => item.id === sourceLink.sourceThreadId) : undefined;
  const childSpinOffs = threadLinks.filter((link) => link.sourceThreadId === thread.id && link.type === "SPUN_OFF_FROM");
  const mergedNodes = nodes.filter((node) => node.threadId === thread.id && node.type === "MERGED_NOTE" && !node.chatTurnId);

  return (
    <main className="flex min-h-0 flex-col overflow-hidden bg-paper max-md:flex-1" aria-label="Learning chat">
      <header className="border-b border-line bg-paper px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Learning chat thread</p>
        <h2 className="text-2xl font-semibold">{thread.title}</h2>
        {sourceLink ? (
          <div className="mt-3 flex max-w-full flex-wrap items-center gap-2 rounded border border-line bg-white px-3 py-2 text-xs text-neutral-600" data-testid="source-thread-chip">
            <div className="min-w-0 flex flex-1 flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">Spun off from:</span>
              {sourceThread ? (
                <a className="font-medium text-moss hover:underline" href={`/?project=${projectId}&thread=${sourceThread.id}`}>
                  {sourceThread.title}
                </a>
              ) : (
                <span className="font-medium text-neutral-500">Source thread unavailable</span>
              )}
              {sourceLink.sourceText ? <span className="max-w-[28rem] truncate text-neutral-500">“{sourceLink.sourceText}”</span> : null}
            </div>
            <form action={mergeSpinOffBackAction}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="threadId" value={thread.id} />
              <SubmitButton className="rounded bg-moss px-2.5 py-1.5 text-xs text-white">Merge back</SubmitButton>
            </form>
          </div>
        ) : null}
        {childSpinOffs.length > 0 ? (
          <div className="mt-3 rounded border border-line bg-white px-3 py-2 text-xs text-neutral-600" data-testid="thread-spin-off-count">
            <span className="font-semibold text-ink">{childSpinOffs.length}</span> open spin-off{childSpinOffs.length === 1 ? "" : "s"} from this thread
          </div>
        ) : null}
      </header>

      <section className="min-h-0 flex-1 overflow-auto p-6 forks-scrollbar" data-testid="chat-transcript">
        {turns.length === 0 ? (
          <div className="mx-auto mt-20 max-w-2xl text-center">
            <h3 className="text-3xl font-semibold">Ask into the project.</h3>
            <p className="mt-3 text-neutral-600">
              The answer will stay conversational, then become hoverable, reusable project knowledge.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {turns.map((turn) => {
              if (turn.role === "USER") {
                return (
                  <div key={turn.id} className="flex justify-end pr-10 max-md:pr-4" data-testid="user-turn">
                    <div className="max-w-[68%] rounded border border-line bg-[#e8ded0] px-4 py-3 text-sm shadow-sm">
                      {turn.content}
                    </div>
                  </div>
                );
              }

              const node = nodes.find((item) => item.chatTurnId === turn.id);
              if (!node) {
                return (
                  <div key={turn.id} className="mx-auto max-w-3xl rounded border border-line bg-white p-4">
                    {turn.content}
                  </div>
                );
              }

              return (
                <div key={turn.id} className="mx-auto max-w-3xl">
                  <AnswerNode
                    node={node}
                    spans={spans.filter((span) => span.nodeId === node.id)}
                    projectId={projectId}
                    threadId={thread.id}
                    isPinned={pins.some((pin) => pin.targetId === node.id && pin.targetType === "NODE")}
                  />
                </div>
              );
            })}
            {mergedNodes.map((node) => (
              <div key={node.id} className="mx-auto max-w-3xl rounded border border-moss bg-white p-4 shadow-sm" data-testid="merged-insight">
                <p className="text-xs font-semibold uppercase tracking-wide text-moss">Merged insight</p>
                <h3 className="mt-1 text-lg font-semibold">{node.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">{node.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <ChatComposer projectId={projectId} threadId={thread.id} />
    </main>
  );
}
