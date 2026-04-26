import { describe, expect, it } from "vitest";
import { ProjectConfigSchema } from "../src/config/schemas/project.schema.js";
import { AiConfigSchema } from "../src/config/schemas/ai.schema.js";
import { PermissionsConfigSchema } from "../src/config/schemas/permissions.schema.js";
import { JsonConfigLoader } from "../src/config/json-config-loader.js";

const validProject = {
  projectType: "api",
  language: "typescript",
  framework: "fastify",
  architecture: "layered",
  database: "unknown",
  qualityLevel: "production",
  securityLevel: "high",
  deploymentTarget: "docker",
  testingStrategy: "tdd-bdd",
  observability: true,
};

const validAi = {
  planMode: { enabled: true, requirePlanApproval: false, maxPlanIterations: 3 },
  agents: { maxParallelAgents: 5, defaultFlow: ["developer", "qa"] },
  limits: { maxRetries: 2, maxFilesPerRun: 20, maxShellCommandsPerRun: 10, maxExecutionSeconds: 300 },
  search: { preferGlobGrep: true, allowRag: false },
};

const validPermissions = {
  defaultMode: "sandbox",
  allowWrite: false,
  allowShell: false,
  allowNetwork: false,
  allowDelete: false,
  protectedBranches: ["main"],
  requireHumanApprovalFor: ["delete_files"],
};

describe("Config validation — Zod schemas", () => {
  it("ProjectConfigSchema accepts valid config", () => {
    const result = ProjectConfigSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it("ProjectConfigSchema rejects config missing required field", () => {
    const invalid = { ...validProject, language: undefined };
    const result = ProjectConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("AiConfigSchema accepts valid ai.config.json", () => {
    const result = AiConfigSchema.safeParse(validAi);
    expect(result.success).toBe(true);
  });

  it("AiConfigSchema rejects ai config with wrong type (maxPlanIterations as string)", () => {
    const invalid = { ...validAi, planMode: { ...validAi.planMode, maxPlanIterations: "three" } };
    const result = AiConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("PermissionsConfigSchema accepts valid permissions.json", () => {
    const result = PermissionsConfigSchema.safeParse(validPermissions);
    expect(result.success).toBe(true);
  });

  it("PermissionsConfigSchema rejects permissions missing defaultMode", () => {
    const { defaultMode: _, ...invalid } = validPermissions;
    const result = PermissionsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("JsonConfigLoader.load validates config/project.json against schema (integration)", async () => {
    const loader = new JsonConfigLoader();
    const result = await loader.load("config/project.json", ProjectConfigSchema);
    expect(result.language).toBe("typescript");
  });

  it("JsonConfigLoader.load throws descriptive error on invalid config shape", async () => {
    const loader = new JsonConfigLoader();
    await expect(
      loader.load("config/project.json", AiConfigSchema)
    ).rejects.toThrow("Config validation failed");
  });
});
