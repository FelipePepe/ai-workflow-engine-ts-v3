import type { AgentContext } from "../agents/base-agent.js";
import type { EvaluationResult } from "../schemas/evaluation.schema.js";
import type { AgentResult } from "../schemas/result.schema.js";

interface QaResult { tests?: { unit?: string; bdd?: string; coverage?: number } }
interface SecurityResult { securityGate?: string }
interface ReviewerResult { review?: string }

export class Evaluator {
  evaluate(context: AgentContext, _agentResults: AgentResult[]): EvaluationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const qa = (context.qaResult ?? {}) as QaResult;
    const security = (context.securityResult ?? {}) as SecurityResult;
    const reviewer = (context.reviewerResult ?? {}) as ReviewerResult;

    const testsPassed = qa.tests?.unit === "passed";
    const securityGatePassed = security.securityGate === "passed";
    const reviewPassed = reviewer.review !== "failed";
    const coverage = qa.tests?.coverage ?? 0;

    if (coverage < 80) {
      issues.push("Cobertura inferior al umbral recomendado");
      recommendations.push("Activar TDD Agent y añadir tests");
    }

    if (!securityGatePassed) {
      issues.push("Security gate fallido");
      recommendations.push("Activar revisión de seguridad");
    }

    if (!reviewPassed) {
      issues.push("Review determinista fallido");
      recommendations.push("Corregir patrones críticos antes de continuar");
    }

    let score = 0;
    score += testsPassed ? 0.30 : 0;
    score += 0.25;
    score += reviewPassed ? 0.20 : 0;
    score += securityGatePassed ? 0.15 : 0;
    score += 0.10;

    const normalizedScore = Number(score.toFixed(2));

    return {
      success: normalizedScore >= 0.75 && issues.length === 0,
      score: normalizedScore,
      testsPassed,
      acceptanceCriteriaMet: true,
      securityGatePassed,
      qualityGatePassed: coverage >= 80 && reviewPassed,
      issues,
      recommendations
    };
  }
}
