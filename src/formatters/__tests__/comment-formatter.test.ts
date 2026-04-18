import { formatCommentBody } from "../comment-formatter";

describe("formatCommentBody", () => {
  it("prefixes comment with severity tag", () => {
    const formatted = formatCommentBody({
      path: "src/a.ts",
      line: 1,
      severity: "warning",
      body: "Guard against null."
    });
    expect(formatted).toBe("[Warning] Guard against null.");
  });
});
