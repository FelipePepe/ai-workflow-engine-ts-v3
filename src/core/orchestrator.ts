import type { AgentContext, BaseAgent } from "../agents/base-agent.js";
import { DeveloperAgent } from "../agents/developer-agent.js";
import { DocumentationAgent } from "../agents/documentation-agent.js";
import { QaAgent } from "../agents/qa-agent.js";
import { ReviewerAgent } from "../agents/reviewer-agent.js";
import { SecurityAgent } from "../agents/security-agent.js";
import type { LlmClient } from "../llm/llm-client.js";
import type { ExecutionPlan } from "../schemas/plan.schema.js";
import type { AgentResult } from "../schemas/result.schema.js";

export class AgentOrchestrator {
  private readonly agents: Record<string, BaseAgent>;

  constructor(llmClient: LlmClient | null = null) {
    this.agents = {
      developer: new DeveloperAgent(llmClient),
      qa: new QaAgent(llmClient),
      security: new SecurityAgent(llmClient),
      reviewer: new ReviewerAgent(),
      documentation: new DocumentationAgent(llmClient)
    };
  }

  async runPlan(plan: ExecutionPlan, context: AgentContext): Promise<AgentResult[]> {
    const results: AgentResult[] = [];

    const parallelSteps = plan.steps.filter((step) => step.parallelizable);
    const sequentialSteps = plan.steps.filter((step) => !step.parallelizable);

    const parallelResults = await Promise.all(parallelSteps.map(async (step) => this.runStep(step.agent, step.id, step.task, context)));
    results.push(...parallelResults);

    for (const result of parallelResults) {
      context[`${result.agentName}Result`] = result.output;
    }

    for (const step of sequentialSteps) {
      const result = await this.runStep(step.agent, step.id, step.task, context);
      results.push(result);
      context[`${result.agentName}Result`] = result.output;
    }

    return results;
  }

  private async runStep(agentName: string, stepId: string, task: string, context: AgentContext): Promise<AgentResult> {
    const agent = this.agents[agentName];
    if (!agent) throw new Error(`Unknown agent: ${agentName}`);

    const output = await agent.run(context);

    return {
      agentName: agent.name,
      status: "completed",
      output,
      logs: [`Executed ${stepId}: ${task}`]
    };
  }
}
