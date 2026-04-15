import chalk from 'chalk';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tryRun } from '../utils/exec.js';

const REQUIRED_BRAND_FILES = [
  'overview.md',
  'voice.md',
  'tokens/colors.md',
  'tokens/typography.md',
  'tokens/spacing.md',
];

export async function doctorCommand(opts) {
  const results = { global: [], project: [], ok: true };

  console.log('');
  console.log(chalk.bold('  XD Toolkit — Health Check'));
  console.log('');

  // ── Global checks ──
  console.log(chalk.bold('  Global'));
  console.log('');

  // Node.js
  const nodeResult = tryRun('node -v');
  const nodeVersion = nodeResult.ok ? parseInt(nodeResult.stdout.replace('v', '').split('.')[0], 10) : 0;
  if (nodeVersion >= 18) {
    console.log(chalk.green(`  ✓ Node.js ${nodeResult.stdout}`));
    results.global.push({ check: 'nodejs', ok: true, version: nodeResult.stdout });
  } else {
    console.log(chalk.red(`  ✗ Node.js ${nodeResult.ok ? nodeResult.stdout + ' (need 18+)' : 'not installed'}`));
    console.log(chalk.dim('    Install from https://nodejs.org'));
    results.global.push({ check: 'nodejs', ok: false });
    results.ok = false;
  }

  // Claude Code
  const claudeResult = tryRun('claude --version');
  if (claudeResult.ok) {
    console.log(chalk.green(`  ✓ Claude Code ${claudeResult.stdout}`));
    results.global.push({ check: 'claude-code', ok: true, version: claudeResult.stdout });
  } else {
    console.log(chalk.red('  ✗ Claude Code not installed'));
    console.log(chalk.dim('    Install: npm install -g @anthropic-ai/claude-code'));
    results.global.push({ check: 'claude-code', ok: false });
    results.ok = false;
  }

  // MCP servers
  const mcpResult = tryRun('claude mcp list');
  if (mcpResult.ok) {
    const lines = mcpResult.stdout.split('\n');
    const connected = lines.filter(l => l.includes('Connected'));
    const disconnected = lines.filter(l => l.includes('Disconnected'));
    console.log(chalk.green(`  ✓ ${connected.length} MCP servers connected`));
    results.global.push({ check: 'mcps', ok: disconnected.length === 0, connected: connected.length, disconnected: disconnected.length });

    if (disconnected.length > 0) {
      console.log(chalk.yellow(`  ⚠ ${disconnected.length} disconnected:`));
      for (const line of disconnected) {
        console.log(chalk.yellow(`      ${line.trim()}`));
      }
      results.ok = false;
    }
  } else {
    console.log(chalk.yellow('  ⚠ Could not check MCP status'));
    results.global.push({ check: 'mcps', ok: false });
  }

  console.log('');

  // ── Project checks ──
  const projectDir = process.cwd();
  const hasBrandrc = existsSync(join(projectDir, '.brandrc.yaml'));
  const hasClaudeMd = existsSync(join(projectDir, 'CLAUDE.md'));
  const hasBrand = existsSync(join(projectDir, '.brand'));

  if (!hasBrandrc && !hasClaudeMd && !hasBrand) {
    console.log(chalk.dim('  No project detected in current directory.'));
    console.log(chalk.dim(`  Run ${chalk.cyan('npx xd-toolkit init')} to create one.`));
  } else {
    console.log(chalk.bold('  Project'));
    console.log('');

    // CLAUDE.md
    if (hasClaudeMd) {
      console.log(chalk.green('  ✓ CLAUDE.md exists'));
      results.project.push({ check: 'claude-md', ok: true });
    } else {
      console.log(chalk.red('  ✗ CLAUDE.md missing'));
      results.project.push({ check: 'claude-md', ok: false });
      results.ok = false;
    }

    // .brandrc.yaml
    if (hasBrandrc) {
      console.log(chalk.green('  ✓ .brandrc.yaml exists'));
      results.project.push({ check: 'brandrc', ok: true });
    } else {
      console.log(chalk.yellow('  ⚠ .brandrc.yaml missing'));
      results.project.push({ check: 'brandrc', ok: false });
    }

    // .brand/ directory
    if (hasBrand) {
      console.log(chalk.green('  ✓ .brand/ directory exists'));

      // Check minimum-tier files
      const missing = [];
      for (const file of REQUIRED_BRAND_FILES) {
        if (!existsSync(join(projectDir, '.brand', file))) {
          missing.push(file);
        }
      }

      if (missing.length === 0) {
        console.log(chalk.green('  ✓ All minimum-tier files present'));
        results.project.push({ check: 'brand-files', ok: true });
      } else {
        console.log(chalk.yellow(`  ⚠ Missing ${missing.length} minimum-tier files:`));
        for (const f of missing) {
          console.log(chalk.yellow(`      .brand/${f}`));
        }
        results.project.push({ check: 'brand-files', ok: false, missing });
      }
    } else {
      console.log(chalk.red('  ✗ .brand/ directory missing'));
      results.project.push({ check: 'brand-dir', ok: false });
      results.ok = false;
    }

    // Skills directories
    const skillDirs = ['.claude/skills', '.cursor/skills', '.agents/skills'];
    for (const dir of skillDirs) {
      const exists = existsSync(join(projectDir, dir));
      if (exists) {
        console.log(chalk.green(`  ✓ ${dir}/`));
      } else {
        console.log(chalk.yellow(`  ⚠ ${dir}/ missing`));
      }
      results.project.push({ check: dir, ok: exists });
    }
  }

  console.log('');

  const warnings = results.project.filter(p => !p.ok).length + results.global.filter(g => !g.ok).length;
  if (results.ok && warnings === 0) {
    console.log(chalk.green.bold('  All checks passed'));
  } else if (results.ok) {
    console.log(chalk.green.bold('  Core checks passed') + chalk.yellow(` (${warnings} warnings)`));
  } else {
    console.log(chalk.yellow.bold('  Some checks need attention'));
  }
  console.log('');

  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
  }
}
