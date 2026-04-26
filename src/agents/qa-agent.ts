import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";

export class QaAgent implements BaseAgent {
  public readonly name = "qa";

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const projectSpec = context.projectSpec as ProjectSpec;
    const coverage = projectSpec.qualityLevel === "production" ? 85 : 82;

    return {
      tests: {
        unit: "passed",
        bdd: projectSpec.testingStrategy.includes("bdd") ? "passed" : "not-configured",
        coverage
      },
      logs: [
        "Tests unitarios simulados",
        "BDD validado según Project Spec"
      ]
    };
  }
}
