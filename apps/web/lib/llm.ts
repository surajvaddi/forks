import type { BranchDraft, SpanDraft } from "./domain";
import { answerSystemPrompt, branchInferencePrompt, promptVersions, spanExtractionPrompt } from "./prompts";

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
      findSpan(content, "core concept", 0.87, 0.44, "The main idea a learner should understand before branching into details."),
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

export class OpenAiLlmAdapter implements LlmAdapter {
  private readonly model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  private async callJson<T>(messages: Array<{ role: "system" | "user"; content: string }>, fallback: T): Promise<T> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return fallback;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages
      })
    });

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return fallback;

    try {
      return JSON.parse(content) as T;
    } catch {
      return fallback;
    }
  }

  async generateAnswer(input: GenerateAnswerInput) {
    const fallback = await new MockLlmAdapter().generateAnswer(input);
    return this.callJson(
      [
        { role: "system", content: answerSystemPrompt() },
        {
          role: "user",
          content: JSON.stringify({
            promptVersion: promptVersions.answer,
            projectTitle: input.projectTitle,
            pinnedContext: input.pinnedContext,
            prompt: input.prompt,
            expectedShape: { title: "string", content: "string" }
          })
        }
      ],
      fallback
    );
  }

  async extractSpans(content: string) {
    const fallback = await new MockLlmAdapter().extractSpans(content);
    const result = await this.callJson<{ spans: SpanDraft[] }>(
      [
        { role: "system", content: "Return JSON only." },
        { role: "user", content: spanExtractionPrompt(content) }
      ],
      { spans: fallback }
    );
    return result.spans ?? fallback;
  }

  async inferBranches(content: string, spans: SpanDraft[]) {
    const fallback = await new MockLlmAdapter().inferBranches(content, spans);
    const result = await this.callJson<{ branches: BranchDraft[] }>(
      [
        { role: "system", content: "Return JSON only." },
        { role: "user", content: `${branchInferencePrompt(content)}\n\nSpans:\n${JSON.stringify(spans)}` }
      ],
      { branches: fallback }
    );
    return result.branches ?? fallback;
  }

  async generateDefinition(term: string, context: string) {
    const fallback = await new MockLlmAdapter().generateDefinition(term);
    const result = await this.callJson<{ definition: string }>(
      [
        { role: "system", content: "Return JSON only. Definition must be one short sentence." },
        { role: "user", content: JSON.stringify({ promptVersion: promptVersions.definition, term, context }) }
      ],
      { definition: fallback }
    );
    return result.definition;
  }

  async generateBranch(label: string, source: string) {
    const fallback = await new MockLlmAdapter().generateBranch(label, source);
    return this.callJson(
      [
        { role: "system", content: "Return JSON only with title and content." },
        { role: "user", content: JSON.stringify({ promptVersion: promptVersions.branch, label, source }) }
      ],
      fallback
    );
  }

  async mergeBranches(inputs: Array<{ label: string; content: string }>) {
    const fallback = await new MockLlmAdapter().mergeBranches(inputs);
    return this.callJson(
      [
        { role: "system", content: "Return JSON only with title and content. Synthesize, do not concatenate." },
        { role: "user", content: JSON.stringify({ promptVersion: promptVersions.merge, inputs }) }
      ],
      fallback
    );
  }
}

export function getLlmAdapter(): LlmAdapter {
  if (process.env.LLM_PROVIDER === "openai") {
    return new OpenAiLlmAdapter();
  }

  return new MockLlmAdapter();
}
