import { PrClient } from "../pr-client";
import { PullRequestContext } from "../../types";

describe("PrClient", () => {
  const context: PullRequestContext = { owner: "acme", repo: "widget", pullNumber: 42 };
  const get = jest.fn();
  const listFiles = jest.fn();
  const client = new PrClient({ rest: { pulls: { get, listFiles } } });

  beforeEach(() => jest.clearAllMocks());

  it("returns metadata", async () => {
    get.mockResolvedValue({
      data: { title: "Add feature", body: null, base: { ref: "main" }, head: { ref: "feat/a" } }
    });
    const result = await client.getMetadata(context);
    expect(result).toEqual({ title: "Add feature", body: "", baseRef: "main", headRef: "feat/a" });
  });

  it("returns changed files", async () => {
    listFiles.mockResolvedValue({
      data: [
        {
          filename: "src/index.ts",
          status: "modified",
          additions: 10,
          deletions: 2,
          changes: 12,
          patch: "@@ -1 +1 @@"
        }
      ]
    });
    const files = await client.getChangedFiles(context);
    expect(files[0].filename).toBe("src/index.ts");
    expect(listFiles).toHaveBeenCalledWith({
      owner: "acme",
      repo: "widget",
      pull_number: 42,
      per_page: 100,
      page: 1
    });
  });

  it("paginates changed files over multiple pages", async () => {
    listFiles
      .mockResolvedValueOnce({
        data: Array.from({ length: 100 }).map((_, index) => ({
          filename: `src/file-${index}.ts`,
          status: "modified",
          additions: 1,
          deletions: 0,
          changes: 1
        }))
      })
      .mockResolvedValueOnce({
        data: [
          {
            filename: "src/final.ts",
            status: "modified",
            additions: 1,
            deletions: 0,
            changes: 1
          }
        ]
      });

    const files = await client.getChangedFiles(context);

    expect(files).toHaveLength(101);
    expect(listFiles).toHaveBeenNthCalledWith(1, {
      owner: "acme",
      repo: "widget",
      pull_number: 42,
      per_page: 100,
      page: 1
    });
    expect(listFiles).toHaveBeenNthCalledWith(2, {
      owner: "acme",
      repo: "widget",
      pull_number: 42,
      per_page: 100,
      page: 2
    });
  });
});
