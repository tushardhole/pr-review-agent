import { ReviewPoster } from "../review-poster";
import { PullRequestContext, ReviewPayload } from "../../types";

describe("ReviewPoster", () => {
  const createReview = jest.fn();
  const poster = new ReviewPoster({ rest: { pulls: { createReview } } });
  const context: PullRequestContext = { owner: "acme", repo: "widget", pullNumber: 7 };
  const payload: ReviewPayload = {
    summary: "Plain summary should not be used",
    request: {
      body: "✅ Suggested decision: APPROVE\n\nAI review summary",
      event: "COMMENT",
      comments: [{ path: "src/a.ts", line: 10, side: "RIGHT", body: "[Warning] Use guard clause." }]
    }
  };

  beforeEach(() => jest.clearAllMocks());

  it("posts createReview payload", async () => {
    createReview.mockResolvedValue({});
    await poster.postReview(context, payload);
    expect(createReview).toHaveBeenCalledWith({
      owner: "acme",
      repo: "widget",
      pull_number: 7,
      body: "✅ Suggested decision: APPROVE\n\nAI review summary",
      event: "COMMENT",
      comments: [{ path: "src/a.ts", line: 10, side: "RIGHT", body: "[Warning] Use guard clause." }]
    });
  });
});
