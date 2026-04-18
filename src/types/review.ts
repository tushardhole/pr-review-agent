export type Severity = "critical" | "warning" | "suggestion" | "nitpick";
export type ApprovalDecision = "approve" | "request_changes" | "comment";

export interface ReviewComment {
  path: string;
  line: number;
  severity: Severity;
  body: string;
}

export interface ReviewResult {
  summary: string;
  comments: ReviewComment[];
  approval: ApprovalDecision;
}

export interface GitHubReviewComment {
  path: string;
  line: number;
  side: "RIGHT";
  body: string;
}

export interface GitHubReviewRequest {
  body: string;
  event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
  comments: GitHubReviewComment[];
}
