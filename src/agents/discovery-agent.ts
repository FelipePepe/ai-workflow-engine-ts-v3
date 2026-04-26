import { JsonConfigLoader } from "../config/json-config-loader.js";
import { settings } from "../config/settings.js";
import { ProfileStore } from "../profile/profile-store.js";
import type { DiscoveryQuestion, DiscoveryResult } from "../schemas/discovery.schema.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import { ProjectSpecSchema } from "../schemas/project-spec.schema.js";
import type { TaskInput } from "../schemas/task.schema.js";

export class DiscoveryAgent {
  public readonly name = "discovery";
  private readonly profileStore = new ProfileStore();
  private readonly configLoader = new JsonConfigLoader();

  async analyze(task: TaskInput): Promise<DiscoveryResult> {
    const profile = await this.profileStore.get();
    const projectConfig = await this.configLoader.load<Partial<ProjectSpec>>("config/project.json");

    const rawSpec: Partial<ProjectSpec> = {
      ...projectConfig,
      ...(profile.defaultProjectSpec ?? {}),
      ...(task.projectSpec ?? {})
    };

    this.applyAnswers(rawSpec, task.answers ?? {});
    this.inferFromText(rawSpec, `${task.title} ${task.description} ${task.constraints.join(" ")}`);

    const projectSpec = ProjectSpecSchema.parse(rawSpec);
    const missingQuestions = this.buildMissingQuestions(projectSpec, task.priority);

    const knownFields = Object.values(projectSpec).filter((value) => value !== "unknown" && value !== "");
    const confidence = Number(Math.min(1, knownFields.length / 10).toFixed(2));

    return {
      confidence,
      projectSpec,
      missingQuestions,
      canProceed: missingQuestions.filter((q) => q.required).length === 0 || confidence >= settings.discoveryMinConfidence,
      assumptions: this.buildAssumptions(projectSpec)
    };
  }

  private inferFromText(spec: Partial<ProjectSpec>, text: string): void {
    const lower = text.toLowerCase();

    if (!spec.language || spec.language === "unknown") {
      if (lower.includes("typescript") || lower.includes("node") || lower.includes("fastify")) spec.language = "typescript";
      else if (lower.includes("c#") || lower.includes(".net")) spec.language = "csharp";
      else if (lower.includes("java") || lower.includes("spring")) spec.language = "java";
      else if (lower.includes("python") || lower.includes("fastapi")) spec.language = "python";
    }

    if (!spec.framework || spec.framework === "unknown") {
      if (lower.includes("fastify")) spec.framework = "fastify";
      else if (lower.includes("express")) spec.framework = "express";
      else if (lower.includes("spring")) spec.framework = "spring-boot";
      else if (lower.includes(".net")) spec.framework = "aspnet";
      else if (lower.includes("fastapi")) spec.framework = "fastapi";
    }

    if (!spec.projectType || spec.projectType === "unknown") {
      if (lower.includes("api") || lower.includes("endpoint")) spec.projectType = "api";
      else if (lower.includes("web")) spec.projectType = "web";
      else if (lower.includes("cli")) spec.projectType = "cli";
    }

    if (lower.includes("auth") || lower.includes("login") || lower.includes("password") || lower.includes("token")) {
      spec.securityLevel = "high";
    }
  }

  private applyAnswers(spec: Partial<ProjectSpec>, answers: Record<string, string>): void {
    if (answers.projectType) spec.projectType = answers.projectType as ProjectSpec["projectType"];
    if (answers.language) spec.language = answers.language as ProjectSpec["language"];
    if (answers.framework) spec.framework = answers.framework;
    if (answers.architecture) spec.architecture = answers.architecture as ProjectSpec["architecture"];
    if (answers.database) spec.database = answers.database;
    if (answers.qualityLevel) spec.qualityLevel = answers.qualityLevel as ProjectSpec["qualityLevel"];
    if (answers.securityLevel) spec.securityLevel = answers.securityLevel as ProjectSpec["securityLevel"];
    if (answers.deploymentTarget) spec.deploymentTarget = answers.deploymentTarget;
  }

  private buildMissingQuestions(spec: ProjectSpec, priority: string): DiscoveryQuestion[] {
    const questions: DiscoveryQuestion[] = [];

    if (spec.projectType === "unknown") {
      questions.push({
        id: "projectType",
        question: "¿Qué tipo de proyecto es?",
        reason: "Permite seleccionar estructura, agentes y validaciones.",
        required: true,
        options: ["api", "web", "desktop", "cli", "library", "microservice"]
      });
    }

    if (spec.language === "unknown") {
      questions.push({
        id: "language",
        question: "¿Qué lenguaje se debe usar?",
        reason: "Condiciona stack, tests, quality gates y estructura.",
        required: true,
        options: ["typescript", "csharp", "java", "python"]
      });
    }

    if (spec.framework === "unknown") {
      questions.push({
        id: "framework",
        question: "¿Qué framework prefieres?",
        reason: "Permite generar código y estructura coherente.",
        required: priority === "critical"
      });
    }

    return questions;
  }

  private buildAssumptions(spec: ProjectSpec): string[] {
    const assumptions: string[] = [];
    if (spec.testingStrategy === "tdd-bdd") assumptions.push("Se usará TDD + BDD como estrategia por defecto.");
    if (spec.observability) assumptions.push("Se asume observabilidad básica activada.");
    return assumptions;
  }
}
