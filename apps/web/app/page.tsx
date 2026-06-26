import { FolderPlus, MessageSquarePlus } from "lucide-react";
import { createProjectAction, createThreadAction } from "@/app/actions";
import { ChatThread } from "@/components/ChatThread";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { RightPanel } from "@/components/RightPanel";
import { SubmitButton } from "@/components/SubmitButton";
import { getProjectSnapshot } from "@/lib/store";

export default async function Home({
  searchParams
}: {
  searchParams?: {
    project?: string;
    thread?: string;
  };
}) {
  const snapshot = await getProjectSnapshot(searchParams?.project, searchParams?.thread);

  if (!snapshot) {
    return (
      <AppShell>
        <ProjectSidebar projects={[]} threads={[]} />
        <EmptyProjects />
        <div className="max-lg:hidden" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ProjectSidebar projects={snapshot.projects} threads={snapshot.threads} activeProjectId={snapshot.project.id} />
      {snapshot.activeThread ? (
        <ChatThread
          thread={snapshot.activeThread}
          turns={snapshot.turns}
          nodes={snapshot.nodes}
          spans={snapshot.spans}
          pins={snapshot.pins}
          projectId={snapshot.project.id}
        />
      ) : (
        <EmptyThreads projectId={snapshot.project.id} projectTitle={snapshot.project.title} />
      )}
      <div className="max-lg:hidden">
        <RightPanel
          project={snapshot.project}
          branches={snapshot.branches}
          nodes={snapshot.nodes}
          pins={snapshot.pins}
          notes={snapshot.notes}
          exports={snapshot.exports}
        />
      </div>
    </AppShell>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-dvh min-h-0 grid-cols-[280px_minmax(0,1fr)_360px] overflow-hidden max-lg:grid-cols-[220px_minmax(0,1fr)] max-md:flex max-md:flex-col">
      {children}
    </div>
  );
}

function EmptyProjects() {
  return (
    <main className="flex min-h-0 flex-col bg-paper max-md:flex-1" aria-label="Project workspace">
      <section className="grid min-h-0 flex-1 place-items-center overflow-auto p-6 forks-scrollbar">
        <form action={createProjectAction} className="w-full max-w-md rounded border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FolderPlus size={18} />
            <h2 className="text-xl font-semibold">Create a project</h2>
          </div>
          <label className="text-sm font-medium text-neutral-700" htmlFor="empty-project-title">
            Project name
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="empty-project-title"
              name="title"
              className="min-w-0 flex-1 rounded border border-line bg-paper px-3 py-2 text-sm"
              placeholder="Learning plan"
              required
            />
            <SubmitButton className="inline-flex items-center gap-2 rounded bg-moss px-3 py-2 text-sm text-white" aria-label="Create project">
              <FolderPlus size={15} /> Create
            </SubmitButton>
          </div>
        </form>
      </section>
    </main>
  );
}

function EmptyThreads({ projectId, projectTitle }: { projectId: string; projectTitle: string }) {
  return (
    <main className="flex min-h-0 flex-col bg-paper max-md:flex-1" aria-label="Thread workspace">
      <header className="border-b border-line bg-paper px-6 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Project</p>
        <h2 className="text-2xl font-semibold">{projectTitle}</h2>
      </header>
      <section className="grid min-h-0 flex-1 place-items-center overflow-auto p-6 forks-scrollbar">
        <form action={createThreadAction} className="w-full max-w-md rounded border border-line bg-white p-5 shadow-sm">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="mb-4 flex items-center gap-2">
            <MessageSquarePlus size={18} />
            <h3 className="text-xl font-semibold">Create a thread</h3>
          </div>
          <label className="text-sm font-medium text-neutral-700" htmlFor="empty-thread-title">
            Thread name
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="empty-thread-title"
              name="title"
              className="min-w-0 flex-1 rounded border border-line bg-paper px-3 py-2 text-sm"
              placeholder="New learning thread"
            />
            <SubmitButton className="inline-flex items-center gap-2 rounded bg-rust px-3 py-2 text-sm text-white" aria-label="Create thread">
              <MessageSquarePlus size={15} /> Create
            </SubmitButton>
          </div>
        </form>
      </section>
    </main>
  );
}
