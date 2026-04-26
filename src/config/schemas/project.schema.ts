import { z } from "zod";

export const ProjectConfigSchema = z.object({
  projectType: z.string(),
  language: z.string(),
  framework: z.string(),
  architecture: z.string(),
  database: z.string(),
  qualityLevel: z.string(),
  securityLevel: z.string(),
  deploymentTarget: z.string(),
  testingStrategy: z.string(),
  observability: z.boolean(),
}).passthrough();

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
