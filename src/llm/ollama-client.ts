import type { LlmClient } from "./llm-client.js";

export class OllamaClient implements LlmClient {
  constructor(private readonly baseUrl: string, private readonly model: string) {}

  async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, prompt, stream: false })
    });

    if (!response.ok) throw new Error(`Ollama request failed: ${response.status}`);

    const data = await response.json() as { response?: string };
    return data.response ?? "";
  }
}
