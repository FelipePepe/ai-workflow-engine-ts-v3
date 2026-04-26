import { promises as fs } from "node:fs";
import path from "node:path";
import { settings } from "../config/settings.js";

export class WorkspaceManager {
  /**
   * Creates a workspace dir for an agent under the engine's workspaceRoot.
   * If `existingPath` is provided (evolutive/incident), the existing dir is
   * reused as-is (no new dir created).
   */
  async createWorkspace(runId: string, agentName: string, existingPath?: string): Promise<string> {
    if (existingPath) {
      // Evolutive / incident: work inside the user's existing project
      return existingPath;
    }
    const workspace = path.join(process.cwd(), settings.workspaceRoot, runId, agentName);
    await fs.mkdir(workspace, { recursive: true });
    return workspace;
  }

  async createParallelWorkspaces(
    runId: string,
    agentNames: string[],
    existingPath?: string
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    for (const agent of agentNames) {
      result[agent] = await this.createWorkspace(runId, agent, existingPath);
    }

    return result;
  }
}
