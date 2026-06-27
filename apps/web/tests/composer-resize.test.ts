import { describe, expect, it } from "vitest";
import { clampComposerHeight, defaultComposerHeight, getMaxComposerHeight, minComposerHeight } from "@/lib/composer-resize";

describe("composer resize bounds", () => {
  it("keeps the default height between min and max", () => {
    expect(defaultComposerHeight).toBeGreaterThanOrEqual(minComposerHeight);
    expect(defaultComposerHeight).toBeLessThanOrEqual(getMaxComposerHeight(900));
  });

  it("clamps below the minimum height", () => {
    expect(clampComposerHeight(20, 900)).toBe(minComposerHeight);
  });

  it("clamps above the viewport-aware maximum height", () => {
    expect(clampComposerHeight(900, 500)).toBe(200);
  });
});
