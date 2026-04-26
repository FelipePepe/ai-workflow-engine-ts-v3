import type { EvaluationResult } from "../schemas/evaluation.schema.js";
import type { DiscoveryResult } from "../schemas/discovery.schema.js";

export class Improver {
  suggestImprovements(evaluation: EvaluationResult, discovery: DiscoveryResult): string[] {
    const improvements: string[] = [];

    if (!discovery.canProceed) improvements.push("Solicitar respuestas faltantes antes de ejecutar cambios reales.");
    if (!evaluation.testsPassed) improvements.push("Reforzar generación de tests TDD.");
    if (!evaluation.securityGatePassed) improvements.push("Añadir Security Agent antes de Developer Agent.");
    if (!evaluation.qualityGatePassed) improvements.push("Añadir regla determinista o quality gate más estricto.");
    if (evaluation.score < 0.75) improvements.push("Revisar plan mode y endurecer contratos SDD.");

    return improvements;
  }
}
