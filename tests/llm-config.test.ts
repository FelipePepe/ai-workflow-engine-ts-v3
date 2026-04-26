import { describe, it, expect } from 'vitest';
import { LlmConfigSchema } from '../src/config/schemas/llm.schema.js';
import { createLlmClient } from '../src/llm/llm-factory.js';
import { OllamaClient } from '../src/llm/ollama-client.js';
import { CopilotClient } from '../src/llm/copilot-client.js';

describe('LlmConfigSchema', () => {
  it('accepts valid ollama config', () => {
    const result = LlmConfigSchema.safeParse({
      provider: 'ollama',
      ollama: { baseUrl: 'http://localhost:11434', model: 'llama3.2' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid github-copilot config', () => {
    const result = LlmConfigSchema.safeParse({
      provider: 'github-copilot',
      githubCopilot: { model: 'gpt-4o', token: 'ghp_test123' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown provider', () => {
    const result = LlmConfigSchema.safeParse({ provider: 'openai' });
    expect(result.success).toBe(false);
  });
});

describe('createLlmClient', () => {
  it('returns OllamaClient for ollama provider', () => {
    const config = LlmConfigSchema.parse({
      provider: 'ollama',
      ollama: { baseUrl: 'http://localhost:11434', model: 'mistral' },
    });
    const client = createLlmClient(config);
    expect(client).toBeInstanceOf(OllamaClient);
  });

  it('returns CopilotClient for github-copilot provider', () => {
    const config = LlmConfigSchema.parse({
      provider: 'github-copilot',
      githubCopilot: { model: 'gpt-4o', token: 'ghp_test' },
    });
    const client = createLlmClient(config);
    expect(client).toBeInstanceOf(CopilotClient);
  });
});
