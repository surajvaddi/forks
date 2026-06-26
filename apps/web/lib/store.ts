import type { BranchDraft, BranchStatus, BranchType, PinTarget, SpanDraft } from "./domain";
import { createId } from "./ids";
import { getLlmAdapter } from "./llm";
import { rankBranches } from "./branch-ranking";

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
  type: "MARKDOWN";
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

export function getStore() {
  if (!globalStore.forksStore) {
    globalStore.forksStore = createSeedState();
  }

  return globalStore.forksStore;
}

export function resetStoreForTests() {
  globalStore.forksStore = createSeedState();
}

export function getProjectSnapshot(projectId?: string, threadId?: string) {
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
  const store = getStore();
  const stamp = now();
  const project: ProjectRecord = { id: createId("project"), title, createdAt: stamp, updatedAt: stamp };
  const thread: ThreadRecord = { id: createId("thread"), projectId: project.id, title: "First learning thread", createdAt: stamp, updatedAt: stamp };
  store.projects.push(project);
  store.threads.push(thread);
  return { project, thread };
}

export async function createThread(projectId: string, title: string) {
  const store = getStore();
  const stamp = now();
  const thread: ThreadRecord = { id: createId("thread"), projectId, title, createdAt: stamp, updatedAt: stamp };
  store.threads.push(thread);
  return thread;
}

export async function handleUserPrompt(projectId: string, threadId: string, prompt: string) {
  const store = getStore();
  const project = store.projects.find((item) => item.id === projectId);
  const thread = store.threads.find((item) => item.id === threadId && item.projectId === projectId);
  if (!project || !thread) throw new Error("Project thread not found.");

  const stamp = now();
  const userTurn: ChatTurnRecord = { id: createId("turn"), projectId, threadId, role: "USER", content: prompt, createdAt: stamp };
  store.turns.push(userTurn);

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

  return { userTurn, assistantTurn, node, spans, branches };
}

export async function generateDefinition(term: string, context: string) {
  return getLlmAdapter().generateDefinition(term, context);
}

export async function generateBranch(branchId: string) {
  const store = getStore();
  const branch = store.branches.find((item) => item.id === branchId);
  if (!branch) throw new Error("Branch not found.");
  if (branch.generatedNodeId) return branch;
  const sourceNode = store.nodes.find((node) => node.id === branch.sourceNodeId);
  const generated = await getLlmAdapter().generateBranch(branch.label, sourceNode?.content ?? branch.preview);
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
  return branch;
}

export async function togglePin(projectId: string, targetId: string, targetType: PinTarget, label: string, threadId?: string) {
  const store = getStore();
  const existing = store.pins.find((pin) => pin.projectId === projectId && pin.targetId === targetId && pin.targetType === targetType);
  if (existing) {
    store.pins = store.pins.filter((pin) => pin.id !== existing.id);
    return null;
  }
  const pin: PinRecord = { id: createId("pin"), projectId, threadId, targetId, targetType, label, createdAt: now() };
  store.pins.push(pin);
  return pin;
}

export async function mergePins(projectId: string) {
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
  return note;
}

export async function updateNote(noteId: string, content: string) {
  const store = getStore();
  const note = store.notes.find((item) => item.id === noteId);
  if (!note) throw new Error("Note not found.");
  note.content = content;
  note.updatedAt = now();
  return note;
}

export async function exportMarkdown(projectId: string, noteId?: string) {
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
  return record;
}
