import type { LlmClient } from './llm-client.js';
import { OllamaClient } from './ollama-client.js';
import { CopilotClient } from './copilot-client.js';
import type { LlmConfig } from '../config/schemas/llm.schema.js';

export function createLlmClient(config: LlmConfig): LlmClient {
  switch (config.provider) {
    case 'ollama':
      return new OllamaClient(config.ollama.baseUrl, config.ollama.model);
    case 'github-copilot':
      return new CopilotClient(config.githubCopilot.model, config.githubCopilot.token);
    default: {
      const _exhaustive: never = config;
      throw new Error(`Unknown LLM provider: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
