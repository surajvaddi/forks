import { FolderPlus } from "lucide-react";
import { createProjectAction } from "@/app/actions";
import { ChatThread } from "@/components/ChatThread";
import { FlowDropSurface } from "@/components/FlowDropSurface";
import { ProjectHome } from "@/components/ProjectHome";
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
        <ProjectSidebar projects={[]} threads={[]} threadLinks={[]} />
        <EmptyProjects />
        <div className="max-lg:hidden" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ProjectSidebar projects={snapshot.projects} threads={snapshot.threads} threadLinks={snapshot.threadLinks} activeProjectId={snapshot.project.id} />
      {snapshot.activeThread ? (
        <ChatThread
          thread={snapshot.activeThread}
          turns={snapshot.turns}
          nodes={snapshot.nodes}
          spans={snapshot.spans}
          pins={snapshot.pins}
          projectId={snapshot.project.id}
          threadLinks={snapshot.threadLinks}
          threads={snapshot.threads}
        />
      ) : (
        <ProjectHome
          project={snapshot.project}
          threads={snapshot.threads}
          threadLinks={snapshot.threadLinks}
          pins={snapshot.pins}
          notes={snapshot.notes}
          exports={snapshot.exports}
        />
      )}
      <div className="min-h-0 max-lg:hidden">
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
    <FlowDropSurface className="grid h-dvh min-h-0 grid-cols-[280px_minmax(0,1fr)_360px] grid-rows-[minmax(0,1fr)] overflow-hidden max-lg:grid-cols-[220px_minmax(0,1fr)] max-md:flex max-md:flex-col">
      {children}
    </FlowDropSurface>
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
