import { describe, expect, it } from "vitest";
import { insertTextAtCaret } from "@/lib/text-insertion";

describe("insertTextAtCaret", () => {
  it("inserts into an empty input", () => {
    expect(insertTextAtCaret("", "core concept", 0)).toEqual({ value: "core concept", caretOffset: "core concept".length });
  });

  it("inserts in the middle with existing whitespace preserved", () => {
    expect(insertTextAtCaret("Explain  next", "core concept", "Explain ".length)).toEqual({
      value: "Explain core concept next",
      caretOffset: "Explain core concept".length
    });
  });

  it("replaces selected text", () => {
    expect(insertTextAtCaret("Explain old idea next", "core concept", "Explain ".length, "Explain old idea".length)).toEqual({
      value: "Explain core concept next",
      caretOffset: "Explain core concept".length
    });
  });

  it("adds spaces when insertion touches surrounding words", () => {
    expect(insertTextAtCaret("Explainnext", "core concept", "Explain".length)).toEqual({
      value: "Explain core concept next",
      caretOffset: "Explain core concept".length
    });
  });
});
