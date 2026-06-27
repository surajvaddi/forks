import { MessageSquarePlus } from "lucide-react";
import { createThreadAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import type { ExportRecord, MergedNoteRecord, PinRecord, ProjectRecord, ThreadLinkRecord, ThreadRecord } from "@/lib/store";

export function ProjectHome({
  project,
  threads,
  threadLinks,
  pins,
  notes,
  exports
}: {
  project: ProjectRecord;
  threads: ThreadRecord[];
  threadLinks: ThreadLinkRecord[];
  pins: PinRecord[];
  notes: MergedNoteRecord[];
  exports: ExportRecord[];
}) {
  const projectThreads = threads.filter((thread) => thread.projectId === project.id);
  const spinOffCount = threadLinks.filter((link) => link.type === "SPUN_OFF_FROM").length;

  return (
    <main className="min-h-0 overflow-auto bg-paper p-6 forks-scrollbar" aria-label="Project home">
      <section className="mx-auto max-w-5xl" data-testid="project-home">
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
      </section>
    </main>
  );
}
