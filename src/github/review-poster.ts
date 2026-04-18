import { IReviewPoster, OctokitClient, PullRequestContext, ReviewPayload } from "../types";

export class ReviewPoster implements IReviewPoster {
  constructor(private readonly octokit: OctokitClient) {}

  async postReview(context: PullRequestContext, payload: ReviewPayload): Promise<void> {
    if (!this.octokit.rest.pulls?.createReview) {
      throw new Error("Octokit createReview API is not available.");
    }
    await this.octokit.rest.pulls.createReview({
      owner: context.owner,
      repo: context.repo,
      pull_number: context.pullNumber,
      body: payload.summary,
      event: payload.request.event,
      comments: payload.request.comments
    });
  }
}
