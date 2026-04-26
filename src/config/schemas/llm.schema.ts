import { z } from 'zod';

export const OllamaConfigSchema = z.object({
  provider: z.literal('ollama'),
  ollama: z.object({
    baseUrl: z.string().url(),
    model: z.string().min(1),
  }),
});

export const GithubCopilotConfigSchema = z.object({
  provider: z.literal('github-copilot'),
  githubCopilot: z.object({
    model: z.enum(['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini', 'claude-3.5-sonnet', 'claude-3.7-sonnet', 'gemini-1.5-pro']),
    token: z.string().min(1),
  }),
});

export const LlmConfigSchema = z.discriminatedUnion('provider', [
  OllamaConfigSchema,
  GithubCopilotConfigSchema,
]);

export type LlmConfig = z.infer<typeof LlmConfigSchema>;
export type OllamaConfig = z.infer<typeof OllamaConfigSchema>;
export type GithubCopilotConfig = z.infer<typeof GithubCopilotConfigSchema>;
