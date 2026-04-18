import { buildUserPrompt } from "../user-prompt";

describe("buildUserPrompt", () => {
  it("builds prompt including extra instructions", () => {
    const prompt = buildUserPrompt({
      reviewLevel: "security-focused",
      contextSummary: "context text",
      extraPrompt: "prioritize auth checks"
    });
    expect(prompt).toContain("security-focused");
    expect(prompt).toContain("context text");
    expect(prompt).toContain("prioritize auth checks");
  });
});
