import { getOptionalInput, getRequiredInput } from "../../adapters/actions-core";
import { parseInputs } from "../input-parser";

jest.mock("../../adapters/actions-core", () => ({
  getRequiredInput: jest.fn(),
  getOptionalInput: jest.fn()
}));

const requiredInput = getRequiredInput as jest.MockedFunction<typeof getRequiredInput>;
const optionalInput = getOptionalInput as jest.MockedFunction<typeof getOptionalInput>;

describe("parseInputs", () => {
  let values: Record<string, string>;

  beforeEach(() => {
    values = {
      github_token: "ghs_test",
      openai_api_key: "sk-test",
      openai_base_url: "",
      model: "",
      exclude_patterns: "dist/**, *.lock",
      max_files: "10",
      review_level: "quick",
      extra_prompt: "focus on security",
      max_context_rounds: "2"
    };
    requiredInput.mockImplementation((name: string) => values[name] ?? "");
    optionalInput.mockImplementation((name: string) => values[name] ?? "");
  });

  it("parses valid values", () => {
    const result = parseInputs();
    expect(result.maxFiles).toBe(10);
    expect(result.reviewLevel).toBe("quick");
    expect(result.excludePatterns).toEqual(["dist/**", "*.lock"]);
  });

  it("falls back to defaults", () => {
    values.max_files = "";
    values.review_level = "";
    values.max_context_rounds = "";
    const result = parseInputs();
    expect(result.maxFiles).toBe(20);
    expect(result.reviewLevel).toBe("thorough");
    expect(result.maxContextRounds).toBe(3);
  });

  it("throws on invalid integers", () => {
    values.max_files = "-1";
    expect(() => parseInputs()).toThrow("Invalid max_files");
  });

  it("throws on invalid review level", () => {
    values.max_files = "5";
    values.review_level = "deep";
    expect(() => parseInputs()).toThrow("Invalid review_level");
  });
});
