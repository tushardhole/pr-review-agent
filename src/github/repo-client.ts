import { IRepoClient, OctokitClient, PullRequestContext } from "../types";

type ContentResponse = { data: unknown };
type TreeResponse = { data: { tree: Array<{ path?: string; type?: string }> } };

const decodeBase64 = (encoded: string): string => Buffer.from(encoded, "base64").toString("utf8");

interface RepoApiRequired {
  getContent(args: { owner: string; repo: string; path: string; ref?: string }): Promise<unknown>;
}

interface GitApiRequired {
  getTree(args: {
    owner: string;
    repo: string;
    tree_sha: string;
    recursive: "true";
  }): Promise<unknown>;
}

const requireRepoApis = (
  client: OctokitClient
): {
  git: GitApiRequired;
  repos: RepoApiRequired;
} => {
  if (!client.rest.git?.getTree || !client.rest.repos?.getContent) {
    throw new Error("Octokit repo APIs are not available.");
  }
  return {
    git: { getTree: client.rest.git.getTree },
    repos: { getContent: client.rest.repos.getContent }
  };
};

export class RepoClient implements IRepoClient {
  constructor(private readonly octokit: OctokitClient) {}

  async getTree(context: PullRequestContext, ref: string): Promise<string[]> {
    const api = requireRepoApis(this.octokit);
    const response = (await api.git.getTree({
      owner: context.owner,
      repo: context.repo,
      tree_sha: ref,
      recursive: "true"
    })) as TreeResponse;
    return response.data.tree
      .filter((item) => item.type === "blob" && typeof item.path === "string")
      .map((item) => item.path as string);
  }

  async readFile(context: PullRequestContext, path: string, ref?: string): Promise<string> {
    const api = requireRepoApis(this.octokit);
    const response = (await api.repos.getContent({
      owner: context.owner,
      repo: context.repo,
      path,
      ref
    })) as ContentResponse;
    if (Array.isArray(response.data) || (response.data as { type?: string }).type !== "file") {
      throw new Error(`Path is not a file: ${path}`);
    }
    const file = response.data as { content?: string; encoding?: string };
    if (file.encoding !== "base64" || typeof file.content !== "string") {
      throw new Error(`Unsupported encoding for ${path}: ${String(file.encoding)}`);
    }
    return decodeBase64(file.content.replace(/\n/g, ""));
  }
}
