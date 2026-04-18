import { GitHubReviewRequest, ReviewResult } from "../types";
import { formatCommentBody } from "./comment-formatter";

const toEvent = (approval: ReviewResult["approval"]): GitHubReviewRequest["event"] => {
  if (approval === "approve") {
    return "APPROVE";
  }
  if (approval === "request_changes") {
    return "REQUEST_CHANGES";
  }
  return "COMMENT";
};

export const mapReviewResultToRequest = (result: ReviewResult): GitHubReviewRequest => ({
  body: result.summary,
  event: toEvent(result.approval),
  comments: result.comments.map((comment) => ({
    path: comment.path,
    line: comment.line,
    side: "RIGHT",
    body: formatCommentBody(comment)
  }))
});
