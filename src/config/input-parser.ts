import { getOptionalInput, getRequiredInput } from "../adapters/actions-core";
import { ActionInputs, ReviewLevel } from "../types";
import { DEFAULTS } from "./defaults";

const REVIEW_LEVELS: ReviewLevel[] = ["quick", "thorough", "security-focused"];

const requiredInput = (name: string): string => getRequiredInput(name);
const optionalInput = (name: string): string => getOptionalInput(name);

const parseInteger = (value: string, fallback: number, name: string): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: expected a positive integer.`);
  }
  return parsed;
};

const parseReviewLevel = (value: string): ReviewLevel => {
  if (!value) {
    return DEFAULTS.reviewLevel;
  }
  if (!REVIEW_LEVELS.includes(value as ReviewLevel)) {
    throw new Error(`Invalid review_level: must be one of ${REVIEW_LEVELS.join(", ")}.`);
  }
  return value as ReviewLevel;
};

const parsePatterns = (value: string): string[] =>
  value
    .split(",")
    .map((pattern) => pattern.trim())
    .filter(Boolean);

export const parseInputs = (): ActionInputs => ({
  githubToken: requiredInput("github_token"),
  openAiApiKey: requiredInput("openai_api_key"),
  openAiBaseUrl: optionalInput("openai_base_url") || DEFAULTS.openAiBaseUrl,
  model: optionalInput("model") || DEFAULTS.model,
  excludePatterns: parsePatterns(optionalInput("exclude_patterns")),
  maxFiles: parseInteger(optionalInput("max_files"), DEFAULTS.maxFiles, "max_files"),
  reviewLevel: parseReviewLevel(optionalInput("review_level")),
  extraPrompt: optionalInput("extra_prompt"),
  maxContextRounds: parseInteger(
    optionalInput("max_context_rounds"),
    DEFAULTS.maxContextRounds,
    "max_context_rounds"
  )
});
