import { z } from "zod";

export const ProjectSpecSchema = z.object({
  projectType: z.enum(["api", "web", "desktop", "cli", "library", "microservice", "unknown"]).default("unknown"),
  language: z.enum(["typescript", "javascript", "csharp", "java", "python", "unknown"]).default("unknown"),
  framework: z.string().default("unknown"),
  architecture: z.enum(["layered", "clean", "hexagonal", "mvc", "microservices", "unknown"]).default("unknown"),
  database: z.string().default("unknown"),
  qualityLevel: z.enum(["poc", "internal", "production"]).default("internal"),
  securityLevel: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  deploymentTarget: z.string().default("unknown"),
  testingStrategy: z.enum(["none", "unit", "tdd", "bdd", "tdd-bdd"]).default("tdd-bdd"),
  observability: z.boolean().default(true)
});

export type ProjectSpec = z.infer<typeof ProjectSpecSchema>;
