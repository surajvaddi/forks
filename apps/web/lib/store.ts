import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { BranchDraft, BranchStatus, BranchType, PinTarget, SpanDraft } from "./domain";
import { createId } from "./ids";
import { getLlmAdapter } from "./llm";
import { rankBranches } from "./branch-ranking";
import { prisma } from "./prisma";
import { getCachedGeneration, setCachedGeneration } from "./cache";
import { promptVersions } from "./prompts";
import { createSimplePdf } from "./pdf";
import { logForksEvent } from "./observability";

export type ProjectRecord = {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ThreadRecord = {
  id: string;
  projectId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatTurnRecord = {
  id: string;
  projectId: string;
  threadId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  nodeId?: string;
  createdAt: Date;
};

export type NodeRecord = {
  id: string;
  projectId: string;
  threadId?: string;
  chatTurnId?: string;
  type: "USER_PROMPT" | "ASSISTANT_ANSWER" | "DEFINITION" | "MERGED_NOTE";
  title?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SpanRecord = SpanDraft & {
  id: string;
  projectId: string;
  nodeId: string;
};

export type BranchRecord = BranchDraft & {
  id: string;
  projectId: string;
  sourceNodeId: string;
  sourceSpanId?: string;
  sourceThreadId?: string;
  generatedNodeId?: string;
  status: BranchStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PinRecord = {
  id: string;
  projectId: string;
  threadId?: string;
  targetId: string;
  targetType: PinTarget;
  label: string;
  note?: string;
  createdAt: Date;
};

export type MergedNoteRecord = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  sourceIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ExportRecord = {
  id: string;
  projectId: string;
  type: "MARKDOWN" | "PDF";
  title: string;
  content: string;
  sourceIds: string[];
  createdAt: Date;
};

type StoreState = {
  projects: ProjectRecord[];
  threads: ThreadRecord[];
  turns: ChatTurnRecord[];
  nodes: NodeRecord[];
  spans: SpanRecord[];
  branches: BranchRecord[];
  pins: PinRecord[];
  notes: MergedNoteRecord[];
  exports: ExportRecord[];
};

const globalStore = globalThis as unknown as { forksStore?: StoreState };
const devStorePath = join(process.cwd(), "../../.forks-store.json");

function shouldUsePrismaStore() {
  return Boolean(process.env.DATABASE_URL) && process.env.FORKS_STORE !== "memory" && process.env.NODE_ENV !== "test";
}

function shouldUseFileBackedMemoryStore() {
  return !shouldUsePrismaStore() && process.env.NODE_ENV !== "test";
}

function now() {
  return new Date();
}

function createSeedState(): StoreState {
  const createdAt = now();
  const project: ProjectRecord = {
    id: "project_seed",
    title: "Distributed Systems Prep",
    description: "A project for learning fault-tolerant systems through native chat.",
    createdAt,
    updatedAt: createdAt
  };
  const thread: ThreadRecord = {
    id: "thread_seed",
    projectId: project.id,
    title: "Fault-tolerant job queues",
    createdAt,
    updatedAt: createdAt
  };
  return { projects: [project], threads: [thread], turns: [], nodes: [], spans: [], branches: [], pins: [], notes: [], exports: [] };
}

function reviveDate(value: unknown) {
  return typeof value === "string" ? new Date(value) : value instanceof Date ? value : now();
}

function reviveStore(raw: StoreState): StoreState {
  return {
    projects: raw.projects.map((item) => ({ ...item, createdAt: reviveDate(item.createdAt), updatedAt: reviveDate(item.updatedAt) })),
    threads: raw.threads.map((item) => ({ ...item, createdAt: reviveDate(item.createdAt), updatedAt: reviveDate(item.updatedAt) })),
    turns: raw.turns.map((item) => ({ ...item, createdAt: reviveDate(item.createdAt) })),
    nodes: raw.nodes.map((item) => ({ ...item, createdAt: reviveDate(item.createdAt), updatedAt: reviveDate(item.updatedAt) })),
    spans: raw.spans,
    branches: raw.branches.map((item) => ({ ...item, createdAt: reviveDate(item.createdAt), updatedAt: reviveDate(item.updatedAt) })),
    pins: raw.pins.map((item) => ({ ...item, createdAt: reviveDate(item.createdAt) })),
    notes: raw.notes.map((item) => ({ ...item, createdAt: reviveDate(item.createdAt), updatedAt: reviveDate(item.updatedAt) })),
    exports: raw.exports.map((item) => ({ ...item, createdAt: reviveDate(item.createdAt) }))
  };
}

function readFileBackedStore() {
  if (!shouldUseFileBackedMemoryStore() || !existsSync(devStorePath)) {
    return null;
  }

  try {
    return reviveStore(JSON.parse(readFileSync(devStorePath, "utf8")) as StoreState);
  } catch {
    return null;
  }
}

function persistFileBackedStore(store: StoreState) {
  if (!shouldUseFileBackedMemoryStore()) return;
  writeFileSync(devStorePath, JSON.stringify(store, null, 2));
}

export function getStore() {
  if (!globalStore.forksStore) {
    globalStore.forksStore = readFileBackedStore() ?? createSeedState();
    persistFileBackedStore(globalStore.forksStore);
  }

  return globalStore.forksStore;
}

export function resetStoreForTests() {
  globalStore.forksStore = createSeedState();
}

function persistCurrentStore() {
  const store = getStore();
  persistFileBackedStore(store);
}

export async function getProjectSnapshot(projectId?: string, threadId?: string) {
  if (shouldUsePrismaStore()) {
    return getPrismaProjectSnapshot(projectId, threadId);
  }

  const store = getStore();
  const project = projectId ? store.projects.find((item) => item.id === projectId) : store.projects[0];
  if (!project) return null;
  const threads = store.threads.filter((item) => item.projectId === project.id);
  const activeThread = threadId ? threads.find((item) => item.id === threadId) : threads[0];
  const turns = activeThread ? store.turns.filter((turn) => turn.threadId === activeThread.id) : [];
  const nodes = store.nodes.filter((node) => node.projectId === project.id);
  const spans = store.spans.filter((span) => span.projectId === project.id);
  const branches = rankBranches(store.branches.filter((branch) => branch.projectId === project.id));
  const pins = store.pins.filter((pin) => pin.projectId === project.id);
  const notes = store.notes.filter((note) => note.projectId === project.id);
  const exports = store.exports.filter((record) => record.projectId === project.id);

  return { project, projects: store.projects, threads, activeThread, turns, nodes, spans, branches, pins, notes, exports };
}

export async function createProject(title: string) {
  if (shouldUsePrismaStore()) {
    return createPrismaProject(title);
  }

  const store = getStore();
  const stamp = now();
  const project: ProjectRecord = { id: createId("project"), title, createdAt: stamp, updatedAt: stamp };
  const thread: ThreadRecord = { id: createId("thread"), projectId: project.id, title: "First learning thread", createdAt: stamp, updatedAt: stamp };
  store.projects.push(project);
  store.threads.push(thread);
  persistCurrentStore();
  return { project, thread };
}

export async function createThread(projectId: string, title: string) {
  if (shouldUsePrismaStore()) {
    return createPrismaThread(projectId, title);
  }

  const store = getStore();
  const stamp = now();
  const thread: ThreadRecord = { id: createId("thread"), projectId, title, createdAt: stamp, updatedAt: stamp };
  store.threads.push(thread);
  persistCurrentStore();
  return thread;
}

export async function handleUserPrompt(projectId: string, threadId: string, prompt: string) {
  if (shouldUsePrismaStore()) {
    return handlePrismaUserPrompt(projectId, threadId, prompt);
  }

  const store = getStore();
  const project = store.projects.find((item) => item.id === projectId);
  const thread = store.threads.find((item) => item.id === threadId && item.projectId === projectId);
  if (!project || !thread) throw new Error("Project thread not found.");

  const stamp = now();
  const userTurn: ChatTurnRecord = { id: createId("turn"), projectId, threadId, role: "USER", content: prompt, createdAt: stamp };
  store.turns.push(userTurn);
  logForksEvent("chat.prompt_submitted", { projectId, threadId, provider: "memory" });

  const llm = getLlmAdapter();
  const pinnedContext = store.pins.filter((pin) => pin.projectId === projectId).map((pin) => pin.label);
  const answer = await llm.generateAnswer({ prompt, projectTitle: project.title, pinnedContext });
  const assistantTurn: ChatTurnRecord = {
    id: createId("turn"),
    projectId,
    threadId,
    role: "ASSISTANT",
    content: answer.content,
    createdAt: now()
  };
  store.turns.push(assistantTurn);

  const node: NodeRecord = {
    id: createId("node"),
    projectId,
    threadId,
    chatTurnId: assistantTurn.id,
    type: "ASSISTANT_ANSWER",
    title: answer.title,
    content: answer.content,
    createdAt: now(),
    updatedAt: now()
  };
  assistantTurn.nodeId = node.id;
  store.nodes.push(node);

  const spanDrafts = await llm.extractSpans(answer.content);
  const spans: SpanRecord[] = spanDrafts.map((span) => ({ ...span, id: createId("span"), projectId, nodeId: node.id }));
  store.spans.push(...spans);

  const branchDrafts = await llm.inferBranches(answer.content, spanDrafts);
  const branches = branchDrafts.map((branch) => {
    const sourceSpan = spans.find((span) => span.text.toLowerCase() === branch.sourceSpanText?.toLowerCase());
    return {
      ...branch,
      id: createId("branch"),
      projectId,
      sourceNodeId: node.id,
      sourceSpanId: sourceSpan?.id,
      sourceThreadId: threadId,
      status: "LATENT" as const,
      createdAt: now(),
      updatedAt: now()
    };
  });
  store.branches.push(...branches);
  logForksEvent("chat.answer_generated", { projectId, threadId, spans: spans.length, branches: branches.length, provider: "memory" });
  persistCurrentStore();

  return { userTurn, assistantTurn, node, spans, branches };
}

export async function generateDefinition(term: string, context: string) {
  return getLlmAdapter().generateDefinition(term, context);
}

export async function generateBranch(branchId: string) {
  if (shouldUsePrismaStore()) {
    return generatePrismaBranch(branchId);
  }

  const store = getStore();
  const branch = store.branches.find((item) => item.id === branchId);
  if (!branch) throw new Error("Branch not found.");
  if (branch.generatedNodeId) return branch;
  const sourceNode = store.nodes.find((node) => node.id === branch.sourceNodeId);
  const source = sourceNode?.content ?? branch.preview;
  const cacheInput = {
    projectId: branch.projectId,
    taskType: "branch",
    source: `${branch.label}\n${source}`,
    modelVersion: process.env.LLM_PROVIDER ?? "mock",
    promptVersion: promptVersions.branch
  };
  const generated =
    (await getCachedGeneration<{ title: string; content: string }>(cacheInput)) ??
    (await setCachedGeneration(cacheInput, await getLlmAdapter().generateBranch(branch.label, source)));
  const node: NodeRecord = {
    id: createId("node"),
    projectId: branch.projectId,
    threadId: branch.sourceThreadId,
    type: "DEFINITION",
    title: generated.title,
    content: generated.content,
    createdAt: now(),
    updatedAt: now()
  };
  store.nodes.push(node);
  branch.generatedNodeId = node.id;
  branch.status = "GENERATED";
  branch.updatedAt = now();
  logForksEvent("branch.generated", { projectId: branch.projectId, branchId: branch.id, provider: "memory" });
  persistCurrentStore();
  return branch;
}

export async function togglePin(projectId: string, targetId: string, targetType: PinTarget, label: string, threadId?: string) {
  if (shouldUsePrismaStore()) {
    return togglePrismaPin(projectId, targetId, targetType, label, threadId);
  }

  const store = getStore();
  const existing = store.pins.find((pin) => pin.projectId === projectId && pin.targetId === targetId && pin.targetType === targetType);
  if (existing) {
    store.pins = store.pins.filter((pin) => pin.id !== existing.id);
    logForksEvent("pin.toggled", { projectId, targetType, pinned: false, provider: "memory" });
    persistCurrentStore();
    return null;
  }
  const pin: PinRecord = { id: createId("pin"), projectId, threadId, targetId, targetType, label, createdAt: now() };
  store.pins.push(pin);
  logForksEvent("pin.toggled", { projectId, targetType, pinned: true, provider: "memory" });
  persistCurrentStore();
  return pin;
}

export async function mergePins(projectId: string) {
  if (shouldUsePrismaStore()) {
    return mergePrismaPins(projectId);
  }

  const store = getStore();
  const pins = store.pins.filter((pin) => pin.projectId === projectId);
  const inputs = pins.map((pin) => {
    const branch = store.branches.find((item) => item.id === pin.targetId);
    const node = branch?.generatedNodeId ? store.nodes.find((item) => item.id === branch.generatedNodeId) : store.nodes.find((item) => item.id === pin.targetId);
    return { label: pin.label, content: node?.content ?? pin.note ?? pin.label };
  });
  const merged = await getLlmAdapter().mergeBranches(inputs);
  const note: MergedNoteRecord = {
    id: createId("note"),
    projectId,
    title: merged.title,
    content: merged.content,
    sourceIds: pins.map((pin) => pin.targetId),
    createdAt: now(),
    updatedAt: now()
  };
  store.notes.push(note);
  logForksEvent("note.merged", { projectId, sources: note.sourceIds.length, provider: "memory" });
  persistCurrentStore();
  return note;
}

export async function updateNote(noteId: string, content: string) {
  if (shouldUsePrismaStore()) {
    return updatePrismaNote(noteId, content);
  }

  const store = getStore();
  const note = store.notes.find((item) => item.id === noteId);
  if (!note) throw new Error("Note not found.");
  note.content = content;
  note.updatedAt = now();
  persistCurrentStore();
  return note;
}

export async function exportMarkdown(projectId: string, noteId?: string) {
  if (shouldUsePrismaStore()) {
    return exportPrismaMarkdown(projectId, noteId);
  }

  const store = getStore();
  const note = noteId ? store.notes.find((item) => item.id === noteId) : store.notes.find((item) => item.projectId === projectId);
  const content = note?.content ?? "# Forks Project Export\n\nNo merged note exists yet.";
  const record: ExportRecord = {
    id: createId("export"),
    projectId,
    type: "MARKDOWN",
    title: note?.title ?? "Forks Project Export",
    content,
    sourceIds: note ? [note.id] : [],
    createdAt: now()
  };
  store.exports.push(record);
  logForksEvent("export.created", { projectId, type: "MARKDOWN", provider: "memory" });
  persistCurrentStore();
  return record;
}

export async function exportPdf(projectId: string, noteId?: string) {
  if (shouldUsePrismaStore()) {
    return exportPrismaPdf(projectId, noteId);
  }

  const store = getStore();
  const note = noteId ? store.notes.find((item) => item.id === noteId) : store.notes.find((item) => item.projectId === projectId);
  const source = note?.content ?? "# Forks Project Export\n\nNo merged note exists yet.";
  const record: ExportRecord = {
    id: createId("export"),
    projectId,
    type: "PDF",
    title: `${note?.title ?? "Forks Project Export"}.pdf`,
    content: createSimplePdf(note?.title ?? "Forks Project Export", source),
    sourceIds: note ? [note.id] : [],
    createdAt: now()
  };
  store.exports.push(record);
  logForksEvent("export.created", { projectId, type: "PDF", provider: "memory" });
  persistCurrentStore();
  return record;
}

async function ensurePrismaSeed() {
  const existing = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;

  return prisma.project.create({
    data: {
      title: "Distributed Systems Prep",
      description: "A project for learning fault-tolerant systems through native chat.",
      threads: {
        create: {
          title: "Fault-tolerant job queues"
        }
      }
    }
  });
}

async function getPrismaProjectSnapshot(projectId?: string, threadId?: string) {
  await ensurePrismaSeed();
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  const project = projectId ? projects.find((item) => item.id === projectId) : projects[0];
  if (!project) return null;
  const projectRecord: ProjectRecord = { ...project, description: project.description ?? undefined };

  const threads = await prisma.thread.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "asc" } });
  const activeThread = threadId ? threads.find((item) => item.id === threadId) : threads[0];
  const turns = activeThread ? await prisma.chatTurn.findMany({ where: { threadId: activeThread.id }, orderBy: { createdAt: "asc" } }) : [];
  const nodes = await prisma.node.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "asc" } });
  const spans = await prisma.span.findMany({ where: { projectId: project.id }, orderBy: { startOffset: "asc" } });
  const branchesRaw = await prisma.branchCandidate.findMany({
    where: { projectId: project.id },
    include: { sourceSpan: true },
    orderBy: { createdAt: "asc" }
  });
  const pins = await prisma.pin.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "asc" } });
  const notes = await prisma.mergedNote.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } });
  const exports = await prisma.exportRecord.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } });

  const branches: BranchRecord[] = rankBranches(
    branchesRaw.map((branch) => ({
      id: branch.id,
      projectId: branch.projectId,
      sourceNodeId: branch.sourceNodeId,
      sourceSpanId: branch.sourceSpanId ?? undefined,
      sourceSpanText: branch.sourceSpan?.text,
      sourceThreadId: branch.sourceThreadId ?? undefined,
      generatedNodeId: branch.generatedNodeId ?? undefined,
      type: branch.type as BranchType,
      label: branch.label,
      preview: branch.preview ?? "",
      reason: branch.reason,
      estimatedValue: branch.estimatedValue,
      estimatedCost: branch.estimatedCost,
      status: branch.status as BranchStatus,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt
    }))
  );

  return {
    project: projectRecord,
    projects: projects.map((item) => ({ ...item, description: item.description ?? undefined })),
    threads,
    activeThread,
    turns: turns.map((turn) => ({ ...turn, role: turn.role as "USER" | "ASSISTANT", nodeId: undefined })),
    nodes: nodes.map((node) => ({
      ...node,
      threadId: node.threadId ?? undefined,
      chatTurnId: node.chatTurnId ?? undefined,
      title: node.title ?? undefined,
      compressedContent: node.compressedContent ?? undefined,
      type: node.type as NodeRecord["type"]
    })),
    spans: spans.map((span) => ({
      id: span.id,
      projectId: span.projectId,
      nodeId: span.nodeId,
      text: span.text,
      startOffset: span.startOffset,
      endOffset: span.endOffset,
      importanceScore: span.importanceScore,
      ambiguityScore: span.ambiguityScore
    })),
    branches,
    pins: pins.map((pin) => ({
      id: pin.id,
      projectId: pin.projectId,
      threadId: pin.threadId ?? undefined,
      targetId: pin.targetId,
      targetType: pin.targetType as PinTarget,
      label: pin.label ?? "Pinned item",
      note: pin.note ?? undefined,
      createdAt: pin.createdAt
    })),
    notes,
    exports: exports.map((record) => ({
      id: record.id,
      projectId: record.projectId,
      type: record.type as "MARKDOWN" | "PDF",
      title: record.title,
      content: record.content,
      sourceIds: record.sourceIds,
      createdAt: record.createdAt
    }))
  };
}

