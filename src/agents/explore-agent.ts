import type { LlmClient } from "../llm/llm-client.js";
import type { PipelineContext, ExplorationReport } from "../schemas/pipeline.schema.js";

export class ExploreAgent {
  public readonly name = "explore";

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: PipelineContext): Promise<ExplorationReport> {
    const template: ExplorationReport = {
      idea: context.idea.title,
      codebaseContext:
        "TypeScript 5.7 + Fastify 5 + Zod 3 + Vitest. ESM modules, NodeNext resolution, JSON file storage.",
      newAgentsNeeded: ["ExploreAgent", "ProposeAgent", "DesignAgent", "TasksAgent"],
      architecturalRisks: [
        "LLM latency across multiple sequential planning stages",
        "Pipeline context growth between stages",
        "SpecAgent context bridge compatibility"
      ],
      entryPointStrategy: "New POST /pipeline/run endpoint — POST /tasks/run stays untouched",
      llm: "not_configured"
    };

    if (!this.llmClient) return template;

    try {
      const prompt = JSON.stringify({
        role: "codebase explorer",
        idea: context.idea.title,
        description: context.idea.description,
        constraints: context.idea.constraints,
        instruction:
          'Respond ONLY with valid JSON: { "newAgentsNeeded": string[], "architecturalRisks": string[], "entryPointStrategy": string }. Be specific and technical.'
      });
      const raw = await this.llmClient.complete(prompt);
      const parsed = JSON.parse(raw) as Partial<ExplorationReport>;
      return {
        ...template,
        ...(Array.isArray(parsed.newAgentsNeeded) && parsed.newAgentsNeeded.length > 0
          ? { newAgentsNeeded: parsed.newAgentsNeeded }
          : {}),
        ...(Array.isArray(parsed.architecturalRisks) && parsed.architecturalRisks.length > 0
          ? { architecturalRisks: parsed.architecturalRisks }
          : {}),
        ...(typeof parsed.entryPointStrategy === "string" && parsed.entryPointStrategy.length > 0
          ? { entryPointStrategy: parsed.entryPointStrategy }
          : {}),
        llm: "ok"
      };
    } catch {
      return { ...template, llm: "error" };
    }
  }
}
