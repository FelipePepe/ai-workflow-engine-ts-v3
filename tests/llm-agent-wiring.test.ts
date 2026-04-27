import { describe, it, expect } from "vitest";
import { DeveloperAgent } from "../src/agents/developer-agent.js";
import { QaAgent } from "../src/agents/qa-agent.js";
import { SecurityAgent } from "../src/agents/security-agent.js";
import { DocumentationAgent } from "../src/agents/documentation-agent.js";
import { SpecAgent } from "../src/agents/spec-agent.js";
import type { LlmClient } from "../src/llm/llm-client.js";
import type { AgentContext } from "../src/agents/base-agent.js";

// ─── Test doubles ───────────────────────────────────────────────────────────

class MockLlmClient implements LlmClient {
  constructor(private readonly response: string) {}
  async complete(_prompt: string): Promise<string> {
    return this.response;
  }
}

class ThrowingLlmClient implements LlmClient {
  async complete(_prompt: string): Promise<string> {
    throw new Error("LLM unavailable");
  }
}

class InvalidJsonLlmClient implements LlmClient {
  async complete(_prompt: string): Promise<string> {
    return "this is not json {{{";
  }
}

// ─── Shared context fixture ──────────────────────────────────────────────────

const baseContext: AgentContext = {
  runId: "test-run",
  task: {
    title: "Test task",
    description: "Test description",
    constraints: ["no external deps"],
    priority: "medium"
  },
  projectSpec: {
    language: "typescript",
    framework: "fastify",
    architecture: "hexagonal",
    qualityLevel: "production",
    testingStrategy: ["bdd", "unit"],
    securityLevel: "high"
  },
  dryRun: true,
  branch: "feature/test"
};

// ─── DeveloperAgent ──────────────────────────────────────────────────────────

describe("DeveloperAgent", () => {
  it("returns mock output when llmClient is null", async () => {
    const agent = new DeveloperAgent(null);
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("not configured, using mock output");
    expect(result["summary"]).toBeDefined();
  });

  it("uses LLM response when client is provided and returns valid JSON", async () => {
    const llmResponse = JSON.stringify({
      summary: "LLM-generated plan",
      filesChanged: ["src/foo.ts"],
      codeNotes: ["use dependency injection"],
      risks: []
    });
    const agent = new DeveloperAgent(new MockLlmClient(llmResponse));
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("ok");
    expect(result["summary"]).toBe("LLM-generated plan");
    expect(result["filesChanged"]).toEqual(["src/foo.ts"]);
  });

  it("falls back to mock when LLM throws", async () => {
    const agent = new DeveloperAgent(new ThrowingLlmClient());
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("error, using mock output");
    expect(result["summary"]).toBeDefined();
  });

  it("falls back to mock when LLM returns invalid JSON", async () => {
    const agent = new DeveloperAgent(new InvalidJsonLlmClient());
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("error, using mock output");
  });
});

// ─── QaAgent ─────────────────────────────────────────────────────────────────

describe("QaAgent", () => {
  it("returns mock output when llmClient is null", async () => {
    const agent = new QaAgent(null);
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("not configured, using mock output");
    expect(result["tests"]).toBeDefined();
  });

  it("uses LLM response when valid", async () => {
    const llmResponse = JSON.stringify({
      tests: { unit: "passed", bdd: "passed", coverage: 92 },
      testCases: ["should return 200 on valid input"],
      logs: ["LLM-generated test strategy"]
    });
    const agent = new QaAgent(new MockLlmClient(llmResponse));
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("ok");
    expect((result["tests"] as Record<string, unknown>)["coverage"]).toBe(92);
  });

  it("falls back to mock when LLM throws", async () => {
    const agent = new QaAgent(new ThrowingLlmClient());
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("error, using mock output");
  });
});

// ─── SecurityAgent ───────────────────────────────────────────────────────────

describe("SecurityAgent", () => {
  it("returns mock output when llmClient is null", async () => {
    const agent = new SecurityAgent(null);
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("not configured, using mock output");
    expect(result["securityGate"]).toBe("passed");
  });

  it("merges LLM owaspChecks with deterministic checks (never replaces)", async () => {
    const llmResponse = JSON.stringify({
      securityGate: "passed",
      owaspChecks: { cors: "reviewed" },
      issues: [],
      recommendations: ["add rate limiting"]
    });
    const agent = new SecurityAgent(new MockLlmClient(llmResponse));
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("ok");
    // deterministic check still present
    expect((result["owaspChecks"] as Record<string, unknown>)["accessControl"]).toBe("reviewed");
    // LLM addition merged in
    expect((result["owaspChecks"] as Record<string, unknown>)["cors"]).toBe("reviewed");
  });

  it("falls back to mock when LLM throws", async () => {
    const agent = new SecurityAgent(new ThrowingLlmClient());
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("error, using mock output");
  });
});

// ─── DocumentationAgent ──────────────────────────────────────────────────────

describe("DocumentationAgent", () => {
  it("returns mock output when llmClient is null", async () => {
    const agent = new DocumentationAgent(null);
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("not configured, using mock output");
    expect(result["documentation"]).toBe("updated");
  });

  it("uses LLM response when valid", async () => {
    const llmResponse = JSON.stringify({
      documentation: "updated",
      sections: ["Summary", "Changes"],
      summary: "Implemented test task using hexagonal architecture."
    });
    const agent = new DocumentationAgent(new MockLlmClient(llmResponse));
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("ok");
    expect(result["summary"]).toBe("Implemented test task using hexagonal architecture.");
  });

  it("falls back to mock when LLM returns invalid JSON", async () => {
    const agent = new DocumentationAgent(new InvalidJsonLlmClient());
    const result = await agent.run(baseContext);
    expect(result["llm"]).toBe("error, using mock output");
  });
});

// ─── SpecAgent ───────────────────────────────────────────────────────────────

describe("SpecAgent", () => {
  it("returns template spec when llmClient is null", async () => {
    const agent = new SpecAgent(null);
    const result = await agent.run(baseContext);
    expect(result["feature"]).toBe("Test task");
    expect(result["functionalRequirements"]).toBeDefined();
    // no llm field when null client (no error)
    expect(result["llm"]).toBeUndefined();
  });

  it("enhances functionalRequirements and bddScenarios from LLM", async () => {
    const llmResponse = JSON.stringify({
      functionalRequirements: ["FR1: validate input", "FR2: return structured response"],
      bddScenarios: ["Given a valid request, When processed, Then returns 200"]
    });
    const agent = new SpecAgent(new MockLlmClient(llmResponse));
    const result = await agent.run(baseContext);
    expect(result["functionalRequirements"]).toEqual(["FR1: validate input", "FR2: return structured response"]);
    expect(result["bddScenarios"]).toEqual(["Given a valid request, When processed, Then returns 200"]);
    // security and quality requirements must still come from template
    expect(result["securityRequirements"]).toBeDefined();
  });

  it("keeps template spec when LLM throws", async () => {
    const agent = new SpecAgent(new ThrowingLlmClient());
    const result = await agent.run(baseContext);
    expect(result["feature"]).toBe("Test task");
    expect((result["functionalRequirements"] as string[]).length).toBeGreaterThan(0);
  });

  it("keeps template when LLM returns invalid JSON", async () => {
    const agent = new SpecAgent(new InvalidJsonLlmClient());
    const result = await agent.run(baseContext);
    expect(result["feature"]).toBe("Test task");
  });
});
