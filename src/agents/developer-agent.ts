import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import type { TaskInput } from "../schemas/task.schema.js";
import type { SddSpec } from "../schemas/spec.schema.js";
import type { LlmClient } from "../llm/llm-client.js";
import { SearchTools } from "../tools/search-tools.js";
import { PermissionGuard } from "../security/permission-guard.js";

export class DeveloperAgent implements BaseAgent {
  public readonly name = "developer";
  private readonly search = new SearchTools();
  private readonly permissions = new PermissionGuard();

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const projectSpec = context.projectSpec as ProjectSpec;
    const workspacePath = context.workspacePath as string | undefined;
    const candidateFiles = await this.search.glob(["src/**/*.ts", "tests/**/*.ts"], workspacePath);
    const permission = await this.permissions.assertAllowed("write_file");

    const mock = {
      summary: `Plan de implementación simulado para ${projectSpec.language}/${projectSpec.framework}.`,
      searchedFiles: candidateFiles.slice(0, 20),
      filesChanged: permission.allowed ? this.suggestFiles(projectSpec) : [],
      proposedFilesChanged: this.suggestFiles(projectSpec),
      permission,
      codeNotes: [
        "Plan Mode prioriza inspección antes de modificar",
        "Se aplicaría Boy Scout Rule sin ampliar scope",
        "Se mantiene sandbox si no hay aprobación"
      ],
      dryRun: context.dryRun
    };

    if (!this.llmClient) {
      return { ...mock, llm: "not configured, using mock output" };
    }

    try {
      const raw = await this.llmClient.complete(this.buildPrompt(context, projectSpec));
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return { ...mock, ...parsed, searchedFiles: candidateFiles.slice(0, 20), permission, dryRun: context.dryRun, llm: "ok" };
    } catch {
      return { ...mock, llm: "error, using mock output" };
    }
  }

  private buildPrompt(context: AgentContext, projectSpec: ProjectSpec): string {
    const task = context.task as TaskInput;
    const spec = context.spec as SddSpec | undefined;
    return JSON.stringify({
      role: "senior developer",
      language: projectSpec.language,
      framework: projectSpec.framework,
      architecture: projectSpec.architecture,
      task: { title: task.title, description: task.description, constraints: task.constraints },
      spec: spec ? { feature: spec.feature, functionalRequirements: spec.functionalRequirements, securityRequirements: spec.securityRequirements } : null,
      instruction: "Respond ONLY with valid JSON: { \"summary\": string, \"filesChanged\": string[], \"codeNotes\": string[], \"risks\": string[] }"
    });
  }

  private suggestFiles(projectSpec: ProjectSpec): string[] {
    if (projectSpec.language === "typescript") {
      return ["src/features/example/example.service.ts", "tests/example.service.test.ts"];
    }
    if (projectSpec.language === "csharp") {
      return ["src/Application/ExampleService.cs", "tests/ExampleServiceTests.cs"];
    }
    if (projectSpec.language === "java") {
      return ["src/main/java/app/ExampleService.java", "src/test/java/app/ExampleServiceTest.java"];
    }
    return ["src/example_service.py", "tests/test_example_service.py"];
  }
}
