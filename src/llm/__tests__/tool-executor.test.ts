import { executeToolCall } from "../tool-executor";
import { IRepoClient, PullRequestContext } from "../../types";

describe("executeToolCall", () => {
  const context: PullRequestContext = { owner: "acme", repo: "widget", pullNumber: 2 };
  const repoClient: IRepoClient = {
    getTree: jest.fn(),
    readFile: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it("executes read_file tool call", async () => {
    (repoClient.readFile as jest.Mock).mockResolvedValue("content");
    const result = await executeToolCall(
      { id: "1", name: "read_file", argumentsJson: JSON.stringify({ path: "src/a.ts" }) },
      repoClient,
      context,
      "main"
    );
    expect(result).toEqual({ toolCallId: "1", output: "content" });
  });

  it("throws on unknown tool", async () => {
    await expect(
      executeToolCall({ id: "1", name: "other_tool", argumentsJson: "{}" }, repoClient, context, "main")
    ).rejects.toThrow("Unsupported tool");
  });

  it("throws on invalid args", async () => {
    await expect(
      executeToolCall({ id: "1", name: "read_file", argumentsJson: "{}" }, repoClient, context, "main")
    ).rejects.toThrow("Invalid read_file arguments");
  });
});
