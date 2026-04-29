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

Read in this order. Every input is optional individually, but at least one source must be present.

1. **`.brandrc.yaml`** — primary configuration:
   - `sources.website` + `sources.website_pages` → Playwright targets
   - `sources.figma` (file IDs) → Figma Console MCP targets
   - `sources.figma_variable_collections` → narrows variable extraction
   - `sources.live_urls` → Layout CLI targets (optional, for CSS-derived tokens when Figma access is unavailable)
   - `sources.social.*` → Playwright targets for voice samples
   - `sources.app_store.*` → Playwright targets for voice samples (descriptions, what's-new copy)
   - `sources.brand_guide` → path to PDF for multimodal analysis
   - `sources.screenshots` → paths to reference imagery for multimodal analysis
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

### Stage 2: Web token extraction (fallback / supplement)

**Tool:** Playwright MCP — navigate to `sources.website`, capture computed CSS, screenshot at desktop + mobile.

**Goal:** Fill gaps Stage 1 didn't cover. If Figma was the source of truth, Stage 2 supplements (e.g., capture actual web type sizes vs. Figma values for reconciliation). If Figma was unavailable, Stage 2 is the primary token source.

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

### Stage 6: Generate `design.md`

**Tool:** `generateDesignMd()` utility (Phase B, already shipped).

Re-run the generator after Stages 1–5 complete to produce the spec-compliant `design.md` at project root.

### Stage 7: Update `.impeccable.md`

Regenerate `.impeccable.md` from the new `overview.md` so the Impeccable skill picks up brand context immediately.

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
| `.brand/components/` | — | — | ✓ (specs derived from Figma component anatomy via DS Pack if available; otherwise empty) |
| `design.md` (root) | ✓ | ✓ | ✓ |
| `.impeccable.md` (root) | ✓ | ✓ | ✓ |

## MCP and tool usage

| Tool | Stage | Required? |
|---|---|---|
| Figma Console MCP | 1, 2 | No (graceful fallback to web-only) |
| Playwright MCP | 2, 3 | Yes (without it, only multimodal analysis can run) |
| Layout CLI | 2 | No (optional; supplements Playwright if installed) |
| Multimodal vision (`Read` on PDFs/images) | 4 | No (skipped if no PDFs/screenshots provided) |
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

1. **Phase 2** (~2 days) — Stage 1 (Figma → tokens) only. Practitioner can `/brand-extract` and get filled token files. Other files remain placeholders.
2. **Phase 3** (~1 day) — Stage 3 (voice scraping). Adds `voice.md`.
3. **Phase 4** (~1 day) — Stage 4 (multimodal). Adds `overview.md`.
4. **Phase 5** (~half day) — Stage 5 (conflict detection) + Stage 6/7 wiring. Full pipeline.

The `brand-coherence-factory` skill (early version, third-party) can be referenced for prompt patterns during Phases 4 and 3, but its single-file output isn't a target — `.brand/` is the structured destination.

## Open questions

1. Should Stage 2 web extraction always run, or only as fallback when Figma is missing? (Current spec: always run, treat as supplement.)
2. How aggressive should Stage 4 be about overwriting an existing populated `overview.md` vs. merging? (Default: warn before overwrite, ask practitioner.)
3. Should pitch-mode extraction skip Figma entirely (since pitch typically means no client access), or attempt and fall back? (Current spec: attempt and fall back.)
4. For comprehensive tier `components/` — should we attempt anything from the Figma file structure, or leave it for DS Pack to fill via specs CLI? (Current spec: leave for DS Pack.)

Resolve these before Phase 2 begins.
