export interface LlmClient {
  complete(prompt: string): Promise<string>;
}
