import chalk from 'chalk';
import ora from 'ora';
import { runAsync } from './exec.js';

/**
 * MCP server definitions. Each entry defines the claude mcp add command.
 */
const CORE_MCPS = [
  {
    name: 'figma',
    label: 'Figma Official',
    description: 'Read Figma designs and generate code',
    cmd: 'claude mcp add figma -s user -- npx -y @anthropic-ai/figma-mcp@latest',
    needsToken: false,
  },
  {
    name: 'figma-console',
    label: 'Figma Console',
    description: 'Write to Figma, manage variables, audit design systems',
    cmd: (tokens) =>
      `claude mcp add figma-console -s user -e FIGMA_ACCESS_TOKEN=${tokens.figma} -e ENABLE_MCP_APPS=true -- npx -y figma-console-mcp@latest`,
    needsToken: 'figma',
  },
  {
    name: 'playwright',
    label: 'Playwright',
    description: 'Browser automation, visual verification, and accessibility auditing',
    cmd: 'claude mcp add playwright -s user -- npx -y @playwright/mcp@latest',
    needsToken: false,
  },
  {
    name: 'github',
    label: 'GitHub',
    description: 'Repo management, PRs, code search, git workflows',
    cmd: (tokens) =>
      `claude mcp add github -s user -e GITHUB_PERSONAL_ACCESS_TOKEN=${tokens.github} -- npx -y @modelcontextprotocol/server-github`,
    needsToken: 'github',
  },
  {
    name: 'netlify',
    label: 'Netlify',
    description: 'Deploy projects to Netlify',
    cmd: 'claude mcp add netlify -s user -- npx -y @netlify/mcp',
    needsToken: false,
  },
  {
    name: 'vercel',
    label: 'Vercel',
    description: 'Deploy Next.js projects to Vercel',
    cmd: 'claude mcp add vercel -s user --transport http https://mcp.vercel.com',
    needsToken: false,
  },
  {
    name: 'context7',
    label: 'Context7',
    description: 'Current documentation for any framework or library',
    cmd: 'claude mcp add context7 -s user -- npx -y @context7/mcp',
    needsToken: false,
  },
];

const OPTIONAL_MCPS = {
  firecrawl: {
    name: 'firecrawl',
    label: 'Firecrawl',
    description: 'Faster bulk scraping for brand onboarding (optional, requires API key)',
    cmd: (tokens) =>
      `claude mcp add firecrawl -s user -e FIRECRAWL_API_KEY=${tokens.firecrawl} -- npx -y firecrawl-mcp`,
    needsToken: 'firecrawl',
  },
};

/**
 * Get the set of already-connected MCP server names.
 */
async function getInstalledMCPs() {
  const { ok, stdout } = await runAsync('claude mcp list');
  if (!ok) return new Set();
  const names = new Set();
  for (const line of stdout.split('\n')) {
    if (line.includes('Connected')) {
      // Lines look like: "name: command... - ✓ Connected"
      const match = line.match(/^([^:]+):/);
      if (match) names.add(match[1].trim());
    }
  }
  return names;
}

/**
 * Install all core MCP servers, skipping any already connected.
 * @param {Object} tokens - { figma, github }
 * @returns {Array<{ name, label, ok, skipped?, error? }>}
 */
export async function installCoreMCPs(tokens) {
  const results = [];
  const installed = await getInstalledMCPs();

  for (let i = 0; i < CORE_MCPS.length; i++) {
    const mcp = CORE_MCPS[i];

    // Skip if already connected
    if (installed.has(mcp.name)) {
      console.log(chalk.dim(`  [${i + 1}/${CORE_MCPS.length}] ${mcp.label} — already installed, skipping`));
      results.push({ name: mcp.name, label: mcp.label, ok: true, skipped: true });
      continue;
    }

    const spinner = ora(`[${i + 1}/${CORE_MCPS.length}] ${mcp.label} — ${mcp.description}`).start();

    const cmd = typeof mcp.cmd === 'function' ? mcp.cmd(tokens) : mcp.cmd;
    const { ok, stderr } = await runAsync(cmd);

    if (ok) {
      spinner.succeed(`[${i + 1}/${CORE_MCPS.length}] ${mcp.label} ${chalk.green('installed')}`);
      results.push({ name: mcp.name, label: mcp.label, ok: true });
    } else {
      spinner.fail(`[${i + 1}/${CORE_MCPS.length}] ${mcp.label} ${chalk.red('failed')}`);
      if (stderr) console.log(chalk.dim(`    ${stderr.split('\n')[0]}`));
      results.push({ name: mcp.name, label: mcp.label, ok: false, error: stderr });
    }
  }

  return results;
}

/**
 * Install an optional MCP server.
 */
export async function installOptionalMCP(name, tokens) {
  const mcp = OPTIONAL_MCPS[name];
  if (!mcp) throw new Error(`Unknown optional MCP: ${name}`);

  // Skip if already installed
  const installed = await getInstalledMCPs();
  if (installed.has(mcp.name)) {
    console.log(chalk.dim(`  ${mcp.label} — already installed, skipping`));
    return { name: mcp.name, label: mcp.label, ok: true, skipped: true };
  }

  const spinner = ora(`${mcp.label} — ${mcp.description}`).start();
  const cmd = typeof mcp.cmd === 'function' ? mcp.cmd(tokens) : mcp.cmd;
  const { ok, stderr } = await runAsync(cmd);

  if (ok) {
    spinner.succeed(`${mcp.label} ${chalk.green('installed')}`);
    return { name: mcp.name, label: mcp.label, ok: true };
  } else {
    spinner.fail(`${mcp.label} ${chalk.red('failed')}`);
    if (stderr) console.log(chalk.dim(`    ${stderr.split('\n')[0]}`));
    return { name: mcp.name, label: mcp.label, ok: false, error: stderr };
  }
}

export { CORE_MCPS, OPTIONAL_MCPS };
