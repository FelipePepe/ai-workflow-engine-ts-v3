import { JsonConfigLoader } from "../config/json-config-loader.js";
import { AiConfigSchema } from "../config/schemas/ai.schema.js";
import type { ExecutionPlan } from "../schemas/plan.schema.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import type { SddSpec } from "../schemas/spec.schema.js";

interface AiConfig {
  planMode: { enabled: boolean; requirePlanApproval: boolean; maxPlanIterations: number };
  agents: { maxParallelAgents: number; defaultFlow: string[] };
  limits: Record<string, number>;
  search: { preferGlobGrep: boolean; allowRag: boolean };
}

export class Planner {
  private readonly loader = new JsonConfigLoader();

  async createPlan(spec: SddSpec, projectSpec: ProjectSpec): Promise<ExecutionPlan> {
    const aiConfig = await this.loader.load("config/ai.config.json", AiConfigSchema);

    return {
      planMode: true,
      summary: `Plan para ${spec.feature} usando ${projectSpec.language}/${projectSpec.framework}`,
      steps: [
        { id: "step_1", agent: "developer", task: "Inspeccionar código y proponer implementación", workspace: "developer", parallelizable: true },
        { id: "step_2", agent: "qa", task: "Diseñar/ejecutar TDD y BDD", workspace: "qa", parallelizable: true },
        { id: "step_3", agent: "security", task: "Aplicar Security First y OWASP", workspace: "security", parallelizable: true },
        { id: "step_4", agent: "reviewer", task: "Revisar calidad, scope y patrones deterministas", workspace: "reviewer", parallelizable: false },
        { id: "step_5", agent: "documentation", task: "Actualizar documentación", workspace: "documentation", parallelizable: false }
      ],
      risks: [
        "Cambios fuera de scope",
        "Permisos excesivos de agente",
        "Falta de contexto de código real",
        "Quality gate no integrado con SonarQube real todavía"
      ],
      filesToInspect: ["src/**/*.ts", "tests/**/*.ts", "config/*.json"],
      commandsToRun: ["npm run typecheck", "npm test"],
      approvalRequired: aiConfig.planMode.requirePlanApproval,
      metadata: {
        methodology: ["Discovery", "Plan Mode", "SDD", "BDD", "TDD", "Security by Design", "Boy Scout Rule"],
        searchStrategy: aiConfig.search.preferGlobGrep ? "glob-grep" : "rag",
        projectSpec
      }
    };
  }
}
