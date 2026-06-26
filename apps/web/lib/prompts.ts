export const promptVersions = {
  answer: "answer.v1",
  spans: "spans.v1",
  branches: "branches.v1",
  definition: "definition.v1",
  branch: "branch.v1",
  merge: "merge.v1"
} as const;

export function answerSystemPrompt() {
  return [
    "You are generating a learning explanation inside Forks.",
    "Answer conversationally, but make important terms visible.",
    "Do not over-expand every concept.",
    "Leave room for hover definitions and contextual branches."
  ].join("\n");
}

export function spanExtractionPrompt(content: string) {
  return [
    "Extract important spans that should become hoverable learning affordances.",
    "Return compact JSON with text, importanceScore, ambiguityScore, and shortDefinition.",
    content
  ].join("\n\n");
}

export function branchInferencePrompt(content: string) {
  return [
    "Infer latent branches for this answer.",
    "Branches are metadata only; do not generate the branch body.",
    "Prefer definitions, examples, contrasts, pitfalls, and implementation branches.",
    content
  ].join("\n\n");
}
