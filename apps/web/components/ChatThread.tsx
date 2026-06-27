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
    <main className="flex min-h-0 flex-col bg-paper max-md:flex-1" aria-label="Learning chat">
      <header className="border-b border-line bg-paper px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Learning chat thread</p>
        <h2 className="text-2xl font-semibold">{thread.title}</h2>
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
          </div>
        )}
      </section>

      <ChatComposer projectId={projectId} threadId={thread.id} />
    </main>
  );
}
