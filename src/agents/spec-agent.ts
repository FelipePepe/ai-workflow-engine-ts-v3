import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { TaskInput } from "../schemas/task.schema.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import type { SddSpec } from "../schemas/spec.schema.js";
import type { LlmClient } from "../llm/llm-client.js";

export class SpecAgent implements BaseAgent {
  public readonly name = "spec";

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const task = context.task as TaskInput;
    const projectSpec = context.projectSpec as ProjectSpec;

    const spec: SddSpec = {
      feature: task.title,
      objective: task.description,
      projectContext: projectSpec as unknown as Record<string, unknown>,
      functionalRequirements: [`Implementar: ${task.description}`],
      acceptanceCriteria: [
        "La solución cumple la descripción inicial",
        "La solución respeta restricciones técnicas, seguridad y calidad"
      ],
      bddScenarios: [
        "Given el contexto del proyecto, When se ejecuta la funcionalidad, Then cumple los criterios de aceptación"
      ],
      technicalConstraints: [
        ...task.constraints,
        `Lenguaje: ${projectSpec.language}`,
        `Framework: ${projectSpec.framework}`,
        `Arquitectura: ${projectSpec.architecture}`
      ],
      securityRequirements: [
        "Security First",
        "Security by Design",
        "Security by Default",
        "No exponer secretos",
        "Validar entradas",
        "Aplicar mínimo privilegio",
        "Considerar OWASP Top 10 Web y LLM"
      ],
      qualityRequirements: [
        `Nivel de calidad: ${projectSpec.qualityLevel}`,
        "Tests obligatorios",
        "Quality gate obligatorio",
        "No incrementar deuda técnica injustificadamente",
        "Aplicar Boy Scout Rule"
      ]
    };

    if (!this.llmClient) {
      return spec as unknown as Record<string, unknown>;
    }

    try {
      const prompt = JSON.stringify({
        role: "spec writer",
        feature: task.title,
        description: task.description,
        language: projectSpec.language,
        framework: projectSpec.framework,
        constraints: task.constraints,
        instruction: "Respond ONLY with valid JSON: { \"functionalRequirements\": string[], \"bddScenarios\": string[] }. Expand on the base requirements with 3-5 concrete, specific items each."
      });
      const raw = await this.llmClient.complete(prompt);
      const parsed = JSON.parse(raw) as { functionalRequirements?: string[]; bddScenarios?: string[] };
      if (Array.isArray(parsed.functionalRequirements) && parsed.functionalRequirements.length > 0) {
        spec.functionalRequirements = parsed.functionalRequirements;
      }
      if (Array.isArray(parsed.bddScenarios) && parsed.bddScenarios.length > 0) {
        spec.bddScenarios = parsed.bddScenarios;
      }
    } catch {
      // fallback: keep template spec as-is
    }

    return spec as unknown as Record<string, unknown>;
  }
}
