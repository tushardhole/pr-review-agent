import { IPrClient, OctokitClient, PrFile, PrMetadata, PullRequestContext } from "../types";

type PullResponse = { data: { title: string; body: string | null; base: { ref: string }; head: { ref: string } } };
type FileResponse = {
  data: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    changes: number;
    patch?: string;
  }>;
};

const baseArgs = (context: PullRequestContext) => ({
  owner: context.owner,
  repo: context.repo,
  pull_number: context.pullNumber
});

interface PullsApiRequired {
  get(args: { owner: string; repo: string; pull_number: number }): Promise<unknown>;
  listFiles(args: {
    owner: string;
    repo: string;
    pull_number: number;
    per_page: number;
    page: number;
  }): Promise<unknown>;
}

const requirePullsApi = (client: OctokitClient): PullsApiRequired => {
  if (!client.rest.pulls || !client.rest.pulls.get || !client.rest.pulls.listFiles) {
    throw new Error("Octokit pulls API is not available.");
  }
  return {
    get: client.rest.pulls.get,
    listFiles: client.rest.pulls.listFiles
  };
};

export class PrClient implements IPrClient {
  constructor(private readonly octokit: OctokitClient) {}

  async getMetadata(context: PullRequestContext): Promise<PrMetadata> {
    const pulls = requirePullsApi(this.octokit);
    const response = (await pulls.get(baseArgs(context))) as PullResponse;
    return {
      title: response.data.title,
      body: response.data.body ?? "",
      baseRef: response.data.base.ref,
      headRef: response.data.head.ref
    };
  }

  async getChangedFiles(context: PullRequestContext): Promise<PrFile[]> {
    const pulls = requirePullsApi(this.octokit);
    const allFiles: PrFile[] = [];
    let page = 1;
    while (true) {
      const response = (await pulls.listFiles({
        ...baseArgs(context),
        per_page: 100,
        page
      })) as FileResponse;
      const mapped = response.data.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch
      }));
      allFiles.push(...mapped);
      if (response.data.length < 100) {
        return allFiles;
      }
      page += 1;
    }
  }
}
