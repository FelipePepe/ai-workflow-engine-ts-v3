import type { FastifyInstance } from "fastify";
import { websocketManager } from "./websocket-manager.js";

export function registerWebSocketRoutes(app: FastifyInstance): void {
  app.get("/ws/runs/:runId", { websocket: true }, (socket, request) => {
    const params = request.params as { runId: string };
    websocketManager.add(params.runId, socket);

    socket.on("message", () => socket.send(JSON.stringify({ type: "pong", runId: params.runId })));
    socket.on("close", () => websocketManager.remove(params.runId, socket));
  });
}
