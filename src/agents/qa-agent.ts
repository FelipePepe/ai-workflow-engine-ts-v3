import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import type { LlmClient } from "../llm/llm-client.js";

export class QaAgent implements BaseAgent {
  public readonly name = "qa";

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const projectSpec = context.projectSpec as ProjectSpec;
    const coverage = projectSpec.qualityLevel === "production" ? 85 : 82;

    const mock = {
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

    if (!this.llmClient) {
      return { ...mock, llm: "not configured, using mock output" };
    }

    try {
      const prompt = JSON.stringify({
        role: "QA engineer",
        language: projectSpec.language,
        testingStrategy: projectSpec.testingStrategy,
        qualityLevel: projectSpec.qualityLevel,
        developerResult: context["developerResult"] ?? null,
        instruction: "Respond ONLY with valid JSON: { \"tests\": { \"unit\": string, \"bdd\": string, \"coverage\": number }, \"testCases\": string[], \"logs\": string[] }"
      });
      const raw = await this.llmClient.complete(prompt);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return { ...mock, ...parsed, llm: "ok" };
    } catch {
      return { ...mock, llm: "error, using mock output" };
    }
  }
}
