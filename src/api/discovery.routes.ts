import type { FastifyInstance } from "fastify";
import { DiscoveryAgent } from "../agents/discovery-agent.js";
import { TaskInputSchema } from "../schemas/task.schema.js";
import type { ErrorResponseBody } from "../types/errors.js";

export function registerDiscoveryRoutes(app: FastifyInstance): void {
  app.post("/discovery/analyze", async (request, reply) => {
    const parsed = TaskInputSchema.safeParse(request.body);
    if (!parsed.success) {
      const body: ErrorResponseBody = { error: "Invalid task input", code: "VALIDATION_ERROR", details: parsed.error.flatten() };
      return reply.status(400).send(body);
    }
    try {
      const result = await new DiscoveryAgent().analyze(parsed.data);
      return reply.send(result);
    } catch (err) {
      const body: ErrorResponseBody = {
        error: err instanceof Error ? err.message : String(err),
        code: "INTERNAL_ERROR",
      };
      return reply.status(500).send(body);
    }
  });
}
