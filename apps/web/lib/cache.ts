import { createHash } from "node:crypto";
import { prisma } from "./prisma";

const memoryCache = new Map<string, unknown>();

export type GenerationCacheKey = {
  projectId: string;
  taskType: string;
  source: string;
  modelVersion: string;
  promptVersion: string;
};

export function buildCacheKey(input: GenerationCacheKey) {
  return createHash("sha256")
    .update([input.taskType, input.source, input.modelVersion, input.promptVersion].join("\n"))
    .digest("hex");
}

function shouldUsePrismaCache() {
  return Boolean(process.env.DATABASE_URL) && process.env.FORKS_STORE !== "memory" && process.env.NODE_ENV !== "test";
}

export async function getCachedGeneration<T>(input: GenerationCacheKey): Promise<T | null> {
  const cacheKey = buildCacheKey(input);
  if (!shouldUsePrismaCache()) {
    return (memoryCache.get(`${input.projectId}:${cacheKey}`) as T | undefined) ?? null;
  }

  const entry = await prisma.cacheEntry.findUnique({
    where: { projectId_cacheKey: { projectId: input.projectId, cacheKey } }
  });
  return entry ? (entry.value as T) : null;
}

export async function setCachedGeneration<T>(input: GenerationCacheKey, value: T) {
  const cacheKey = buildCacheKey(input);
  if (!shouldUsePrismaCache()) {
    memoryCache.set(`${input.projectId}:${cacheKey}`, value);
    return value;
  }

  await prisma.cacheEntry.upsert({
    where: { projectId_cacheKey: { projectId: input.projectId, cacheKey } },
    update: { value: value as object, modelVersion: input.modelVersion, promptVersion: input.promptVersion },
    create: {
      projectId: input.projectId,
      taskType: input.taskType,
      cacheKey,
      value: value as object,
      modelVersion: input.modelVersion,
      promptVersion: input.promptVersion
    }
  });
  return value;
}
