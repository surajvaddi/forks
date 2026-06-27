export const defaultComposerHeight = 128;
export const minComposerHeight = 96;
export const maxComposerHeight = 360;
export const maxComposerViewportRatio = 0.4;

export function getMaxComposerHeight(viewportHeight: number) {
  return Math.max(minComposerHeight, Math.min(maxComposerHeight, Math.floor(viewportHeight * maxComposerViewportRatio)));
}

export function clampComposerHeight(height: number, viewportHeight: number) {
  return Math.min(Math.max(height, minComposerHeight), getMaxComposerHeight(viewportHeight));
}
