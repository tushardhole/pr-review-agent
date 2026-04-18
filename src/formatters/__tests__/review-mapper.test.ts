import { mapReviewResultToRequest } from "../review-mapper";

describe("mapReviewResultToRequest", () => {
  it("maps request_changes to a comment event with red badge", () => {
    const request = mapReviewResultToRequest({
      summary: "Needs fixes",
      approval: "request_changes",
      comments: [{ path: "src/a.ts", line: 2, severity: "critical", body: "Potential injection." }]
    });
    expect(request.event).toBe("COMMENT");
    expect(request.body).toContain("🚨 Suggested decision: REQUEST_CHANGES");
    expect(request.comments[0].body).toContain("[Critical]");
  });

  it("maps approve to a comment event with green badge", () => {
    const request = mapReviewResultToRequest({
      summary: "Looks good",
      approval: "approve",
      comments: []
    });
    expect(request.event).toBe("COMMENT");
    expect(request.body).toContain("✅ Suggested decision: APPROVE");
  });
});
