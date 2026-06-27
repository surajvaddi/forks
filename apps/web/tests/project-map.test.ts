import { describe, expect, it } from "vitest";
import { getProjectMergeCandidates } from "@/lib/project-map";
import type { ProjectThreadSummary } from "@/lib/store";

const stamp = new Date("2026-01-01T00:00:00.000Z");

function summary(input: Partial<ProjectThreadSummary> & Pick<ProjectThreadSummary, "threadId" | "title">): ProjectThreadSummary {
  return {
    projectId: "project_1",
    turnCount: 1,
    childThreadCount: 0,
    lastActivityAt: stamp,
    ...input
  };
}

describe("getProjectMergeCandidates", () => {
  it("suggests merging a single spin-off back into its parent", () => {
    const candidates = getProjectMergeCandidates([
      summary({ threadId: "parent", title: "Parent", childThreadCount: 1, lastTurnContent: "Parent context" }),
      summary({ threadId: "child", title: "Child", sourceThreadId: "parent", sourceText: "Focused context" })
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].title).toBe("Merge Child back into Parent");
    expect(candidates[0].sourceThreadIds).toEqual(["parent", "child"]);
    expect(candidates[0].strategy).toBe("THREAD_MERGE_PLACEHOLDER");
  });

  it("suggests consolidating sibling spin-offs from the same parent", () => {
    const candidates = getProjectMergeCandidates([
      summary({ threadId: "parent", title: "Parent", childThreadCount: 2 }),
      summary({ threadId: "child_a", title: "Child A", sourceThreadId: "parent", sourceText: "A" }),
      summary({ threadId: "child_b", title: "Child B", sourceThreadId: "parent", sourceText: "B" })
    ]);

    expect(candidates[0].title).toBe("Merge 2 spin-offs from Parent");
    expect(candidates[0].sourceThreadIds).toEqual(["child_a", "child_b"]);
    expect(candidates[0].contextSeed).toContain("A");
    expect(candidates[0].contextSeed).toContain("B");
  });
});
