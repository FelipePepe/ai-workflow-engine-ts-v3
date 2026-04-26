export interface AgentResult {
  agentName: string;
  status: "completed" | "failed";
  output: Record<string, unknown>;
  logs: string[];
}
