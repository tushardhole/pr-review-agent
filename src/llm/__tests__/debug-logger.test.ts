import { createDebugLogger } from "../debug-logger";

describe("createDebugLogger", () => {
  const originalEnv = process.env;
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
    logSpy.mockRestore();
  });

  it("does not log when debug flag is disabled", () => {
    delete process.env.DEBUG_LLM_RESPONSE;
    const logger = createDebugLogger();
    logger.log("test", "value");
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("redacts secrets and truncates output", () => {
    process.env.DEBUG_LLM_RESPONSE = "true";
    process.env.DEBUG_LLM_RESPONSE_MAX_CHARS = "30";
    const logger = createDebugLogger();
    logger.log("payload", `token sk-abcdefghijklmnopqrstuvwxyz ${"x".repeat(200)}`);
    const output = logSpy.mock.calls.map((call) => String(call[0])).join("\n");
    expect(output).toContain("[llm-debug] payload start");
    expect(output).toContain("[REDACTED]");
    expect(output).toContain("truncated");
  });
});
