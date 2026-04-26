import { promises as fs } from "node:fs";
import path from "node:path";
import type { ZodSchema } from "zod";

export class JsonConfigLoader {
  async load<T>(relativePath: string, schema?: ZodSchema<T>): Promise<T> {
    const fullPath = path.join(process.cwd(), relativePath);
    const raw = await fs.readFile(fullPath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (schema) {
      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new Error(`Config validation failed for ${relativePath}: ${result.error.message}`);
      }
      return result.data;
    }
    return parsed as T;
  }
}
