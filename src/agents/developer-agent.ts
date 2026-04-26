import type { AgentContext, BaseAgent } from "./base-agent.js";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";
import { SearchTools } from "../tools/search-tools.js";
import { PermissionGuard } from "../security/permission-guard.js";

export class DeveloperAgent implements BaseAgent {
  public readonly name = "developer";
  private readonly search = new SearchTools();
  private readonly permissions = new PermissionGuard();

  async run(context: AgentContext): Promise<Record<string, unknown>> {
    const projectSpec = context.projectSpec as ProjectSpec;
    const candidateFiles = await this.search.glob(["src/**/*.ts", "tests/**/*.ts"]);
    const permission = await this.permissions.assertAllowed("write_file");

    return {
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
