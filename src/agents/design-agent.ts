import type { LlmClient } from "../llm/llm-client.js";
import type { PipelineContext, TechnicalDesign } from "../schemas/pipeline.schema.js";

export class DesignAgent {
  public readonly name = "design";

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: PipelineContext): Promise<TechnicalDesign> {
    const template: TechnicalDesign = {
      architecture:
        "Layered: Route → Engine → PipelineOrchestrator → [PlanningAgents] → AgentOrchestrator → [ExecutionAgents]",
      newComponents: context.explorationReport?.newAgentsNeeded.map((name) => ({
        name,
        responsibility: `SDD planning stage: ${name}`
      })) ?? [],
      dataFlow: "IdeaInput → PipelineContext (accumulates) → PipelineResult",
      apiContract: {
        endpoint: "/pipeline/run",
        method: "POST",
        requestShape: { title: "string", description: "string", constraints: "string[]" },
        responseShape: { runId: "string", planning: "object", execution: "object", durationMs: "number" }
      },
      llm: "not_configured"
    };

    if (!this.llmClient) return template;

    try {
      const prompt = JSON.stringify({
        role: "technical architect",
        idea: context.idea.title,
        proposal: context.proposal,
        spec: context.spec,
        instruction:
          'Respond ONLY with valid JSON: { "architecture": string, "newComponents": Array<{name: string, responsibility: string}>, "dataFlow": string }. Be specific and concrete.'
      });
      const raw = await this.llmClient.complete(prompt);
      const parsed = JSON.parse(raw) as Partial<TechnicalDesign>;
      return {
        ...template,
        ...(typeof parsed.architecture === "string" && parsed.architecture.length > 0
          ? { architecture: parsed.architecture }
          : {}),
        ...(Array.isArray(parsed.newComponents) && parsed.newComponents.length > 0
          ? { newComponents: parsed.newComponents }
          : {}),
        ...(typeof parsed.dataFlow === "string" && parsed.dataFlow.length > 0
          ? { dataFlow: parsed.dataFlow }
          : {}),
        llm: "ok"
      };
    } catch {
      return { ...template, llm: "error" };
    }
  }
}
