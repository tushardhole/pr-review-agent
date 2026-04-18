import { buildContextSummary, ReviewContextPayload } from "../context-assembler";

describe("buildContextSummary", () => {
  it("builds a complete summary", () => {
    const payload: ReviewContextPayload = {
      metadata: { title: "Add auth", body: "Please review", baseRef: "main", headRef: "feat/auth" },
      repositoryTree: ["src/a.ts", "src/b.ts"],
      conventionFiles: [{ path: "CONTRIBUTING.md", content: "Use tests." }],
      changedFiles: [
        { filename: "src/a.ts", status: "modified", additions: 2, deletions: 1, changes: 3, patch: "@@ ..." }
      ]
    };
    const text = buildContextSummary(payload);
    expect(text).toContain("PR Title: Add auth");
    expect(text).toContain("Repository Tree:\nsrc/a.ts");
    expect(text).toContain("Use tests.");
    expect(text).toContain("File: src/a.ts");
  });
});
