import { ChatComposer } from "./ChatComposer";
import { AnswerNode } from "./AnswerNode";
import type { ChatTurnRecord, NodeRecord, PinRecord, SpanRecord, ThreadRecord } from "@/lib/store";

export function ChatThread({
  thread,
  turns,
  nodes,
  spans,
  pins,
  projectId
}: {
  thread: ThreadRecord;
  turns: ChatTurnRecord[];
  nodes: NodeRecord[];
  spans: SpanRecord[];
  pins: PinRecord[];
  projectId: string;
}) {
  return (
    <main className="flex min-h-0 flex-col bg-paper" aria-label="Learning chat">
      <header className="border-b border-line bg-paper px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Learning chat thread</p>
        <h2 className="text-2xl font-semibold">{thread.title}</h2>
      </header>

      <section className="min-h-0 flex-1 overflow-auto p-6 forks-scrollbar">
        {turns.length === 0 ? (
          <div className="mx-auto mt-20 max-w-2xl text-center">
            <h3 className="text-3xl font-semibold">Ask into the project.</h3>
            <p className="mt-3 text-neutral-600">
              The answer will stay conversational, then become hoverable, branchable, pinnable project knowledge.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            {turns.map((turn) => {
              if (turn.role === "USER") {
                return (
                  <div key={turn.id} className="ml-auto max-w-2xl rounded border border-line bg-[#e8ded0] px-4 py-3 text-sm">
                    {turn.content}
                  </div>
                );
              }

              const node = nodes.find((item) => item.chatTurnId === turn.id);
              if (!node) {
                return (
                  <div key={turn.id} className="rounded border border-line bg-white p-4">
                    {turn.content}
                  </div>
                );
              }

              return (
                <AnswerNode
                  key={turn.id}
                  node={node}
                  spans={spans.filter((span) => span.nodeId === node.id)}
                  projectId={projectId}
                  threadId={thread.id}
                  isPinned={pins.some((pin) => pin.targetId === node.id && pin.targetType === "NODE")}
                />
              );
            })}
          </div>
        )}
      </section>

      <ChatComposer projectId={projectId} threadId={thread.id} />
    </main>
  );
}
