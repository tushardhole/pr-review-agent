export interface ReadFileToolArgs {
  path: string;
}

export const READ_FILE_TOOL_NAME = "read_file";

export const READ_FILE_TOOL = {
  type: "function" as const,
  function: {
    name: READ_FILE_TOOL_NAME,
    description: "Read a file from repository by path to gather more review context.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path relative to repository root." }
      },
      required: ["path"],
      additionalProperties: false
    }
  }
};
