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

  it("retries with summary-only comment when line resolution fails", async () => {
    createReview
      .mockRejectedValueOnce({ status: 422, message: 'Unprocessable Entity: "Line could not be resolved"' })
      .mockResolvedValueOnce({});

    await poster.postReview(context, payload);

    expect(createReview).toHaveBeenNthCalledWith(1, {
      owner: "acme",
      repo: "widget",
      pull_number: 7,
      body: "✅ Suggested decision: APPROVE\n\nAI review summary",
      event: "COMMENT",
      comments: [{ path: "src/a.ts", line: 10, side: "RIGHT", body: "[Warning] Use guard clause." }]
    });
    expect(createReview).toHaveBeenNthCalledWith(2, {
      owner: "acme",
      repo: "widget",
      pull_number: 7,
      body:
        "✅ Suggested decision: APPROVE\n\nAI review summary\n\n⚠️ Inline comments were removed because GitHub could not resolve at least one target line.",
      event: "COMMENT",
      comments: []
    });
  });
});
