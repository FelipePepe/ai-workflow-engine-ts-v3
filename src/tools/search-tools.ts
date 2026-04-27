import fg from "fast-glob";
import { promises as fs } from "node:fs";

export class SearchTools {
  async glob(patterns: string[], cwd?: string): Promise<string[]> {
    return fg(patterns, {
      dot: false,
      cwd: cwd ?? process.cwd(),
      ignore: ["node_modules/**", "dist/**", ".git/**", ".ai-workspaces/**"]
    });
  }

  async grep(pattern: string, files: string[], cwd?: string): Promise<Array<{ file: string; line: number; text: string }>> {
    const results: Array<{ file: string; line: number; text: string }> = [];
    const base = cwd ?? process.cwd();

    for (const file of files) {
      const absFile = file.startsWith("/") ? file : `${base}/${file}`;
      const content = await fs.readFile(absFile, "utf-8").catch(() => "");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(pattern.toLowerCase())) {
          results.push({ file, line: index + 1, text: line.trim() });
        }
      });
    }

    return results;
  }
}
