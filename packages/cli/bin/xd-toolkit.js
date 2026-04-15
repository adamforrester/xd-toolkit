#!/usr/bin/env node

import { program } from 'commander';
import { setupCommand } from '../src/commands/setup.js';
import { initCommand } from '../src/commands/init.js';
import { doctorCommand } from '../src/commands/doctor.js';
import { updateCommand } from '../src/commands/update.js';
import { scoreCommand } from '../src/commands/score.js';

program
  .name('xd-toolkit')
  .description('XD Vibe Coding Toolkit — brand-consistent AI-assisted development')
  .version('0.1.0');

program
  .command('setup')
  .description('One-time practitioner setup: install MCPs, skill packs, and configure tokens')
  .option('--json', 'Output results as JSON')
  .action(setupCommand);

program
  .command('init')
  .description('Scaffold a new client project with brand routing and skills')
  .option('--client <name>', 'Client name')
  .option('--mode <mode>', 'Project mode: standard, pitch, or comprehensive', 'standard')
  .option('--brand-path <path>', 'Path to existing shared .brand/ directory')
  .option('--figma-only', 'Minimal scaffold for Figma design work only')
  .option('--json', 'Output results as JSON')
  .action(initCommand);

program
  .command('doctor')
  .description('Check global and project health')
  .option('--json', 'Output results as JSON')
  .action(doctorCommand);

program
  .command('update')
  .description('Update Core Toolkit skills without overwriting .brand/')
  .option('--json', 'Output results as JSON')
  .action(updateCommand);

program
  .command('score')
  .description('Report brand package completeness')
  .option('--json', 'Output results as JSON')
  .action(scoreCommand);

program.parse();
