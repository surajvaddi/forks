import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePoweredTextChunkDrop } from "@/hooks/usePoweredTextChunkDrop";
import { poweredContextMimeType, serializePoweredContext, type PoweredContextPayload } from "@/lib/powered-context";

const payload: PoweredContextPayload = {
  projectId: "project_1",
  sourceThreadId: "thread_1",
  selectedText: "core concept",
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

function DropTarget({ onDrop }: { onDrop: (payload: PoweredContextPayload) => void }) {
  const { isPoweredContextOver, poweredContextDropHandlers } = usePoweredTextChunkDrop<HTMLDivElement>({ onDrop });
  return (
    <div data-testid="drop-target" data-over={isPoweredContextOver ? "true" : "false"} {...poweredContextDropHandlers}>
      drop here
    </div>
  );
}

describe("usePoweredTextChunkDrop", () => {
  it("identifies powered context drags", () => {
    render(<DropTarget onDrop={() => undefined} />);
    const target = screen.getByTestId("drop-target");

    fireEvent.dragOver(target, { dataTransfer: transfer({ [poweredContextMimeType]: serializePoweredContext(payload) }) });

    expect(target).toHaveAttribute("data-over", "true");
  });

  it("ignores normal text drags", () => {
    render(<DropTarget onDrop={() => undefined} />);
    const target = screen.getByTestId("drop-target");

    fireEvent.dragOver(target, { dataTransfer: transfer({ "text/plain": "plain text" }) });

    expect(target).toHaveAttribute("data-over", "false");
  });

  it("calls the destination callback once with the parsed payload on drop", () => {
    const onDrop = vi.fn();
    render(<DropTarget onDrop={onDrop} />);

    fireEvent.drop(screen.getByTestId("drop-target"), { dataTransfer: transfer({ [poweredContextMimeType]: serializePoweredContext(payload) }) });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(payload, expect.anything());
  });
});
