import { promises as fs } from "node:fs";
import path from "node:path";

export class JsonConfigLoader {
  async load<T>(relativePath: string): Promise<T> {
    const fullPath = path.join(process.cwd(), relativePath);
    const raw = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(raw) as T;
  }
}