async function createPrismaProject(title: string) {
  const project = await prisma.project.create({
    data: {
      title,
      threads: {
        create: {
          title: "First learning thread"
        }
      }
    },
    include: { threads: true }
  });

  return { project, thread: project.threads[0] };
}

async function createPrismaThread(projectId: string, title: string) {
  return prisma.thread.create({ data: { projectId, title } });
}

async function handlePrismaUserPrompt(projectId: string, threadId: string, prompt: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const thread = await prisma.thread.findFirst({ where: { id: threadId, projectId } });
  if (!project || !thread) throw new Error("Project thread not found.");

  const userTurn = await prisma.chatTurn.create({ data: { projectId, threadId, role: "USER", content: prompt } });
  logForksEvent("chat.prompt_submitted", { projectId, threadId, provider: "prisma" });
  const pinnedContext = (await prisma.pin.findMany({ where: { projectId } })).map((pin) => pin.label ?? "");
  const llm = getLlmAdapter();
  const answer = await llm.generateAnswer({ prompt, projectTitle: project.title, pinnedContext });
  const assistantTurn = await prisma.chatTurn.create({ data: { projectId, threadId, role: "ASSISTANT", content: answer.content } });
  const node = await prisma.node.create({
    data: {
      projectId,
      threadId,
      chatTurnId: assistantTurn.id,
      type: "ASSISTANT_ANSWER",
      title: answer.title,
      content: answer.content
    }
  });

  const spanDrafts = await llm.extractSpans(answer.content);
  const spans = await Promise.all(
    spanDrafts.map((span) =>
      prisma.span.create({
        data: {
          projectId,
          nodeId: node.id,
          text: span.text,
          startOffset: span.startOffset,
          endOffset: span.endOffset,
          importanceScore: span.importanceScore,
          ambiguityScore: span.ambiguityScore
        }
      })
    )
  );

  const branchDrafts = await llm.inferBranches(answer.content, spanDrafts);
  const branches = await Promise.all(
    branchDrafts.map((branch) => {
      const sourceSpan = spans.find((span) => span.text.toLowerCase() === branch.sourceSpanText?.toLowerCase());
      return prisma.branchCandidate.create({
        data: {
          projectId,
          sourceNodeId: node.id,
          sourceSpanId: sourceSpan?.id,
          sourceThreadId: threadId,
          type: branch.type,
          label: branch.label,
          preview: branch.preview,
          reason: branch.reason,
          estimatedValue: branch.estimatedValue,
          estimatedCost: branch.estimatedCost,
          status: "LATENT"
        }
      });
    })
  );
  logForksEvent("chat.answer_generated", { projectId, threadId, spans: spans.length, branches: branches.length, provider: "prisma" });

  return { userTurn, assistantTurn, node, spans, branches };
}

