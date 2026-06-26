"use client";

import { BookOpen, FolderPlus, MessageSquare, MessageSquarePlus, Trash2 } from "lucide-react";
import { useOptimistic } from "react";
import { createProjectAction, createThreadAction, deleteProjectAction, deleteThreadAction } from "@/app/actions";
import { SubmitButton } from "./SubmitButton";
import type { ProjectRecord, ThreadRecord } from "@/lib/store";

export function ProjectSidebar({
  projects,
  threads,
  activeProjectId
}: {
  projects: ProjectRecord[];
  threads: ThreadRecord[];
  activeProjectId?: string;
}) {
  const [optimisticProjects, addOptimisticProject] = useOptimistic(
    projects,
    (currentProjects: ProjectRecord[], title: string) => [
      ...currentProjects,
      {
        id: `optimistic_project_${title}`,
        title,
        description: "Creating project...",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  );
  const threadsByProject = new Map<string, ThreadRecord[]>();
  for (const thread of threads) {
    const projectThreads = threadsByProject.get(thread.projectId) ?? [];
    projectThreads.push(thread);
    threadsByProject.set(thread.projectId, projectThreads);
  }

  return (
    <aside className="flex min-h-0 flex-col border-r border-line bg-[#eee9dd] p-4 max-md:h-[38dvh] max-md:shrink-0" aria-label="Projects and threads">
      <div className="mb-6 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded bg-ink text-paper">
          <BookOpen size={18} />
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-tight">Forks</h1>
          <p className="text-xs text-neutral-600">Project chat for learning</p>
        </div>
      </div>

      <form
        action={async (formData) => {
          const title = formData.get("title");
          if (typeof title === "string" && title.trim()) {
            addOptimisticProject(title.trim());
          }
          await createProjectAction(formData);
        }}
        className="mb-5 rounded border border-line bg-paper p-2"
      >
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
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Projects and threads</p>
        <div className="space-y-3">
          {optimisticProjects.map((project) => (
            <section key={project.id} className="rounded border border-line bg-paper/70 p-1.5" aria-label={`${project.title} project`} data-testid="project-item">
              <div
                className={`flex items-center gap-1 rounded ${
                  project.id === activeProjectId ? "bg-white font-semibold shadow-sm" : "hover:bg-white"
                }`}
              >
                <a className="min-w-0 flex-1 truncate px-2 py-2 text-sm" href={`/?project=${project.id}`}>
                  {project.title}
                </a>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <SubmitButton
                    className="grid h-7 w-7 place-items-center rounded text-neutral-500 hover:bg-[#f4d7ce] hover:text-rust"
                    aria-label={`Delete project ${project.title}`}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </SubmitButton>
                </form>
              </div>

              <div className="mt-1 space-y-1 pl-3" aria-label={`${project.title} threads`}>
                {(threadsByProject.get(project.id) ?? []).map((thread) => (
                  <div key={thread.id} className="flex items-center gap-1 rounded text-neutral-700 hover:bg-white">
                    <MessageSquare size={13} className="ml-1 shrink-0 text-neutral-400" />
                    <a href={`/?project=${thread.projectId}&thread=${thread.id}`} className="min-w-0 flex-1 truncate px-1 py-1.5 text-xs">
                      {thread.title}
                    </a>
                    <form action={deleteThreadAction}>
                      <input type="hidden" name="projectId" value={thread.projectId} />
                      <input type="hidden" name="threadId" value={thread.id} />
                      <SubmitButton
                        className="grid h-6 w-6 place-items-center rounded text-neutral-400 hover:bg-[#f4d7ce] hover:text-rust"
                        aria-label={`Delete thread ${thread.title}`}
                        title="Delete thread"
                      >
                        <Trash2 size={12} />
                      </SubmitButton>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {activeProjectId ? (
        <form action={createThreadAction} className="mt-4 border-t border-line pt-4">
          <input type="hidden" name="projectId" value={activeProjectId} />
          <label className="text-xs font-medium text-neutral-600" htmlFor="thread-title">
            New thread in project
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
      ) : null}
    </aside>
  );
}
