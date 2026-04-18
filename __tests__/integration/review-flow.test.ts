import { getOptionalInput, getRequiredInput } from "../../src/adapters/actions-core";
import { createActionsGitHubRuntime } from "../../src/adapters/actions-github";
import { createOpenAiClient } from "../../src/llm/openai-client";
import { executeReviewFlow } from "../../src/index";

jest.mock("../../src/adapters/actions-core", () => ({
  getRequiredInput: jest.fn(),
  getOptionalInput: jest.fn(),
  failAction: jest.fn()
}));
jest.mock("../../src/adapters/actions-github", () => ({ createActionsGitHubRuntime: jest.fn() }));
jest.mock("../../src/llm/openai-client", () => ({ createOpenAiClient: jest.fn() }));

describe("executeReviewFlow integration", () => {
  const requiredInput = getRequiredInput as jest.MockedFunction<typeof getRequiredInput>;
  const optionalInput = getOptionalInput as jest.MockedFunction<typeof getOptionalInput>;
  const runtimeFactory = createActionsGitHubRuntime as jest.MockedFunction<typeof createActionsGitHubRuntime>;
  const createClient = createOpenAiClient as jest.MockedFunction<typeof createOpenAiClient>;
  const pullsGet = jest.fn();
  const pullsListFiles = jest.fn();
  const createReview = jest.fn();
  const getTree = jest.fn();
  const getContent = jest.fn();
  const createCompletion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const values: Record<string, string> = {
      github_token: "ghs_test",
      openai_api_key: "sk_test",
      openai_base_url: "https://api.openai.com/v1",
      model: "gpt-4o",
      exclude_patterns: "",
      max_files: "20",
      review_level: "thorough",
      extra_prompt: "",
      max_context_rounds: "1"
    };
    requiredInput.mockImplementation((name: string) => values[name] ?? "");
    optionalInput.mockImplementation((name: string) => values[name] ?? "");
    runtimeFactory.mockReturnValue({
      getPullRequestNumber: () => 11,
      getRepoInfo: () => ({ owner: "acme", repo: "widget" }),
      createOctokit: () => ({
        rest: {
          pulls: { get: pullsGet, listFiles: pullsListFiles, createReview },
          git: { getTree },
          repos: { getContent }
        }
      })
    });
    createClient.mockReturnValue({
      chat: { completions: { create: createCompletion } }
    } as never);

    pullsGet.mockResolvedValue({
      data: { title: "PR title", body: "PR body", base: { ref: "main" }, head: { ref: "feat/a" } }
    });
    pullsListFiles.mockResolvedValue({
      data: [{ filename: "src/a.ts", status: "modified", additions: 3, deletions: 1, changes: 4, patch: "@@ ..." }]
    });
    getTree.mockResolvedValue({ data: { tree: [{ path: "CONTRIBUTING.md", type: "blob" }, { path: "src/a.ts", type: "blob" }] } });
    getContent.mockResolvedValue({
      data: { type: "file", encoding: "base64", content: Buffer.from("Use tests").toString("base64") }
    });
    createCompletion.mockResolvedValue({
      choices: [{ message: { content: '{"summary":"Looks good","approval":"comment","comments":[]}' } }]
    });
  });

  it("runs end-to-end and posts a review", async () => {
    await executeReviewFlow();
    expect(createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: "acme",
        repo: "widget",
        pull_number: 11,
        body: "💬 Suggested decision: COMMENT\n\nLooks good",
        event: "COMMENT"
      })
    );
  });
});
