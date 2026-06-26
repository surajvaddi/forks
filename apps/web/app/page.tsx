import { ChatThread } from "@/components/ChatThread";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { RightPanel } from "@/components/RightPanel";
import { getProjectSnapshot } from "@/lib/store";

export default function Home({
  searchParams
}: {
  searchParams?: {
    project?: string;
    thread?: string;
  };
}) {
  const snapshot = getProjectSnapshot(searchParams?.project, searchParams?.thread);

  if (!snapshot || !snapshot.activeThread) {
    return <div className="grid min-h-screen place-items-center bg-paper p-8">No project found.</div>;
  }

  return (
    <div className="grid h-screen grid-cols-[280px_minmax(0,1fr)_360px] overflow-hidden max-lg:grid-cols-[220px_minmax(0,1fr)] max-md:flex max-md:h-auto max-md:min-h-screen max-md:flex-col">
      <ProjectSidebar projects={snapshot.projects} threads={snapshot.threads} activeProjectId={snapshot.project.id} />
      <ChatThread
        thread={snapshot.activeThread}
        turns={snapshot.turns}
        nodes={snapshot.nodes}
        spans={snapshot.spans}
        pins={snapshot.pins}
        projectId={snapshot.project.id}
      />
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
    </div>
  );
}
