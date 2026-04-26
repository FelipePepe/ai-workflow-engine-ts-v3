import type { FastifyInstance } from "fastify";
import { IdeaInputSchema } from "../schemas/pipeline.schema.js";
import type { SelfImprovementEngine } from "../core/engine.js";

export async function pipelineRoutes(
  app: FastifyInstance,
  engine: SelfImprovementEngine
): Promise<void> {
  app.post("/pipeline/run", async (request, reply) => {
    const parsed = IdeaInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Invalid request body",
        details: parsed.error.flatten()
      });
    }

    const result = await engine.runPipeline(parsed.data);
    return reply.status(200).send(result);
  });
}
