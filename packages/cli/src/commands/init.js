import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { stringify as yamlStringify } from 'yaml';
import { renderTemplate } from '../utils/template-renderer.js';
import { copySkillsToProject } from '../utils/skill-copier.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const TEMPLATES_DIR = resolve(__dirname, '../../src/templates');
const SKILLS_DIR = resolve(__dirname, '../../skills');

// .brand/ files to scaffold per tier
const BRAND_FILES = {
  minimum: [
    'overview.md',
    'voice.md',
    'tokens/colors.md',
    'tokens/typography.md',
    'tokens/spacing.md',
    'tokens/motion.md',
    'tokens/surfaces.md',
  ],
  standard: [
    'components/.gitkeep',
    'composition/page-types.md',
    'composition/patterns.md',
    'composition/anti-patterns.md',
    'CHANGELOG.md',
  ],
  comprehensive: [
    'workflows/figma-to-code.md',
    'workflows/code-standards.md',
    'workflows/deploy.md',
    'workflows/qa-checklist.md',
    'specs/.gitkeep',
  ],
};

const TIER_FOR_MODE = {
  pitch: 'minimum',
  standard: 'standard',
  comprehensive: 'comprehensive',
};

const PITCH_DISCLAIMER =
  '> ⚠️ **PITCH MODE** — derived from public sources only. Not validated against internal brand standards.\n\n';

