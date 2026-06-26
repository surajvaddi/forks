export const chatRoles = ["USER", "ASSISTANT", "SYSTEM"] as const;
export type ChatRole = (typeof chatRoles)[number];

export const nodeTypes = [
  "USER_PROMPT",
  "ASSISTANT_ANSWER",
  "DEFINITION",
  "EXAMPLE",
  "ANALOGY",
  "PROOF",
  "IMPLEMENTATION",
  "VISUAL_DESCRIPTION",
  "ARTIFACT",
  "ANNOTATION",
  "SUMMARY",
  "MERGED_NOTE"
] as const;
export type NodeType = (typeof nodeTypes)[number];

export const branchTypes = [
  "DEFINITION",
  "EXAMPLE",
  "ANALOGY",
  "FORMALIZATION",
  "PROOF",
  "IMPLEMENTATION",
  "VISUAL",
  "CONTRAST",
  "PREREQUISITE",
  "PITFALL",
  "EDGE_CASE",
  "ARTIFACT",
  "SUMMARY",
  "MERGE"
] as const;
export type BranchType = (typeof branchTypes)[number];

export const branchStatuses = ["LATENT", "PREVIEWED", "GENERATED", "PINNED", "DISCARDED"] as const;
export type BranchStatus = (typeof branchStatuses)[number];

export const pinTargets = ["NODE", "SPAN", "CONCEPT", "BRANCH", "ARTIFACT", "NOTE"] as const;
export type PinTarget = (typeof pinTargets)[number];

export type SpanDraft = {
  text: string;
  startOffset: number;
  endOffset: number;
  importanceScore: number;
  ambiguityScore: number;
  shortDefinition?: string;
};

export type BranchDraft = {
  sourceSpanText?: string;
  type: BranchType;
  label: string;
  preview: string;
  reason: string;
  estimatedValue: number;
  estimatedCost: number;
};
