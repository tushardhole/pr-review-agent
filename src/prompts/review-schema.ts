import { ReviewResult, Severity } from "../types";

export const REVIEW_RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "comments", "approval"],
  properties: {
    summary: { type: "string" },
    approval: { type: "string", enum: ["approve", "request_changes", "comment"] },
    comments: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "line", "severity", "body"],
        properties: {
          path: { type: "string" },
          line: { type: "number" },
          severity: { type: "string", enum: ["critical", "warning", "suggestion", "nitpick"] },
          body: { type: "string" }
        }
      }
    }
  }
} as const;

const APPROVALS: ReadonlyArray<ReviewResult["approval"]> = ["approve", "request_changes", "comment"];
const SEVERITIES: ReadonlyArray<Severity> = ["critical", "warning", "suggestion", "nitpick"];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validateReviewResult = (value: unknown): value is ReviewResult => {
  if (!isObject(value)) {
    return false;
  }
  if (typeof value.summary !== "string" || !APPROVALS.includes(value.approval as ReviewResult["approval"])) {
    return false;
  }
  if (!Array.isArray(value.comments)) {
    return false;
  }
  return value.comments.every((comment) => {
    if (!isObject(comment)) {
      return false;
    }
    return (
      typeof comment.path === "string" &&
      typeof comment.line === "number" &&
      SEVERITIES.includes(comment.severity as Severity) &&
      typeof comment.body === "string"
    );
  });
};
