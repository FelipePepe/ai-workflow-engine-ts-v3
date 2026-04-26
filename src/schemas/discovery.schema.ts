import type { ProjectSpec } from "./project-spec.schema.js";

export interface DiscoveryQuestion {
  id: string;
  question: string;
  reason: string;
  required: boolean;
  options?: string[];
}

export interface DiscoveryResult {
  confidence: number;
  projectSpec: ProjectSpec;
  missingQuestions: DiscoveryQuestion[];
  canProceed: boolean;
  assumptions: string[];
}
