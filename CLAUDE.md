# XD Vibe Coding Toolkit

An end-to-end suite of tools for Experience Design (XD) practitioners to produce production-quality, brand-consistent digital products using AI agents.

## Architecture

See `docs/architecture.md` for the full architecture document covering:
- Three packages (Core Toolkit, Brand Factory, Brand Packages)
- Four component categories (MCP Servers, Skills, Instruction Files, Data Files)
- The MCP stack (9 core + 1 optional across Design, Build/Test, Deploy, Context phases)
- The skills stack (Impeccable 18 skills + engineering + Brand Factory)
- The `.brand/` directory structure and loading strategy
- The E2E pipeline (Design -> Build -> Test -> Deploy)
- Build plan (C1-C10 deliverables)

## Project Structure

```
packages/
  cli/              # xd-brand CLI (C2) — init, update, validate, doctor, score, upgrade
  core/             # Package 1: Core Toolkit skills + instruction file templates
  brand-factory/    # Package 2: Brand Factory skills
schema/
  brand/            # C1: .brand/ directory schema specification
extensions/
  ds-pack/          # Optional: Design System Ops (21 skills)
  designer-skills/  # Optional: Designer Skills Pack (63 skills, 8 plugins)
docs/
  architecture.md           # Full architecture & workflow document
  testing-and-scenarios.md  # Testing strategy & agency scenarios (A/B/C/D)
```

## Build Order

Custom deliverables (C1-C10) are built in three phases:
1. **Foundation** — C1 (.brand/ schema), C2 (CLI init), C3 (instruction templates), C9/C10 (docs + doctor)
2. **Brand Factory** — C4-C8 (extract, analyze, score, audit, refresh skills)
3. **Distribution** — Public repo setup, practitioner docs, extension packaging

## Key Conventions

- Skills are markdown files that travel with client project repos
- `.brand/` contains structured data (markdown + JSON), never executable code
- MCPs are installed per-practitioner, skills per-project
- Impeccable reads `.impeccable.md` (auto-generated from `.brand/overview.md`) — no fork needed
- Token values live in markdown for agent readability, not JSON
