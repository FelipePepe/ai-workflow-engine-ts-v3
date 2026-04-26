import type { LlmClient } from './llm-client.js';

const COPILOT_API_BASE = 'https://api.githubcopilot.com';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: { content: string };
  }>;
}

export class CopilotClient implements LlmClient {
  constructor(
    private readonly model: string,
    private readonly token: string,
  ) {}

  async complete(prompt: string): Promise<string> {
    const messages: ChatMessage[] = [{ role: 'user', content: prompt }];

    const response = await fetch(`${COPILOT_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        'Copilot-Integration-Id': 'vscode-chat',
      },
      body: JSON.stringify({ model: this.model, messages, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`GitHub Copilot request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as ChatCompletionResponse;
    return data.choices[0]?.message.content ?? '';
  }
}
