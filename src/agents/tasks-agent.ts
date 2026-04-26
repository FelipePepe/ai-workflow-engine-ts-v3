import type { LlmClient } from "../llm/llm-client.js";
import type { PipelineContext, TaskChecklist } from "../schemas/pipeline.schema.js";

export class TasksAgent {
  public readonly name = "tasks";

  constructor(private readonly llmClient: LlmClient | null = null) {}

  async run(context: PipelineContext): Promise<TaskChecklist[]> {
    const template: TaskChecklist[] = [
      {
        id: "T-01",
        title: `Implement: ${context.idea.title}`,
        description: context.idea.description,
        files: [],
        priority: "high",
        dependencies: []
      }
    ];

    if (!this.llmClient) return template;

    try {
      const prompt = JSON.stringify({
        role: "task planner",
        idea: context.idea.title,
        description: context.idea.description,
        spec: context.spec,
        design: context.design,
        instruction:
          'Respond ONLY with valid JSON: Array<{ "id": string, "title": string, "description": string, "files": string[], "priority": "high"|"medium"|"low", "dependencies": string[] }>. Break down into atomic, testable tasks.'
      });
      const raw = await this.llmClient.complete(prompt);
      const parsed = JSON.parse(raw) as TaskChecklist[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return template;
    } catch {
      return template;
    }
  }
}
