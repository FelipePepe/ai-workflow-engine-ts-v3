import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { TaskInput } from "../schemas/task.schema.js";
import type { LlmClient } from "../llm/llm-client.js";

export class DocumentationAgent implements BaseAgent {
  public readonly name = "documentation";

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const mock = {
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

    if (!this.llmClient) {
      return { ...mock, llm: "not configured, using mock output" };
    }

    try {
      const task = context.task as TaskInput;
      const developerResult = context["developerResult"] as Record<string, unknown> | undefined;
      const prompt = JSON.stringify({
        role: "technical writer",
        task: { title: task.title, description: task.description },
        implemented: developerResult?.summary ?? null,
        instruction: "Respond ONLY with valid JSON: { \"documentation\": \"updated\", \"sections\": string[], \"summary\": string }"
      });
      const raw = await this.llmClient.complete(prompt);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return { ...mock, ...parsed, llm: "ok" };
    } catch {
      return { ...mock, llm: "error, using mock output" };
    }
  }
}
