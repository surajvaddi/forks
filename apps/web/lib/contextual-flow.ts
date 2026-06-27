export type ContextualFlowOperation = "INSERTION" | "EXTRACTION" | "COMBINATION" | "CONSOLIDATION";

export type ContextualFlowInput = {
  paragraph: string;
  selectedText: string;
  supportingText?: string;
  startOffset: number;
  endOffset: number;
  operation: ContextualFlowOperation;
};

export type ContextualFlowPlan = {
  displayedText: string;
  contextualText: string;
  replaceStartOffset: number;
  replaceEndOffset: number;
  operation: ContextualFlowOperation;
  strategy: "RAW_CONTEXT_FALLBACK" | "CONTEXTUAL_REWRITE";
};

export interface ContextualFlowAdapter {
  planInsertion(input: ContextualFlowInput): ContextualFlowPlan;
  planExtraction(input: ContextualFlowInput): ContextualFlowPlan;
  planCombination(inputs: ContextualFlowInput[]): ContextualFlowPlan;
  planConsolidation(inputs: ContextualFlowInput[]): ContextualFlowPlan;
}

export class FallbackContextualFlowAdapter implements ContextualFlowAdapter {
  planInsertion(input: ContextualFlowInput): ContextualFlowPlan {
    return {
      displayedText: input.selectedText,
      contextualText: input.supportingText ?? input.selectedText,
      replaceStartOffset: input.startOffset,
      replaceEndOffset: input.endOffset,
      operation: "INSERTION",
      strategy: "RAW_CONTEXT_FALLBACK"
    };
  }

  planExtraction(input: ContextualFlowInput): ContextualFlowPlan {
    return {
      displayedText: input.selectedText,
      contextualText: input.selectedText,
      replaceStartOffset: input.startOffset,
      replaceEndOffset: input.endOffset,
      operation: "EXTRACTION",
      strategy: "RAW_CONTEXT_FALLBACK"
    };
  }

  planCombination(inputs: ContextualFlowInput[]): ContextualFlowPlan {
    const first = inputs[0];
    return {
      displayedText: first?.selectedText ?? "",
      contextualText: inputs.map((input) => input.supportingText ?? input.selectedText).join("\n\n"),
      replaceStartOffset: first?.startOffset ?? 0,
      replaceEndOffset: first?.endOffset ?? 0,
      operation: "COMBINATION",
      strategy: "RAW_CONTEXT_FALLBACK"
    };
  }

  planConsolidation(inputs: ContextualFlowInput[]): ContextualFlowPlan {
    const first = inputs[0];
    return {
      displayedText: first?.selectedText ?? "",
      contextualText: inputs.map((input) => input.supportingText ?? input.selectedText).join("\n\n"),
      replaceStartOffset: first?.startOffset ?? 0,
      replaceEndOffset: first?.endOffset ?? 0,
      operation: "CONSOLIDATION",
      strategy: "RAW_CONTEXT_FALLBACK"
    };
  }
}

export class ContextualFlowPlanner implements ContextualFlowAdapter {
  planInsertion(input: ContextualFlowInput): ContextualFlowPlan {
    // TODO: Use LLM/NLP context rewriting so inserted text fits the sentence,
    // including edits to surrounding words, punctuation, tense, or references.
    return new FallbackContextualFlowAdapter().planInsertion(input);
  }

  planExtraction(input: ContextualFlowInput): ContextualFlowPlan {
    // TODO: Extract a selected span into a reusable context object that can seed
    // a new thread, branch, note, or project memory item.
    return new FallbackContextualFlowAdapter().planExtraction(input);
  }

  planCombination(inputs: ContextualFlowInput[]): ContextualFlowPlan {
    // TODO: Combine multiple selected spans into one coherent context packet,
    // resolving overlap, order, references, and duplicate definitions.
    return new FallbackContextualFlowAdapter().planCombination(inputs);
  }

  planConsolidation(inputs: ContextualFlowInput[]): ContextualFlowPlan {
    // TODO: Consolidate repeated or diverged selected context into a durable
    // summary that can replace several separate snippets.
    return new FallbackContextualFlowAdapter().planConsolidation(inputs);
  }
}
