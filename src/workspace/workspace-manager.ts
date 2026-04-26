import { promises as fs } from "node:fs";
import path from "node:path";
import { settings } from "../config/settings.js";

export class WorkspaceManager {
  async createWorkspace(runId: string, agentName: string): Promise<string> {
    const workspace = path.join(process.cwd(), settings.workspaceRoot, runId, agentName);
    await fs.mkdir(workspace, { recursive: true });
    return workspace;
  }

  async createParallelWorkspaces(runId: string, agentNames: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    for (const agent of agentNames) {
      result[agent] = await this.createWorkspace(runId, agent);
    }

    return result;
  }
}
