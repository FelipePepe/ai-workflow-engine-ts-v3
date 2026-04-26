import type { AgentContext, BaseAgent } from "./base-agent.js";
import { DeterministicReviewer } from "../review/deterministic-reviewer.js";

export class ReviewerAgent implements BaseAgent {
  public readonly name = "reviewer";
  private readonly deterministicReviewer = new DeterministicReviewer();

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const serialized = JSON.stringify(context.developerResult ?? {});
    const findings = await this.deterministicReviewer.reviewText(serialized);

    return {
      review: findings.some((f) => f.severity === "critical") ? "failed" : "passed",
      deterministicFindings: findings,
      comments: [
        "Review determinista aplicado con patrones reutilizables",
        "La solución debe respetar SDD, seguridad y scope",
        "Patrones repetidos deberían convertirse en reglas automáticas"
      ]
    };
  }
}
