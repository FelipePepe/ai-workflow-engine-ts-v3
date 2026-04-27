import type { SelfImprovementEngine } from '../core/engine.js';

declare module 'fastify' {
  interface FastifyInstance {
    engine: SelfImprovementEngine;
  }
}
