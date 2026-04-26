import type { LlmClient } from "../llm/llm-client.js";
import type { PipelineContext, Proposal } from "../schemas/pipeline.schema.js";

export class ProposeAgent {
  public readonly name = "propose";

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: PipelineContext): Promise<Proposal> {
    const template: Proposal = {
      intent: `Implement: ${context.idea.description}`,
      scope: {
        added: [],
        changed: [],
        deleted: []
      },
      approach: "TBD — requires LLM analysis",
      outOfScope: [],
      risks: context.explorationReport?.architecturalRisks ?? [],
      llm: "not_configured"
    };

    if (!this.llmClient) return template;

    try {
      const prompt = JSON.stringify({
        role: "proposal writer",
        idea: context.idea.title,
        description: context.idea.description,
        constraints: context.idea.constraints,
        exploration: context.explorationReport,
        instruction:
          'Respond ONLY with valid JSON: { "intent": string, "scope": { "added": string[], "changed": string[], "deleted": string[] }, "approach": string, "outOfScope": string[], "risks": string[] }.'
      });
      const raw = await this.llmClient.complete(prompt);
      const parsed = JSON.parse(raw) as Partial<Proposal>;
      return {
        intent: typeof parsed.intent === "string" && parsed.intent.length > 0
          ? parsed.intent
          : template.intent,
        scope: parsed.scope && typeof parsed.scope === "object"
          ? parsed.scope
          : template.scope,
        approach: typeof parsed.approach === "string" && parsed.approach.length > 0
          ? parsed.approach
          : template.approach,
        outOfScope: Array.isArray(parsed.outOfScope) ? parsed.outOfScope : template.outOfScope,
        risks: Array.isArray(parsed.risks) && parsed.risks.length > 0
          ? parsed.risks
          : template.risks,
        llm: "ok"
      };
    } catch {
      return { ...template, llm: "error" };
    }
  }
}
