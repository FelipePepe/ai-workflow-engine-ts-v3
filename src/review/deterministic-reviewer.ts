import { ReviewPatternStore } from "./review-pattern-store.js";

export class DeterministicReviewer {
  private readonly store = new ReviewPatternStore();

  async reviewText(text: string): Promise<Array<{ patternId: string; severity: string; recommendation: string }>> {
    const patterns = await this.store.loadPatterns();
    const findings: Array<{ patternId: string; severity: string; recommendation: string }> = [];
    const lower = text.toLowerCase();

    for (const pattern of patterns) {
      if (pattern.matchHints.some((hint) => lower.includes(hint.toLowerCase()))) {
        findings.push({
          patternId: pattern.id,
          severity: pattern.severity,
          recommendation: pattern.recommendation
        });
      }
    }

    return findings;
  }
}
