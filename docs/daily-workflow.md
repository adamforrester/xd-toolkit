# Daily Workflow

What a typical XD project looks like day to day, from the moment a new client lands on your desk to the moment you ship. This doc fills the gap between [setup-guide.md](setup-guide.md) (one-time install) and [architecture.md](architecture.md) (reference). It does **not** repeat content from those — start there if you haven't installed yet, or if you need to look something specific up.

---

## The shape of a project

Every XD project moves through five phases. The toolkit gives you a tool for each.

```
┌───────────┐   ┌──────────┐   ┌────────┐   ┌──────────┐   ┌────────┐
│ Onboard   │ → │ Extract  │ → │ Design │ → │ Build    │ → │ Audit  │
└───────────┘   └──────────┘   └────────┘   └──────────┘   └────────┘
  /new-project    /brand-          Figma        Impeccable    /brand-
                  context:         + brand      build         context:
                  extract          context                    audit
```

The toolkit is set up so that brand context flows automatically from extraction into every later phase. You don't manually wire it up; you just keep working and the agents pick it up.

---

## Day 1 — Onboarding

You have a new client. Make a directory, run `/new-project`, answer the questions.

```bash
mkdir acme-corp && cd acme-corp
claude
> /new-project
```

`/new-project` is conversational. It asks:

- Client name, project mode (`pitch`, `standard`, `comprehensive`)
- Whether you have access to brand assets (Figma file, brand guide PDF, live site URL)
- Whether you want to extract brand context now or later

If you say "extract now," the workflow flows directly into `/brand-context:extract` (next section). If you say "later," it scaffolds the project with empty `.brand/` files and you can extract whenever you're ready.

**What you end up with:**

