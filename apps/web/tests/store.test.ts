import { beforeEach, describe, expect, it } from "vitest";
import {
  createProject,
  createThread,
  createThreadFromContext,
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
    const initialTurns = snapshot!.turns.length;

    await handleUserPrompt(snapshot!.project.id, snapshot!.activeThread!.id, "Explain distributed job queues");
    const updated = await getProjectSnapshot(snapshot!.project.id, snapshot!.activeThread!.id);

    expect(updated?.turns).toHaveLength(initialTurns + 2);
    expect(updated?.nodes.some((node) => node.type === "ASSISTANT_ANSWER")).toBe(true);
    expect(updated?.spans.length).toBeGreaterThan(0);
    expect(updated?.branches.every((branch) => branch.status === "LATENT")).toBe(true);
  });

  it("preloads Forks-purpose learning content", async () => {
    const snapshot = await getProjectSnapshot();

    expect(snapshot?.project.title).toBe("Learning With Forks");
    expect(snapshot?.activeThread?.title).toBe("How Forks helps you learn");
    expect(snapshot?.nodes.some((node) => node.title === "Learning Answer")).toBe(true);
    expect(snapshot?.nodes.some((node) => node.content.includes("reusable project knowledge"))).toBe(true);
  });

  it("deduplicates repeated latent learning branches while keeping spans consistent", async () => {
    const snapshot = await getProjectSnapshot();
    const initialBranchLabels = snapshot!.branches.map((branch) => branch.label);

    await handleUserPrompt(snapshot!.project.id, snapshot!.activeThread!.id, "hi");
    await handleUserPrompt(snapshot!.project.id, snapshot!.activeThread!.id, "hi again");
    const updated = (await getProjectSnapshot(snapshot!.project.id, snapshot!.activeThread!.id))!;
    const learningNodes = updated.nodes.filter((node) => node.title === "Learning Answer");
    const latestLearningNode = learningNodes[learningNodes.length - 1];

    expect(updated.branches.map((branch) => branch.label)).toEqual(initialBranchLabels);
    expect(updated.spans.some((span) => span.nodeId === latestLearningNode.id && span.text === "core concept")).toBe(true);
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

  it("deletes the last project without recreating seed data", async () => {
    const snapshot = await getProjectSnapshot();
    const target = await deleteProject(snapshot!.project.id);
    const updated = await getProjectSnapshot();

    expect(target.project).toBeUndefined();
    expect(target.thread).toBeUndefined();
    expect(updated).toBeNull();
  });

  it("deletes the last thread without recreating a fallback thread", async () => {
    const snapshot = await getProjectSnapshot();
    const target = await deleteThread(snapshot!.project.id, snapshot!.activeThread!.id);
    const updated = await getProjectSnapshot(snapshot!.project.id, target.thread?.id);

    expect(target.project?.id).toBe(snapshot!.project.id);
    expect(target.thread).toBeUndefined();
    expect(updated?.threads.some((thread) => thread.projectId === snapshot!.project.id)).toBe(false);
    expect(updated?.activeThread).toBeUndefined();
  });

  it("creates a new thread from powered context", async () => {
    const snapshot = await getProjectSnapshot();
    const thread = await createThreadFromContext(snapshot!.project.id, snapshot!.activeThread!.id, "core concept");
    const updated = await getProjectSnapshot(snapshot!.project.id, thread.id);

    expect(updated?.activeThread?.title).toBe("Flow: core concept");
    expect(updated?.threadLinks).toContainEqual(
      expect.objectContaining({
        sourceThreadId: snapshot!.activeThread!.id,
        targetThreadId: thread.id,
        sourceText: "core concept",
        type: "SPUN_OFF_FROM"
      })
    );
    expect(updated?.turns).toHaveLength(1);
    expect(updated?.turns[0].role).toBe("USER");
    expect(updated?.turns[0].content).toContain("Start a new learning flow");
    expect(updated?.turns[0].content).toContain("core concept");
  });
});
