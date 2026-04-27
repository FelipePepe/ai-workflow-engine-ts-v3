import { describe, expect, it } from "vitest";
import { DiscoveryAgent } from "../src/agents/discovery-agent.js";

describe("DiscoveryAgent", () => {
  it("infers api and typescript from text", async () => {
    const result = await new DiscoveryAgent().analyze({
      title: "Crear API con Fastify",
      description: "Crear endpoint en TypeScript usando Fastify",
      constraints: [],
      priority: "medium",
      taskType: "new_project"
    });

    expect(result.projectSpec.projectType).toBe("api");
    expect(result.projectSpec.language).toBe("typescript");
    expect(result.projectSpec.framework).toBe("fastify");
  });
});
