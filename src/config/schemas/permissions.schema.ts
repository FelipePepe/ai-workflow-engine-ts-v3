import { z } from "zod";

export const PermissionsConfigSchema = z.object({
  defaultMode: z.string(),
  allowWrite: z.boolean(),
  allowShell: z.boolean(),
  allowNetwork: z.boolean(),
  allowDelete: z.boolean(),
  protectedBranches: z.array(z.string()),
  requireHumanApprovalFor: z.array(z.string()),
}).passthrough();

export type PermissionsConfig = z.infer<typeof PermissionsConfigSchema>;
