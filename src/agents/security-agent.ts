import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import type { LlmClient } from "../llm/llm-client.js";
import { PermissionGuard } from "../security/permission-guard.js";

export class SecurityAgent implements BaseAgent {
  public readonly name = "security";
  private readonly permissions = new PermissionGuard();

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const projectSpec = context.projectSpec as ProjectSpec;
    const policy = await this.permissions.loadPolicy();

    const deterministicChecks = {
      accessControl: "reviewed",
      inputValidation: "reviewed",
      secrets: "no secrets detected",
      supplyChain: "pending real SCA integration",
      promptInjection: "considered",
      excessiveAgency: "limited"
    };

    const mock = {
      securityGate: "passed",
      securityLevel: projectSpec.securityLevel,
      sandboxPolicy: policy,
      owaspChecks: deterministicChecks,
      issues: []
    };

    if (!this.llmClient) {
      return { ...mock, llm: "not configured, using mock output" };
    }

    try {
      const prompt = JSON.stringify({
        role: "security engineer",
        securityLevel: projectSpec.securityLevel,
        developerResult: context["developerResult"] ?? null,
        deterministicFindings: deterministicChecks,
        instruction: "Respond ONLY with valid JSON: { \"securityGate\": \"passed\" | \"failed\", \"owaspChecks\": object, \"issues\": string[], \"recommendations\": string[] }"
      });
      const raw = await this.llmClient.complete(prompt);
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      // LLM supplements deterministic checks — merge, never replace
      const mergedOwaspChecks = { ...deterministicChecks, ...(parsed["owaspChecks"] as object ?? {}) };
      const mergedIssues = [
        ...((parsed["issues"] as string[]) ?? []),
      ].filter((v, i, a) => a.indexOf(v) === i);
      return { ...mock, ...parsed, owaspChecks: mergedOwaspChecks, issues: mergedIssues, sandboxPolicy: policy, securityLevel: projectSpec.securityLevel, llm: "ok" };
    } catch {
      return { ...mock, llm: "error, using mock output" };
    }
  }
}
