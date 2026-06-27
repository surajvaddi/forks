import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpandableAnswerText } from "@/components/ExpandableAnswerText";
import type { SpanRecord } from "@/lib/store";

function renderAnswer(content: string, spans: SpanRecord[] = []) {
  return render(<ExpandableAnswerText content={content} spans={spans} projectId="project_test" sourceThreadId="thread_test" sourceNodeId="node_test" />);
}

describe("assistant answer markdown rendering", () => {
  it("renders common ChatGPT-style markdown, code, and math", () => {
    const { container } = renderAnswer(`# Heading

- first
- second

Use \`const x = 1\`.

\`\`\`ts
const total = 1 + 2;
\`\`\`

Inline math $E = mc^2$ and block math:

$$
a^2 + b^2 = c^2
$$`);

    expect(screen.getByRole("heading", { name: "Heading" })).toBeVisible();
    expect(screen.getByText("first")).toBeVisible();
    expect(screen.getByText("const x = 1")).toBeVisible();
    expect(screen.getByText("const total = 1 + 2;")).toBeVisible();
    expect(container.querySelector(".katex")).not.toBeNull();
  });

  it("keeps hoverable answer spans inside markdown paragraphs", () => {
    const content = "A **core concept** can still be explained.";
    const startOffset = content.indexOf("core concept");

    renderAnswer(content, [
      {
        id: "span_core",
        projectId: "project_test",
        nodeId: "node_test",
        text: "core concept",
        startOffset,
        endOffset: startOffset + "core concept".length,
        importanceScore: 0.9,
        ambiguityScore: 0.3,
        shortDefinition: "The central idea."
      }
    ]);

    expect(screen.getAllByText("core concept")[0]).toBeVisible();
    expect(screen.getByLabelText("Add definition for core concept to text")).toBeInTheDocument();
  });
});
