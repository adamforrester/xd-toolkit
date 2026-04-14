# Practitioner Setup Guide

Step-by-step setup for XD practitioners. No terminal experience required. Follow each step in order — if something goes wrong, check the Troubleshooting section at the bottom.

---

## Before You Start (What You Need)

You need these accounts and tools. Estimate: 15-20 minutes if creating new accounts, 5 minutes if you already have them.

- [ ] **1. Node.js 18+**
  Open Terminal (Mac: Cmd+Space, type "Terminal", press Enter).
  Type `node -v` and press Enter.
  - If you see `v18.x.x` or higher — you're good, move on.
  - If you see "command not found" — go to https://nodejs.org, download the **LTS** version, run the installer, then **restart Terminal** and check again.

- [ ] **2. Claude Code**
  Type `claude --version` in Terminal.
  - If you see a version number — you're good.
  - If "command not found" — install it: `npm install -g @anthropic-ai/claude-code`
  - Full install docs: https://docs.anthropic.com/en/docs/claude-code

- [ ] **3. Figma Personal Access Token**
  You already have a Figma account. You need a token so Claude can read your designs.
  1. Go to https://www.figma.com
  2. Click your avatar (top-right) → **Settings**
  3. Scroll to **Personal access tokens**
  4. Click **Generate new token** — give it a name like "Claude Code"
  5. **Copy the token immediately** — you won't be able to see it again
  6. Save it somewhere safe (password manager, Notes app, etc.)

- [ ] **4. GitHub account + Personal Access Token**
  If you don't have a GitHub account: https://github.com/signup (free)
  To create a token:
  1. Go to https://github.com/settings/tokens
  2. Click **Generate new token (classic)**
  3. Give it a name like "Claude Code"
  4. Select scopes: **repo**, **read:org**
  5. Click **Generate token**
  6. **Copy the token immediately** — save it with your Figma token

- [ ] **5. Netlify account (free)**
  Go to https://app.netlify.com/signup — sign up with your GitHub account.
  No token needed — Netlify authenticates via browser when you first deploy.

- [ ] **6. Vercel account (free, optional)**
  Only needed for Next.js projects: https://vercel.com/signup
  Authenticates via browser on first use.
  Note: Vercel's free tier **prohibits commercial use** — use Netlify for client work.

---

## Install the MCPs (One-Time Setup)

MCPs (Model Context Protocol servers) give Claude the ability to interact with external tools — Figma, browsers, GitHub, deployment platforms. You install them once and they're available across all projects.

Run each command in Terminal. After each one, you should see a confirmation message.

### Step 1: Figma Official MCP

**What it does:** Lets Claude read your Figma designs and generate code from them.

```bash
claude mcp add figma -s user -- npx -y @anthropic-ai/figma-mcp@latest
```

You should see: `Added figma to user settings`
If you see an error about npx: Make sure Node.js is installed (check #1 above).

### Step 2: Figma Console MCP

**What it does:** Lets Claude write to Figma, manage variables, audit design system health, and run design-code parity checks. Complements the Official MCP.

```bash
claude mcp add figma-console -s user \
  -e FIGMA_ACCESS_TOKEN=YOUR_FIGMA_TOKEN_HERE \
  -e ENABLE_MCP_APPS=true \
  -- npx -y figma-console-mcp@latest
```

Replace `YOUR_FIGMA_TOKEN_HERE` with the Figma token from step 3 above.

You should see: `Added figma-console to user settings`
If you see an auth error later: double-check your token — it starts with `figd_`.

### Step 3: Playwright MCP

**What it does:** Lets Claude open a real browser to verify pages render correctly, run accessibility audits, and test interactions. Also handles voice extraction during brand onboarding.

```bash
claude mcp add playwright -s user -- npx -y @playwright/mcp@latest
```

You should see: `Added playwright to user settings`

### Step 4: GitHub MCP

**What it does:** Lets Claude create repos, push code, manage pull requests, and handle git workflows conversationally.

```bash
claude mcp add github -s user \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN_HERE \
  -- npx -y @modelcontextprotocol/server-github
```

Replace `YOUR_GITHUB_TOKEN_HERE` with the GitHub token from step 4 above.

You should see: `Added github to user settings`

### Step 5: Netlify MCP

**What it does:** Lets Claude deploy your projects to Netlify, check build logs, and manage sites.

```bash
claude mcp add netlify -s user -- npx -y @netlify/mcp
```

You should see: `Added netlify to user settings`
First time you deploy, a browser window will open for Netlify login — that's normal.

### Step 6: Vercel MCP

**What it does:** Lets Claude deploy Next.js projects to Vercel. Optional — skip if you don't work with Next.js.

```bash
claude mcp add vercel -s user --transport http https://mcp.vercel.com
```

You should see: `Added vercel to user settings`

### Step 7: Context7 MCP

**What it does:** Gives Claude access to current documentation for any framework or library, so it uses up-to-date APIs instead of stale training data.

```bash
claude mcp add context7 -s user -- npx -y @context7/mcp
```

You should see: `Added context7 to user settings`

### Step 8: Storybook MCP (project-scoped)

**What it does:** Lets Claude discover and reuse existing components from your Storybook. Only install this when working on a project that has Storybook.

```bash
# Run this INSIDE a project that uses Storybook:
npx storybook add @storybook/addon-mcp
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

This is per-project, not global — you'll do this step for each Storybook project.

---

## Verify Everything

After installing all MCPs, run:

```bash
claude mcp list
```

You should see each MCP listed with a status:

- **Connected** — working correctly
- **Disconnected** — something's wrong (see Troubleshooting below)

Expected output (8 core MCPs):
```
figma: ... - ✓ Connected
figma-console: ... - ✓ Connected
playwright: ... - ✓ Connected
github: ... - ✓ Connected
netlify: ... - ✓ Connected
vercel: ... - ✓ Connected
context7: ... - ✓ Connected
```

Storybook will only show if you installed it for the current project.

---

## The Quick Version (For Experienced Users)

If you're comfortable with Terminal, run the automated setup script:

```bash
bash scripts/setup-mcps.sh
```

It installs all 8 MCPs, prompts for your Figma and GitHub tokens, and verifies each connection. Takes about 5 minutes.

---

## Troubleshooting

### "command not found: claude"
Claude Code isn't installed. Run: `npm install -g @anthropic-ai/claude-code`

### "command not found: npx"
Node.js isn't installed. Go to https://nodejs.org, install the LTS version, **restart Terminal**, then try again.

### MCP shows "Disconnected"
Usually a token issue. Re-run the `claude mcp add` command with the correct token. Common causes:
- Token was copied with extra spaces — re-copy carefully
- Token expired — generate a new one from the service's settings
- Token doesn't have the right permissions — for GitHub, make sure `repo` and `read:org` scopes are selected

### Chrome conflict with Playwright
If Playwright can't launch a browser, close all Chrome windows first. Playwright needs its own browser instance and can conflict with an open Chrome session.

### Netlify/Vercel auth failed
If the browser auth window doesn't appear or fails:
- Netlify: try `npx netlify-cli login` manually
- Vercel: authenticate via the Vercel dashboard at https://vercel.com

### "EACCES: permission denied" during npm install
Your Node.js installation has a permissions issue. Fix it:
```bash
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```
Or reinstall Node.js via the official installer (not Homebrew).

### Something else?
Open an issue at https://github.com/adamforrester/xd-toolkit/issues with:
1. The command you ran
2. The error message you saw
3. Your OS version (`sw_vers` on Mac)
4. Your Node.js version (`node -v`)
