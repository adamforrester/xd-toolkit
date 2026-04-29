import chalk from 'chalk';
import inquirer from 'inquirer';
import { tryRun } from '../utils/exec.js';
import { validateFigmaToken, validateGitHubToken } from '../utils/token-validator.js';
import { installCoreMCPs, installOptionalMCP } from '../utils/mcp-installer.js';
import { installUXDesignSkills, installDesignSystemPack, installCommandsGlobal } from '../utils/skill-copier.js';

export async function setupCommand(opts) {
  const results = { mcps: [], skills: [], warnings: [] };

  console.log('');
  console.log(chalk.bold('  XD Toolkit — Practitioner Setup'));
  console.log(chalk.dim('  One-time setup for MCP servers, skill packs, and tokens'));
  console.log('');

  // ── Step 1: Check Node.js ──
  const nodeResult = tryRun('node -v');
  if (!nodeResult.ok) {
    console.log(chalk.red('✗ Node.js is not installed.'));
    console.log('  Install from https://nodejs.org (LTS version), restart Terminal, and try again.');
    process.exit(1);
  }

  const nodeVersion = parseInt(nodeResult.stdout.replace('v', '').split('.')[0], 10);
  if (nodeVersion < 18) {
    console.log(chalk.red(`✗ Node.js ${nodeResult.stdout} is too old. Version 18+ is required.`));
    console.log('  Update at https://nodejs.org (LTS version), restart Terminal, and try again.');
    process.exit(1);
  }
  console.log(chalk.green(`✓ Node.js ${nodeResult.stdout}`));

  // ── Check Claude Code ──
  const claudeResult = tryRun('claude --version');
  if (!claudeResult.ok) {
    console.log(chalk.red('✗ Claude Code is not installed.'));
    console.log('  Install: npm install -g @anthropic-ai/claude-code');
    console.log('  Docs: https://docs.anthropic.com/en/docs/claude-code');
    process.exit(1);
  }
  console.log(chalk.green(`✓ Claude Code ${claudeResult.stdout}`));

  // ── Check git (required for Design System Pack install) ──
  const gitResult = tryRun('git --version');
  if (!gitResult.ok) {
    console.log(chalk.yellow('⚠ git is not installed.'));
    console.log(chalk.dim('  Install: https://git-scm.com/downloads'));
    console.log(chalk.dim('  You can continue without git, but the Design System Pack option will fail to install.'));
  } else {
    console.log(chalk.green(`✓ ${gitResult.stdout}`));
  }
  console.log('');

  // ── Step 2: Package selection ──
  console.log(chalk.bold('  Which packages do you want to install?'));
  console.log('');

  const { packages } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'packages',
      message: 'Select packages',
      choices: [
        {
          name: `Core Toolkit ${chalk.dim('— 21 skills, Superpowers plugin, 7 MCP servers')}`,
          value: 'core',
          checked: true,
          disabled: 'always included',
        },
        {
          name: `UX Design Skills Pack ${chalk.dim('— 63 skills for research, strategy, design ops')}`,
          value: 'ux-design',
          checked: false,
        },
        {
          name: `Design System Pack ${chalk.dim('— 21 skills for DS governance, auditing, documentation')}`,
          value: 'ds-pack',
          checked: false,
        },
        {
          name: `Brand Factory ${chalk.dim('— generate .brand/ packages from client assets')}`,
          value: 'brand-factory',
          checked: false,
        },
      ],
    },
  ]);

  // Core is always included
  const selectedPackages = ['core', ...packages.filter(p => p !== 'core')];
  console.log('');

  // ── Step 3: Token collection ──
  console.log(chalk.bold('  Tokens'));
  console.log(chalk.dim('  These let Claude interact with Figma and GitHub on your behalf.'));
  console.log('');

  // Figma PAT
  console.log(`  ${chalk.cyan('Figma Personal Access Token')}`);
  console.log(chalk.dim('  Get one: figma.com → click your avatar → Settings → Personal access tokens'));
  console.log(chalk.dim('  Generate a new token, copy it, and paste it here.'));
  console.log('');

  const { figmaToken } = await inquirer.prompt([
    {
      type: 'password',
      name: 'figmaToken',
      message: 'Figma PAT:',
      mask: '*',
      validate: (input) => {
        const { valid, message } = validateFigmaToken(input);
        return valid || message;
      },
    },
  ]);

  // GitHub PAT
  console.log('');
  console.log(`  ${chalk.cyan('GitHub Personal Access Token')}`);
  console.log(chalk.dim('  Get one: github.com → Settings → Developer settings → Personal access tokens'));
  console.log(chalk.dim('  → Tokens (classic) → Generate new token'));
  console.log(chalk.dim('  Scopes needed: repo, read:org'));
  console.log('');

  const { githubToken } = await inquirer.prompt([
    {
      type: 'password',
      name: 'githubToken',
      message: 'GitHub PAT:',
      mask: '*',
      validate: (input) => {
        const { valid, message } = validateGitHubToken(input);
        return valid || message;
      },
    },
  ]);

  const tokens = { figma: figmaToken.trim(), github: githubToken.trim() };

  console.log('');

  // ── Step 4: Install MCP servers ──
  console.log(chalk.bold('  Installing MCP servers'));
  console.log(chalk.dim('  This installs 7 servers. Each one takes a few seconds.'));
  console.log('');

  const mcpResults = await installCoreMCPs(tokens);
  results.mcps.push(...mcpResults);

  // Storybook MCP — bundled with Design System Pack (only active when Storybook runs locally)
  if (selectedPackages.includes('ds-pack')) {
    console.log('');
    const storybookResult = await installOptionalMCP('storybook', tokens);
    results.mcps.push(storybookResult);
    console.log(chalk.dim('    Storybook MCP only connects when a Storybook instance is running on http://localhost:6006'));
  }

  console.log('');

  // ── Step 5: Install skill packs ──
  console.log(chalk.bold('  Installing skill packs'));
  console.log('');

  // Core skills are bundled — they'll be copied per-project during init.
  console.log(chalk.green('✓ Core Toolkit skills bundled (deployed per-project during init)'));
  results.skills.push({ name: 'core', ok: true });

  if (selectedPackages.includes('ux-design')) {
    const ok = await installUXDesignSkills();
    results.skills.push({ name: 'ux-design', ok });
  }

  if (selectedPackages.includes('ds-pack')) {
    const ok = await installDesignSystemPack();
    results.skills.push({ name: 'ds-pack', ok });
  }

  if (selectedPackages.includes('brand-factory')) {
    console.log(chalk.green('✓ Brand Factory skills bundled (available during brand analysis)'));
    results.skills.push({ name: 'brand-factory', ok: true });
  }

  // ── Step 5b: Install plugins ──
  console.log('');
  console.log(chalk.bold('  Installing plugins'));
  console.log('');

  const superpowersResult = tryRun('claude install github:obra/superpowers');
  if (superpowersResult.ok) {
    console.log(chalk.green('✓ Superpowers — structured development: brainstorming, TDD, debugging, code review'));
    results.skills.push({ name: 'superpowers', ok: true });
  } else {
    console.log(chalk.yellow('⚠ Superpowers plugin failed to install'));
    if (superpowersResult.stderr) console.log(chalk.dim(`    ${superpowersResult.stderr.split('\n')[0]}`));
    results.skills.push({ name: 'superpowers', ok: false, error: superpowersResult.stderr });
  }

  // ── Step 5c: Install slash commands globally ──
  console.log('');
  console.log(chalk.bold('  Installing slash commands'));
  console.log('');

  const cmdResult = installCommandsGlobal();
  if (cmdResult.ok) {
    console.log(chalk.green(`✓ ${cmdResult.count} slash commands installed to ~/.claude/commands/`));
    console.log(chalk.dim('    /new-project — set up a new client project with brand extraction'));
    console.log(chalk.dim('    /brand-check — check brand package completeness'));
  } else {
    console.log(chalk.yellow(`⚠ Slash commands not installed: ${cmdResult.error}`));
  }

  console.log('');

  // ── Step 6: Verify ──
  console.log(chalk.bold('  Verifying installation'));
  console.log('');

  const verifyResult = tryRun('claude mcp list');
  if (verifyResult.ok) {
    const lines = verifyResult.stdout.split('\n');
    const connected = lines.filter(l => l.includes('Connected')).length;
    const disconnected = lines.filter(l => l.includes('Disconnected'));

    console.log(chalk.green(`✓ ${connected} MCP servers connected`));

    if (disconnected.length > 0) {
      console.log(chalk.yellow(`⚠ ${disconnected.length} MCP servers disconnected:`));
      for (const line of disconnected) {
        console.log(chalk.yellow(`    ${line.trim()}`));
      }
      results.warnings.push(`${disconnected.length} MCP servers disconnected`);
    }
  } else {
    console.log(chalk.yellow('⚠ Could not verify MCP status (claude mcp list failed)'));
    results.warnings.push('MCP verification failed');
  }

  console.log('');

  // ── Step 7: Summary ──
  const mcpOk = results.mcps.filter(m => m.ok).length;
  const mcpFail = results.mcps.filter(m => !m.ok).length;
  const skillOk = results.skills.filter(s => s.ok).length;

  console.log(chalk.bold('  Setup complete'));
  console.log('');
  console.log(`  MCP servers: ${chalk.green(`${mcpOk} installed`)}${mcpFail > 0 ? chalk.red(` / ${mcpFail} failed`) : ''}`);
  console.log(`  Skill packs: ${chalk.green(`${skillOk} ready`)}`);

  if (results.warnings.length > 0) {
    console.log('');
    console.log(chalk.yellow('  Warnings:'));
    for (const w of results.warnings) {
      console.log(chalk.yellow(`    ⚠ ${w}`));
    }
  }

  console.log('');
  console.log(chalk.bold('  Where things live'));
  console.log(chalk.dim('  Skill packs:      ~/.claude/skills/'));
  console.log(chalk.dim('  Slash commands:   ~/.claude/commands/'));
  console.log(chalk.dim('  Plugins:          ~/.claude/plugins/'));
  console.log(chalk.dim('  MCP servers:      run "claude mcp list" to view, "claude mcp remove <name>" to remove'));
  console.log('');
  console.log(chalk.bold('  Next step:'));
  console.log(`  Open Claude Code and type: ${chalk.cyan('/new-project [client name]')}`);
  console.log(chalk.dim('  Or from the CLI: npx xd-toolkit init'));
  console.log('');

  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
  }
}
