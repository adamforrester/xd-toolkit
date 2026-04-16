import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import chalk from 'chalk';
import { copySkillsToProject, BUNDLED_SKILLS_DIR } from '../utils/skill-copier.js';

const TOOL_DIRS = [
  '.claude/skills',
  '.cursor/skills',
  '.agents/skills',
  '.gemini/skills',
];

export async function updateCommand(opts) {
  const projectDir = process.cwd();
  const results = { updated: [], skipped: [], errors: [] };

  console.log('');
  console.log(chalk.bold('  XD Toolkit — Update Skills'));
  console.log('');

  // Check we're in a project
  const hasClaudeMd = existsSync(join(projectDir, 'CLAUDE.md'));
  const hasBrandrc = existsSync(join(projectDir, '.brandrc.yaml'));
  if (!hasClaudeMd && !hasBrandrc) {
    console.log(chalk.red('  Not inside an xd-toolkit project.'));
    console.log(chalk.dim(`  Run ${chalk.cyan('npx xd-toolkit init')} to create one, or cd into an existing project.`));
    console.log('');
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: 'not a project directory' }));
    }
    return;
  }

  // Check bundled skills exist
  if (!existsSync(BUNDLED_SKILLS_DIR)) {
    console.log(chalk.red('  Bundled skills not found. Reinstall xd-toolkit.'));
    console.log('');
    if (opts.json) {
      console.log(JSON.stringify({ ok: false, error: 'bundled skills missing' }));
    }
    return;
  }

  const bundledSkills = readdirSync(BUNDLED_SKILLS_DIR).filter(f =>
    !f.startsWith('.') && existsSync(join(BUNDLED_SKILLS_DIR, f, 'SKILL.md'))
  );

  console.log(chalk.dim(`  Source: ${bundledSkills.length} bundled skills`));
  console.log(chalk.dim('  Preserving: .brand/, .brandrc.yaml, CLAUDE.md customizations'));
  console.log('');

  // Count existing skills per directory for diff reporting
  const before = {};
  for (const dir of TOOL_DIRS) {
    const fullDir = join(projectDir, dir);
    if (existsSync(fullDir)) {
      before[dir] = new Set(readdirSync(fullDir).filter(f => !f.startsWith('.')));
    } else {
      before[dir] = new Set();
    }
  }

  // Copy skills
  const copyResults = copySkillsToProject(projectDir, BUNDLED_SKILLS_DIR);

  for (const r of copyResults) {
    if (r.ok) {
      const afterFiles = new Set(
        readdirSync(join(projectDir, r.dir)).filter(f => !f.startsWith('.'))
      );
      const added = [...afterFiles].filter(f => !before[r.dir].has(f));
      const existing = [...afterFiles].filter(f => before[r.dir].has(f));

      if (added.length > 0) {
        console.log(chalk.green(`  ✓ ${r.dir}/ — ${existing.length} updated, ${added.length} new`));
        results.updated.push({ dir: r.dir, updated: existing.length, added: added.length, newSkills: added });
      } else {
        console.log(chalk.green(`  ✓ ${r.dir}/ — ${existing.length} skills refreshed`));
        results.updated.push({ dir: r.dir, updated: existing.length, added: 0 });
      }
    } else {
      console.log(chalk.red(`  ✗ ${r.dir}/ — ${r.error}`));
      results.errors.push({ dir: r.dir, error: r.error });
    }
  }

  console.log('');
  console.log(chalk.bold('  Preserved (not modified):'));
  console.log(chalk.dim('    .brand/'));
  console.log(chalk.dim('    .brandrc.yaml'));
  console.log(chalk.dim('    CLAUDE.md'));
  console.log(chalk.dim('    .impeccable.md'));
  console.log('');

  if (results.errors.length === 0) {
    console.log(chalk.green.bold('  Update complete'));
  } else {
    console.log(chalk.yellow.bold(`  Update complete with ${results.errors.length} errors`));
  }
  console.log('');

  if (opts.json) {
    console.log(JSON.stringify({ ok: results.errors.length === 0, ...results }, null, 2));
  }
}
