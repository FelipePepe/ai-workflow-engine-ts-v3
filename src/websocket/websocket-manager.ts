import type { WebSocket } from "@fastify/websocket";

export type WsEvent =
  | { type: "run_start"; runId: string; timestamp: string }
  | { type: "agent_complete"; runId: string; agentName: string; status: string; timestamp: string }
  | { type: "run_finish"; runId: string; timestamp: string }
  | { type: "error"; runId: string; message: string; timestamp: string };

export class WebSocketManager {
  private readonly connections = new Map<string, Set<WebSocket>>();

  add(runId: string, socket: WebSocket): void {
    const set = this.connections.get(runId) ?? new Set<WebSocket>();
    set.add(socket);
    this.connections.set(runId, set);
  }

  remove(runId: string, socket: WebSocket): void {
    this.connections.get(runId)?.delete(socket);
  }

  sendEvent(runId: string, event: Record<string, unknown>): void {
    const clients = this.connections.get(runId) ?? new Set<WebSocket>();
    for (const client of clients) client.send(JSON.stringify(event));
  }

  emit(runId: string, event: WsEvent): void {
    const clients = this.connections.get(runId) ?? new Set<WebSocket>();
    for (const client of clients) client.send(JSON.stringify(event));
  }
}

export const websocketManager = new WebSocketManager();