async function generatePrismaBranch(branchId: string) {
  const branch = await prisma.branchCandidate.findUnique({ where: { id: branchId }, include: { sourceNode: true } });
  if (!branch) throw new Error("Branch not found.");
  if (branch.generatedNodeId) return branch;

  const cacheInput = {
    projectId: branch.projectId,
    taskType: "branch",
    source: `${branch.label}\n${branch.sourceNode.content}`,
    modelVersion: process.env.LLM_PROVIDER ?? "mock",
    promptVersion: promptVersions.branch
  };
  const generated =
    (await getCachedGeneration<{ title: string; content: string }>(cacheInput)) ??
    (await setCachedGeneration(cacheInput, await getLlmAdapter().generateBranch(branch.label, branch.sourceNode.content)));
  const node = await prisma.node.create({
    data: {
      projectId: branch.projectId,
      threadId: branch.sourceThreadId,
      type: "DEFINITION",
      title: generated.title,
      content: generated.content
    }
  });

  const updated = await prisma.branchCandidate.update({
    where: { id: branchId },
    data: { generatedNodeId: node.id, status: "GENERATED" }
  });
  logForksEvent("branch.generated", { projectId: branch.projectId, branchId, provider: "prisma" });
  return updated;
}

async function togglePrismaPin(projectId: string, targetId: string, targetType: PinTarget, label: string, threadId?: string) {
  const existing = await prisma.pin.findUnique({ where: { projectId_targetId_targetType: { projectId, targetId, targetType } } });
  if (existing) {
    await prisma.pin.delete({ where: { id: existing.id } });
    logForksEvent("pin.toggled", { projectId, targetType, pinned: false, provider: "prisma" });
    return null;
  }

  const pin = await prisma.pin.create({ data: { projectId, threadId, targetId, targetType, label } });
  logForksEvent("pin.toggled", { projectId, targetType, pinned: true, provider: "prisma" });
  return pin;
}

