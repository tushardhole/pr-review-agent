import { filterResolvableComments } from "../review-comment-validator";
import { GitHubReviewRequest, PrFile } from "../../types";

describe("filterResolvableComments", () => {
  it("keeps only comments on resolvable added lines", () => {
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
    expect(result.request.body).toContain("were omitted");
  });
});
