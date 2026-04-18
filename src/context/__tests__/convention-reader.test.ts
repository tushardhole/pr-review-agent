import { readConventionFiles } from "../convention-reader";
import { IRepoClient, PullRequestContext } from "../../types";

describe("readConventionFiles", () => {
  const context: PullRequestContext = { owner: "acme", repo: "widget", pullNumber: 9 };
  const repoClient: IRepoClient = {
    getTree: jest.fn(),
    readFile: jest.fn()
  };

  beforeEach(() => jest.clearAllMocks());

  it("reads only matched convention files", async () => {
    (repoClient.getTree as jest.Mock).mockResolvedValue(["CONTRIBUTING.md", "src/app.ts"]);
    (repoClient.readFile as jest.Mock).mockResolvedValue("# guide");
    const result = await readConventionFiles(repoClient, context, "main", ["CONTRIBUTING.md"]);
    expect(result).toEqual([{ path: "CONTRIBUTING.md", content: "# guide" }]);
  });

  it("skips files that fail to read", async () => {
    (repoClient.getTree as jest.Mock).mockResolvedValue(["CONTRIBUTING.md"]);
    (repoClient.readFile as jest.Mock).mockRejectedValue(new Error("boom"));
    const result = await readConventionFiles(repoClient, context, "main", ["CONTRIBUTING.md"]);
    expect(result).toEqual([]);
  });
});
