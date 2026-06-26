import { beforeEach, describe, expect, it } from "vitest";
import {
  createProject,
  createThread,
  deleteProject,
  deleteThread,
  exportMarkdown,
  exportPdf,
  generateBranch,
  getProjectSnapshot,
  handleUserPrompt,
  mergePins,
  resetStoreForTests,
  togglePin
} from "@/lib/store";

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

  it("deletes projects and redirects to a remaining project target", async () => {
    const created = await createProject("Temporary Project");
    const target = await deleteProject(created.project.id);
    const snapshot = await getProjectSnapshot();

    expect(snapshot?.projects.some((project) => project.id === created.project.id)).toBe(false);
    expect(target.project).toBeDefined();
    expect(target.thread).toBeDefined();
  });

  it("deletes threads and keeps a project open with a fallback thread", async () => {
    const snapshot = await getProjectSnapshot();
    const extra = await createThread(snapshot!.project.id, "Temporary Thread");
    const target = await deleteThread(snapshot!.project.id, extra.id);
    const updated = await getProjectSnapshot(snapshot!.project.id, target.thread?.id);

    expect(updated?.threads.some((thread) => thread.id === extra.id)).toBe(false);
    expect(updated?.activeThread).toBeDefined();
  });
});