async function mergePrismaPins(projectId: string) {
  const pins = await prisma.pin.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } });
  const branches = await prisma.branchCandidate.findMany({ where: { projectId, id: { in: pins.map((pin) => pin.targetId) } } });
  const generatedNodeIds = branches.map((branch) => branch.generatedNodeId).filter(Boolean) as string[];
  const nodes = await prisma.node.findMany({ where: { projectId, OR: [{ id: { in: pins.map((pin) => pin.targetId) } }, { id: { in: generatedNodeIds } }] } });
  const inputs = pins.map((pin) => {
    const branch = branches.find((item) => item.id === pin.targetId);
    const node = branch?.generatedNodeId ? nodes.find((item) => item.id === branch.generatedNodeId) : nodes.find((item) => item.id === pin.targetId);
    return { label: pin.label ?? "Pinned item", content: node?.content ?? pin.note ?? pin.label ?? "Pinned item" };
  });
  const merged = await getLlmAdapter().mergeBranches(inputs);

  const note = await prisma.mergedNote.create({
    data: {
      projectId,
      title: merged.title,
      content: merged.content,
      sourceIds: pins.map((pin) => pin.targetId)
    }
  });
  logForksEvent("note.merged", { projectId, sources: pins.length, provider: "prisma" });
  return note;
}

