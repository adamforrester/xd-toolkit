---
name: brand-extract
description: Extract a structured brand package from a client's existing assets — Figma files, live website, social profiles, brand-guide PDF, and reference screenshots — and write the results into the project's `.brand/` directory and a spec-compliant `design.md`. Use when starting a new client project, when `.brand/` files are empty placeholders, when the practitioner says "extract the brand", "analyze this brand", "build a brand package from these assets", or after running `/new-project` for the first time.
---

# /brand-extract

> **Status:** Spec — implementation in progress. This file defines what the skill should do; the prompts and orchestration logic land in this directory as it's built.

Build a complete `.brand/` package and a spec-compliant `design.md` from the inputs declared in `.brandrc.yaml`, plus any assets the practitioner uploads. The output respects the project's tier (minimum / standard / comprehensive).

## When to invoke

- Practitioner runs `/new-project` and reaches Phase 4 (extraction).
- Practitioner explicitly invokes `/brand-extract` in an existing project.
- `/brand-check` reports missing or empty token / voice / overview files and the practitioner accepts the offer to fill them.

Do **not** invoke this skill automatically on every message. Extraction is expensive (multiple MCP calls, vision analysis, web scraping) and overwrites files. It must be a deliberate practitioner action.

## Inputs

Read in this order. Every input is optional individually, but at least one source must be present. **Assume the practitioner has a website** — if `sources.website` isn't set, prompt for it before doing anything else. Figma is conditional (often missing for new or prospective clients).

