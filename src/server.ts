import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { settings } from "./config/settings.js";
import { registerDiscoveryRoutes } from "./api/discovery.routes.js";
import { registerPlanRoutes } from "./api/plan.routes.js";
import { registerTaskRoutes } from "./api/tasks.routes.js";
import { registerConfigRoutes } from "./api/config.routes.js";
import { registerMemoryRoutes } from "./api/memory.routes.js";
import { registerMetricsRoutes } from "./api/metrics.routes.js";
import { registerWebSocketRoutes } from "./websocket/websocket.routes.js";
import type { FastifyError } from "fastify";
import type { ErrorResponseBody } from "./types/errors.js";
import { SelfImprovementEngine } from "./core/engine.js";
import { websocketManager } from "./websocket/websocket-manager.js";

const app = Fastify({ logger: true });

app.setErrorHandler((error: FastifyError, _request, reply) => {
  const body: ErrorResponseBody = {
    error: error.message,
    code: error.code ?? "INTERNAL_ERROR",
    details: process.env["APP_ENV"] === "dev" ? error.stack : undefined,
  };
  void reply.status(error.statusCode ?? 500).send(body);
});

await app.register(cors);
await app.register(websocket);

const engine = new SelfImprovementEngine();
engine.setWsManager(websocketManager);
app.decorate("engine", engine);

app.get("/", async () => ({
  name: settings.appName,
  version: "0.3.0",
  status: "running"
}));

registerDiscoveryRoutes(app);
registerPlanRoutes(app);
registerTaskRoutes(app);
registerConfigRoutes(app);
registerMemoryRoutes(app);
registerMetricsRoutes(app);
registerWebSocketRoutes(app);

await app.listen({ port: settings.port, host: "0.0.0.0" });
