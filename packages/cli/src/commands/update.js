import chalk from 'chalk';

export async function updateCommand(opts) {
  console.log('');
  console.log(chalk.bold('  XD Toolkit — Update'));
  console.log('');
  console.log(chalk.yellow('  Not yet implemented.'));
  console.log(chalk.dim('  This command will refresh Core Toolkit skills'));
  console.log(chalk.dim('  without overwriting .brand/ or project customizations.'));
  console.log('');

  if (opts.json) {
    console.log(JSON.stringify({ ok: false, error: 'not implemented' }));
  }
}
