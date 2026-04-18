import * as github from "@actions/github";
import { OctokitClient } from "../types";

export interface RepoInfo {
  owner: string;
  repo: string;
}

export interface ActionsGitHubRuntime {
  getPullRequestNumber(): number | undefined;
  getRepoInfo(): RepoInfo;
  createOctokit(token: string): OctokitClient;
}

export const createActionsGitHubRuntime = (): ActionsGitHubRuntime => ({
  getPullRequestNumber: () => github.context.payload.pull_request?.number,
  getRepoInfo: () => ({ owner: github.context.repo.owner, repo: github.context.repo.repo }),
  createOctokit: (token: string) => github.getOctokit(token) as unknown as OctokitClient
});
