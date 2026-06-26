import { describe, expect, it } from "vitest";
import { PlaceholderThreadCompositionAdapter } from "@/lib/thread-composition";

describe("PlaceholderThreadCompositionAdapter", () => {
  it("plans a future merge thread from multiple source threads", () => {
    const adapter = new PlaceholderThreadCompositionAdapter();
    const plan = adapter.planThreadMerge({
      projectId: "project_1",
      mode: "DIVERGED_FROM_COMMON_PARENT",
      sources: [
        { projectId: "project_1", threadId: "thread_a", title: "Branch A", summary: "Context A" },
        { projectId: "project_1", threadId: "thread_b", title: "Branch B", summary: "Context B" }
      ]
    });

    expect(plan.sourceThreadIds).toEqual(["thread_a", "thread_b"]);
    expect(plan.contextSeed).toContain("Context A");
    expect(plan.strategy).toBe("THREAD_MERGE_PLACEHOLDER");
  });

  it("plans a future spin-off thread with focused context", () => {
    const adapter = new PlaceholderThreadCompositionAdapter();
    const plan = adapter.planThreadSpinOff({
      projectId: "project_1",
      sourceThreadId: "thread_source",
      title: "Focused branch",
      context: "Start from this narrower question."
    });

    expect(plan.title).toBe("Focused branch");
    expect(plan.sourceThreadIds).toEqual(["thread_source"]);
    expect(plan.strategy).toBe("THREAD_SPIN_OFF_PLACEHOLDER");
  });
});
