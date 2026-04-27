import "dotenv/config";
import { JsonConfigLoader } from './json-config-loader.js';
import { LlmConfigSchema, type LlmConfig } from './schemas/llm.schema.js';

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

const DEFAULT_LLM_CONFIG: LlmConfig = {
  provider: 'ollama',
  ollama: { baseUrl: 'http://localhost:11434', model: 'llama3.2' },
};

export async function loadLlmConfig(): Promise<LlmConfig> {
  const loader = new JsonConfigLoader();
  try {
    return await loader.load<LlmConfig>('config/llm.json', LlmConfigSchema);
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return DEFAULT_LLM_CONFIG;
    }
    throw err;
  }
}
