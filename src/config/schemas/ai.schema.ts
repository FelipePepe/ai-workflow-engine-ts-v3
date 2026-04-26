import { z } from "zod";

export const AiConfigSchema = z.object({
  planMode: z.object({
    enabled: z.boolean(),
    requirePlanApproval: z.boolean(),
    maxPlanIterations: z.number().int().positive(),
  }),
  agents: z.object({
    maxParallelAgents: z.number().int().positive(),
    defaultFlow: z.array(z.string()),
  }),
  limits: z.object({
    maxRetries: z.number().int().nonnegative(),
    maxFilesPerRun: z.number().int().positive(),
    maxShellCommandsPerRun: z.number().int().positive(),
    maxExecutionSeconds: z.number().int().positive(),
  }),
  search: z.object({
    preferGlobGrep: z.boolean(),
    allowRag: z.boolean(),
  }),
}).passthrough();

export type AiConfig = z.infer<typeof AiConfigSchema>;
