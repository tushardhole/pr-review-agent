import { buildSystemPrompt } from "../system-prompt";

describe("buildSystemPrompt", () => {
  it("contains reviewer directives", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("senior code reviewer");
    expect(prompt).toContain("Return ONLY raw JSON");
    expect(prompt).toContain("approval must be exactly one of");
  });
});
