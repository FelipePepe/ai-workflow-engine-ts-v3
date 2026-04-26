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

const app = Fastify({ logger: true });

await app.register(cors);
await app.register(websocket);

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
