import { describe, expect, it } from "vitest";
import { answerSystemPrompt, branchInferencePrompt, promptVersions, spanExtractionPrompt } from "@/lib/prompts";

describe("versioned prompts", () => {
  it("exposes stable prompt versions", () => {
    expect(promptVersions.answer).toBe("answer.v1");
    expect(promptVersions.branch).toBe("branch.v1");
  });

  it("keeps prompts focused on latent learning affordances", () => {
    expect(answerSystemPrompt()).toContain("learning explanation");
    expect(spanExtractionPrompt("hello")).toContain("hoverable");
    expect(branchInferencePrompt("hello")).toContain("metadata only");
  });
});
