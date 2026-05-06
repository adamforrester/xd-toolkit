# XD Toolkit

> **Status:** Early access. Foundation works end-to-end; Brand Skills automation skills are still in build. See [Known limitations](#known-limitations).

An end-to-end toolkit for **Experience Design practitioners** who want AI agents to produce brand-consistent, production-quality digital products. It bundles the skills, MCP servers, slash commands, and brand-context plumbing that an AI agent needs to design, build, test, and deploy on-brand work.

---

## What's included

- **22 bundled skills** — Impeccable family (×20) + figma-plugin-dev (×1) + vml-thrive-feedback (×1)
- **3 plugins** (all installed during setup):
  - **Superpowers** — structured development practices (brainstorming, TDD, debugging, code review)
  - **Karpathy Guidelines** — coding discipline (think before coding, simplicity first, surgical changes, goal-driven execution; 91k+ stars)
  - **brand-context** — full brand-extraction pipeline (from the standalone [adamforrester/brand-skills](https://github.com/adamforrester/brand-skills) repo). Slash commands: `/brand-context:extract` and `/brand-context:check`
- **`brand-cli`** — companion npm CLI from brand-skills, providing `brand-cli refresh-design`, `refresh-context`, `score`, `setup`, and `init`
- **7 MCP servers** — Figma Official, Figma Console, Playwright, GitHub, Netlify, Vercel, Context7
- **1 slash command bundled with xd-toolkit** — `/new-project` (conversational client onboarding). The `/brand-context:*` commands come from the brand-skills plugin.
- **`.brand/` directory schema** — 17 schema files defining a tiered brand package (minimum / standard / comprehensive)
- **Optional add-ons:**
  - UX Design Skills Pack (63 skills)
  - Design System Pack (21 skills + Storybook MCP)

---

## Quick install

### Prerequisites

- Node.js 18+
- git ([install](https://git-scm.com/downloads)) — required even for the npm install method, since npm uses git under the hood to fetch from GitHub
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (`npm install -g @anthropic-ai/claude-code`)
- A Figma personal access token ([how to get one](https://help.figma.com/hc/en-us/articles/8085703771159))
- A GitHub personal access token (classic, scopes: `repo`, `read:org`)

### Install (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/adamforrester/xd-toolkit/main/install.sh | bash
```

One command. The installer checks your environment, fixes the common macOS npm permission issue automatically, installs the toolkit globally, and runs `xd-toolkit setup`.

If you'd like to read the script before running it:

```bash
curl -fsSL https://raw.githubusercontent.com/adamforrester/xd-toolkit/main/install.sh | less
```

### Manual install (if you'd rather not pipe to bash)

```bash
npm install -g github:adamforrester/xd-toolkit
xd-toolkit setup
```

If you hit `EACCES` permission errors on macOS, run the installer above instead — or fix npm's prefix once with `npm config set prefix ~/.npm-global` and add `~/.npm-global/bin` to your PATH.

### For contributors (clone the repo)

If you want to modify the toolkit or pull updates with `git pull`:

```bash
git clone https://github.com/adamforrester/xd-toolkit.git
cd xd-toolkit
npm install
npx xd-toolkit setup
```

`setup` prompts you for optional packages, your Figma PAT, and your GitHub PAT, then installs MCP servers, the Superpowers and Karpathy Guidelines plugins, selected skill packs, and global slash commands. Run `xd-toolkit doctor` afterwards to verify everything is connected.

---

## Quick start

In a fresh directory, open Claude Code and type:

```
/new-project Wendy's
```

This walks through 8 setup questions, scaffolds the project (`.brand/`, `CLAUDE.md`, `.impeccable.md`, `.brandrc.yaml`), then guides you through asset collection, brand extraction, conflict detection, and a brand self-test.

Then check completeness:

```
/brand-check
```

CLI-only flow (no conversational layer):

```bash
mkdir my-client && cd my-client
npx xd-toolkit init --client "My Client" --mode standard
npx xd-toolkit score
```

---

## Documentation

| File | What it covers |
|---|---|
| [`docs/tester-quickstart.md`](docs/tester-quickstart.md) | First-time tester guide |
| [`docs/setup-guide.md`](docs/setup-guide.md) | Step-by-step setup walkthrough |
| [`docs/architecture.md`](docs/architecture.md) | Full architecture: packages, MCP stack, skills, workflows |
| [`docs/testing-and-scenarios.md`](docs/testing-and-scenarios.md) | Test strategy and four agency scenarios |
| [`schema/brand/`](schema/brand/) | Schema specs for every `.brand/` file |
| [`tests/fixtures/wendys/`](tests/fixtures/wendys/) | Reference brand package at the minimum tier |

---

## Repo layout

```
packages/
  cli/              CLI source (setup, init, doctor, update, score)
  core/             Core Toolkit skill + instruction file templates
  brand-skills/    Brand Skills skills (in progress)
schema/
  brand/            .brand/ directory schema (16 files)
extensions/
  ds-pack/          Optional Design System Pack
  ux-design-skills/ Optional UX Design Skills Pack
docs/               Architecture, setup, testing docs
tests/fixtures/     Reference brand packages
```

---

## Known limitations

- **`/brand-audit` (C7) is not yet built.** A skill that scores agent output against the project's brand package (token compliance, voice consistency, anti-pattern checks) is on the roadmap. For now, manual review against `.brand/` is the workflow.
- **`/brand-score` slash command (C6) is partial.** The `xd-toolkit score` CLI command exists and reports completeness; the in-session conversational version doesn't.
- **Layer 5 (full E2E prototype build)** has not been run since `/brand-extract` shipped at v1.0.0. Stages 1–5 + 8 validated against TruGreen; Stage 6 (DS repo scan) is implementation-complete but client-untested.
- **Daily-workflow documentation** is partial — install and per-skill usage are documented; a single end-to-end "what a typical project looks like day to day" doc is still missing.
- **Firecrawl MCP** is not auto-installed (free tier is too thin to justify the prompt). Add manually if you have a paid plan — see `docs/architecture.md`.
- **Not yet on npm.** Install from GitHub for now.

Found a bug? Open an issue with `xd-toolkit doctor` output, your OS, and your Node version.

---

## License

MIT. Bundled third-party skills retain their original licenses.
