export type ThreadCompositionSource = {
  projectId: string;
  threadId: string;
  title: string;
  summary?: string;
  originThreadId?: string;
};

export type ThreadMergeMode = "DIVERGED_FROM_COMMON_PARENT" | "UNRELATED_THREADS";

export type ThreadMergeInput = {
  projectId: string;
  sources: [ThreadCompositionSource, ThreadCompositionSource, ...ThreadCompositionSource[]];
  mode: ThreadMergeMode;
};

export type ThreadSpinOffInput = {
  projectId: string;
  sourceThreadId: string;
  title: string;
  context: string;
};

export type ThreadCompositionPlan = {
  title: string;
  contextSeed: string;
  sourceThreadIds: string[];
  strategy: "THREAD_MERGE_PLACEHOLDER" | "THREAD_SPIN_OFF_PLACEHOLDER" | "LLM_SYNTHESIZED_CONTEXT";
};

export interface ThreadCompositionAdapter {
  planThreadMerge(input: ThreadMergeInput): ThreadCompositionPlan;
  planThreadSpinOff(input: ThreadSpinOffInput): ThreadCompositionPlan;
}

export class PlaceholderThreadCompositionAdapter implements ThreadCompositionAdapter {
  planThreadMerge(input: ThreadMergeInput): ThreadCompositionPlan {
    // TODO: Use the thread graph and LLM synthesis to merge diverged siblings or
    // unrelated threads into a new thread with reconciled context and sources.
    return {
      title: input.mode === "DIVERGED_FROM_COMMON_PARENT" ? "Merged branch thread" : "Synthesized thread",
      contextSeed: input.sources.map((source) => source.summary ?? source.title).join("\n\n"),
      sourceThreadIds: input.sources.map((source) => source.threadId),
      strategy: "THREAD_MERGE_PLACEHOLDER"
    };
  }

  planThreadSpinOff(input: ThreadSpinOffInput): ThreadCompositionPlan {
    // TODO: Generate a focused starting context for a new thread without copying
    // the entire source conversation.
    return {
      title: input.title,
      contextSeed: input.context,
      sourceThreadIds: [input.sourceThreadId],
      strategy: "THREAD_SPIN_OFF_PLACEHOLDER"
    };
  }
}
