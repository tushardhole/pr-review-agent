import OpenAI from "openai";

export interface OpenAiClientConfig {
  apiKey: string;
  baseURL: string;
}

export const createOpenAiClient = (config: OpenAiClientConfig): OpenAI =>
  new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  });
