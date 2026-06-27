import { PlaceholderThreadCompositionAdapter, type ThreadMergeMode } from "./thread-composition";
import type { ProjectThreadSummary } from "./store";

export type ProjectMergeCandidate = {
  id: string;
  title: string;
  mode: ThreadMergeMode;
  sourceThreadIds: string[];
  contextSeed: string;
  strategy: "THREAD_MERGE_PLACEHOLDER" | "THREAD_SPIN_OFF_PLACEHOLDER" | "LLM_SYNTHESIZED_CONTEXT";
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
