import { mkdirSync, cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import chalk from 'chalk';
import ora from 'ora';
import { runAsync } from './exec.js';

/**
 * Tool-specific skill directories within a project.
 */
const TOOL_DIRS = [
  '.claude/skills',
  '.cursor/skills',
  '.agents/skills',
  '.gemini/skills',
];

/**
 * Copy core skills to a project's tool-specific directories.
 * @param {string} projectDir - Absolute path to the project root
 * @param {string} skillsSourceDir - Absolute path to bundled skills
 */
export function copySkillsToProject(projectDir, skillsSourceDir) {
  if (!existsSync(skillsSourceDir)) {
    console.log(chalk.yellow(`  Skills source not found at ${skillsSourceDir} — skipping`));
    return [];
  }

  const results = [];
  for (const dir of TOOL_DIRS) {
    const target = join(projectDir, dir);
    mkdirSync(target, { recursive: true });
    try {
      cpSync(skillsSourceDir, target, { recursive: true });
      results.push({ dir, ok: true });
    } catch (err) {
      results.push({ dir, ok: false, error: err.message });
    }
  }
  return results;
}

/**
 * Install the UX Design Skills Pack via claude install.
 */
export async function installUXDesignSkills() {
  const spinner = ora('Installing UX Design Skills Pack (63 skills, 8 plugins)...').start();
  const { ok, stderr } = await runAsync('claude install github:Owl-Listener/designer-skills');
  if (ok) {
    spinner.succeed('UX Design Skills Pack installed');
  } else {
    spinner.fail('UX Design Skills Pack failed to install');
    if (stderr) console.log(chalk.dim(`    ${stderr.split('\n')[0]}`));
  }
  return ok;
}

/**
 * Copy Brand Factory skills to user-level skills directory.
 */
export function installBrandFactorySkills(skillsSourceDir) {
  const target = join(homedir(), '.claude', 'skills', 'brand-factory');
  mkdirSync(target, { recursive: true });
  if (existsSync(skillsSourceDir)) {
    cpSync(skillsSourceDir, target, { recursive: true });
    return true;
  }
  return false;
}

/**
 * Get the path to the user-level Claude skills directory.
 */
export function getUserSkillsDir() {
  return join(homedir(), '.claude', 'skills');
}
