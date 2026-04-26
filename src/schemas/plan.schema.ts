export interface PlanStep {
  id: string;
  agent: "developer" | "qa" | "security" | "reviewer" | "documentation";
  task: string;
  workspace?: string;
  parallelizable: boolean;
}

export interface ExecutionPlan {
  planMode: true;
  summary: string;
  steps: PlanStep[];
  risks: string[];
  filesToInspect: string[];
  commandsToRun: string[];
  approvalRequired: boolean;
  metadata: Record<string, unknown>;
}
