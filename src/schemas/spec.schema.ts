export interface SddSpec {
  feature: string;
  objective: string;
  projectContext: Record<string, unknown>;
  functionalRequirements: string[];
  acceptanceCriteria: string[];
  bddScenarios: string[];
  technicalConstraints: string[];
  securityRequirements: string[];
  qualityRequirements: string[];
}
