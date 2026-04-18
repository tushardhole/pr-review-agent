import { REVIEW_RESULT_SCHEMA, validateReviewResult } from "../review-schema";

describe("REVIEW_RESULT_SCHEMA", () => {
  it("defines required top-level fields", () => {
    expect(REVIEW_RESULT_SCHEMA.required).toEqual(["summary", "comments", "approval"]);
  });

  it("accepts valid review payloads", () => {
    const valid = {
      summary: "Looks good",
      approval: "comment",
      comments: [{ path: "src/a.ts", line: 2, severity: "warning", body: "Add guard." }]
    };
    expect(validateReviewResult(valid)).toBe(true);
  });

  it("rejects invalid review payloads", () => {
    const invalid = { summary: "x", approval: "bad", comments: [] };
    expect(validateReviewResult(invalid)).toBe(false);
  });
});
