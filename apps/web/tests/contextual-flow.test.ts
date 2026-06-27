import { describe, expect, it } from "vitest";
import { ContextualFlowPlanner } from "@/lib/contextual-flow";

describe("ContextualFlowPlanner", () => {
  it("currently returns an explicit raw insertion fallback plan", () => {
    const planner = new ContextualFlowPlanner();
    const plan = planner.planInsertion({
      paragraph: "Learn the core concept before branching.",
      selectedText: "core concept",
      supportingText: "The main idea to understand first.",
      startOffset: 10,
      endOffset: 22,
      operation: "INSERTION"
    });

    expect(plan).toEqual({
      displayedText: "core concept",
      contextualText: "The main idea to understand first.",
      replaceStartOffset: 10,
      replaceEndOffset: 22,
      operation: "INSERTION",
      strategy: "RAW_CONTEXT_FALLBACK"
    });
  });

  it("stubs extraction, combination, and consolidation flow plans", () => {
    const planner = new ContextualFlowPlanner();
    const input = {
      paragraph: "Forks turns selected text into reusable context.",
      selectedText: "selected text",
      startOffset: 12,
      endOffset: 25,
      operation: "EXTRACTION" as const
    };

    expect(planner.planExtraction(input).operation).toBe("EXTRACTION");
    expect(planner.planCombination([input]).operation).toBe("COMBINATION");
    expect(planner.planConsolidation([input]).operation).toBe("CONSOLIDATION");
  });
});
