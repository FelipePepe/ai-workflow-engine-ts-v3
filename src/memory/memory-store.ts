import { promises as fs } from "node:fs";
import path from "node:path";

const MEMORY_FILE = path.join(process.cwd(), "data", "memory.json");

export class MemoryStore {
  private async ensureFile(): Promise<void> {
    await fs.mkdir(path.dirname(MEMORY_FILE), { recursive: true });
    try {
      await fs.access(MEMORY_FILE);
    } catch {
      await fs.writeFile(MEMORY_FILE, "[]", "utf-8");
    }
  }

  async loadAll(): Promise<Record<string, unknown>[]> {
    await this.ensureFile();
    return JSON.parse(await fs.readFile(MEMORY_FILE, "utf-8")) as Record<string, unknown>[];
  }

  async save(experience: Record<string, unknown>): Promise<void> {
    const data = await this.loadAll();
    data.push(experience);
    await fs.writeFile(MEMORY_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  async latest(limit = 20): Promise<Record<string, unknown>[]> {
    const data = await this.loadAll();
    return data.slice(-limit);
  }
}
