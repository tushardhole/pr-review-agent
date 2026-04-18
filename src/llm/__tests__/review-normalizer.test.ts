import { normalizeReviewPayload } from "../review-normalizer";

describe("normalizeReviewPayload", () => {
  it("maps boolean approval and message field", () => {
    const normalized = normalizeReviewPayload({
      summary: "summary",
      approval: false,
      comments: [{ path: "src/a.ts", line: "8", message: "Use guard clause." }]
    }) as { approval: string; comments: Array<{ body: string; line: number }> };
    expect(normalized.approval).toBe("request_changes");
    expect(normalized.comments[0]).toEqual({ path: "src/a.ts", line: 8, severity: "suggestion", body: "Use guard clause." });
  });

  it("drops comments missing required path and line", () => {
    const normalized = normalizeReviewPayload({
      summary: "summary",
      approval: "comment",
      comments: [{ line: 3, message: "Missing path." }, { path: "src/a.ts", message: "Missing line." }]
    }) as { comments: unknown[] };
    expect(normalized.comments).toEqual([]);
  });
});
