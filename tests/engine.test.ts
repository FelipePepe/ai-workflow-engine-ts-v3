import { describe, expect, it } from "vitest";
import { SelfImprovementEngine } from "../src/core/engine.js";

describe("SelfImprovementEngine V3", () => {
  it("creates a plan only", async () => {
    const result = await new SelfImprovementEngine().createPlanOnly({
      title: "Crear endpoint de prueba",
      description: "Crear una API en TypeScript con Fastify",
      constraints: ["Debe incluir tests"],
      priority: "low"
    });

    expect(result).toHaveProperty("plan");
    expect(result).toHaveProperty("projectSpec");
  });

  it("runs with JSON config and returns evaluation", async () => {
    const result = await new SelfImprovementEngine().run({
      title: "Crear endpoint de prueba",
      description: "Crear una API en TypeScript con Fastify",
      constraints: ["Debe incluir tests"],
      priority: "low"
    });

    expect(result).toHaveProperty("evaluation");
    expect(result).toHaveProperty("workspaces");
  });
});
