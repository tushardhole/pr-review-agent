import { runReview } from "../review-runner";
import { IRepoClient, PullRequestContext } from "../../types";

describe("runReview", () => {
  const create = jest.fn();
  const client = { chat: { completions: { create } } };
  const repoClient: IRepoClient = { getTree: jest.fn(), readFile: jest.fn() };
  const context: PullRequestContext = { owner: "acme", repo: "widget", pullNumber: 1 };

  beforeEach(() => jest.clearAllMocks());

  it("handles tool call then returns parsed review", async () => {
    create.mockResolvedValueOnce({
      choices: [
        {
          message: {
            tool_calls: [{ id: "call-1", function: { name: "read_file", arguments: '{"path":"src/a.ts"}' } }]
          }
        }
      ]
    });
    (repoClient.readFile as jest.Mock).mockResolvedValue("const a = 1;");
    create.mockResolvedValueOnce({
      choices: [{ message: { content: '{"summary":"ok","comments":[],"approval":"comment"}' } }]
    });

    const result = await runReview({
      client,
      repoClient,
      context,
      ref: "main",
      model: "gpt-4o",
      systemPrompt: "system",
      userPrompt: "user",
      maxContextRounds: 2
    });

    expect(result.approval).toBe("comment");
    expect(repoClient.readFile).toHaveBeenCalledWith(context, "src/a.ts", "main");
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("throws when rounds exceeded", async () => {
    create.mockResolvedValue({
      choices: [{ message: { tool_calls: [{ id: "1", function: { name: "read_file", arguments: '{"path":"a"}' } }] } }]
    });
    (repoClient.readFile as jest.Mock).mockResolvedValue("x");

    await expect(
      runReview({
        client,
        repoClient,
        context,
        ref: "main",
        model: "gpt-4o",
        systemPrompt: "system",
        userPrompt: "user",
        maxContextRounds: 0
      })
    ).rejects.toThrow("Exceeded max context rounds");
  });

  it("throws on invalid JSON response", async () => {
    create.mockResolvedValue({
      choices: [{ message: { content: "not-json" } }]
    });
    await expect(
      runReview({
        client,
        repoClient,
        context,
        ref: "main",
        model: "gpt-4o",
        systemPrompt: "system",
        userPrompt: "user",
        maxContextRounds: 1
      })
    ).rejects.toThrow("LLM returned invalid JSON");
  });

  it("throws on schema mismatch response", async () => {
    create.mockResolvedValue({
      choices: [{ message: { content: '{"summary":"ok","approval":"bad","comments":[]}' } }]
    });
    await expect(
      runReview({
        client,
        repoClient,
        context,
        ref: "main",
        model: "gpt-4o",
        systemPrompt: "system",
        userPrompt: "user",
        maxContextRounds: 1
      })
    ).rejects.toThrow("LLM response does not match review schema");
  });
});