async function updatePrismaNote(noteId: string, content: string) {
  return prisma.mergedNote.update({ where: { id: noteId }, data: { content } });
}

async function exportPrismaMarkdown(projectId: string, noteId?: string) {
  const note = noteId
    ? await prisma.mergedNote.findUnique({ where: { id: noteId } })
    : await prisma.mergedNote.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
  const content = note?.content ?? "# Forks Project Export\n\nNo merged note exists yet.";

  const record = await prisma.exportRecord.create({
    data: {
      projectId,
      type: "MARKDOWN",
      title: note?.title ?? "Forks Project Export",
      content,
      sourceIds: note ? [note.id] : []
    }
  });
  logForksEvent("export.created", { projectId, type: "MARKDOWN", provider: "prisma" });
  return record;
}

async function exportPrismaPdf(projectId: string, noteId?: string) {
  const note = noteId
    ? await prisma.mergedNote.findUnique({ where: { id: noteId } })
    : await prisma.mergedNote.findFirst({ where: { projectId }, orderBy: { createdAt: "desc" } });
  const source = note?.content ?? "# Forks Project Export\n\nNo merged note exists yet.";

  const record = await prisma.exportRecord.create({
    data: {
      projectId,
      type: "PDF",
      title: `${note?.title ?? "Forks Project Export"}.pdf`,
      content: createSimplePdf(note?.title ?? "Forks Project Export", source),
      sourceIds: note ? [note.id] : []
    }
  });
  logForksEvent("export.created", { projectId, type: "PDF", provider: "prisma" });
  return record;
}
