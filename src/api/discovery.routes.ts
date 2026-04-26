import type { FastifyInstance } from "fastify";
import { DiscoveryAgent } from "../agents/discovery-agent.js";
import { TaskInputSchema } from "../schemas/task.schema.js";

export function registerDiscoveryRoutes(app: FastifyInstance): void {
  app.post("/discovery/analyze", async (request, reply) => {
    const parsed = TaskInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "Invalid task input", details: parsed.error.flatten() });
    return new DiscoveryAgent().analyze(parsed.data);
  });
}
