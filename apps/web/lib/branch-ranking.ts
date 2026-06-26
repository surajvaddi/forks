import type { BranchStatus } from "./domain";

export type RankableBranch = {
  estimatedValue: number;
  estimatedCost: number;
  status: BranchStatus;
  createdAt?: Date | string;
};

const statusWeight: Record<BranchStatus, number> = {
  LATENT: 0,
  PREVIEWED: 0.03,
  GENERATED: 0.08,
  PINNED: 0.16,
  DISCARDED: -1
};

export function branchScore(branch: RankableBranch) {
  return branch.estimatedValue - branch.estimatedCost * 0.35 + statusWeight[branch.status];
}

export function rankBranches<T extends RankableBranch>(branches: T[]) {
  return [...branches]
    .filter((branch) => branch.status !== "DISCARDED")
    .sort((a, b) => branchScore(b) - branchScore(a));
}
