import { z } from "zod";

// ─── Input ───────────────────────────────────────────────────────────────────

export const IdeaInputSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  constraints: z.array(z.string()).default([])
});

export type IdeaInput = z.infer<typeof IdeaInputSchema>;

// ─── Planning stage outputs ───────────────────────────────────────────────────

export interface ExplorationReport {
  idea: string;
  codebaseContext: string;
  newAgentsNeeded: string[];
  architecturalRisks: string[];
  entryPointStrategy: string;
  llm: "ok" | "error" | "not_configured";
}

export interface Proposal {
  intent: string;
  scope: {
    added: string[];
    changed: string[];
    deleted: string[];
  };
  approach: string;
  outOfScope: string[];
  risks: string[];
  llm: "ok" | "error" | "not_configured";
}

export interface TechnicalDesign {
  architecture: string;
  newComponents: Array<{ name: string; responsibility: string }>;
  dataFlow: string;
  apiContract: {
    endpoint: string;
    method: string;
    requestShape: Record<string, unknown>;
    responseShape: Record<string, unknown>;
  };
  llm: "ok" | "error" | "not_configured";
}

export interface TaskChecklist {
  id: string;
  title: string;
  description: string;
  files: string[];
  priority: "high" | "medium" | "low";
  dependencies: string[];
}

// ─── Pipeline context (accumulates as stages run) ────────────────────────────

export interface PipelineContext {
  idea: IdeaInput;
  explorationReport?: ExplorationReport;
  proposal?: Proposal;
  spec?: Record<string, unknown>;
  design?: TechnicalDesign;
  tasks?: TaskChecklist[];
}

// ─── Final result ─────────────────────────────────────────────────────────────

export interface PipelineResult {
  runId: string;
  idea: IdeaInput;
  planning: {
    exploration: ExplorationReport;
    proposal: Proposal;
    spec: Record<string, unknown>;
    design: TechnicalDesign;
    tasks: TaskChecklist[];
  };
  execution: Record<string, unknown>;
  durationMs: number;
}
