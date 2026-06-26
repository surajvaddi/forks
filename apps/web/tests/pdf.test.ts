import { describe, expect, it } from "vitest";
import { createSimplePdf } from "@/lib/pdf";

describe("createSimplePdf", () => {
  it("creates a minimal PDF payload", () => {
    const pdf = createSimplePdf("Test", "# Hello\n\nWorld");

    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf).toContain("xref");
    expect(pdf).toContain("Forks Export");
  });
});
