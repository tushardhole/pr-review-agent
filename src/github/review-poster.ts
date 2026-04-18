import { IReviewPoster, OctokitClient, PullRequestContext, ReviewPayload } from "../types";

const isLineResolutionError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const candidate = error as { status?: number; message?: string };
  return candidate.status === 422 && typeof candidate.message === "string" && candidate.message.includes("Line could not be resolved");
};

export class ReviewPoster implements IReviewPoster {
  constructor(private readonly octokit: OctokitClient) {}

  async postReview(context: PullRequestContext, payload: ReviewPayload): Promise<void> {
    if (!this.octokit.rest.pulls?.createReview) {
      throw new Error("Octokit createReview API is not available.");
    }
    const baseRequest = {
      owner: context.owner,
      repo: context.repo,
      pull_number: context.pullNumber,
      body: payload.request.body,
      event: payload.request.event
    };
    try {
      await this.octokit.rest.pulls.createReview({ ...baseRequest, comments: payload.request.comments });
    } catch (error) {
      if (!isLineResolutionError(error) || payload.request.comments.length === 0) {
        throw error;
      }
      await this.octokit.rest.pulls.createReview({
        ...baseRequest,
        body: `${payload.request.body}\n\n⚠️ Inline comments were removed because GitHub could not resolve at least one target line.`,
        comments: []
      });
    }
  }
}
