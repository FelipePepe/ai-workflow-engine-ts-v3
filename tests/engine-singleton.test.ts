import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import { SelfImprovementEngine } from "../src/core/engine.js";
import { registerTaskRoutes } from "../src/api/tasks.routes.js";
import { registerPlanRoutes } from "../src/api/plan.routes.js";

describe("Engine singleton — Fastify decoration", () => {
  it("app.engine is the same instance across route registrations", async () => {
    const app = Fastify();
    const engine = new SelfImprovementEngine();
    app.decorate("engine", engine);
    registerTaskRoutes(app);
    registerPlanRoutes(app);
    await app.ready();
    expect(app.engine).toBe(engine);
    await app.close();
  });

  it("app.engine exposes run and createPlanOnly methods", () => {
    const engine = new SelfImprovementEngine();
    expect(typeof engine.run).toBe("function");
    expect(typeof engine.createPlanOnly).toBe("function");
  });
});
