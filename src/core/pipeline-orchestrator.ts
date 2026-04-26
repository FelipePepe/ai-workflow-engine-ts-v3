import crypto from "node:crypto";
import type { LlmClient } from "../llm/llm-client.js";
import { ExploreAgent } from "../agents/explore-agent.js";
import { ProposeAgent } from "../agents/propose-agent.js";
import { DesignAgent } from "../agents/design-agent.js";
import { TasksAgent } from "../agents/tasks-agent.js";
import { SpecAgent } from "../agents/spec-agent.js";
import { AgentOrchestrator } from "./orchestrator.js";
import type { IdeaInput, PipelineContext, PipelineResult } from "../schemas/pipeline.schema.js";
import type { AgentContext } from "../agents/base-agent.js";
import type { SddSpec } from "../schemas/spec.schema.js";
import type { TaskInput } from "../schemas/task.schema.js";
import type { WebSocketManager } from "../websocket/websocket-manager.js";

export class PipelineOrchestrator {
  private readonly explore: ExploreAgent;
  private readonly propose: ProposeAgent;
  private readonly spec: SpecAgent;
  private readonly design: DesignAgent;
  private readonly tasks: TasksAgent;
  private readonly execution: AgentOrchestrator;

  constructor(
    private readonly llmClient: LlmClient | null = null,
    private readonly wsManager: WebSocketManager | null = null
  ) {
    this.explore = new ExploreAgent(llmClient);
    this.propose = new ProposeAgent(llmClient);
    this.spec = new SpecAgent(llmClient);
    this.design = new DesignAgent(llmClient);
    this.tasks = new TasksAgent(llmClient);
    this.execution = new AgentOrchestrator(llmClient);
  }

  async run(idea: IdeaInput): Promise<PipelineResult> {
    const runId = crypto.randomUUID().slice(0, 8);
    const startedAt = Date.now();
    const ts = () => new Date().toISOString();

    const ctx: PipelineContext = { idea };

    // ── Planning phase ─────────────────────────────────────────────────────

    this.wsManager?.emit(runId, { type: "pipeline_stage", stage: "explore", runId, timestamp: ts() });
    ctx.explorationReport = await this.explore.run(ctx);

    this.wsManager?.emit(runId, { type: "pipeline_stage", stage: "propose", runId, timestamp: ts() });
    ctx.proposal = await this.propose.run(ctx);

    this.wsManager?.emit(runId, { type: "pipeline_stage", stage: "spec", runId, timestamp: ts() });
    const agentCtxForSpec = this.bridgeToAgentContext(runId, ctx);
    ctx.spec = await this.spec.run(agentCtxForSpec) as Record<string, unknown>;

    this.wsManager?.emit(runId, { type: "pipeline_stage", stage: "design", runId, timestamp: ts() });
    ctx.design = await this.design.run(ctx);

    this.wsManager?.emit(runId, { type: "pipeline_stage", stage: "tasks", runId, timestamp: ts() });
    ctx.tasks = await this.tasks.run(ctx);

    // ── Execution phase ────────────────────────────────────────────────────

    this.wsManager?.emit(runId, { type: "pipeline_stage", stage: "execution", runId, timestamp: ts() });
    const syntheticTask = this.bridgeToTaskInput(ctx);
    const executionAgentCtx = this.bridgeToAgentContext(runId, ctx, syntheticTask);
    const planner = await import("./planner.js");
    const plan = await new planner.Planner().createPlan(ctx.spec as unknown as SddSpec, {
      language: "typescript",
      framework: "fastify",
      architecture: "hexagonal",
      qualityLevel: "production",
      testingStrategy: "tdd-bdd",
      securityLevel: "high"
    });
    const agentResults = await this.execution.runPlan(plan, executionAgentCtx);

    for (const result of agentResults) {
      this.wsManager?.emit(runId, {
        type: "agent_complete",
        runId,
        agentName: result.agentName,
        status: result.status,
        timestamp: ts()
      });
    }

    return {
      runId,
      idea,
      planning: {
        exploration: ctx.explorationReport,
        proposal: ctx.proposal,
        spec: ctx.spec,
        design: ctx.design,
        tasks: ctx.tasks
      },
      execution: { agentResults },
      durationMs: Date.now() - startedAt
    };
  }

  // ── Bridge helpers ─────────────────────────────────────────────────────────

  private bridgeToAgentContext(runId: string, ctx: PipelineContext, task?: TaskInput): AgentContext {
    return {
      runId,
      task: task ?? {
        title: ctx.idea.title,
        description: ctx.idea.description,
        constraints: ctx.idea.constraints,
        priority: "medium"
      },
      projectSpec: {
        language: "typescript",
        framework: "fastify",
        architecture: "hexagonal",
        qualityLevel: "production",
        testingStrategy: "tdd-bdd",
        securityLevel: "high"
      },
      dryRun: false,
      branch: `feature/${runId}`
    };
  }

  private bridgeToTaskInput(ctx: PipelineContext): TaskInput {
    const firstTask = ctx.tasks?.[0];
    return {
      title: firstTask?.title ?? ctx.idea.title,
      description: firstTask?.description ?? ctx.idea.description,
      constraints: ctx.idea.constraints,
      priority: firstTask?.priority ?? "medium"
    };
  }
}
