#!/usr/bin/env tsx
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';

// ─── readline helpers ────────────────────────────────────────────────────────

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function fetchOllamaModels(baseUrl: string): Promise<string[]> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json() as { models?: Array<{ name: string }> };
    return (data.models ?? []).map((m) => m.name);
  } catch {
    return [];
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const configPath = path.resolve(process.cwd(), 'config', 'llm.json');

  console.log('\n🤖  AI Workflow Engine — LLM Configuration\n');

  // Show current config if exists
  try {
    const current = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    console.log(`Current config: provider=${current.provider as string}\n`);
  } catch { /* first run */ }

  console.log('Select provider:');
  console.log('  1. Ollama (local)');
  console.log('  2. GitHub Copilot\n');

  const providerChoice = await ask(rl, '> ');
  const isOllama = providerChoice.trim() === '1';

  let config: Record<string, unknown>;

  if (isOllama) {
    const baseUrl = (await ask(rl, `\nOllama base URL [http://localhost:11434]: `)).trim() || 'http://localhost:11434';

    process.stdout.write('Fetching available models...');
    const models = await fetchOllamaModels(baseUrl);

    let model: string;
    if (models.length > 0) {
      console.log(' ✓');
      console.log('\nSelect model:');
      models.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
      console.log(`  ${models.length + 1}. (enter manually)\n`);
      const modelChoice = (await ask(rl, '> ')).trim();
      const idx = parseInt(modelChoice, 10) - 1;
      if (idx >= 0 && idx < models.length) {
        model = models[idx]!;
      } else {
        model = (await ask(rl, '\nModel name: ')).trim();
      }
    } else {
      console.log(' (unreachable — manual entry)');
      model = (await ask(rl, '\nModel name: ')).trim();
    }

    config = { provider: 'ollama', ollama: { baseUrl, model } };

  } else {
    const COPILOT_MODELS = ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini', 'claude-3.5-sonnet', 'claude-3.7-sonnet', 'gemini-1.5-pro'];

    console.log('\nSelect model:');
    COPILOT_MODELS.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    const modelChoice = (await ask(rl, '\n> ')).trim();
    const idx = parseInt(modelChoice, 10) - 1;
    const model = COPILOT_MODELS[idx] ?? COPILOT_MODELS[0]!;

    const token = (await ask(rl, '\nGitHub PAT (ghp_... / gho_... / github_pat_...): ')).trim();

    if (!token.startsWith('ghp_') && !token.startsWith('gho_') && !token.startsWith('github_pat_')) {
      console.warn('\n⚠️  Token format looks unexpected — saved anyway.');
    }

    config = { provider: 'github-copilot', githubCopilot: { model, token } };
  }

  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  console.log(`\n✓ Saved config to config/llm.json\n`);
  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
