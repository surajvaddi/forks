import { describe, expect, it } from "vitest";
import { branchScore, rankBranches } from "@/lib/branch-ranking";

describe("branch ranking", () => {
  it("prefers high value and low cost branches", () => {
    const expensive = { estimatedValue: 0.8, estimatedCost: 0.9, status: "LATENT" as const };
    const focused = { estimatedValue: 0.82, estimatedCost: 0.1, status: "LATENT" as const };

    expect(branchScore(focused)).toBeGreaterThan(branchScore(expensive));
  });

  it("filters discarded branches", () => {
    const branches = rankBranches([
      { estimatedValue: 0.99, estimatedCost: 0.1, status: "DISCARDED" as const },
      { estimatedValue: 0.5, estimatedCost: 0.1, status: "LATENT" as const }
    ]);

    expect(branches).toHaveLength(1);
    expect(branches[0].status).toBe("LATENT");
  });
});
