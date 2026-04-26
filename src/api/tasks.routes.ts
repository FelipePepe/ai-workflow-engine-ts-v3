import type { FastifyInstance } from "fastify";
import { SelfImprovementEngine } from "../core/engine.js";
import { TaskInputSchema } from "../schemas/task.schema.js";

export function registerTaskRoutes(app: FastifyInstance): void {
  app.post("/tasks/run", async (request, reply) => {
    const parsed = TaskInputSchema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: "Invalid task input", details: parsed.error.flatten() });
    return new SelfImprovementEngine().run(parsed.data);
  });
}
