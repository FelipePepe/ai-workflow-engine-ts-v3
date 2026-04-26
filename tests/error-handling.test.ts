import { describe, expect, it } from "vitest";
import Fastify from "fastify";
import { registerTaskRoutes } from "../src/api/tasks.routes.js";
import { registerPlanRoutes } from "../src/api/plan.routes.js";
import { registerDiscoveryRoutes } from "../src/api/discovery.routes.js";

const validBody = {
  title: "test",
  description: "test description",
  constraints: [],
  priority: "low",
};

describe("Error handling — validation errors", () => {
  it("POST /tasks/run returns 400 with VALIDATION_ERROR on bad input", async () => {
    const app = Fastify();
    app.decorate("engine", {} as never);
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
    app.decorate("engine", {} as never);
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
});

describe("Error handling — engine throws", () => {
  it("POST /tasks/run returns 500 with INTERNAL_ERROR when engine.run throws", async () => {
    const app = Fastify();
    app.decorate("engine", {
      run: () => Promise.reject(new Error("engine exploded")),
      createPlanOnly: () => Promise.reject(new Error("engine exploded")),
    } as never);
    registerTaskRoutes(app);
    const res = await app.inject({ method: "POST", url: "/tasks/run", body: validBody });
    expect(res.statusCode).toBe(500);
    const body = res.json();
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body.error).toBe("engine exploded");
    await app.close();
  });

  it("POST /plan/create returns 500 with INTERNAL_ERROR when engine.createPlanOnly throws", async () => {
    const app = Fastify();
    app.decorate("engine", {
      run: () => Promise.reject(new Error("plan failed")),
      createPlanOnly: () => Promise.reject(new Error("plan failed")),
    } as never);
    registerPlanRoutes(app);
    const res = await app.inject({ method: "POST", url: "/plan/create", body: validBody });
    expect(res.statusCode).toBe(500);
    const body = res.json();
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body.error).toBe("plan failed");
    await app.close();
  });
});
