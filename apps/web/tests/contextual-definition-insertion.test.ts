import { describe, expect, it } from "vitest";
import { ContextualDefinitionInsertionPlanner } from "@/lib/contextual-definition-insertion";

describe("ContextualDefinitionInsertionPlanner", () => {
  it("currently returns an explicit raw-definition fallback plan", () => {
    const planner = new ContextualDefinitionInsertionPlanner();
    const plan = planner.adaptDefinitionForParagraph({
      paragraph: "Learn the core concept before branching.",
      term: "core concept",
      definition: "The main idea to understand first.",
      startOffset: 10,
      endOffset: 22
    });

    expect(plan).toEqual({
      termText: "core concept",
      insertedText: "The main idea to understand first.",
      replaceStartOffset: 10,
      replaceEndOffset: 22,
      strategy: "RAW_DEFINITION_FALLBACK"
    });
  });
});
