import { beforeEach, describe, expect, it } from "vitest";
import { exportMarkdown, exportPdf, generateBranch, getProjectSnapshot, handleUserPrompt, mergePins, resetStoreForTests, togglePin } from "@/lib/store";

describe("chat to knowledge store", () => {
  beforeEach(() => {
    resetStoreForTests();
  });

  it("persists chat turns, answer node, spans, and latent branches", async () => {
    const snapshot = await getProjectSnapshot();
    expect(snapshot?.activeThread).toBeDefined();

    await handleUserPrompt(snapshot!.project.id, snapshot!.activeThread!.id, "Explain distributed job queues");
    const updated = await getProjectSnapshot(snapshot!.project.id, snapshot!.activeThread!.id);

    expect(updated?.turns).toHaveLength(2);
    expect(updated?.nodes.some((node) => node.type === "ASSISTANT_ANSWER")).toBe(true);
    expect(updated?.spans.length).toBeGreaterThan(0);
    expect(updated?.branches.every((branch) => branch.status === "LATENT")).toBe(true);
  });

  it("generates a branch lazily and can pin, merge, and export it", async () => {
    const snapshot = await getProjectSnapshot();
    await handleUserPrompt(snapshot!.project.id, snapshot!.activeThread!.id, "Explain distributed job queues");
    const withBranches = (await getProjectSnapshot(snapshot!.project.id, snapshot!.activeThread!.id))!;
    const branch = withBranches.branches[0];

    await generateBranch(branch.id);
    await togglePin(withBranches.project.id, branch.id, "BRANCH", branch.label, withBranches.activeThread!.id);
    const note = await mergePins(withBranches.project.id);
    const exported = await exportMarkdown(withBranches.project.id, note.id);
    const pdf = await exportPdf(withBranches.project.id, note.id);

    expect(note.content).toContain("#");
    expect(exported.type).toBe("MARKDOWN");
    expect(exported.content).toContain("What to remember");
    expect(pdf.type).toBe("PDF");
    expect(pdf.content.startsWith("%PDF-1.4")).toBe(true);
  });
});
