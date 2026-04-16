# XD Vibe Coding Toolkit

An end-to-end suite of tools for Experience Design (XD) practitioners to produce production-quality, brand-consistent digital products using AI agents.

## Architecture

See `docs/architecture.md` for the full architecture document covering:
- Three packages (Core Toolkit, Brand Factory, Brand Packages)
- Four component categories (MCP Servers, Skills, Instruction Files, Data Files)
- The MCP stack (8 core + 1 optional across Design, Build/Test, Deploy, Context phases)
- The skills stack (Impeccable 18 skills + engineering + Brand Factory)
- The `.brand/` directory structure and loading strategy
- The E2E pipeline (Design -> Build -> Test -> Deploy)
- Build plan (C1-C10 deliverables)
- Figma-only workflow (designing on canvas without code)
- Four agency scenarios (A: new client, B: pitch, C: existing client, D: DS consulting)

## Project Structure

```
packages/
  cli/              # xd-toolkit CLI (C2) — setup, init, doctor, update, score
    bin/            #   Entry point (xd-toolkit.js)
    src/commands/   #   setup.js, init.js, doctor.js, update.js, score.js
    src/utils/      #   mcp-installer, skill-copier, template-renderer, token-validator
    src/templates/  #   Bundled .tmpl files for CLAUDE.md, AGENTS.md, etc.
    skills/core/    #   Bundled 21 skills (Impeccable 18 + Vercel 2 + figma-plugin-dev 1)
  core/             # Package 1: Core Toolkit skills + instruction file templates
    templates/      #   Source templates (CLAUDE.md.tmpl, AGENTS.md.tmpl, etc.)
  brand-factory/    # Package 2: Brand Factory skills (C4-C8, not yet built)
schema/
  brand/            # C1: .brand/ directory schema specification (16 schema files)
extensions/
  ds-pack/          # Optional: Design System Ops (21 skills)
  ux-design-skills/ # Optional: UX Design Skills Pack (63 skills, 8 plugins)
scripts/
  setup-mcps.sh     # Automated MCP setup script
tests/
  fixtures/wendys/  # Wendy's test fixture (minimum-tier .brand/ + CLAUDE.md + .impeccable.md)
docs/
  architecture.md           # Full architecture & workflow document
  testing-and-scenarios.md  # Testing strategy & agency scenarios (A/B/C/D)
  setup-guide.md            # Step-by-step practitioner setup guide
  test-results.md           # Layer 1-3 test findings
```

## Deliverable Status

| # | Deliverable | Status | Notes |
|---|------------|--------|-------|
| C1 | `.brand/` schema specification | **Done** | 16 schema files in `schema/brand/` |
| C2 | `xd-toolkit` CLI | **Done** | setup, init, doctor, update, score commands working. 21 skills bundled. |
| C3 | Instruction file templates | **Done** | CLAUDE.md, AGENTS.md, .cursorrules, copilot-instructions.md, .impeccable.md |
| C4 | `/brand-extract` skill | Not started | Spec complete in architecture doc (voice extraction via Playwright) |
| C5 | `/brand-analyze` skill | Not started | Spec complete (channel-aware voice inference with confidence levels) |
| C6 | `/brand-score` skill | Not started | CLI `score` command exists but the skill (for in-session use) is separate |
| C7 | `/brand-audit` skill | Not started | |
| C8 | `/brand-refresh` skill | Not started | |
| C9 | Practitioner documentation | **Partial** | setup-guide.md done, daily workflow guide not started |
| C10 | MCP setup verification | **Done** | `xd-toolkit doctor` command + `scripts/setup-mcps.sh` |

## Testing Status

- **Layer 1 (Brand Routing):** 5/5 passed — see `docs/test-results.md`
- **Layer 2 (Impeccable Integration):** Partial pass — build output on-brand, briefs brand-light
- **Layer 3 (MCP Stack):** 6/6 passed — Playwright replaces A11y Scanner, Firecrawl optional
- **Layer 4 (Brand Factory):** Blocked on C4-C8
- **Layer 5 (E2E):** Blocked on Layer 4

## Build Order

Custom deliverables (C1-C10) are built in three phases:
1. **Foundation** — C1 (.brand/ schema), C2 (CLI), C3 (instruction templates), C9/C10 (docs + doctor) — **DONE**
2. **Brand Factory** — C4-C8 (extract, analyze, score, audit, refresh skills) — **NEXT**
3. **Distribution** — Public repo setup, practitioner docs, extension packaging

## Key Conventions

- Skills are markdown files that travel with client project repos
- `.brand/` contains structured data (markdown + JSON), never executable code
- MCPs are installed per-practitioner, skills per-project
- Impeccable reads `.impeccable.md` (auto-generated from `.brand/overview.md`) — no fork needed
- Token values live in markdown for agent readability, not JSON
- Token files need **application context** (where values go in UI), not just values — see `schema/brand/README.md`
- CLI supports `--json` on all commands for machine-readable output
- CLI supports `--brand-path` for shared brand packages across multiple projects
- CLI supports `--figma-only` for design-only workflows without code scaffolding
- Playwright MCP handles both browser verification AND accessibility auditing (axe-core injection)
- Firecrawl MCP is optional — Playwright is the default extraction method
