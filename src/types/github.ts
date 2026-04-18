import { GitHubReviewRequest } from "./review";

export interface OctokitClient {
  rest: {
    pulls?: {
      get?(args: { owner: string; repo: string; pull_number: number }): Promise<unknown>;
      listFiles?(args: {
        owner: string;
        repo: string;
        pull_number: number;
        per_page: number;
        page: number;
      }): Promise<unknown>;
      createReview?(args: {
        owner: string;
        repo: string;
        pull_number: number;
        body: string;
        event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT";
        comments: Array<{ path: string; line: number; side: "RIGHT"; body: string }>;
      }): Promise<unknown>;
    };
    repos?: {
      getContent?(args: { owner: string; repo: string; path: string; ref?: string }): Promise<unknown>;
    };
    git?: {
      getTree?(args: {
        owner: string;
        repo: string;
        tree_sha: string;
        recursive: "true";
      }): Promise<unknown>;
    };
  };
}

export interface PullRequestContext {
  owner: string;
  repo: string;
  pullNumber: number;
}

export interface PrMetadata {
  title: string;
  body: string;
  baseRef: string;
  headRef: string;
}

export interface PrFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface ConventionFile {
  path: string;
  content: string;
}

export interface ReviewPayload {
  summary: string;
  request: GitHubReviewRequest;
}

export interface IPrClient {
  getMetadata(context: PullRequestContext): Promise<PrMetadata>;
  getChangedFiles(context: PullRequestContext): Promise<PrFile[]>;
}

export interface IRepoClient {
  getTree(context: PullRequestContext, ref: string): Promise<string[]>;
  readFile(context: PullRequestContext, path: string, ref?: string): Promise<string>;
}

export interface IReviewPoster {
  postReview(context: PullRequestContext, payload: ReviewPayload): Promise<void>;
}
