import { describe, it, expect } from "vitest";
import { ExploreAgent } from "../src/agents/explore-agent.js";
import { ProposeAgent } from "../src/agents/propose-agent.js";
import { DesignAgent } from "../src/agents/design-agent.js";
import { TasksAgent } from "../src/agents/tasks-agent.js";
import type { LlmClient } from "../src/llm/llm-client.js";
import type { PipelineContext } from "../src/schemas/pipeline.schema.js";

// ─── Test doubles ───────────────────────────────────────────────────────────

class MockLlmClient implements LlmClient {
  constructor(private readonly response: string) {}
  async complete(_prompt: string): Promise<string> { return this.response; }
}
class ThrowingLlmClient implements LlmClient {
  async complete(_prompt: string): Promise<string> { throw new Error("LLM unavailable"); }
}
class InvalidJsonLlmClient implements LlmClient {
  async complete(_prompt: string): Promise<string> { return "not json {{{"; }
}

// ─── Shared fixture ──────────────────────────────────────────────────────────

const baseCtx: PipelineContext = {
  idea: {
    title: "Unified SDD Pipeline",
    description: "Integrate SDD planning phases into the execution pipeline",
    constraints: ["no breaking changes", "backward compatible"]
  }
};

// ─── ExploreAgent ─────────────────────────────────────────────────────────────

describe("ExploreAgent", () => {
  it("returns template when llmClient is null", async () => {
    const agent = new ExploreAgent(null);
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("not_configured");
    expect(result.newAgentsNeeded.length).toBeGreaterThan(0);
    expect(result.entryPointStrategy).toContain("/pipeline/run");
  });

  it("merges LLM response when valid", async () => {
    const llmResp = JSON.stringify({
      newAgentsNeeded: ["ExploreAgent", "ProposeAgent"],
      architecturalRisks: ["latency"],
      entryPointStrategy: "POST /pipeline/run with streaming"
    });
    const agent = new ExploreAgent(new MockLlmClient(llmResp));
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("ok");
    expect(result.entryPointStrategy).toBe("POST /pipeline/run with streaming");
    expect(result.newAgentsNeeded).toEqual(["ExploreAgent", "ProposeAgent"]);
    // template fields preserved
    expect(result.idea).toBe(baseCtx.idea.title);
  });

  it("falls back to template when LLM throws", async () => {
    const agent = new ExploreAgent(new ThrowingLlmClient());
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("error");
    expect(result.newAgentsNeeded.length).toBeGreaterThan(0);
  });

  it("falls back to template when LLM returns invalid JSON", async () => {
    const agent = new ExploreAgent(new InvalidJsonLlmClient());
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("error");
  });
});

// ─── ProposeAgent ─────────────────────────────────────────────────────────────

describe("ProposeAgent", () => {
  it("returns template when llmClient is null", async () => {
    const agent = new ProposeAgent(null);
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("not_configured");
    expect(result.intent).toContain(baseCtx.idea.description);
  });

  it("merges LLM response when valid", async () => {
    const llmResp = JSON.stringify({
      intent: "Extend engine with full SDD planning",
      scope: { added: ["PipelineOrchestrator"], changed: ["engine.ts"], deleted: [] },
      approach: "New PipelineOrchestrator chains planning agents",
      outOfScope: ["UI changes"],
      risks: ["LLM latency"]
    });
    const agent = new ProposeAgent(new MockLlmClient(llmResp));
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("ok");
    expect(result.intent).toBe("Extend engine with full SDD planning");
    expect(result.scope.added).toContain("PipelineOrchestrator");
  });

  it("falls back to template when LLM throws", async () => {
    const agent = new ProposeAgent(new ThrowingLlmClient());
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("error");
    expect(result.intent).toBeDefined();
  });

  it("falls back to template when LLM returns invalid JSON", async () => {
    const agent = new ProposeAgent(new InvalidJsonLlmClient());
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("error");
  });
});

// ─── DesignAgent ──────────────────────────────────────────────────────────────

describe("DesignAgent", () => {
  it("returns template when llmClient is null", async () => {
    const agent = new DesignAgent(null);
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("not_configured");
    expect(result.apiContract.endpoint).toBe("/pipeline/run");
  });

  it("merges LLM response when valid", async () => {
    const llmResp = JSON.stringify({
      architecture: "Route → PipelineOrchestrator → planning → execution",
      newComponents: [{ name: "ExploreAgent", responsibility: "codebase analysis" }],
      dataFlow: "IdeaInput → PipelineContext → PipelineResult"
    });
    const agent = new DesignAgent(new MockLlmClient(llmResp));
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("ok");
    expect(result.architecture).toContain("PipelineOrchestrator");
    // apiContract preserved from template
    expect(result.apiContract.endpoint).toBe("/pipeline/run");
  });

  it("falls back to template when LLM throws", async () => {
    const agent = new DesignAgent(new ThrowingLlmClient());
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("error");
  });

  it("falls back to template when LLM returns invalid JSON", async () => {
    const agent = new DesignAgent(new InvalidJsonLlmClient());
    const result = await agent.run(baseCtx);
    expect(result.llm).toBe("error");
  });
});

// ─── TasksAgent ───────────────────────────────────────────────────────────────

describe("TasksAgent", () => {
  it("returns template (1 task) when llmClient is null", async () => {
    const agent = new TasksAgent(null);
    const result = await agent.run(baseCtx);
    expect(result.length).toBe(1);
    expect(result[0].title).toContain(baseCtx.idea.title);
  });

  it("returns LLM tasks when valid array returned", async () => {
    const llmResp = JSON.stringify([
      { id: "T-01", title: "Create PipelineOrchestrator", description: "...", files: ["src/core/pipeline-orchestrator.ts"], priority: "high", dependencies: [] },
      { id: "T-02", title: "Add /pipeline/run route", description: "...", files: ["src/api/pipeline.routes.ts"], priority: "high", dependencies: ["T-01"] }
    ]);
    const agent = new TasksAgent(new MockLlmClient(llmResp));
    const result = await agent.run(baseCtx);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe("T-01");
  });

  it("falls back to template when LLM throws", async () => {
    const agent = new TasksAgent(new ThrowingLlmClient());
    const result = await agent.run(baseCtx);
    expect(result.length).toBe(1);
  });

  it("falls back to template when LLM returns invalid JSON", async () => {
    const agent = new TasksAgent(new InvalidJsonLlmClient());
    const result = await agent.run(baseCtx);
    expect(result.length).toBe(1);
  });
});
