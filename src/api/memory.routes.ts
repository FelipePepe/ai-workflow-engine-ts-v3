import type { FastifyInstance } from "fastify";
import { MemoryStore } from "../memory/memory-store.js";

export function registerMemoryRoutes(app: FastifyInstance): void {
  app.get("/memory", async (request) => {
    const query = request.query as { limit?: string };
    return new MemoryStore().latest(Number(query.limit ?? 20));
  });
}
