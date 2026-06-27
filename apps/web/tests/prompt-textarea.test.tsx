import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { PromptTextarea } from "@/components/PromptTextarea";
import { poweredContextMimeType, serializePoweredContext, type PoweredContextPayload } from "@/lib/powered-context";

const payload: PoweredContextPayload = {
  projectId: "project_1",
  sourceThreadId: "thread_1",
  selectedText: "core concept",
  contextualText: "core concept",
  operation: "EXTRACTION"
};

function transfer(data: Record<string, string>) {
  return {
    types: Object.keys(data),
    getData(type: string) {
      return data[type] ?? "";
    },
    dropEffect: "none"
  };
}

function ControlledPrompt({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return <PromptTextarea value={value} onChange={setValue} />;
}

describe("PromptTextarea powered context insertion", () => {
  it("drops powered context into an empty composer", () => {
    render(<ControlledPrompt />);
    const prompt = screen.getByLabelText("Chat prompt") as HTMLTextAreaElement;

    fireEvent.drop(prompt, { dataTransfer: transfer({ [poweredContextMimeType]: serializePoweredContext(payload) }) });

    expect(prompt.value).toBe("core concept");
  });

  it("emits a structured composer chunk when powered context is dropped", () => {
    const chunks: string[] = [];
    render(<PromptTextarea value="" onChange={() => undefined} onChunkCreated={(chunk) => chunks.push(chunk.sourceThreadId)} />);
    const prompt = screen.getByLabelText("Chat prompt") as HTMLTextAreaElement;

    fireEvent.drop(prompt, { dataTransfer: transfer({ [poweredContextMimeType]: serializePoweredContext(payload) }) });

    expect(chunks).toEqual(["thread_1"]);
  });

  it("drops powered context into the middle of existing composer text", () => {
    render(<ControlledPrompt initialValue="Explain  please" />);
    const prompt = screen.getByLabelText("Chat prompt") as HTMLTextAreaElement;
    prompt.setSelectionRange("Explain ".length, "Explain ".length);

    fireEvent.drop(prompt, { dataTransfer: transfer({ [poweredContextMimeType]: serializePoweredContext(payload) }) });

    expect(prompt.value).toBe("Explain core concept please");
    expect(prompt.selectionStart).toBe("Explain core concept".length);
  });

  it("replaces selected composer text with dropped powered context", () => {
    render(<ControlledPrompt initialValue="Explain old idea please" />);
    const prompt = screen.getByLabelText("Chat prompt") as HTMLTextAreaElement;
    prompt.setSelectionRange("Explain ".length, "Explain old idea".length);

    fireEvent.drop(prompt, { dataTransfer: transfer({ [poweredContextMimeType]: serializePoweredContext(payload) }) });

    expect(prompt.value).toBe("Explain core concept please");
  });

  it("ignores malformed powered context payloads", () => {
    render(<ControlledPrompt initialValue="Keep this" />);
    const prompt = screen.getByLabelText("Chat prompt") as HTMLTextAreaElement;

    fireEvent.drop(prompt, { dataTransfer: transfer({ [poweredContextMimeType]: "{nope" }) });

    expect(prompt.value).toBe("Keep this");
  });

  it("shows insertion styling only for powered context drags", () => {
    render(<ControlledPrompt />);
    const prompt = screen.getByLabelText("Chat prompt");

    fireEvent.dragOver(prompt, { dataTransfer: transfer({ "text/plain": "plain text" }) });
    expect(prompt).not.toHaveClass("ring-2");

    fireEvent.dragOver(prompt, { dataTransfer: transfer({ [poweredContextMimeType]: serializePoweredContext(payload) }) });
    expect(prompt).toHaveClass("ring-2");
  });
});
