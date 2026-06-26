import { describe, expect, it } from "vitest";
import { branchStatuses, branchTypes, chatRoles, nodeTypes, pinTargets } from "@/lib/domain";

describe("domain constants", () => {
  it("keeps core product enums available to the app", () => {
    expect(chatRoles).toContain("USER");
    expect(chatRoles).toContain("ASSISTANT");
    expect(nodeTypes).toContain("ASSISTANT_ANSWER");
    expect(branchTypes).toContain("DEFINITION");
    expect(branchStatuses).toContain("LATENT");
    expect(pinTargets).toContain("BRANCH");
  });
});
