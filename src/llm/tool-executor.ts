import { IRepoClient, PullRequestContext } from "../types";
import { READ_FILE_TOOL_NAME, ReadFileToolArgs } from "./tool-definitions";

export interface ToolCall {
  id: string;
  name: string;
  argumentsJson: string;
}

export interface ToolResult {
  toolCallId: string;
  output: string;
}

const parseArgs = (argsJson: string): ReadFileToolArgs => {
  const parsed = JSON.parse(argsJson) as Partial<ReadFileToolArgs>;
  if (!parsed.path || typeof parsed.path !== "string") {
    throw new Error("Invalid read_file arguments: path is required.");
  }
  return { path: parsed.path };
};

export const executeToolCall = async (
  toolCall: ToolCall,
  repoClient: IRepoClient,
  context: PullRequestContext,
  ref: string
): Promise<ToolResult> => {
  if (toolCall.name !== READ_FILE_TOOL_NAME) {
    throw new Error(`Unsupported tool: ${toolCall.name}`);
  }
  const args = parseArgs(toolCall.argumentsJson);
  const output = await repoClient.readFile(context, args.path, ref);
  return { toolCallId: toolCall.id, output };
};
