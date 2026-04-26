import { z } from "zod";
import { ProjectSpecSchema } from "./project-spec.schema.js";

export const TaskInputSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  constraints: z.array(z.string()).default([]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  projectSpec: ProjectSpecSchema.optional(),
  answers: z.record(z.string(), z.string()).optional(),
  taskType: z.enum(["new_project", "evolutive", "incident"]).optional().default("new_project"),
  workspacePath: z.string().optional()
});

export type TaskInput = z.infer<typeof TaskInputSchema>;