- A `.brand/` directory at the chosen tier (minimum / standard / comprehensive)
- `CLAUDE.md` with brand routing rules wired up
- `AGENTS.md`, `.cursorrules`, `copilot-instructions.md`, `.impeccable.md`, `design.md` (per the [google-labs-code/design.md](https://github.com/google-labs-code/design.md) spec)

> If `init` fails or you want to set up the scaffold without the conversational layer, the CLI fallback is `npx xd-toolkit init --client "Acme Corp" --mode standard`. Same result, no questions.

---

## Day 1-2 — Extraction

Run the extraction pipeline against everything you have on the client.

```
> /brand-context:extract
```

This is where most of the brand intelligence work happens. It runs as a multi-stage pipeline:

| Stage | What it does | Output |
|---|---|---|
| 1 | Pulls Figma variables (Figma Console MCP) | `.brand/tokens/*.md` |
| 2 | Sample web computed styles (Playwright) | reconciled into tokens |
| 3 | Voice extraction from website + social + app stores | `.brand/voice.md` (additive) |
| 4 | Multimodal: brand guide PDF + reference screenshots | `.brand/overview.md` |
| 5 | Cross-source conflict detection | `.brand/conflicts.md` |
| 6 | Design system repo scan (comprehensive tier only) | `.brand/components/*.md` |
| 7+8 | Regenerate `design.md` and `.impeccable.md` | project root |

**The pipeline is additive on the parts that depend on practitioner judgment.** Voice and conflicts get appended sections rather than overwritten. Tokens and overview respect an explicit overwrite policy. You can re-run extraction safely as you discover more sources.

When the pipeline surfaces a conflict — say, the brand guide says "Get Started" but the live site says "Get started" — it stops and asks you to resolve it. That decision is then preserved in `conflicts.md` so it doesn't re-surface on the next run.

**Quick check after extraction:**

```bash
brand-cli score   # completeness against the chosen tier
```

You'll get a tier (minimum/standard/comprehensive), a percentage, and a list of gaps. Fill the gaps by re-running extraction with more sources, or by editing the markdown files by hand.

---

## Day 2-N — Design

If your work is design-only (no code yet), this is where you spend most of your time. Open Figma. The Figma Official MCP and Figma Console MCP are both connected, so the agent can read your file's design context, instantiate components from the design library, and write back design tokens.

Brand context flows automatically. The agent reads `.brand/tokens/`, `.brand/voice.md`, `.brand/overview.md` whenever it touches anything visual or copy-related. You don't tell it to — that's wired up by the routing rules in `CLAUDE.md`.

Common requests at this stage:

- "Design a hero section for the homepage" → it'll use the right tokens, follow `composition/page-types.md`, write Wendy's-irreverent copy if that's the voice
- "Write three error message variations for failed payment" → it pulls voice samples from `voice.md`
- "Audit this Figma file against the design system" → uses Figma Console MCP audit tools

If you want to generate something *into* Figma from intent or code, use the `figma_generate_design` tools (or invoke the `/figma:figma-generate-design` skill explicitly).

---

## Day N+ — Build

When it's time to turn the design into code, you're using Impeccable's build skills (`/shape`, `/scaffold`, `/build`) — these are the 20 Impeccable skills bundled in the Core Toolkit.

The division of labor matters here:

- **`/shape`** runs structured discovery and produces a brief. The brief is intentionally **scope-focused, not brand-focused** — capturing what the work is and where the boundaries are. (See [test-results.md, Layer 2](test-results.md) for why.)
- **The build phase** is where brand personality enters. The agent reads `.impeccable.md` and the `.brand/` files automatically while writing code. Your output ends up on-brand without any extra prompting.

This split is by design. Don't try to inject brand context into the brief — the system covers for it during build, and double-injection makes briefs noisy.

**Build phase MCP usage:**

- **Playwright** for browser verification of any UI changes (also runs axe-core for a11y)
- **Context7** for current framework docs (don't trust the model's training-cutoff knowledge for fast-moving libraries)
- **GitHub** / **Netlify** / **Vercel** for repo and deploy operations

---

## Pre-deploy — Audit

Before deploying, run the brand-adherence audit:

```
> /brand-context:audit
```

This evaluates the actual output (your built page or component) against `.brand/` across six dimensions: token compliance, component reuse, composition anti-patterns, voice, visual atmosphere, and conflict consistency. You get severity-ranked findings and an adherence score. Reports persist to `.brand/audits/` so you have a record of what was checked when.

`/brand-context:audit` is **report-only** in v1 — it tells you what's off-brand, you fix it manually, you re-run. Auto-fix mode is a future phase.

For pre-deploy site-wide accessibility and performance, `npx unlighthouse` is the recommended tool (run it against the deployed preview URL; see [architecture.md](architecture.md) for context on why CLI over MCP for this case).

---

## Common patterns

**Refreshing a brand package.** Re-run `/brand-context:extract` whenever the client changes their brand guide, ships a new site, or rebrands. The pipeline respects existing decisions (conflicts you've resolved stay resolved) and additively layers in what's new.

**Sharing a brand package across projects.** Pass `--brand-path` to `xd-toolkit init` so multiple project directories can read from a single `.brand/` source of truth. Useful when one client has multiple parallel workstreams.

**Pitch mode.** When you don't have direct access to the client's Figma or brand assets, use `--mode pitch`. The toolkit constrains extraction to public sources only and produces a minimum-tier brand package fast. See [Scenario B in testing-and-scenarios.md](testing-and-scenarios.md#scenario-b-pitch--no-direct-access).

**Health check at any time.**

```bash
xd-toolkit doctor   # verifies MCPs connected, plugins enabled, .brand/ valid
```

If something feels off, run this first.

---

## When something breaks

| Symptom | First thing to check |
|---|---|
| Agent ignores brand tokens | Is `.brand/tokens/colors.md` populated? `brand-cli score` will tell you |
| Voice feels off-brand | Has `voice.md` got a populated `## Observed Voice` section? Re-run `/brand-context:extract` if not |
| Conflict re-surfaces every run | Make sure you walked through the resolution prompt (it persists to `conflicts.md`) |
| Figma MCP errors | `xd-toolkit doctor` — most often a stale auth token or the desktop app isn't running |
| `/brand-context:*` commands not found | brand-context plugin disabled. `claude plugin list` to check, then `claude plugin enable brand-context@brand-skills` |

For deeper troubleshooting, [setup-guide.md](setup-guide.md) covers install issues; [test-results.md](test-results.md) records what's been validated end-to-end.

---

## What's not covered yet

A few things still belong to manual workflow:

- **Stage 6 (DS repo scan) hasn't been validated end-to-end on a real codebase** — the implementation ships, but the first client run is still pending. If you're the first to try it, expect rough edges.
- **Layer 5 (full E2E build run-through)** is unblocked but not yet executed. If you complete one, capture findings in [test-results.md](test-results.md).
- **`/brand-context:audit` auto-fix mode** doesn't exist yet — the audit reports, you remediate.

These all belong to the brand-skills repo's roadmap rather than xd-toolkit's, since brand-skills now owns the auditing/scoring/extraction surface.
