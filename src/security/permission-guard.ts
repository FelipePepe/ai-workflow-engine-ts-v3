import { JsonConfigLoader } from "../config/json-config-loader.js";
import { PermissionsConfigSchema } from "../config/schemas/permissions.schema.js";

export interface PermissionPolicy {
  defaultMode: string;
  allowWrite: boolean;
  allowShell: boolean;
  allowNetwork: boolean;
  allowDelete: boolean;
  protectedBranches: string[];
  requireHumanApprovalFor: string[];
}

export class PermissionGuard {
  private readonly loader = new JsonConfigLoader();

  async loadPolicy(): Promise<PermissionPolicy> {
    return this.loader.load("config/permissions.json", PermissionsConfigSchema);
  }

  async assertAllowed(action: string): Promise<{ allowed: boolean; reason: string }> {
    const policy = await this.loadPolicy();

    if (policy.requireHumanApprovalFor.includes(action)) {
      return { allowed: false, reason: `Action ${action} requires human approval.` };
    }

    if (action === "write_file" && !policy.allowWrite) {
      return { allowed: false, reason: "Write access disabled by sandbox policy." };
    }

    if (action === "run_shell" && !policy.allowShell) {
      return { allowed: false, reason: "Shell access disabled by sandbox policy." };
    }

    if (action === "delete_file" && !policy.allowDelete) {
      return { allowed: false, reason: "Delete disabled by sandbox policy." };
    }

    return { allowed: true, reason: "Allowed." };
  }
}
