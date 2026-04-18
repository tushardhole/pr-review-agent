import { InputDefaults } from "../types";

export const DEFAULTS: InputDefaults = {
  openAiBaseUrl: "https://api.openai.com/v1",
  model: "gpt-4o",
  maxFiles: 20,
  reviewLevel: "thorough",
  maxContextRounds: 3
};

export const CONVENTION_FILE_PATTERNS: string[] = [
  "CONTRIBUTING.md",
  "CONTRIBUTORS.md",
  ".editorconfig",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.json",
  ".prettierrc",
  ".prettierrc.json",
  "biome.json",
  "STYLE_GUIDE.md",
  "CODING_STANDARDS.md",
  "pyproject.toml",
  ".rubocop.yml"
];
