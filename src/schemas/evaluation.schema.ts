export interface EvaluationResult {
  success: boolean;
  score: number;
  testsPassed: boolean;
  acceptanceCriteriaMet: boolean;
  securityGatePassed: boolean;
  qualityGatePassed: boolean;
  issues: string[];
  recommendations: string[];
}
