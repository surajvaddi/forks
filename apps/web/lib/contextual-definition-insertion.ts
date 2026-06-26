export type DefinitionInsertionInput = {
  paragraph: string;
  term: string;
  definition: string;
  startOffset: number;
  endOffset: number;
};

export type DefinitionInsertionPlan = {
  termText: string;
  insertedText: string;
  replaceStartOffset: number;
  replaceEndOffset: number;
  surroundingTextBefore?: string;
  surroundingTextAfter?: string;
  strategy: "RAW_DEFINITION_FALLBACK" | "CONTEXTUAL_REWRITE";
};

export interface DefinitionInsertionAdapter {
  adaptDefinitionForParagraph(input: DefinitionInsertionInput): DefinitionInsertionPlan;
}

export class FallbackDefinitionInsertionAdapter implements DefinitionInsertionAdapter {
  adaptDefinitionForParagraph(input: DefinitionInsertionInput): DefinitionInsertionPlan {
    return {
      termText: input.term,
      insertedText: input.definition,
      replaceStartOffset: input.startOffset,
      replaceEndOffset: input.endOffset,
      strategy: "RAW_DEFINITION_FALLBACK"
    };
  }
}

export class ContextualDefinitionInsertionPlanner implements DefinitionInsertionAdapter {
  adaptDefinitionForParagraph(input: DefinitionInsertionInput): DefinitionInsertionPlan {
    // TODO: Replace the fallback with an LLM/NLP rewrite that makes the definition
    // grammatically fit the paragraph, possibly editing nearby words or punctuation.
    return new FallbackDefinitionInsertionAdapter().adaptDefinitionForParagraph(input);
  }
}
