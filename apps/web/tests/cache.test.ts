import { describe, expect, it } from "vitest";
import { buildCacheKey, getCachedGeneration, setCachedGeneration } from "@/lib/cache";

describe("generation cache", () => {
  it("builds stable keys from task, source, model, and prompt versions", () => {
    const input = {
      projectId: "project_1",
      taskType: "branch",
      source: "Define idempotency",
      modelVersion: "mock",
      promptVersion: "branch.v1"
    };

    expect(buildCacheKey(input)).toBe(buildCacheKey(input));
    expect(buildCacheKey({ ...input, promptVersion: "branch.v2" })).not.toBe(buildCacheKey(input));
  });

  it("stores deterministic memory cache entries in tests", async () => {
    const input = {
      projectId: "project_1",
      taskType: "branch",
      source: "Define retries",
      modelVersion: "mock",
      promptVersion: "branch.v1"
    };

    await setCachedGeneration(input, { title: "Define retries" });
    await expect(getCachedGeneration(input)).resolves.toEqual({ title: "Define retries" });
  });
});
