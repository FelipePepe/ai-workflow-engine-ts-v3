import type { FastifyInstance } from "fastify";
import { MemoryStore } from "../memory/memory-store.js";

interface Experience { evaluation?: { score?: number; success?: boolean } }

export function registerMetricsRoutes(app: FastifyInstance): void {
  app.get("/metrics", async () => {
    const runs = await new MemoryStore().loadAll() as Experience[];

    if (runs.length === 0) return { totalRuns: 0, averageScore: 0, successRate: 0 };

    const scores = runs.map((run) => run.evaluation?.score ?? 0);
    const successes = runs.map((run) => run.evaluation?.success ?? false);

    return {
      totalRuns: runs.length,
      averageScore: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      successRate: Number((successes.filter(Boolean).length / successes.length).toFixed(2))
    };
  });
}
