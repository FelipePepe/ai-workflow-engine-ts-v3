import type { AgentContext, BaseAgent } from "./base-agent.js";

export class DocumentationAgent implements BaseAgent {
  public readonly name = "documentation";

  async run(_context: AgentContext): Promise<Record<string, unknown>> {
    return {
      documentation: "updated",
      sections: [
        "Resumen funcional",
        "Project Spec JSON",
        "SDD",
        "Plan Mode",
        "Permisos/sandbox",
        "Validaciones realizadas"
      ]
    };
  }
}
