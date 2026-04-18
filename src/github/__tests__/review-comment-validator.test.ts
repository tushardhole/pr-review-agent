import { filterResolvableComments } from "../review-comment-validator";
import { GitHubReviewRequest, PrFile } from "../../types";

describe("filterResolvableComments", () => {
  it("keeps only comments on resolvable added lines and omits note by default", () => {
    const files: PrFile[] = [
      {
        filename: "src/a.ts",
        status: "modified",
        additions: 2,
        deletions: 1,
        changes: 3,
        patch: "@@ -1,2 +1,3 @@\n line1\n-line2\n+line2Updated\n+line3"
      }
    ];
    const request: GitHubReviewRequest = {
      body: "review body",
      event: "COMMENT",
      comments: [
        { path: "src/a.ts", line: 2, side: "RIGHT", body: "valid" },
        { path: "src/a.ts", line: 99, side: "RIGHT", body: "invalid" }
      ]
    };

    const result = filterResolvableComments(request, files);

    expect(result.droppedComments).toBe(1);
    expect(result.request.comments).toEqual([{ path: "src/a.ts", line: 2, side: "RIGHT", body: "valid" }]);
    expect(result.request.body).toBe("review body");
  });

  it("includes omission note when diagnostics option is enabled", () => {
    const files: PrFile[] = [
      {
        filename: "src/a.ts",
        status: "modified",
        additions: 1,
        deletions: 0,
        changes: 1,
        patch: "@@ -1 +1 @@\n+line1"
      }
    ];
    const request: GitHubReviewRequest = {
      body: "review body",
      event: "COMMENT",
      comments: [
        { path: "src/a.ts", line: 1, side: "RIGHT", body: "valid" },
        { path: "src/a.ts", line: 9, side: "RIGHT", body: "invalid" }
      ]
    };
    const result = filterResolvableComments(request, files, { includeOmissionNote: true });
    expect(result.request.body).toContain("were omitted");
  });
});
