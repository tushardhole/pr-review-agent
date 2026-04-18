import { GitHubReviewRequest, ReviewResult } from "../types";
import { formatCommentBody } from "./comment-formatter";

const toDecisionBadge = (approval: ReviewResult["approval"]): string => {
  if (approval === "approve") {
    return "✅ Suggested decision: APPROVE";
  }
  if (approval === "request_changes") {
    return "🚨 Suggested decision: REQUEST_CHANGES";
  }
  return "💬 Suggested decision: COMMENT";
};

export const mapReviewResultToRequest = (result: ReviewResult): GitHubReviewRequest => ({
  body: `${toDecisionBadge(result.approval)}\n\n${result.summary}`.trim(),
  event: "COMMENT",
  comments: result.comments.map((comment) => ({
    path: comment.path,
    line: comment.line,
    side: "RIGHT",
    body: formatCommentBody(comment)
  }))
});
