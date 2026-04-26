import type { FastifyInstance } from "fastify";
import { JsonConfigLoader } from "../config/json-config-loader.js";

export function registerConfigRoutes(app: FastifyInstance): void {
  app.get("/config", async () => {
    const loader = new JsonConfigLoader();
    return {
      project: await loader.load("config/project.json"),
      ai: await loader.load("config/ai.config.json"),
      permissions: await loader.load("config/permissions.json"),
      reviewPatterns: await loader.load("config/review-patterns.json")
    };
  });
}