1. **`.brandrc.yaml`** — primary configuration:
   - `sources.website` + `sources.website_pages` → Playwright targets *(assumed; prompt if missing)*
   - `sources.figma` (file IDs) → Figma Console MCP targets *(optional; absent for new/prospect clients)*
   - `sources.figma_variable_collections` → narrows variable extraction
   - `sources.live_urls` → Layout CLI targets (optional, for CSS-derived tokens when Figma access is unavailable)
   - `sources.social.*` → Playwright targets for voice samples
   - `sources.app_store.*` → Playwright targets for voice samples (descriptions, what's-new copy)
   - `sources.brand_guide` → path to PDF for multimodal analysis
   - `sources.screenshots` → paths to reference imagery for multimodal analysis
   - `sources.design_system_repo` → string. Local path (e.g., `./packages/design-system`) or remote git URL (e.g., `https://github.com/client/design-system`). Used in Stage 6 (comprehensive tier) to extract real component implementations.
2. **Project tier** from `.brandrc.yaml` `tier` field (`minimum` / `standard` / `comprehensive`) — controls which `.brand/` files are populated.
3. **Mode** from `.brandrc.yaml` `mode` field (`standard` / `pitch` / `comprehensive`) — `pitch` mode is public-sources-only; flag every output file with the pitch disclaimer.
4. **Practitioner-provided assets** uploaded into the project root or referenced in conversation (PDFs, images, additional URLs).

If `.brandrc.yaml` has no sources, prompt the practitioner once for: website URL, Figma URL (optional), and any local brand assets. Then write the answers back to `.brandrc.yaml`.

## Pipeline

Run stages in order. Each stage is independently testable; if a stage fails, log what failed and continue — partial extraction is better than no extraction. Surface every failure to the practitioner at the end.

### Stage 1: Figma variable extraction → token files

**Tool:** Figma Console MCP (`mcp__figma-console__figma_get_variables`, `figma_get_token_values`, `figma_browse_tokens`).

**Output files:**
- `.brand/tokens/colors.md` (frontmatter `colors`, prose pulled from variable descriptions)
- `.brand/tokens/typography.md` (frontmatter `typography`, font sources noted in prose)
- `.brand/tokens/spacing.md` (frontmatter `spacing`)
- `.brand/tokens/surfaces.md` (frontmatter `rounded` and `elevation`)

**Mapping rules:**
- Color variables → `colors` map. Hex strings only (sRGB). If a Figma variable resolves to a Color collection alias, follow the alias to its primitive value.
- Typography variables (font family, size, weight, lineHeight, letterSpacing) → `typography` map. Group related Figma styles into design.md Typography objects.
- Spacing / sizing number variables → `spacing` map. Convert px to px-unit Dimensions; preserve unitless ratios as numbers.
- Border-radius variables → `rounded` map.
- Effect styles (shadows) → `elevation` map. Translate Figma effect to CSS box-shadow string.

**Fallback:** If Figma access fails (no token, file private, MCP disconnected), skip to Stage 2 and rely on Layout CLI / Playwright for token inference. Mark token files with `<!-- Source: inferred from web (no Figma access) -->`.

### Stage 2: Web token extraction (always run)

**Tool:** Playwright MCP — navigate to `sources.website`, capture computed CSS, screenshot at desktop + mobile.

**Always runs** when `sources.website` is set. Treat as supplementary when Stage 1 succeeded; treat as primary when Stage 1 was skipped or failed. Surfaces real web behavior either way — useful even with a healthy Figma source because Stage 5 (conflict detection) compares them.

**Method:**
- Inject `getComputedStyle` queries on representative elements (h1, h2, p, body, button.primary, etc.).
- Sample colors from screenshots — top 8 most-used colors via pixel sampling.
- Capture font-family stacks (extract first declared family).

**Output:** Augment frontmatter from Stage 1, or write fresh if Stage 1 was skipped.

### Stage 3: Voice extraction → `voice.md`

**Tool:** Playwright MCP — navigate to `sources.website` + `sources.social.*` + `sources.app_store.*`.

**Method:** Scrape and classify 30–50 copy samples grouped by:
- **Type:** headlines, CTAs, body, error messages, navigation labels, microcopy, transactional (confirmations, receipts).
- **Channel:** website, social, app store, email (if `sources.email_examples` provided).

**Inference:**
- Tone descriptors derived from samples (formal / casual / playful / authoritative / warm / direct).
- Voice traits (3–5 adjectives that recur across samples).
- Channel-specific deltas (e.g., "more irreverent on Twitter than on the website").
- Confidence level per claim (HIGH if ≥10 samples support it, MEDIUM 5–9, LOW <5 — surface explicitly in prose).

**Output:** `.brand/voice.md` per the schema. Reference example: `tests/fixtures/wendys-voice-extraction-example.md`.

**Fallback:** If samples drop below 10 total, skip prose generation. Write a stub with the samples that were captured and ask the practitioner to provide additional copy sources (uploaded brand voice doc, email exports, recent campaign decks).

### Stage 4: Multimodal analysis → `overview.md`

**Tool:** Native vision (read PDF pages and screenshots directly via the `Read` tool).

**Inputs:**
- `sources.brand_guide` PDF (read up to 20 pages; prioritize cover, mission/positioning, voice, visual identity, anti-patterns).
- `sources.screenshots` (up to 10 images).
- Top 3 screenshots captured by Stage 2 from the website.

**Output:** `.brand/overview.md` per the schema. Sections to fill:
- Brand Identity (name, tagline, positioning)
- Brand Personality (traits, archetype, description)
- Audience (primary, secondary, context, key use cases)
- Visual Language (direction, principles, signature elements)
- Competitive Context (differentiation, avoid-resemblance-to, **aesthetic anti-patterns**)
- **Brand self-test** (5–10 yes/no questions, generated from personality + visual direction + anti-patterns)

**Inference quality bar:** every claim must trace to specific source material. Cite the source inline (e.g., "*Bold, playful, irreverent — per page 4 of the brand guide and the consistent voice on @Wendys Twitter*").

### Stage 5: Conflict detection

**Tool:** Pure reasoning over Stages 1–4 outputs.

**Method:** Identify contradictions between sources:
- **Genuine conflicts:** brand guide says one thing, the live site does another (e.g., guide specifies `#E2231A`, site uses `#FF0000`). Flag for practitioner resolution.
- **Digital adaptations** (NOT conflicts): brand guide prescribes a display font; site uses a similar body font for performance reasons. Document as intentional adaptation in `tokens/typography.md` "Usage by Medium".
- **Voice deltas across channels:** social is irreverent, website is professional. Document in `voice.md` "Channel deltas". Not a conflict.

**Source authority hierarchy** (when resolution is needed):
1. Practitioner-provided live brand guide (PDF, recent)
2. Figma variables (if maintained by the brand team)
3. Live website CSS (current behavior)
4. Social profiles (often more relaxed, brand-relevant for tone but not tokens)

**Output:** `.brand/conflicts.md` (standard tier and above). Lists each conflict with:
- What conflicts (sources A vs. B)
- Severity (token-level, voice-level, structural)
- Recommended resolution per the source authority hierarchy
- Status (`unresolved` / `resolved-with-rationale` / `intentional-adaptation`)

If no conflicts, write a one-line file: "No conflicts detected as of {date}."

### Stage 6: Design-system repo scan (comprehensive tier only)

**Tool:** Native `Read` over a local path or shallow `git clone` of a remote repo, then file-pattern analysis.

**Trigger:** `sources.design_system_repo` is set AND tier is `comprehensive`.

**Method:**
- For local paths: read directly. For remote URLs: shallow-clone (`git clone --depth 1`) to a temp directory; clean up after.
- Scan for and inventory:
  - `tokens/` directory or `tokens.json` / `tokens.yaml` / `*.tokens.json` files → cross-check against Stage 1+2 tokens (potential conflict source).
  - Component source files (typical patterns: `src/components/*/`, `packages/*/src/`, `lib/components/*/`). Identify component names, prop signatures (TypeScript or PropTypes), and any associated stories (`*.stories.tsx`).
  - `package.json` to detect component-library dependencies (e.g., `@radix-ui/*`, `react-aria`, internal `@client/ds`).
  - `figma.config.*` (Figma Code Connect mappings) → links Figma component IDs to source files.
  - Storybook config (`.storybook/main.ts`) → confirms Storybook MCP can be used.

**Output:** For each component discovered, write a `.brand/components/<name>.md` with:
- Component purpose (inferred from name + props + JSDoc/TSDoc if present)
- Prop API summary
- Source file path (so agents can find it)
- Storybook URL pattern if Storybook is configured
- Any Code Connect mapping

**Important:** This stage **describes** what exists; it does not audit quality, completeness, or DS conformance. That's a DS Pack concern. The output is "what components live in this repo" — agents working on visual implementation use it to know what to reuse instead of re-inventing.

**Fallback:** If the path is invalid, clone fails, or no recognizable component patterns are found, skip the stage and log "design system repo scan: no components detected" to the summary. Don't error.

### Stage 7: Generate `design.md`

**Tool:** `generateDesignMd()` utility (Phase B, already shipped).

Re-run the generator after Stages 1–6 complete to produce the spec-compliant `design.md` at project root.

### Stage 8: Update `.impeccable.md`

Regenerate `.impeccable.md` from the new `overview.md` so the Impeccable skill picks up brand context immediately.

## Overwrite policy

`/brand-extract` writes into `.brand/` files that may already exist. Behavior depends on whether the file is still a placeholder.

**Detection:** placeholder files contain the marker `<!-- Fill this file following the schema at schema/brand/...schema.md -->` written by `xd-toolkit init`. While that marker is present, treat the file as untouched scaffolding.

| File state | Behavior |
|---|---|
| Placeholder marker present | Overwrite without prompting — that's the marker's purpose |
| File is empty (zero bytes) | Overwrite without prompting |
| Marker absent, file populated | Prompt: **overwrite** (blow away current contents), **merge** (preserve prose, refresh structured parts), or **skip** (leave file alone, only regenerate `design.md` from current contents) |

**What "merge" means per file type:**
- **Token files** (`.brand/tokens/*.md`): replace YAML frontmatter with new values; keep existing prose. Tokens are structured; prose is editorial.
- **`overview.md`**: keep existing prose; replace only the brand self-test block (it has a clear `## Brand self-test` heading delimiter).
- **`voice.md`**: append new samples under a "Latest extraction ({date})" subsection; don't touch existing prose.
- **`conflicts.md`**: append new conflicts; mark previously-resolved entries as "still applies" or "resolved (verify)" based on whether the conflict re-surfaced.

When in doubt, default to **skip** — destructive operations should require explicit confirmation. The practitioner can always re-run with `--overwrite` for a clean rebuild.

## Outputs by tier

| File | minimum | standard | comprehensive |
|---|:-:|:-:|:-:|
| `.brand/overview.md` | ✓ | ✓ | ✓ |
| `.brand/voice.md` | ✓ | ✓ | ✓ |
| `.brand/tokens/colors.md` | ✓ | ✓ | ✓ |
| `.brand/tokens/typography.md` | ✓ | ✓ | ✓ |
| `.brand/tokens/spacing.md` | ✓ | ✓ | ✓ |
| `.brand/tokens/surfaces.md` | ✓ | ✓ | ✓ |
| `.brand/tokens/motion.md` | — | ✓ | ✓ |
| `.brand/composition/anti-patterns.md` | — | ✓ | ✓ |
| `.brand/conflicts.md` | — | ✓ | ✓ |
| `.brand/composition/page-types.md` | — | — | ✓ |
| `.brand/composition/patterns.md` | — | — | ✓ |
| `.brand/components/` | — | — | ✓ (populated by Stage 6 from `sources.design_system_repo`; if no repo provided, left empty for DS Pack to fill later) |
| `design.md` (root) | ✓ | ✓ | ✓ |
| `.impeccable.md` (root) | ✓ | ✓ | ✓ |

## MCP and tool usage

| Tool | Stage | Required? |
|---|---|---|
| Figma Console MCP | 1, 2 | No (graceful fallback to web-only) |
| Playwright MCP | 2, 3 | Yes (without it, only multimodal analysis can run) |
| Layout CLI | 2 | No (optional; supplements Playwright if installed) |
| Multimodal vision (`Read` on PDFs/images) | 4 | No (skipped if no PDFs/screenshots provided) |
| `git` + `Read` (design system repo scan) | 6 | No (only runs when `sources.design_system_repo` is set and tier is comprehensive) |
| Firecrawl MCP | 3 | No (Playwright is default) |

specs CLI is intentionally out of scope — that's a DS Pack concern.

## Failure modes and fallbacks

| Failure | Fallback |
|---|---|
| `.brandrc.yaml` has no sources | Prompt practitioner once, write answers back to file |
| Figma file private / no token | Skip Stage 1, mark tokens as web-inferred |
| Playwright blocked by site (CAPTCHA, login wall) | Ask practitioner to upload screenshots; treat as Stage 4 input |
| Figma MCP disconnected | Skip Stage 1; surface "Figma extraction unavailable — `claude mcp list` shows it disconnected" |
| Brand guide PDF >20 pages | Read first 20; prompt practitioner to specify which additional pages matter |
| Voice samples <10 | Stub `voice.md` with what was captured; ask practitioner for additional sources |
| Stage 1 produces conflicting hex values for "primary" | Stage 5 records as a conflict; choose Figma value as default, flag for review |
| All sources fail | Write skeleton `.brand/` files with a banner explaining what failed and what the practitioner can provide |

## Practitioner interaction points

The skill should be conversational at three checkpoints, not running fully silently:

1. **Before extraction starts.** Confirm scope: "I'll extract from {websiteUrl}, {figmaCount} Figma file(s), and {socialCount} social profile(s). Estimated time: {n} minutes. Continue?"
2. **At the end of Stage 1+2.** Show extracted token summary. Ask: "These tokens look right? Any to remove or rename before I write the files?"
3. **At the end of Stage 5 (conflicts).** Walk through each conflict. Get explicit resolution per item. Update `.brand/conflicts.md` with practitioner decisions.

Other stages run autonomously and log progress.

## Pitch mode

When `mode: pitch`:
- Prepend the pitch disclaimer (`> ⚠️ **PITCH MODE**...`) to every generated `.brand/` file.
- Skip Stage 5 conflict resolution (no internal access to resolve; just flag).
- Add a line to `.brand/overview.md` Audience section: "Inferred from public sources only — validate before client meetings."
- Cap inferred confidence at MEDIUM in `voice.md`.

## Done criteria

- Every required file for the tier has been written or explicitly stubbed with a reason.
- `design.md` has been regenerated.
- `.impeccable.md` has been regenerated.
- The practitioner has resolved or acknowledged every conflict in `.brand/conflicts.md`.
- A summary message has been posted with: tokens extracted (counts), voice samples (counts by channel), files written, files skipped (with reasons), conflicts surfaced.

## Build sequence (implementation, not user-facing)

For the team building this skill, ship in order — each phase is testable end-to-end with the previous phases:

1. **Phase 2** (~2 days) — Stage 1 (Figma → tokens) + Stage 2 (always-run web token extraction). Practitioner can `/brand-extract` and get filled token files. Other `.brand/` files remain placeholders.
2. **Phase 3** (~1 day) — Stage 3 (voice scraping). Adds `voice.md`.
3. **Phase 4** (~1 day) — Stage 4 (multimodal). Adds `overview.md`.
4. **Phase 5** (~half day) — Stage 5 (conflict detection) + Overwrite policy enforcement + Stage 7/8 wiring. Full base pipeline.
5. **Phase 6** (~1 day) — Stage 6 (design system repo scan). Comprehensive tier only. Last because it depends on the rest of the pipeline being solid.

Total: ~5.5 days, gated by phase. Each phase ships a usable increment.

The `brand-coherence-factory` skill (early version, third-party) can be referenced for prompt patterns during Phases 4 and 3, but its single-file output isn't a target — `.brand/` is the structured destination.
