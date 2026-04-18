import { mapReviewResultToRequest } from "../review-mapper";

describe("mapReviewResultToRequest", () => {
  it("maps review result to GitHub review payload", () => {
    const request = mapReviewResultToRequest({
      summary: "Needs fixes",
      approval: "request_changes",
      comments: [{ path: "src/a.ts", line: 2, severity: "critical", body: "Potential injection." }]
    });
    expect(request.event).toBe("REQUEST_CHANGES");
    expect(request.comments[0].body).toContain("[Critical]");
  });
});
