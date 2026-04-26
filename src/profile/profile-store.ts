import { promises as fs } from "node:fs";
import path from "node:path";
import type { ProjectSpec } from "../schemas/project-spec.schema.js";

const PROFILE_FILE = path.join(process.cwd(), "data", "profile", "default-profile.json");

export interface UserProjectProfile {
  defaultProjectSpec?: Partial<ProjectSpec>;
  preferences: Record<string, string>;
  updatedAt: string;
}

export class ProfileStore {
  private async ensureFile(): Promise<void> {
    await fs.mkdir(path.dirname(PROFILE_FILE), { recursive: true });
    try {
      await fs.access(PROFILE_FILE);
    } catch {
      await fs.writeFile(PROFILE_FILE, JSON.stringify({
        preferences: {},
        updatedAt: new Date().toISOString()
      }, null, 2), "utf-8");
    }
  }

  async get(): Promise<UserProjectProfile> {
    await this.ensureFile();
    return JSON.parse(await fs.readFile(PROFILE_FILE, "utf-8")) as UserProjectProfile;
  }

  async update(patch: Partial<UserProjectProfile>): Promise<UserProjectProfile> {
    const current = await this.get();
    const updated: UserProjectProfile = {
      ...current,
      ...patch,
      preferences: { ...current.preferences, ...(patch.preferences ?? {}) },
      defaultProjectSpec: { ...(current.defaultProjectSpec ?? {}), ...(patch.defaultProjectSpec ?? {}) },
      updatedAt: new Date().toISOString()
    };
    await fs.writeFile(PROFILE_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  }
}
