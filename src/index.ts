import { failAction } from "./adapters/actions-core";
import { ActionsGitHubRuntime, createActionsGitHubRuntime } from "./adapters/actions-github";
import { CONVENTION_FILE_PATTERNS } from "./config/defaults";
import { parseInputs } from "./config/input-parser";
import { buildContextSummary } from "./context/context-assembler";
import { readConventionFiles } from "./context/convention-reader";
import { mapReviewResultToRequest } from "./formatters/review-mapper";
import { filterFilesForReview } from "./github/file-filter";
import { PrClient } from "./github/pr-client";
import { filterResolvableComments } from "./github/review-comment-validator";
import { RepoClient } from "./github/repo-client";
import { ReviewPoster } from "./github/review-poster";
import { createOpenAiClient } from "./llm/openai-client";
import { runReview } from "./llm/review-runner";
import { buildSystemPrompt } from "./prompts/system-prompt";
import { buildUserPrompt } from "./prompts/user-prompt";
import { PullRequestContext } from "./types";

const shouldIncludeDiagnosticsInReview = (): boolean => process.env.DEBUG_LLM_RESPONSE === "true";

export const executeReviewFlow = async (): Promise<void> => {
  const runtime = createActionsGitHubRuntime();
  await executeReviewFlowWithRuntime(runtime);
};

export const executeReviewFlowWithRuntime = async (runtime: ActionsGitHubRuntime): Promise<void> => {
  const inputs = parseInputs();
  const pullNumber = runtime.getPullRequestNumber();
  if (!pullNumber) {
    throw new Error("This action must run on pull_request events.");
  }

  const octokit = runtime.createOctokit(inputs.githubToken);
  const repoInfo = runtime.getRepoInfo();
  const context: PullRequestContext = {
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    pullNumber
  };

  const prClient = new PrClient(octokit);
  const repoClient = new RepoClient(octokit);
  const reviewPoster = new ReviewPoster(octokit);
  const metadata = await prClient.getMetadata(context);
  const changedFiles = filterFilesForReview(
    await prClient.getChangedFiles(context),
    inputs.excludePatterns,
    inputs.maxFiles
  );
  const repositoryTree = await repoClient.getTree(context, metadata.headRef);
  const conventionFiles = await readConventionFiles(
    repoClient,
    context,
    metadata.headRef,
    CONVENTION_FILE_PATTERNS,
    repositoryTree
  );
  const contextSummary = buildContextSummary({ metadata, changedFiles, conventionFiles, repositoryTree });
  const review = await runReview({
    client: createOpenAiClient({ apiKey: inputs.openAiApiKey, baseURL: inputs.openAiBaseUrl }),
    repoClient,
    context,
    ref: metadata.headRef,
    model: inputs.model,
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt({
      reviewLevel: inputs.reviewLevel,
      contextSummary,
      extraPrompt: inputs.extraPrompt
    }),
    maxContextRounds: inputs.maxContextRounds
  });
  const mappedRequest = mapReviewResultToRequest(review);
  const validatedRequest = filterResolvableComments(mappedRequest, changedFiles, {
    includeOmissionNote: shouldIncludeDiagnosticsInReview()
  }).request;

  await reviewPoster.postReview(context, {
    summary: review.summary,
    request: validatedRequest
  });
};

const run = async (): Promise<void> => {
  try {
    await executeReviewFlow();
  } catch (error) {
    failAction(error instanceof Error ? error.message : String(error));
  }
};

if (require.main === module) {
  void run();
}
