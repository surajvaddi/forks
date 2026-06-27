import { Bookmark, GitBranch, MessageSquare, MessageSquarePlus } from "lucide-react";
import { createThreadAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import type { ExportRecord, MergedNoteRecord, PinRecord, ProjectRecord, ProjectThreadSummary, ThreadLinkRecord, ThreadRecord } from "@/lib/store";

export function ProjectHome({
  project,
  threads,
  threadLinks,
  threadSummaries,
  pins,
  notes,
  exports
}: {
  project: ProjectRecord;
  threads: ThreadRecord[];
  threadLinks: ThreadLinkRecord[];
  threadSummaries: ProjectThreadSummary[];
  pins: PinRecord[];
  notes: MergedNoteRecord[];
  exports: ExportRecord[];
}) {
  const projectThreads = threads.filter((thread) => thread.projectId === project.id);
  const spinOffCount = threadLinks.filter((link) => link.type === "SPUN_OFF_FROM").length;
  const rootSummaries = threadSummaries.filter((summary) => !summary.sourceThreadId);

  return (
    <main className="min-h-0 overflow-auto bg-paper p-6 forks-scrollbar" aria-label="Project home">
      <section className="mx-auto max-w-5xl space-y-6" data-testid="project-home">
        <header className="border-b border-line pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Project map</p>
              <h2 className="mt-1 text-3xl font-semibold">{project.title}</h2>
              {project.description ? <p className="mt-2 max-w-2xl text-sm text-neutral-600">{project.description}</p> : null}
            </div>
            <form action={createThreadAction} className="flex min-w-72 gap-2 rounded border border-line bg-white p-2 shadow-sm">
              <input type="hidden" name="projectId" value={project.id} />
              <input
                name="title"
                className="min-w-0 flex-1 rounded bg-paper px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-moss"
                placeholder="New thread"
                aria-label="New thread from project home"
              />
              <SubmitButton className="grid h-8 w-8 place-items-center rounded bg-rust text-white" aria-label="Add thread from project home">
                <MessageSquarePlus size={16} />
              </SubmitButton>
            </form>
          </div>
          <div className="mt-5 grid grid-cols-5 gap-2 max-lg:grid-cols-3 max-sm:grid-cols-2">
            {[
              ["Threads", projectThreads.length],
              ["Spin-offs", spinOffCount],
              ["Saved context", pins.length],
              ["Notes", notes.length],
              ["Exports", exports.length]
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-line bg-white px-3 py-2">
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-xs text-neutral-500">{label}</p>
              </div>
            ))}
          </div>
        </header>

        <section aria-label="Project flow tree" data-testid="project-flow-tree">
          <div className="mb-3 flex items-center gap-2">
            <GitBranch size={18} className="text-moss" />
            <h3 className="text-lg font-semibold">Threads and spin-offs</h3>
          </div>
          <div className="space-y-3">
            {rootSummaries.length === 0 ? (
              <p className="rounded border border-line bg-white p-4 text-sm text-neutral-600">Create a thread to start mapping this project.</p>
            ) : (
              rootSummaries.map((summary) => (
                <ThreadTreeItem key={summary.threadId} projectId={project.id} summary={summary} summaries={threadSummaries} depth={0} />
              ))
            )}
          </div>
        </section>

        <section aria-label="Saved project context" data-testid="project-saved-context">
          <div className="mb-3 flex items-center gap-2">
            <Bookmark size={18} className="text-rust" />
            <h3 className="text-lg font-semibold">Saved context</h3>
          </div>
          {pins.length === 0 ? (
            <p className="rounded border border-line bg-white p-4 text-sm text-neutral-600">
              Save answers, spans, concepts, and spin-offs to keep important context close to the project.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              {pins.slice(0, 6).map((pin) => (
                <div key={pin.id} className="rounded border border-line bg-white p-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{pin.targetType.toLowerCase()}</p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium">{pin.label}</p>
                  {pin.note ? <p className="mt-1 line-clamp-2 text-xs text-neutral-600">{pin.note}</p> : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function ThreadTreeItem({
  projectId,
  summary,
  summaries,
  depth
}: {
  projectId: string;
  summary: ProjectThreadSummary;
  summaries: ProjectThreadSummary[];
  depth: number;
}) {
  const children = summaries.filter((item) => item.sourceThreadId === summary.threadId);
  const preview = summary.lastTurnContent?.replace(/\s+/g, " ").trim();

  return (
    <div className={depth > 0 ? "ml-6 border-l border-line pl-4" : ""} data-testid={depth > 0 ? "project-flow-child" : "project-flow-root"}>
      <a
        href={`/?project=${projectId}&thread=${summary.threadId}`}
        className="flex items-start gap-3 rounded border border-line bg-white p-3 shadow-sm transition hover:border-moss"
      >
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded bg-skywash text-moss">
          <MessageSquare size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-ink">{summary.title}</span>
            {summary.childThreadCount > 0 ? (
              <span className="rounded bg-paper px-2 py-0.5 text-xs text-neutral-600">
                {summary.childThreadCount} spin-off{summary.childThreadCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </span>
          {summary.sourceText ? <span className="mt-1 block truncate text-xs text-neutral-500">From: {summary.sourceText}</span> : null}
          {preview ? <span className="mt-1 block line-clamp-2 text-sm text-neutral-600">{preview}</span> : null}
        </span>
      </a>
      {children.length > 0 ? (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <ThreadTreeItem key={child.threadId} projectId={projectId} summary={child} summaries={summaries} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
