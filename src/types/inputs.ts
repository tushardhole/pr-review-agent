export type ReviewLevel = "quick" | "thorough" | "security-focused";

export interface ActionInputs {
  githubToken: string;
  openAiApiKey: string;
  openAiBaseUrl: string;
  model: string;
  excludePatterns: string[];
  maxFiles: number;
  reviewLevel: ReviewLevel;
  extraPrompt: string;
  maxContextRounds: number;
}

export interface InputDefaults {
  openAiBaseUrl: string;
  model: string;
  maxFiles: number;
  reviewLevel: ReviewLevel;
  maxContextRounds: number;
}
