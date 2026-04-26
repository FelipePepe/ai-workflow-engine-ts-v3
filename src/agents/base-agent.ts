export interface AgentContext {
  runId: string;
  task: unknown;
  projectSpec?: unknown;
  discovery?: unknown;
  spec?: unknown;
  plan?: unknown;
  dryRun: boolean;
  branch: string;
  workspace?: string;
  [key: string]: unknown;
}

export interface BaseAgent {
  name: string;
  run(context: AgentContext): Promise<Record<string, unknown>>;
}
