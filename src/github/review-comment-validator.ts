import { GitHubReviewRequest, PrFile } from "../types";

interface ValidationResult {
  request: GitHubReviewRequest;
  droppedComments: number;
}

const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

const parseResolvableLines = (patch?: string): Set<number> => {
  const result = new Set<number>();
  if (!patch) {
    return result;
  }

  let rightLine = 0;
  let inHunk = false;
  for (const line of patch.split("\n")) {
    const hunkMatch = line.match(HUNK_HEADER);
    if (hunkMatch) {
      rightLine = Number(hunkMatch[1]);
      inHunk = true;
      continue;
    }
    if (!inHunk || line.startsWith("\\ No newline")) {
      continue;
    }
    if (line.startsWith("+") && !line.startsWith("+++")) {
      result.add(rightLine);
      rightLine += 1;
      continue;
    }
    if (line.startsWith(" ")) {
      rightLine += 1;
    }
  }
  return result;
};

const buildResolvableMap = (files: PrFile[]): Map<string, Set<number>> =>
  new Map(files.map((file) => [file.filename, parseResolvableLines(file.patch)]));

export const filterResolvableComments = (
  request: GitHubReviewRequest,
  files: PrFile[]
): ValidationResult => {
  const resolvableByPath = buildResolvableMap(files);
  const comments = request.comments.filter((comment) => {
    const resolvableLines = resolvableByPath.get(comment.path);
    return resolvableLines ? resolvableLines.has(comment.line) : false;
  });
  const droppedComments = request.comments.length - comments.length;
  const note =
    droppedComments > 0
      ? `\n\n⚠️ ${droppedComments} inline comment(s) were omitted because their lines were not resolvable in the PR diff.`
      : "";
  return {
    request: { ...request, body: `${request.body}${note}`.trim(), comments },
    droppedComments
  };
};
