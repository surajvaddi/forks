import { PlaceholderThreadCompositionAdapter, type ThreadMergeMode } from "./thread-composition";
import type { ExportRecord, MergedNoteRecord, PinRecord, ProjectThreadSummary } from "./store";

export type ProjectMergeCandidate = {
  id: string;
  title: string;
  mode: ThreadMergeMode;
  sourceThreadIds: string[];
  contextSeed: string;
  strategy: "THREAD_MERGE_PLACEHOLDER" | "THREAD_SPIN_OFF_PLACEHOLDER" | "LLM_SYNTHESIZED_CONTEXT";
};

export type ProjectActivityItem = {
  id: string;
  label: string;
  detail: string;
  createdAt: Date;
  kind: "THREAD" | "PIN" | "NOTE" | "EXPORT";
};

const compositionAdapter = new PlaceholderThreadCompositionAdapter();

export function getProjectMergeCandidates(summaries: ProjectThreadSummary[]): ProjectMergeCandidate[] {
  const summariesById = new Map(summaries.map((summary) => [summary.threadId, summary]));
  const candidates: ProjectMergeCandidate[] = [];

  for (const parent of summaries) {
    const children = summaries.filter((summary) => summary.sourceThreadId === parent.threadId);
    if (children.length === 0) continue;

    const sources = children.length > 1 ? children : [parent, children[0]];
    const mode: ThreadMergeMode = "DIVERGED_FROM_COMMON_PARENT";
    const plan = compositionAdapter.planThreadMerge({
      projectId: parent.projectId,
      mode,
      sources: sources.map((summary) => ({
        projectId: summary.projectId,
        threadId: summary.threadId,
        title: summary.title,
        summary: summary.lastTurnContent ?? summary.sourceText ?? summary.title,
        originThreadId: summary.sourceThreadId
      })) as [
        { projectId: string; threadId: string; title: string; summary?: string; originThreadId?: string },
        { projectId: string; threadId: string; title: string; summary?: string; originThreadId?: string },
        ...{ projectId: string; threadId: string; title: string; summary?: string; originThreadId?: string }[]
      ]
    });

    // TODO: Replace this placeholder candidate with a ContextualFlowPlanner
    // consolidation pass that can merge diverged siblings, unrelated threads,
    // or extracted powered chunks into a new thread with source provenance.
    candidates.push({
      id: `merge_${parent.threadId}`,
      title: children.length > 1 ? `Merge ${children.length} spin-offs from ${parent.title}` : `Merge ${children[0].title} back into ${summariesById.get(parent.threadId)?.title ?? parent.title}`,
      mode,
      sourceThreadIds: plan.sourceThreadIds,
      contextSeed: plan.contextSeed,
      strategy: plan.strategy
    });
  }

  return candidates;
}

export function getProjectActivity({
  threadSummaries,
  pins,
  notes,
  exports
}: {
  threadSummaries: ProjectThreadSummary[];
  pins: PinRecord[];
  notes: MergedNoteRecord[];
  exports: ExportRecord[];
}): ProjectActivityItem[] {
  const threadItems = threadSummaries.map((summary) => ({
    id: `thread_${summary.threadId}`,
    label: summary.lastTurnContent ? "Thread updated" : "Thread created",
    detail: summary.lastTurnContent ?? summary.title,
    createdAt: summary.lastActivityAt,
    kind: "THREAD" as const
  }));

  const pinItems = pins.map((pin) => ({
    id: `pin_${pin.id}`,
    label: "Context saved",
    detail: pin.label,
    createdAt: pin.createdAt,
    kind: "PIN" as const
  }));

  const noteItems = notes.map((note) => ({
    id: `note_${note.id}`,
    label: "Note synthesized",
    detail: note.title,
    createdAt: note.updatedAt,
    kind: "NOTE" as const
  }));

  const exportItems = exports.map((record) => ({
    id: `export_${record.id}`,
    label: `${record.type.toLowerCase()} exported`,
    detail: record.title,
    createdAt: record.createdAt,
    kind: "EXPORT" as const
  }));

  // TODO: Replace this derived activity feed with persisted product events so
  // LLM generation, powered-context transformations, merges, and exports can
  // be audited and replayed across sessions.
  return [...threadItems, ...pinItems, ...noteItems, ...exportItems].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);
}
