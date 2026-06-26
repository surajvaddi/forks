import { describe, expect, it } from "vitest";
import { MockLlmAdapter } from "@/lib/llm";

describe("MockLlmAdapter", () => {
  it("generates deterministic distributed queue learning material", async () => {
    const llm = new MockLlmAdapter();
    const answer = await llm.generateAnswer({
      prompt: "Explain distributed job queues",
      projectTitle: "Distributed Systems Prep",
      pinnedContext: []
    });
    const spans = await llm.extractSpans(answer.content);
    const branches = await llm.inferBranches(answer.content, spans);

    expect(answer.content).toContain("distributed job queue");
    expect(spans.some((span) => span.text === "idempotent handlers")).toBe(true);
    expect(branches.some((branch) => branch.label === "Give payment retry example")).toBe(true);
  });
});
