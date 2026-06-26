import { describe, expect, it, vi } from "vitest";
import { logForksEvent } from "@/lib/observability";

describe("logForksEvent", () => {
  it("does not log during tests", () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    logForksEvent("chat.prompt_submitted", { projectId: "project_1" });

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
