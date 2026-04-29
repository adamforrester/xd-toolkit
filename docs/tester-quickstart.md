# XD Toolkit — Tester Quickstart

Thanks for testing this. The toolkit is in early access — the foundation works end-to-end, but the Brand Factory skills (extraction, scoring, audit, refresh) are still in build. This guide gets you through what's ready today.

## What this is

An end-to-end suite for Experience Design practitioners who want AI agents to produce **brand-consistent, production-quality digital products**. It bundles:

- 21 core skills (Impeccable + Vercel + figma-plugin-dev)
- The Superpowers plugin (structured development practices)
- 7 MCP servers (Figma Official, Figma Console, Playwright, GitHub, Netlify, Vercel, Context7)
- Two slash commands (`/new-project`, `/brand-check`)
- Optional add-ons: UX Design Skills Pack (63 skills), Design System Pack (21 skills + Storybook MCP), Brand Factory

## Prerequisites

- Node.js 18+
- Claude Code installed (`npm install -g @anthropic-ai/claude-code`)
- A Figma personal access token — figma.com → avatar → Settings → Personal access tokens
- A GitHub personal access token (classic) — github.com → Settings → Developer settings → Tokens (classic). Scopes: `repo`, `read:org`

Total setup time: ~10 minutes.

## Setup (one-time)

```bash
git clone https://github.com/[your-fork]/xd-toolkit.git
cd xd-toolkit
npm install
npx xd-toolkit setup
```

You'll be prompted to:
1. Choose which optional packages to install (Core is forced on; UX Design Skills, Design System Pack, and Brand Factory are checkboxes)
2. Paste your Figma PAT
3. Paste your GitHub PAT

Setup will:
- Install 7 core MCP servers (skipping any already present)
- Install the Superpowers plugin
- Install whichever optional skill packs you selected
- If you selected the Design System Pack, also install the Storybook MCP (only connects when Storybook is running locally)
- Copy `/new-project` and `/brand-check` to `~/.claude/commands/` so they're available globally

After setup, run `npx xd-toolkit doctor` to verify everything is connected.

## Try it

In a fresh directory, open Claude Code and type:

```
/new-project Wendy's
```

This walks through:
1. **Project details** (8 questions: stack, deploy target, component library, etc.)
2. **Scaffold** — creates `.brand/`, `CLAUDE.md`, `.impeccable.md`, `.brandrc.yaml`
3. **Off-ramp** — Yes / Not now / Skip (test all three)
4. **Asset collection** — logos, fonts, photography, icons
5. **Brand extraction** — Playwright-driven analysis of the live site (Wendy's is fine)
6. **Conflict detection** — distinguishes digital adaptations from genuine conflicts
7. **Review** — visual atmosphere, brand self-test, aesthetic anti-patterns

Then:

```
/brand-check
```

Reports completeness against the tier you chose and surfaces gaps.

To verify CLI-only flow (no conversational layer):

```bash
mkdir test-cli && cd test-cli
npx xd-toolkit init --client "Test" --tier minimum
npx xd-toolkit score
```

## What to test

- Does `setup` finish cleanly with `7 MCP servers connected` (or 8 with DS Pack)?
- Does `/new-project` produce a usable `.brand/` directory at the chosen tier?
- Do all three off-ramp paths (Yes / Not now / Skip) leave a working project?
- Does `/brand-check` give a sensible completeness score?
- Does Claude follow the rules in the generated `CLAUDE.md` when asked to build something? (E.g. ask it to build a Wendy's-branded landing page and check it doesn't substitute fonts or invent a logo.)

## Known limitations

- **Brand Factory skills (C4–C8) are not built yet.** `/new-project`'s extraction phase relies on the model + Playwright doing it ad hoc. Dedicated `/brand-extract`, `/brand-analyze`, `/brand-audit`, `/brand-refresh` skills are coming.
- **Layer 4 + Layer 5 end-to-end tests are blocked** on the above.
- **No daily-workflow doc yet** — `docs/setup-guide.md` covers install, but ongoing use is documented via the slash commands themselves.
- **Design System Pack** requires `git` on PATH (the installer clones from GitHub).
- **Firecrawl MCP** is no longer auto-installed. Free tier doesn't offer enough credits to be worth the prompt. If you have a paid plan, add it manually (see `docs/architecture.md`).

## Reporting issues

When something breaks, please include:
- The command you ran
- The full output (especially anything in red or yellow)
- `npx xd-toolkit doctor` output
- Your OS + Node version

File at: [issue tracker URL]

## Useful files for orientation

- `CLAUDE.md` — project-level conventions and deliverable status
- `docs/architecture.md` — full architecture reference
- `docs/setup-guide.md` — step-by-step setup walkthrough
- `schema/brand/` — what each `.brand/` file looks like
- `tests/fixtures/wendys/` — a complete reference brand package at the minimum tier
