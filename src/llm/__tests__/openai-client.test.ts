import OpenAI from "openai";
import { createOpenAiClient } from "../openai-client";

jest.mock("openai");

describe("createOpenAiClient", () => {
  it("instantiates OpenAI with config", () => {
    createOpenAiClient({ apiKey: "sk-test", baseURL: "https://example.com/v1" });
    expect(OpenAI).toHaveBeenCalledWith({ apiKey: "sk-test", baseURL: "https://example.com/v1" });
  });
});