export async function initCommand(opts) {
  const results = { created: [], tier: '', mode: '', client: '' };

  console.log('');
  console.log(chalk.bold('  XD Toolkit — Project Setup'));
  console.log('');

  // ── Gather inputs (interactive or from flags) ──
  const answers = {};

  // Client name
  if (opts.client) {
    answers.client = opts.client;
  } else {
    const { client } = await inquirer.prompt([
      { type: 'input', name: 'client', message: 'Client name:', validate: v => v.trim().length > 0 || 'Required' },
    ]);
    answers.client = client.trim();
  }

  // Mode
  if (opts.mode && ['standard', 'pitch', 'comprehensive'].includes(opts.mode)) {
    answers.mode = opts.mode;
  } else if (!opts.mode || opts.mode === 'standard') {
    const { mode } = await inquirer.prompt([
      {
        type: 'list',
        name: 'mode',
        message: 'Project mode:',
        choices: [
          { name: `standard   ${chalk.dim('— You have brand assets: style guide, Figma, live site')}`, value: 'standard' },
          { name: `pitch      ${chalk.dim('— Public sources only: website, social media, no internal access')}`, value: 'pitch' },
          { name: `comprehensive ${chalk.dim('— Full access plus institutional knowledge capture')}`, value: 'comprehensive' },
        ],
        default: 'standard',
      },
    ]);
    answers.mode = mode;
  } else {
    answers.mode = opts.mode;
  }

  // Figma-only
  answers.figmaOnly = opts.figmaOnly || false;
  if (!opts.figmaOnly) {
    const { projectType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'Project type:',
        choices: [
          { name: `Coded prototype ${chalk.dim('— full scaffold with code workflows')}`, value: 'code' },
          { name: `Figma design only ${chalk.dim('— brand context for Figma work, no code')}`, value: 'figma' },
        ],
        default: 'code',
      },
    ]);
    answers.figmaOnly = projectType === 'figma';
  }

  // Source URLs
  const { websiteUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'websiteUrl',
      message: 'Live website URL (for brand extraction):',
      default: '',
    },
  ]);
  answers.websiteUrl = websiteUrl.trim();

  if (answers.mode !== 'pitch') {
    const { figmaUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'figmaUrl',
        message: `Figma file URL ${chalk.dim('(optional, press Enter to skip)')}:`,
        default: '',
      },
    ]);
    answers.figmaUrl = figmaUrl.trim();
  }

  const { socialProfiles } = await inquirer.prompt([
    {
      type: 'input',
      name: 'socialProfiles',
      message: `Social profiles ${chalk.dim('(comma-separated URLs, optional)')}:`,
      default: '',
    },
  ]);
  answers.socialProfiles = socialProfiles.trim();

  // Brand path (shared brand packages)
  if (!opts.brandPath) {
    const { brandLocation } = await inquirer.prompt([
      {
        type: 'list',
        name: 'brandLocation',
        message: 'Brand package location:',
        choices: [
          { name: `Create new .brand/ here ${chalk.dim('— first project for this client')}`, value: 'new' },
          { name: `Use existing .brand/ ${chalk.dim('— shared across projects')}`, value: 'existing' },
        ],
        default: 'new',
      },
    ]);

    if (brandLocation === 'existing') {
      const { brandPath } = await inquirer.prompt([
        {
          type: 'input',
          name: 'brandPath',
          message: 'Path to existing .brand/ directory:',
          validate: (v) => {
            const p = resolve(process.cwd(), v.trim());
            return existsSync(p) || `Directory not found: ${p}`;
          },
        },
      ]);
      answers.brandPath = brandPath.trim();
    }
  } else {
    answers.brandPath = opts.brandPath;
  }

  console.log('');

  // ── Scaffold the project ──
  const projectDir = process.cwd();
  const tier = TIER_FOR_MODE[answers.mode];
  results.tier = tier;
  results.mode = answers.mode;
  results.client = answers.client;

  console.log(chalk.bold(`  Scaffolding ${answers.client} (${answers.mode} mode)`));
  console.log('');

  // 1. .brand/ directory
  if (!answers.brandPath) {
    const brandDir = join(projectDir, '.brand');
    scaffoldBrandDirectory(brandDir, tier, answers.mode === 'pitch');
    results.created.push('.brand/');
    console.log(chalk.green(`✓ .brand/ directory (${tier} tier)`));
  } else {
    const relPath = relative(projectDir, resolve(projectDir, answers.brandPath));
    console.log(chalk.green(`✓ Using existing brand package at ${relPath}`));
  }

  // 2. Skills directories (unless figma-only)
  if (!answers.figmaOnly) {
    if (existsSync(SKILLS_DIR)) {
      const skillResults = copySkillsToProject(projectDir, SKILLS_DIR);
      for (const r of skillResults) {
        if (r.ok) {
          console.log(chalk.green(`✓ ${r.dir}/`));
          results.created.push(r.dir + '/');
        } else {
          console.log(chalk.yellow(`⚠ ${r.dir}/ — ${r.error}`));
        }
      }
    } else {
      // Skills not bundled yet — create empty directories
      for (const dir of ['.claude/skills', '.cursor/skills', '.agents/skills', '.gemini/skills']) {
        mkdirSync(join(projectDir, dir), { recursive: true });
        console.log(chalk.green(`✓ ${dir}/ (empty — run xd-toolkit update to populate)`));
        results.created.push(dir + '/');
      }
    }
  }

  // 3. Instruction files
  const brandPrefix = answers.brandPath
    ? relative(projectDir, resolve(projectDir, answers.brandPath)).replace(/\\/g, '/')
    : '.brand';

  const templateVars = {
    client: answers.client,
    project: '',
    deploy_platform: 'Netlify',
  };

  const instructionFiles = [
    { template: 'CLAUDE.md.tmpl', output: 'CLAUDE.md' },
    { template: 'AGENTS.md.tmpl', output: 'AGENTS.md' },
    { template: 'cursorrules.tmpl', output: '.cursorrules' },
    { template: 'copilot-instructions.md.tmpl', output: '.github/copilot-instructions.md' },
  ];

  for (const { template, output } of instructionFiles) {
    const templatePath = join(TEMPLATES_DIR, template);
    const outputPath = join(projectDir, output);

    if (existsSync(templatePath)) {
      const content = readFileSync(templatePath, 'utf-8');
      let rendered = renderTemplate(content, templateVars);

      // If using shared brand path, rewrite .brand/ references
      if (answers.brandPath && brandPrefix !== '.brand') {
        rendered = rendered.replaceAll('.brand/', `${brandPrefix}/`);
      }

      mkdirSync(join(projectDir, output.includes('/') ? output.substring(0, output.lastIndexOf('/')) : ''), { recursive: true });
      writeFileSync(outputPath, rendered, 'utf-8');
      console.log(chalk.green(`✓ ${output}`));
      results.created.push(output);
    } else {
      // Templates not bundled — write a minimal version
      const minimal = `# ${answers.client}\n\nRead \`${brandPrefix}/overview.md\` for brand context.\n`;
      mkdirSync(join(projectDir, output.includes('/') ? output.substring(0, output.lastIndexOf('/')) : ''), { recursive: true });
      writeFileSync(outputPath, minimal, 'utf-8');
      console.log(chalk.green(`✓ ${output} (minimal — templates not bundled)`));
      results.created.push(output);
    }
  }

  // 4. .impeccable.md
  writeFileSync(
    join(projectDir, '.impeccable.md'),
    `# Brand Context for ${answers.client}\n\n<!-- Populated by /brand-analyze or manually -->\n`,
    'utf-8'
  );
  console.log(chalk.green('✓ .impeccable.md'));
  results.created.push('.impeccable.md');

  // 5. .brandrc.yaml
  const brandrc = buildBrandrc(answers);
  writeFileSync(join(projectDir, '.brandrc.yaml'), yamlStringify(brandrc), 'utf-8');
  console.log(chalk.green('✓ .brandrc.yaml'));
  results.created.push('.brandrc.yaml');

  console.log('');

  // ── Next steps ──
  console.log(chalk.bold('  Next steps'));
  console.log('');

  if (answers.mode === 'pitch') {
    console.log(`  1. Tell Claude Code: ${chalk.cyan('"Extract brand from ' + (answers.websiteUrl || 'the website') + '"')}`);
    console.log('  2. Review the generated .brand/ files');
    console.log('  3. Start designing or building');
  } else {
    console.log('  1. Upload brand guide PDF to this directory (if you have one)');
    console.log(`  2. Tell Claude Code: ${chalk.cyan('"Extract brand from the assets in .brandrc.yaml"')}`);
    console.log('  3. Review and enrich the generated .brand/ files');
    console.log('  4. Start designing or building');
  }

  if (answers.brandPath) {
    console.log('');
    console.log(chalk.dim(`  Brand package: ${brandPrefix}/ (shared)`));
  }

  console.log('');

  if (opts.json) {
    console.log(JSON.stringify(results, null, 2));
  }
}

