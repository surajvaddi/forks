import type { BranchDraft, SpanDraft } from "./domain";

export type GenerateAnswerInput = {
  prompt: string;
  projectTitle: string;
  pinnedContext: string[];
};

export type LlmAdapter = {
  generateAnswer(input: GenerateAnswerInput): Promise<{ title: string; content: string }>;
  extractSpans(content: string): Promise<SpanDraft[]>;
  inferBranches(content: string, spans: SpanDraft[]): Promise<BranchDraft[]>;
  generateDefinition(term: string, context: string): Promise<string>;
  generateBranch(label: string, source: string): Promise<{ title: string; content: string }>;
  mergeBranches(inputs: Array<{ label: string; content: string }>): Promise<{ title: string; content: string }>;
};

function findSpan(content: string, text: string, importanceScore: number, ambiguityScore: number, shortDefinition?: string): SpanDraft | null {
  const startOffset = content.toLowerCase().indexOf(text.toLowerCase());
  if (startOffset === -1) return null;
  return {
    text: content.slice(startOffset, startOffset + text.length),
    startOffset,
    endOffset: startOffset + text.length,
    importanceScore,
    ambiguityScore,
    shortDefinition
  };
}

export class MockLlmAdapter implements LlmAdapter {
  async generateAnswer(input: GenerateAnswerInput) {
    const lower = input.prompt.toLowerCase();

    if (lower.includes("queue") || lower.includes("distributed") || lower.includes("job")) {
      return {
        title: "Distributed Job Queues",
        content:
          "A distributed job queue lets workers process jobs asynchronously across many machines. Because workers can crash or retry jobs, the system often uses at-least-once delivery and idempotent handlers. The important design move is to make repeated work safe, then record enough state to explain what happened later."
      };
    }

    return {
      title: "Learning Answer",
      content:
        "The useful way to learn this is to identify the core concept, notice the hidden prerequisite, and branch only when a detail becomes confusing. Forks keeps the chat natural while turning the answer into reusable project knowledge."
    };
  }

  async extractSpans(content: string) {
    const candidates = [
      findSpan(content, "distributed job queue", 0.94, 0.42, "A queue that coordinates async work across multiple machines."),
      findSpan(content, "workers", 0.68, 0.25, "Processes that pick up and execute queued jobs."),
      findSpan(content, "asynchronously", 0.57, 0.4, "Work happens outside the request that created it."),
      findSpan(content, "at-least-once delivery", 0.91, 0.74, "A delivery guarantee where a job may run more than once but should not be lost."),
      findSpan(content, "idempotent handlers", 0.96, 0.79, "Handlers that can safely run multiple times without duplicate side effects."),
      findSpan(content, "hidden prerequisite", 0.72, 0.61, "A required idea that the explanation assumes you already know."),
      findSpan(content, "reusable project knowledge", 0.82, 0.38, "Knowledge saved so it can be revisited, merged, and exported later.")
    ];

    return candidates.filter(Boolean) as SpanDraft[];
  }

  async inferBranches(_content: string, spans: SpanDraft[]) {
    const branches: BranchDraft[] = [];

    for (const span of spans.slice(0, 5)) {
      branches.push({
        sourceSpanText: span.text,
        type: "DEFINITION",
        label: `Define ${span.text}`,
        preview: `Clarify what ${span.text} means in this context.`,
        reason: "The span is important enough to become a lightweight learning branch.",
        estimatedValue: Math.min(0.98, span.importanceScore + 0.02),
        estimatedCost: 0.14
      });
    }

    if (spans.some((span) => span.text.toLowerCase().includes("idempotent"))) {
      branches.push({
        sourceSpanText: "idempotent handlers",
        type: "EXAMPLE",
        label: "Give payment retry example",
        preview: "Show how an idempotency key prevents duplicate charges.",
        reason: "Concrete failure examples make distributed systems concepts stick.",
        estimatedValue: 0.93,
        estimatedCost: 0.28
      });
    }

    return branches;
  }

  async generateDefinition(term: string) {
    const dictionary: Record<string, string> = {
      "distributed job queue": "A queue that coordinates background jobs across multiple machines.",
      workers: "Processes that claim queued jobs and perform the work.",
      asynchronously: "Happening outside the original request flow.",
      "at-least-once delivery": "A guarantee that work is retried until it runs, even if that means duplicates.",
      "idempotent handlers": "Handlers that can safely execute more than once without duplicate side effects."
    };

    return dictionary[term.toLowerCase()] ?? `${term}: a concept worth expanding in this project context.`;
  }

  async generateBranch(label: string, source: string) {
    return {
      title: label,
      content:
        `${label}: ${source} matters because it gives the learner a precise next move instead of forcing another blank prompt. ` +
        "In Forks, this branch is generated only after the user asks for it, so the interface stays calm until curiosity appears."
    };
  }

  async mergeBranches(inputs: Array<{ label: string; content: string }>) {
    const title = inputs.length === 0 ? "Merged Learning Note" : `${inputs[0].label.replace(/^Define /, "")} Study Note`;
    const content = [
      `# ${title}`,
      "",
      "## Core idea",
      inputs.map((input) => input.content).join("\n\n"),
      "",
      "## What to remember",
      "Fork only the ideas that matter, pin the pieces worth keeping, and merge when the material is ready to become durable knowledge."
    ].join("\n");

    return { title, content };
  }
}

export function getLlmAdapter(): LlmAdapter {
  return new MockLlmAdapter();
}
