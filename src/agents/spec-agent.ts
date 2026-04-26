import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { TaskInput } from "../schemas/task.schema.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import type { SddSpec } from "../schemas/spec.schema.js";

export class SpecAgent implements BaseAgent {
  public readonly name = "spec";

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

    return spec as unknown as Record<string, unknown>;
  }
}
