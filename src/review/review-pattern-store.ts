import { JsonConfigLoader } from "../config/json-config-loader.js";

export interface ReviewPattern {
  id: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  matchHints: string[];
  recommendation: string;
}

export class ReviewPatternStore {
  private readonly loader = new JsonConfigLoader();

  async loadPatterns(): Promise<ReviewPattern[]> {
    const config = await this.loader.load<{ patterns: ReviewPattern[] }>("config/review-patterns.json");
    return config.patterns;
  }
}
