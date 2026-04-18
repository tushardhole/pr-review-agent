import { RepoClient } from "../repo-client";
import { PullRequestContext } from "../../types";

describe("RepoClient", () => {
  const context: PullRequestContext = { owner: "acme", repo: "widget", pullNumber: 1 };
  const getTree = jest.fn();
  const getContent = jest.fn();
  const client = new RepoClient({ rest: { git: { getTree }, repos: { getContent } } });

  beforeEach(() => jest.clearAllMocks());

  it("returns file paths from tree", async () => {
    getTree.mockResolvedValue({
      data: {
        tree: [
          { path: "src/a.ts", type: "blob" },
          { path: "src", type: "tree" }
        ]
      }
    });
    const paths = await client.getTree(context, "feature-branch");
    expect(paths).toEqual(["src/a.ts"]);
  });

  it("decodes base64 file content", async () => {
    getContent.mockResolvedValue({
      data: {
        type: "file",
        encoding: "base64",
        content: Buffer.from("hello", "utf8").toString("base64")
      }
    });
    const content = await client.readFile(context, "README.md", "main");
    expect(content).toBe("hello");
  });

  it("throws when path is not a file", async () => {
    getContent.mockResolvedValue({ data: [] });
    await expect(client.readFile(context, "src")).rejects.toThrow("Path is not a file");
  });
});
