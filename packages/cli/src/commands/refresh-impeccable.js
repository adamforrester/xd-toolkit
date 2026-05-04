import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import chalk from 'chalk';
import { parse as yamlParse } from 'yaml';
import { generateImpeccableMd } from '../utils/impeccable-md-generator.js';

/**
 * Regenerate .impeccable.md at the project root from the project's .brand/.
 *
 * Same resolution rules as refresh-design: --brand-path > brandrc > ./.brand
 * Client name from .brandrc.yaml (`client`), fallback to directory name.
 */
export async function refreshImpeccableCommand(opts) {
  const projectDir = process.cwd();
  let client = projectDir.split('/').pop() || 'Brand';
  let brandDir = join(projectDir, '.brand');

  const brandrcPath = join(projectDir, '.brandrc.yaml');
  if (existsSync(brandrcPath)) {
    try {
      const cfg = yamlParse(readFileSync(brandrcPath, 'utf-8'));
      if (cfg?.client) client = cfg.client;
      if (cfg?.brand_path) brandDir = resolve(projectDir, cfg.brand_path);
    } catch (err) {
      console.log(chalk.yellow(`⚠ Could not parse .brandrc.yaml: ${err.message}`));
    }
  }

  if (opts.brandPath) {
    brandDir = resolve(projectDir, opts.brandPath);
  }

  if (!existsSync(brandDir)) {
    console.log(chalk.red(`✗ Brand directory not found: ${brandDir}`));
    console.log(chalk.dim('  Run `xd-toolkit init` first, or pass --brand-path.'));
    process.exit(1);
  }

  const content = generateImpeccableMd(brandDir, client);
  const outPath = join(projectDir, '.impeccable.md');
  writeFileSync(outPath, content, 'utf-8');

  console.log(chalk.green(`✓ .impeccable.md regenerated from ${brandDir}`));

  if (opts.json) {
    console.log(JSON.stringify({ ok: true, brand_dir: brandDir, output: outPath, client }, null, 2));
  }
}
