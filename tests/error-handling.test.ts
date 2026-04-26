import { describe, expect, it, vi } from "vitest";
import Fastify from "fastify";
import { registerTaskRoutes } from "../src/api/tasks.routes.js";
import { registerPlanRoutes } from "../src/api/plan.routes.js";
import { registerDiscoveryRoutes } from "../src/api/discovery.routes.js";

vi.mock("../src/core/engine.js", () => ({
  SelfImprovementEngine: class {
    run() { return Promise.reject(new Error("engine exploded")); }
    createPlanOnly() { return Promise.reject(new Error("engine exploded")); }
  },
}));

const validBody = {
  title: "test",
  description: "test description",
  constraints: [],
  priority: "low",
};

describe("Error handling — route try/catch", () => {
  it("POST /tasks/run returns 400 with VALIDATION_ERROR on bad input", async () => {
    const app = Fastify();
    registerTaskRoutes(app);
    const res = await app.inject({ method: "POST", url: "/tasks/run", body: {} });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body).toHaveProperty("error");
    expect(body.code).toBe("VALIDATION_ERROR");
    await app.close();
  });

  it("POST /plan/create returns 400 with VALIDATION_ERROR on bad input", async () => {
    const app = Fastify();
    registerPlanRoutes(app);
    const res = await app.inject({ method: "POST", url: "/plan/create", body: {} });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    await app.close();
  });

  it("POST /discovery/analyze returns 400 with VALIDATION_ERROR on bad input", async () => {
    const app = Fastify();
    registerDiscoveryRoutes(app);
    const res = await app.inject({ method: "POST", url: "/discovery/analyze", body: {} });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    await app.close();
  });

  it("POST /tasks/run returns 500 with INTERNAL_ERROR when engine throws", async () => {
    const app = Fastify();
    registerTaskRoutes(app);
    const res = await app.inject({ method: "POST", url: "/tasks/run", body: validBody });
    expect(res.statusCode).toBe(500);
    const body = res.json();
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body).toHaveProperty("error");
    await app.close();
  });
});