/**
 * Create the .brand/ directory structure with empty placeholder files.
 */
function scaffoldBrandDirectory(brandDir, tier, isPitch) {
  // Minimum tier files are always created
  const filesToCreate = [...BRAND_FILES.minimum];

  if (tier === 'standard' || tier === 'comprehensive') {
    filesToCreate.push(...BRAND_FILES.standard);
  }
  if (tier === 'comprehensive') {
    filesToCreate.push(...BRAND_FILES.comprehensive);
  }

  for (const filePath of filesToCreate) {
    const fullPath = join(brandDir, filePath);
    mkdirSync(join(fullPath, '..'), { recursive: true });

    if (filePath.endsWith('.gitkeep')) {
      writeFileSync(fullPath, '', 'utf-8');
      continue;
    }

    const name = filePath.replace(/\.md$/, '').split('/').pop();
    const title = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
    let content = `# ${title}\n\n<!-- Fill this file following the schema at schema/brand/${filePath.replace(/\//g, '-').replace('.md', '')}.schema.md -->\n`;

    if (isPitch) {
      content = PITCH_DISCLAIMER + content;
    }

    writeFileSync(fullPath, content, 'utf-8');
  }
}

/**
 * Build the .brandrc.yaml content from answers.
 */
function buildBrandrc(answers) {
  const config = {
    client: answers.client,
    tier: TIER_FOR_MODE[answers.mode],
    mode: answers.mode,
  };

  if (answers.brandPath) {
    config.brand_path = answers.brandPath;
  }

  config.deploy = { platform: 'netlify' };

  const sources = {};
  if (answers.websiteUrl) {
    sources.website = answers.websiteUrl;
  }
  if (answers.figmaUrl) {
    // Extract file ID from Figma URL
    const match = answers.figmaUrl.match(/figma\.com\/(?:design|file)\/([^/]+)/);
    if (match) {
      sources.figma = [match[1]];
    }
  }
  if (answers.socialProfiles) {
    const social = {};
    for (const url of answers.socialProfiles.split(',').map(u => u.trim()).filter(Boolean)) {
      if (url.includes('twitter.com') || url.includes('x.com')) social.twitter = url;
      else if (url.includes('instagram.com')) social.instagram = url;
      else if (url.includes('linkedin.com')) social.linkedin = url;
      else if (url.includes('facebook.com')) social.facebook = url;
      else if (url.includes('tiktok.com')) social.tiktok = url;
    }
    if (Object.keys(social).length > 0) sources.social = social;
  }
  if (Object.keys(sources).length > 0) {
    config.sources = sources;
  }

  config.tools = { agent: 'claude-code' };
  config.extensions = [];

  return config;
}
