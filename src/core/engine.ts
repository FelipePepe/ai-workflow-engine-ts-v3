import crypto from "node:crypto";
import type { AgentContext } from "../agents/base-agent.js";
import { DiscoveryAgent } from "../agents/discovery-agent.js";
import { SpecAgent } from "../agents/spec-agent.js";
import type { LlmClient } from "../llm/llm-client.js";
import { settings } from "../config/settings.js";
import { MemoryStore } from "../memory/memory-store.js";
import type { SddSpec } from "../schemas/spec.schema.js";
import type { TaskInput } from "../schemas/task.schema.js";
import type { IdeaInput, PipelineResult } from "../schemas/pipeline.schema.js";
import { WorkspaceManager } from "../workspace/workspace-manager.js";
import type { WebSocketManager } from "../websocket/websocket-manager.js";
import { Evaluator } from "./evaluator.js";
import { GitFlowService } from "./gitflow.js";
import { Improver } from "./improver.js";
import { AgentOrchestrator } from "./orchestrator.js";
import { Planner } from "./planner.js";
import { PipelineOrchestrator } from "./pipeline-orchestrator.js";

export class SelfImprovementEngine {
  private readonly discoveryAgent = new DiscoveryAgent();
  private readonly specAgent: SpecAgent;
  private readonly planner = new Planner();
  private readonly orchestrator: AgentOrchestrator;
  private readonly evaluator = new Evaluator();
  private readonly improver = new Improver();
  private readonly memory = new MemoryStore();
  private readonly gitflow = new GitFlowService();
  private readonly workspaceManager = new WorkspaceManager();
  private wsManager: WebSocketManager | null = null;

  constructor(private readonly llmClient: LlmClient | null = null) {
    this.specAgent = new SpecAgent(llmClient);
    this.orchestrator = new AgentOrchestrator(llmClient);
  }

  setWsManager(wsManager: WebSocketManager): void {
    this.wsManager = wsManager;
  }

  async runPipeline(idea: IdeaInput): Promise<PipelineResult> {
    const pipeline = new PipelineOrchestrator(this.llmClient, this.wsManager);
    return pipeline.run(idea);
  }

  async createPlanOnly(task: TaskInput): Promise<Record<string, unknown>> {
    const runId = crypto.randomUUID().slice(0, 8);
    const discovery = await this.discoveryAgent.analyze(task);
    const projectSpec = discovery.projectSpec;
    const branch = this.gitflow.createFeatureBranchName(runId, task.title);

    const context: AgentContext = {
      runId,
      task,
      discovery,
      projectSpec,
      dryRun: true,
      branch,
      startedAt: new Date().toISOString()
    };

    const spec = await this.specAgent.run(context) as unknown as SddSpec;
    const plan = await this.planner.createPlan(spec, projectSpec);

    return { runId, branch, discovery, projectSpec, spec, plan, dryRun: true };
  }

  async run(task: TaskInput): Promise<Record<string, unknown>> {
    const planned = await this.createPlanOnly(task);
    const runId = planned.runId as string;
    const branch = planned.branch as string;
    const discovery = planned.discovery as any;
    const projectSpec = planned.projectSpec as any;
    const spec = planned.spec as SddSpec;
    const plan = planned.plan as any;

    const ts = () => new Date().toISOString();
    this.wsManager?.emit(runId, { type: "run_start", runId, timestamp: ts() });

    try {
      const workspaces = await this.workspaceManager.createParallelWorkspaces(
        runId,
        ["developer", "qa", "security", "reviewer", "documentation"]
      );

      const context: AgentContext = {
        runId,
        task,
        discovery,
        projectSpec,
        spec,
        plan,
        dryRun: settings.dryRun || !discovery.canProceed || plan.approvalRequired,
        branch,
        workspaces,
        startedAt: new Date().toISOString()
      };

      const agentResults = await this.orchestrator.runPlan(plan, context);
      for (const result of agentResults) {
        this.wsManager?.emit(runId, { type: "agent_complete", runId, agentName: result.agentName, status: result.status, timestamp: ts() });
      }

      const evaluation = this.evaluator.evaluate(context, agentResults);
      const improvements = this.improver.suggestImprovements(evaluation, discovery);

      const experience = {
        runId,
        branch,
        workspaces,
        task,
        discovery,
        projectSpec,
        spec,
        plan,
        agentResults,
        evaluation,
        improvements,
        gitflowPolicy: this.gitflow.policy(),
        dryRun: context.dryRun,
        finishedAt: new Date().toISOString()
      };

      await this.memory.save(experience);
      this.wsManager?.emit(runId, { type: "run_finish", runId, timestamp: ts() });
      return experience;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.wsManager?.emit(runId, { type: "error", runId, message, timestamp: ts() });
      throw err;
    }
  }
}
