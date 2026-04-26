import "dotenv/config";

export const settings = {
  appName: process.env.APP_NAME ?? "AI Workflow Engine TS V3 JSON",
  appEnv: process.env.APP_ENV ?? "dev",
  port: Number(process.env.PORT ?? 3000),
  qualityGateMinScore: Number(process.env.QUALITY_GATE_MIN_SCORE ?? 0.75),
  maxRetries: Number(process.env.MAX_RETRIES ?? 2),
  dryRun: String(process.env.DRY_RUN ?? "true").toLowerCase() === "true",
  discoveryMinConfidence: Number(process.env.DISCOVERY_MIN_CONFIDENCE ?? 0.75),
  workspaceRoot: process.env.WORKSPACE_ROOT ?? ".ai-workspaces",
  maxParallelAgents: Number(process.env.MAX_PARALLEL_AGENTS ?? 5)
};
