"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProject,
  createThread,
  deleteProject,
  deleteThread,
  exportMarkdown,
  exportPdf,
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
  const { project, thread } = await createProject(title);
  revalidatePath("/");
  redirect(`/?project=${project.id}&thread=${thread.id}`);
}

export async function createThreadAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  const title = getString(formData, "title") || "New learning thread";
  if (!projectId) return;
  const thread = await createThread(projectId, title);
  revalidatePath("/");
  redirect(`/?project=${projectId}&thread=${thread.id}`);
}

export async function deleteProjectAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  if (!projectId) return;
  const target = await deleteProject(projectId);
  revalidatePath("/");
  if (target.project && target.thread) {
    redirect(`/?project=${target.project.id}&thread=${target.thread.id}`);
  }
  redirect("/");
}

export async function deleteThreadAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  const threadId = getString(formData, "threadId");
  if (!projectId || !threadId) return;
  const target = await deleteThread(projectId, threadId);
  revalidatePath("/");
  if (target.project && target.thread) {
    redirect(`/?project=${target.project.id}&thread=${target.thread.id}`);
  }
  redirect(`/?project=${projectId}`);
}

export async function submitPromptAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  const threadId = getString(formData, "threadId");
  const prompt = getString(formData, "prompt");
  if (!projectId || !threadId || !prompt) return;
  await handleUserPrompt(projectId, threadId, prompt);
  revalidatePath("/");
  redirect(`/?project=${projectId}&thread=${threadId}`);
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

export async function exportPdfAction(formData: FormData) {
  const projectId = getString(formData, "projectId");
  const noteId = getString(formData, "noteId") || undefined;
  if (!projectId) return;
  await exportPdf(projectId, noteId);
  revalidatePath("/");
}
