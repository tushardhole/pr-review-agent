import { ApprovalDecision, ReviewComment, Severity } from "../types";

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const APPROVAL_VALUES: ApprovalDecision[] = ["approve", "request_changes", "comment"];
const SEVERITY_MAP: Record<string, Severity> = {
  critical: "critical",
  high: "critical",
  warning: "warning",
  warn: "warning",
  medium: "warning",
  suggestion: "suggestion",
  info: "suggestion",
  low: "suggestion",
  nit: "nitpick",
  nitpick: "nitpick"
};

const parseApproval = (value: unknown): ApprovalDecision | undefined => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
    if (APPROVAL_VALUES.includes(normalized as ApprovalDecision)) {
      return normalized as ApprovalDecision;
    }
    return undefined;
  }
  if (typeof value === "boolean") {
    return value ? "approve" : "request_changes";
  }
  return undefined;
};

const parseLine = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

const normalizeComment = (value: unknown): ReviewComment | null => {
  if (!isObject(value)) {
    return null;
  }
  const path = typeof value.path === "string" ? value.path : undefined;
  const line = parseLine(value.line);
  const bodySource = typeof value.body === "string" ? value.body : value.message;
  const body = typeof bodySource === "string" ? bodySource : undefined;
  if (!path || !line || !body) {
    return null;
  }
  const severityRaw = typeof value.severity === "string" ? value.severity.toLowerCase().trim() : "suggestion";
  const severity = SEVERITY_MAP[severityRaw] ?? "suggestion";
  return { path, line, severity, body };
};

export const normalizeReviewPayload = (value: unknown): unknown => {
  if (!isObject(value)) {
    return value;
  }
  const summary = typeof value.summary === "string" ? value.summary : "";
  const approval = parseApproval(value.approval);
  const comments = Array.isArray(value.comments) ? value.comments.map(normalizeComment).filter(Boolean) : [];
  return {
    summary,
    approval: approval ?? value.approval,
    comments
  };
};
