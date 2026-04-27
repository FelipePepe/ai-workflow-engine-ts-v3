import { describe, expect, it } from "vitest";
import { WebSocketManager } from "../src/websocket/websocket-manager.js";
import type { WsEvent } from "../src/websocket/websocket-manager.js";

function makeMockSocket() {
  const messages: string[] = [];
  return {
    send: (data: string) => messages.push(data),
    messages,
  };
}

describe("WebSocketManager — emit", () => {
  it("emits a run_start event to registered sockets", () => {
    const manager = new WebSocketManager();
    const socket = makeMockSocket();
    const runId = "test-run-1";

    manager.add(runId, socket as never);
    manager.emit(runId, { type: "run_start", runId, timestamp: "2026-01-01T00:00:00.000Z" });

    expect(socket.messages).toHaveLength(1);
    const parsed = JSON.parse(socket.messages[0]!) as WsEvent;
    expect(parsed.type).toBe("run_start");
    expect(parsed.runId).toBe(runId);
  });

  it("emits agent_complete with agentName and status", () => {
    const manager = new WebSocketManager();
    const socket = makeMockSocket();
    const runId = "test-run-2";

    manager.add(runId, socket as never);
    manager.emit(runId, { type: "agent_complete", runId, agentName: "developer", status: "completed", timestamp: "2026-01-01T00:00:01.000Z" });

    const parsed = JSON.parse(socket.messages[0]!) as Extract<WsEvent, { type: "agent_complete" }>;
    expect(parsed.type).toBe("agent_complete");
    expect(parsed.agentName).toBe("developer");
    expect(parsed.status).toBe("completed");
  });

  it("emits run_finish event", () => {
    const manager = new WebSocketManager();
    const socket = makeMockSocket();
    const runId = "test-run-3";

    manager.add(runId, socket as never);
    manager.emit(runId, { type: "run_finish", runId, timestamp: "2026-01-01T00:00:02.000Z" });

    const parsed = JSON.parse(socket.messages[0]!) as WsEvent;
    expect(parsed.type).toBe("run_finish");
  });

  it("emits error event with message", () => {
    const manager = new WebSocketManager();
    const socket = makeMockSocket();
    const runId = "test-run-4";

    manager.add(runId, socket as never);
    manager.emit(runId, { type: "error", runId, message: "something went wrong", timestamp: "2026-01-01T00:00:03.000Z" });

    const parsed = JSON.parse(socket.messages[0]!) as Extract<WsEvent, { type: "error" }>;
    expect(parsed.type).toBe("error");
    expect(parsed.message).toBe("something went wrong");
  });

  it("does not send to removed sockets", () => {
    const manager = new WebSocketManager();
    const socket = makeMockSocket();
    const runId = "test-run-5";

    manager.add(runId, socket as never);
    manager.remove(runId, socket as never);
    manager.emit(runId, { type: "run_start", runId, timestamp: "2026-01-01T00:00:00.000Z" });

    expect(socket.messages).toHaveLength(0);
  });

  it("emits events in order: run_start, agent_complete, run_finish", () => {
    const manager = new WebSocketManager();
    const socket = makeMockSocket();
    const runId = "test-run-6";

    manager.add(runId, socket as never);
    manager.emit(runId, { type: "run_start", runId, timestamp: "t1" });
    manager.emit(runId, { type: "agent_complete", runId, agentName: "developer", status: "completed", timestamp: "t2" });
    manager.emit(runId, { type: "run_finish", runId, timestamp: "t3" });

    expect(socket.messages).toHaveLength(3);
    expect((JSON.parse(socket.messages[0]!) as WsEvent).type).toBe("run_start");
    expect((JSON.parse(socket.messages[1]!) as WsEvent).type).toBe("agent_complete");
    expect((JSON.parse(socket.messages[2]!) as WsEvent).type).toBe("run_finish");
  });
});
