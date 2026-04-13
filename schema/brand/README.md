# .brand/ Schema Specification (C1)

This directory defines the schema for every file in a `.brand/` package — the structured brand intelligence that skills and instruction files reference during AI-assisted development.

## Tiered Completeness Model

Brand packages have three completeness tiers. Each tier is a superset of the previous.

| Tier | What's Included | When It's Enough |
|------|----------------|-----------------|
| **Minimum** | `overview.md` + `tokens/` + `voice.md` | Basic brand-aware generation. Agent knows the brand personality, can use correct colors/type/spacing, writes in the right voice. Enough for early prototyping. |
| **Standard** | Minimum + `components/` + `composition/` | Full page builds. Agent knows which components exist, how to compose layouts, what to avoid. Enough for production prototypes. |
| **Comprehensive** | Standard + `specs/` + `workflows/` | Full pipeline coverage. Agent has deterministic component specs, knows the exact build/deploy/QA workflow. Enough for production handoff. |

## Schema File Format

Each `.schema.md` file in this directory documents one `.brand/` file. Schemas use this structure:

- **File purpose** — what the file is for and when agents load it
- **Tier** — which completeness tier introduces this file
- **Sections** — the markdown sections expected in the file, with field definitions
- **Fields** use `(required)` or `(optional)` markers and specify expected content type
- **Examples** — short illustrative snippets

## Key Design Principle: Values Need Application Context

Token files must include **where and how** values are used, not just the values themselves. Agents make plausible but wrong decisions when given values without usage context (e.g., using brand red as a full-bleed background when it's meant for accents).

Every token schema file should have two layers:
1. **Application context** — where each value appears in the UI (backgrounds, text, accents, components)
2. **Technical constraints** — accessibility rules, hard limits, restrictions

This was validated in Layer 1 routing tests: color values + contrast ratios alone produced a full-bleed red hero (correct color, wrong application). Adding "red is for accents and CTAs, not section backgrounds" fixed the behavior.

## Directory Map

```
schema/brand/
├── README.md                          # This file
├── overview.schema.md                 # .brand/overview.md
├── voice.schema.md                    # .brand/voice.md
├── tokens-colors.schema.md            # .brand/tokens/colors.md
├── tokens-typography.schema.md        # .brand/tokens/typography.md
├── tokens-spacing.schema.md           # .brand/tokens/spacing.md
├── tokens-motion.schema.md            # .brand/tokens/motion.md
├── tokens-surfaces.schema.md          # .brand/tokens/surfaces.md
├── components.schema.md               # .brand/components/[name].md
├── composition-page-types.schema.md   # .brand/composition/page-types.md
├── composition-patterns.schema.md     # .brand/composition/patterns.md
├── composition-anti-patterns.schema.md # .brand/composition/anti-patterns.md
├── workflows-figma-to-code.schema.md  # .brand/workflows/figma-to-code.md
├── workflows-code-standards.schema.md # .brand/workflows/code-standards.md
├── workflows-deploy.schema.md         # .brand/workflows/deploy.md
├── workflows-qa-checklist.schema.md   # .brand/workflows/qa-checklist.md
├── changelog.schema.md                # .brand/CHANGELOG.md
└── brandrc.schema.md                  # .brandrc.yaml
```

## Loading Strategy

Only `overview.md` loads every session (~200 tokens via CLAUDE.md reference). Everything else loads on-demand when the agent recognizes a relevant task. This keeps baseline context cost minimal while ensuring brand intelligence is available when needed.

| Tier | Files | Loaded When |
|------|-------|-------------|
| Minimum | `overview.md` | Every session (CLAUDE.md reference) |
| Minimum | `voice.md` | Copywriting tasks |
| Minimum | `tokens/*.md` | Visual implementation |
| Standard | `components/*.md` | Working on that component |
| Standard | `composition/*.md` | Building new pages/views |
| Comprehensive | `workflows/*.md` | Specific workflow tasks |
| Comprehensive | `specs/*.spec.json` | Component implementation |
