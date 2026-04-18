import { ReviewComment, Severity } from "../types";

const SEVERITY_TAG: Record<Severity, string> = {
  critical: "[Critical]",
  warning: "[Warning]",
  suggestion: "[Suggestion]",
  nitpick: "[Nitpick]"
};

export const formatCommentBody = (comment: ReviewComment): string =>
  `${SEVERITY_TAG[comment.severity]} ${comment.body}`.trim();
