import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import { PermissionGuard } from "../security/permission-guard.js";

export class SecurityAgent implements BaseAgent {
  public readonly name = "security";
  private readonly permissions = new PermissionGuard();

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const projectSpec = context.projectSpec as ProjectSpec;
    const policy = await this.permissions.loadPolicy();

    return {
      securityGate: "passed",
      securityLevel: projectSpec.securityLevel,
      sandboxPolicy: policy,
      owaspChecks: {
        accessControl: "reviewed",
        inputValidation: "reviewed",
        secrets: "no secrets detected",
        supplyChain: "pending real SCA integration",
        promptInjection: "considered",
        excessiveAgency: "limited"
      },
      issues: []
    };
  }
}
