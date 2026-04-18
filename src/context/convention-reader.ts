import { minimatch } from "minimatch";
import { ConventionFile, IRepoClient, PullRequestContext } from "../types";

const matchConventionFile = (path: string, patterns: string[]): boolean =>
  patterns.some((pattern) => minimatch(path, pattern, { nocase: true, dot: true }));

export const readConventionFiles = async (
  repoClient: IRepoClient,
  context: PullRequestContext,
  ref: string,
  patterns: string[],
  repositoryTree?: string[]
): Promise<ConventionFile[]> => {
  const paths = repositoryTree ?? (await repoClient.getTree(context, ref));
  const selected = paths.filter((path) => matchConventionFile(path, patterns));
  const results = await Promise.all(
    selected.map(async (path) => {
      try {
        const content = await repoClient.readFile(context, path, ref);
        return { path, content };
      } catch {
        return null;
      }
    })
  );
  return results.filter((value): value is ConventionFile => value !== null);
};
