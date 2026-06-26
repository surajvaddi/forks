"use server";

import { revalidatePath } from "next/cache";
import {
  createProject,
  createThread,
  exportMarkdown,
  generateBranch,
  handleUserPrompt,
  mergePins,
  togglePin,
  updateNote
} from "@/lib/store";
import type { PinTarget } from "@/lib/domain";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createProjectAction(formData: FormData) {
  const title = getString(formData, "title");
  if (!title) return;
  await createProject(title);
  revalidatePath("/");
}

export async function createThreadAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  const title = getString(formData, "title") || "New learning thread";
  if (!projectId) return;
  await createThread(projectId, title);
  revalidatePath("/");
}

export async function submitPromptAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  const threadId = getString(formData, "threadId");
  const prompt = getString(formData, "prompt");
  if (!projectId || !threadId || !prompt) return;
  await handleUserPrompt(projectId, threadId, prompt);
  revalidatePath("/");
}

export async function expandBranchAction(formData: FormData) {
  const branchId = getString(formData, "branchId");
  if (!branchId) return;
  await generateBranch(branchId);
  revalidatePath("/");
}

export async function togglePinAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  const threadId = getString(formData, "threadId") || undefined;
  const targetId = getString(formData, "targetId");
  const targetType = getString(formData, "targetType") as PinTarget;
  const label = getString(formData, "label");
  if (!projectId || !targetId || !targetType || !label) return;
  await togglePin(projectId, targetId, targetType, label, threadId);
  revalidatePath("/");
}

export async function mergePinsAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  if (!projectId) return;
  await mergePins(projectId);
  revalidatePath("/");
}

export async function updateNoteAction(formData: FormData) {
  const noteId = getString(formData, "noteId");
  const content = getString(formData, "content");
  if (!noteId) return;
  await updateNote(noteId, content);
  revalidatePath("/");
}

export async function exportMarkdownAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  const noteId = getString(formData, "noteId") || undefined;
  if (!projectId) return;
  await exportMarkdown(projectId, noteId);
  revalidatePath("/");
}
