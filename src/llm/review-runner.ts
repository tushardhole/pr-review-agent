import { IRepoClient, PullRequestContext, ReviewResult } from "../types";
import { validateReviewResult } from "../prompts/review-schema";
import { READ_FILE_TOOL } from "./tool-definitions";
import { ToolCall, executeToolCall } from "./tool-executor";
import { normalizeReviewPayload } from "./review-normalizer";
import { createDebugLogger } from "./debug-logger";

type Message = Record<string, unknown>;
type ToolCallRaw = { id: string; function: { name: string; arguments: string } };
type CompletionResponse = { choices: Array<{ message: { content?: string; tool_calls?: ToolCallRaw[] } }> };

interface LlmClient {
  chat: { completions: { create(args: unknown): Promise<unknown> } };
}

export interface ReviewRunArgs {
  client: LlmClient;
  repoClient: IRepoClient;
  context: PullRequestContext;
  ref: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxContextRounds: number;
}

const mapToolCall = (toolCall: ToolCallRaw): ToolCall => ({
  id: toolCall.id,
  name: toolCall.function.name,
  argumentsJson: toolCall.function.arguments
});

const debugLogger = createDebugLogger();

const parseReview = (raw: string): ReviewResult => {
  debugLogger.log("raw-response", raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    debugLogger.log("json-parse-error", error instanceof Error ? error.message : String(error));
    throw new Error("LLM returned invalid JSON.");
  }
  const normalized = normalizeReviewPayload(parsed);
  if (!validateReviewResult(normalized)) {
    debugLogger.log("parsed-json-invalid", JSON.stringify(normalized, null, 2));
    throw new Error("LLM response does not match review schema.");
  }
  return normalized;
};

export const runReview = async (args: ReviewRunArgs): Promise<ReviewResult> => {
  const messages: Message[] = [
    { role: "system", content: args.systemPrompt },
    { role: "user", content: args.userPrompt }
  ];

  for (let round = 0; round <= args.maxContextRounds; round += 1) {
    const response = (await args.client.chat.completions.create({
      model: args.model,
      messages,
      tools: [READ_FILE_TOOL]
    })) as CompletionResponse;
    const message = response.choices[0]?.message;
    if (!message) {
      throw new Error("LLM returned no message.");
    }
    debugLogger.log("response-metadata", JSON.stringify({ round, hasToolCalls: Boolean(message.tool_calls) }));
    if (!message.tool_calls || message.tool_calls.length === 0) {
      if (!message.content) {
        throw new Error("LLM returned empty content.");
      }
      return parseReview(message.content);
    }
    messages.push({ role: "assistant", content: message.content ?? "", tool_calls: message.tool_calls });
    for (const call of message.tool_calls) {
      const result = await executeToolCall(mapToolCall(call), args.repoClient, args.context, args.ref);
      messages.push({ role: "tool", tool_call_id: result.toolCallId, content: result.output });
    }
  }

  throw new Error("Exceeded max context rounds before review output.");
};
