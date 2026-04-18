import { ReviewLevel } from "../types";

export interface UserPromptArgs {
  reviewLevel: ReviewLevel;
  contextSummary: string;
  extraPrompt: string;
}

export const buildUserPrompt = (args: UserPromptArgs): string => {
  const detailLine = `Review level: ${args.reviewLevel}.`;
  const extra = args.extraPrompt ? `Additional instructions: ${args.extraPrompt}` : "";
  return [detailLine, "Analyze this pull request context:", args.contextSummary, extra]
    .filter(Boolean)
    .join("\n\n");
};
