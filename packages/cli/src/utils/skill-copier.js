import { mkdirSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import chalk from 'chalk';
import ora from 'ora';
import { runAsync } from './exec.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/**
 * Path to the bundled core skills shipped with the CLI package.
 */
export const BUNDLED_SKILLS_DIR = resolve(__dirname, '../../skills/core');

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
 * Add a Claude Code plugin marketplace and parse its declared name from stdout.
 * Returns the marketplace name (e.g. "superpowers-dev") or null if add failed.
 */
async function addPluginMarketplace(repo) {
  const result = await runAsync(`claude plugin marketplace add ${repo}`);
  const combined = `${result.stdout}\n${result.stderr}`;
  // "Successfully added marketplace: <name>" or "Marketplace <name> already exists"
  const m =
    combined.match(/Successfully added marketplace:\s*([\w.-]+)/i) ||
    combined.match(/[Mm]arketplace\s+["']?([\w.-]+)["']?\s+already/);
  if (m) return m[1];
  if (!result.ok) return null;
  return null;
}

// The Owl-Listener/designer-skills marketplace contains 8 separate plugins.
const UX_DESIGN_PLUGINS = [
  'design-research',
  'design-systems',
  'ux-strategy',
  'ui-design',
  'interaction-design',
  'prototyping-testing',
  'design-ops',
  'designer-toolkit',
];

/**
 * Install the UX Design Skills Pack via the Claude Code plugin marketplace.
 * Installs all 8 plugins from Owl-Listener/designer-skills.
 */
export async function installUXDesignSkills() {
  const spinner = ora(`Installing UX Design Skills Pack (${UX_DESIGN_PLUGINS.length} plugins)...`).start();

  const marketplaceName = await addPluginMarketplace('Owl-Listener/designer-skills');
  if (!marketplaceName) {
    spinner.fail('UX Design Skills Pack failed: could not add marketplace');
    return false;
  }

  const failures = [];
  let installed = 0;
  for (const plugin of UX_DESIGN_PLUGINS) {
    spinner.text = `Installing ${plugin} (${installed + failures.length + 1}/${UX_DESIGN_PLUGINS.length})...`;
    const result = await runAsync(`claude plugin install ${plugin}@${marketplaceName}`);
    if (result.ok) {
      installed++;
    } else {
      failures.push({ plugin, error: result.stderr || result.stdout });
    }
  }

  if (failures.length === 0) {
    spinner.succeed(`UX Design Skills Pack installed (${installed} plugins)`);
    return true;
  }

  if (installed > 0) {
    spinner.warn(`UX Design Skills Pack: ${installed}/${UX_DESIGN_PLUGINS.length} plugins installed, ${failures.length} failed`);
  } else {
    spinner.fail('UX Design Skills Pack failed: no plugins installed');
  }
  for (const f of failures) {
    console.log(chalk.dim(`    ${f.plugin}: ${(f.error || '').split('\n')[0]}`));
  }
  return failures.length === 0;
}

export { addPluginMarketplace };

/**
 * Install the Design System Pack by cloning the repo and copying skills
 * into the user-level Claude skills directory.
 */
export async function installDesignSystemPack() {
  const spinner = ora('Installing Design System Pack (21 skills)...').start();
  const tmpDir = join(homedir(), '.claude', '.tmp-ds-pack');
  const target = getUserSkillsDir();

  // Clean any prior temp dir
  await runAsync(`rm -rf "${tmpDir}"`);

  const clone = await runAsync(`git clone --depth 1 https://github.com/murphytrueman/design-system-ops.git "${tmpDir}"`);
  if (!clone.ok) {
    spinner.fail('Design System Pack failed to clone');
    if (clone.stderr) console.log(chalk.dim(`    ${clone.stderr.split('\n')[0]}`));
    return false;
  }

  try {
    mkdirSync(target, { recursive: true });
    const skillsSource = join(tmpDir, 'skills');
    if (!existsSync(skillsSource)) {
      spinner.fail('Design System Pack: skills directory not found in repo');
      await runAsync(`rm -rf "${tmpDir}"`);
      return false;
    }
    cpSync(skillsSource, target, { recursive: true });
    await runAsync(`rm -rf "${tmpDir}"`);
    spinner.succeed('Design System Pack installed');
    return true;
  } catch (err) {
    spinner.fail('Design System Pack failed to install');
    console.log(chalk.dim(`    ${err.message}`));
    await runAsync(`rm -rf "${tmpDir}"`);
    return false;
  }
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

/**
 * Path to the bundled slash commands shipped with the CLI package.
 */
export const BUNDLED_COMMANDS_DIR = resolve(__dirname, '../../commands');

/**
 * Copy slash commands to user-level ~/.claude/commands/ (globally available).
 */
export function installCommandsGlobal() {
  const source = BUNDLED_COMMANDS_DIR;
  const target = join(homedir(), '.claude', 'commands');

  if (!existsSync(source)) {
    return { ok: false, error: 'Commands source not found' };
  }

  mkdirSync(target, { recursive: true });
  try {
    cpSync(source, target, { recursive: true });
    const count = readdirSync(source).filter(f => f.endsWith('.md')).length;
    return { ok: true, count };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Copy slash commands to project-level .claude/commands/ (travels with repo).
 */
export function copyCommandsToProject(projectDir) {
  const source = BUNDLED_COMMANDS_DIR;
  const target = join(projectDir, '.claude', 'commands');

  if (!existsSync(source)) {
    return { ok: false, error: 'Commands source not found' };
  }

  mkdirSync(target, { recursive: true });
  try {
    cpSync(source, target, { recursive: true });
    const count = readdirSync(source).filter(f => f.endsWith('.md')).length;
    return { ok: true, count };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
