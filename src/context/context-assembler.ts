import { ConventionFile, PrFile, PrMetadata } from "../types";

export interface ReviewContextPayload {
  metadata: PrMetadata;
  changedFiles: PrFile[];
  repositoryTree: string[];
  conventionFiles: ConventionFile[];
}

const toFilePatchText = (files: PrFile[]): string =>
  files
    .map((file) => `File: ${file.filename}\nStatus: ${file.status}\nPatch:\n${file.patch ?? "(binary or too large)"}`)
    .join("\n\n");

const toConventionText = (files: ConventionFile[]): string =>
  files.map((file) => `Path: ${file.path}\n${file.content}`).join("\n\n---\n\n");

export const buildContextSummary = (payload: ReviewContextPayload): string => {
  const tree = payload.repositoryTree.join("\n");
  const conventions = payload.conventionFiles.length > 0 ? toConventionText(payload.conventionFiles) : "(none)";
  const patches = toFilePatchText(payload.changedFiles);
  return [
    `PR Title: ${payload.metadata.title}`,
    `PR Body:\n${payload.metadata.body || "(empty)"}`,
    `Base Branch: ${payload.metadata.baseRef}`,
    `Head Branch: ${payload.metadata.headRef}`,
    `Repository Tree:\n${tree}`,
    `Convention Files:\n${conventions}`,
    `Changed Files:\n${patches}`
  ].join("\n\n");
};
