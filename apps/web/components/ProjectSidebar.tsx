import { BookOpen, FolderPlus, MessageSquarePlus } from "lucide-react";
import { createProjectAction, createThreadAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import type { ProjectRecord, ThreadRecord } from "@/lib/store";

export function ProjectSidebar({
  projects,
  threads,
  activeProjectId
}: {
  projects: ProjectRecord[];
  threads: ThreadRecord[];
  activeProjectId: string;
}) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-line bg-[#eee9dd] p-4" aria-label="Projects and threads">
      <div className="mb-6 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded bg-ink text-paper">
          <BookOpen size={18} />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Forks</h1>
          <p className="text-xs text-neutral-600">Project chat for learning</p>
        </div>
      </div>

      <form action={createProjectAction} className="mb-5 rounded border border-line bg-paper p-2">
        <label className="text-xs font-medium text-neutral-600" htmlFor="project-title">
          New project
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="project-title"
            name="title"
            className="min-w-0 flex-1 rounded border border-line bg-white px-2 py-1.5 text-sm"
            placeholder="Systems prep"
          />
          <SubmitButton className="grid h-8 w-8 place-items-center rounded bg-moss text-white" aria-label="Create project">
            <FolderPlus size={16} />
          </SubmitButton>
        </div>
      </form>

      <div className="min-h-0 flex-1 overflow-auto forks-scrollbar">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Projects</p>
        <div className="space-y-2">
          {projects.map((project) => (
            <a
              key={project.id}
              className={`block rounded border px-3 py-2 text-sm ${
                project.id === activeProjectId ? "border-moss bg-white font-semibold" : "border-transparent hover:bg-white"
              }`}
              href={`/?project=${project.id}`}
            >
              {project.title}
            </a>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Threads</p>
        </div>
        <div className="mt-2 space-y-2">
          {threads.map((thread) => (
            <a key={thread.id} href={`/?project=${thread.projectId}&thread=${thread.id}`} className="block rounded px-3 py-2 text-sm hover:bg-white">
              {thread.title}
            </a>
          ))}
        </div>
      </div>

      <form action={createThreadAction} className="mt-4 border-t border-line pt-4">
        <input type="hidden" name="projectId" value={activeProjectId} />
        <label className="text-xs font-medium text-neutral-600" htmlFor="thread-title">
          New thread
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="thread-title"
            name="title"
            className="min-w-0 flex-1 rounded border border-line bg-white px-2 py-1.5 text-sm"
            placeholder="Topic"
          />
          <SubmitButton className="grid h-8 w-8 place-items-center rounded bg-rust text-white" aria-label="Create thread">
            <MessageSquarePlus size={16} />
          </SubmitButton>
        </div>
      </form>
    </aside>
  );
}
