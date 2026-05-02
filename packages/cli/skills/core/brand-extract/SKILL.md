---
name: brand-extract
description: Extract a structured brand package from a client's Figma file, live website, social profiles, brand-guide PDF, and reference screenshots — populating .brand/tokens/*.md, .brand/voice.md, .brand/overview.md, and regenerating design.md. Use when the user says "extract the brand", "/brand-extract", "build a brand package from these assets", "pull tokens from Figma", "analyze the voice", "summarize the brand from this PDF", or after running /new-project for the first time. Currently implements Phase 4 (token extraction from Figma + web, voice extraction from website + social + app stores, and multimodal analysis of brand-guide PDF + screenshots). Conflict detection and design-system repo scanning are the remaining stages of the full pipeline.
---

# /brand-extract — Phase 4 (tokens + voice + overview)

You are running the brand-extract skill to populate this project's `.brand/` package: `tokens/*.md` (from the client's Figma file when available + the live website), `voice.md` (from the live website + social profiles + app store listings), and `overview.md` (from brand-guide PDF + reference screenshots via multimodal vision).

**Phase 4 scope:** Stages 1, 2, 3, and 4. Stages 5–8 (conflicts, repo scan, .impeccable.md regen) are not yet implemented. Stop after Stage 4 and tell the user what's left for later phases.

The full design lives at `packages/brand-skills/skills/brand-extract/DESIGN.md` in the toolkit repo.

---

## 0. Pre-flight checks

Before doing anything else:

1. **Confirm `.brandrc.yaml` exists** at the project root. If not, tell the user: "I need a `.brandrc.yaml` first. Run `xd-toolkit init` or `/new-project`." Stop.
2. **Read `.brandrc.yaml`.** Note `client`, `tier`, `mode`, `sources.website`, `sources.figma`, `sources.figma_variable_collections`.
3. **If `sources.website` is missing**, ask the user: "What's the live website URL?" Save the answer back to `.brandrc.yaml` under `sources.website`.
4. **Check MCP availability:**
   - Run `claude mcp list`. Look for `figma-console` and `playwright`.
   - If `playwright` is missing or disconnected: tell the user how to fix (`xd-toolkit setup` or `claude mcp add playwright -s user -- npx -y @playwright/mcp@latest`). Stop.
   - If `figma-console` is missing or disconnected AND `sources.figma` is set: tell the user, but proceed — Stage 1 will be skipped.

## 1. Confirm scope with the practitioner

Tell the user what you're about to do, in one short paragraph:

> I'll extract design tokens for {client}. Sources: {website}, {figmaCount} Figma file(s){, plus N pages: ...}. This will populate `.brand/tokens/colors.md`, `.brand/tokens/typography.md`, `.brand/tokens/spacing.md`, and `.brand/tokens/surfaces.md`. Estimated time: 2–4 minutes. Continue?

If they decline, stop. Don't proceed without explicit confirmation.

## 2. Stage 1 — Figma variable extraction

Skip this stage if `sources.figma` is empty or `figma-console` MCP is unavailable. Log "Stage 1 skipped: no Figma source" and move to Stage 2.

For each Figma file ID in `sources.figma`:

1. Call `mcp__figma-console__figma_browse_tokens` (or `figma_get_variables` if the file is opened — try `figma_list_open_files` first to see what's accessible).
2. Filter to the collections in `sources.figma_variable_collections` if specified; otherwise extract all collections.
3. For each variable, resolve aliases to primitive values (use `figma_get_token_values` for resolved values).
4. Categorize variables into the four target groups:
   - **Colors** — type COLOR. Output as `<name>: "#RRGGBB"` (sRGB hex, lowercase or uppercase consistent within the file).
   - **Typography** — text styles or grouped variables (font family + size + weight + lineHeight + letterSpacing). Each typography token is a Typography object per the design.md spec.
   - **Spacing** — type FLOAT or NUMBER variables in spacing/sizing collections. Output as `<name>: <px-value>px` (or unitless number for ratios/columns).
   - **Surfaces** — separate radius variables (`<name>: <px>` under `rounded`) from effect styles (shadows → CSS box-shadow strings under `elevation`).
5. Normalize variable names to design.md-recommended conventions where reasonable (`primary-60` over `Primary/60`), but preserve the practitioner's naming if it's already sensible. Don't aggressively rename.

**Hold these results in memory** for Stage 4 (token file writing). Do not write yet.

## 3. Stage 2 — Web token extraction (always run)

This stage always runs when `sources.website` is set. Treat as supplementary to Stage 1 (or primary if Stage 1 was skipped).

1. Use Playwright MCP to navigate to `sources.website`. Take screenshots at desktop (1280px) and mobile (390px) widths.
2. Inject `getComputedStyle` queries via `mcp__playwright__browser_evaluate`. Sample these elements:
   - `body`, `h1`, `h2`, `h3`, `p`, `a`, `button` (preferably `button.primary` or `button[type="submit"]` if present)
   - First `header` and first `footer`
3. Capture the following per element:
   - `color`, `background-color` → color tokens
   - `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing` → typography tokens
   - `padding`, `margin`, `gap` (for flex/grid containers) → spacing tokens
   - `border-radius` → rounded tokens
   - `box-shadow` → elevation tokens
4. Sample dominant colors from the desktop screenshot — the top 6–8 most-used colors (excluding pure white, pure black, and transparency). Use `mcp__playwright__browser_evaluate` with a canvas-based pixel sampler if needed.
5. Normalize:
   - Convert any `rgb()`, `rgba()`, or `hsl()` color values to hex.
   - Convert font-size, padding, margin to px integers (drop `em`/`rem` for the frontmatter; preserve in prose if useful).
   - Group similar values to derive a scale (e.g., padding values cluster around 4, 8, 16, 32 → these become spacing scale steps).

**Reconcile with Stage 1 results:**
- If Stage 1 produced a token with the same role (e.g., "primary"), prefer the Figma value unless the web value materially differs (then it's a conflict — note for Stage 5 in a future phase, but don't write to `conflicts.md` yet; just include a note in the prose).
- If Stage 1 had no equivalent, add the web-derived token with a name inferred from its role (e.g., `surface-page`, `text-primary`).

## 4. Stage 3 — Voice extraction (always run when sources.website is set)

This stage scrapes user-facing copy from the live site, social profiles, and app store listings to produce `.brand/voice.md`. Run after Stages 1+2.

### 4a. Source list

Build the URL list from `.brandrc.yaml`:
- `sources.website` (homepage) and every entry in `sources.website_pages` (e.g., `/about`, `/products`, `/contact`, `/help`)
- Each platform under `sources.social.*` (twitter / x, instagram, linkedin, facebook, tiktok)
- Each entry under `sources.app_store.*` (ios, android)

If `sources.website` is missing, you should already have prompted for it in Stage 0. If still absent, skip Stage 3 with a note in the summary.

### 4b. Scrape copy samples (target: 30–50 total)

For each URL, use Playwright MCP. Don't reuse the screenshots from Stage 2 — voice extraction needs the rendered text content, not visuals.

For website / social pages:
1. `mcp__playwright__browser_navigate` to the URL
2. `mcp__playwright__browser_snapshot` to get the accessibility tree (preferred — gives semantic structure with role labels)
3. If snapshot is sparse, fall back to `mcp__playwright__browser_evaluate` with a script that walks `document.querySelectorAll('h1, h2, h3, [role="heading"], button, a, .cta, [aria-label], [class*="error"], nav a, footer a, .toast, .notice')` and returns `{tag, role, textContent, ariaLabel, className}` for each.

For app store listings: navigate, then capture the description block, "What's New" section, and short subtitle. Most app stores require minimal selector work.

For each captured string, classify and store:
- **Type** — exactly one of: `headline`, `cta`, `body`, `error`, `nav`, `microcopy`, `transactional`. Inference rules:
  - `headline` — H1/H2/H3 elements with role="heading", or hero text >= 24px font (you saw the type scale in Stage 2 — use it)
  - `cta` — `<button>`, `<a>` styled as button (class contains "btn"/"button"), `[role="button"]`, or anchor with imperative verb
  - `body` — paragraph elements, list items >= 5 words
  - `error` — anything in elements with class/data attribute containing "error", "alert", "warn", or aria-invalid
  - `nav` — anchors inside `<nav>`, header, or footer
  - `microcopy` — tooltips (`[role="tooltip"]`), placeholders, helper text under inputs, badges, captions
  - `transactional` — toast/notice/confirmation patterns, anything in `[role="status"]` or `[aria-live]`
- **Channel** — `website`, `social`, `app-store`, `email` (if email examples are uploaded — Phase 4 will handle uploads; for Phase 3 only website/social/app-store)
- **Source URL** — keep for citation in `voice.md` provenance comments

Stop scraping when you have ≥30 samples *or* you've exhausted the source list. Don't crawl indefinitely.

### 4c. Inference

From the corpus, derive:

- **Voice attributes** (3–5 adjectives) — what consistently shows up across types and channels (e.g., "direct", "warm", "wry"). Each attribute must be supported by at least 3 specific samples.
- **Voice anti-attributes** — what the brand explicitly avoids. Inferred from absences (no exclamation points anywhere → "Never overly enthusiastic") or contrasts with competitor patterns (don't speculate — anchor in evidence).
- **Tone by context** — sample at least 3 contexts from the type buckets (typically `error`, `transactional`, `cta` or `headline`). For each, give one or two real examples and a short tone descriptor.
- **Vocabulary** — preferred terms (words that recur with intent) and avoided terms (you can rarely prove a word is *avoided*, so use the absence cautiously — only flag avoided terms that the brand explicitly contrasts in marketing copy or that are obvious anti-patterns for the inferred voice).
- **Microcopy patterns** — patterns visible in the samples for buttons, errors, empty states. Cite real examples.
- **Channel deltas** — note material differences (e.g., "Twitter copy is shorter and more irreverent than the website").

### 4d. Confidence levels

Tag each major claim in `voice.md` with confidence based on supporting sample count:
- **HIGH** — ≥10 samples back the claim
- **MEDIUM** — 5–9 samples
- **LOW** — <5 samples

Express confidence inline in the prose where useful (e.g., "Voice is consistently warm and direct *(HIGH — 18 supporting samples across website + Twitter)*"), or in a small confidence-summary block at the top of `voice.md`.

### 4e. Sample threshold

If the total scraped samples is **<10**, do not generate inferred prose. Behavior depends on whether voice.md already has prescriptive content (see 4f):

- **Placeholder voice.md (case 1):** write a stub for the observed-voice section listing the captured samples verbatim and asking for more sources. Do not invent attributes from <10 samples.
- **Populated voice.md (cases 2/3):** append a sparse observed-voice section that includes only the Sources, Sample corpus, and a `> ⚠️ Insufficient samples (<10) — observed-voice claims withheld` note plus the raw sample list. Do not touch prescriptive sections.

In both cases, ask the practitioner to provide more sources before re-running:
- Additional `sources.website_pages` (deeper crawl of the live site)
- Brand voice document or style guide PDF (Stage 4 territory once it ships)
- Recent campaign decks, email examples, support templates

### 4f. Write to voice.md — additive only

**Stage 3 is descriptive, not prescriptive. It owns exactly one section: `## Observed Voice (live channels)`. It never modifies any other section of voice.md.**

This is different from token files. Tokens are values — replacing them is fine. Voice.md may already contain prescriptive guidance (voice principles, tone spectrum rules, vocabulary, microcopy patterns, writing rules) sourced from a brand guide, campaign toolkit, or earlier multimodal analysis. That content is authoritative and Stage 3 must preserve it.

**Three cases to handle:**

1. **voice.md is a placeholder** (contains `<!-- Fill this file following the schema at schema/brand/voice.schema.md -->` marker, or is empty/zero-bytes):
   Write the full file with prescriptive sections left as `<!-- TODO: populate from brand guide via Stage 4 (not yet implemented) -->` and the observed-voice section filled in from this stage.

2. **voice.md has prescriptive content but no observed-voice section** (most common case after earlier `/new-project` runs that synthesized prescriptive content from uploaded assets):
   Use `Edit` to **append** an `## Observed Voice (live channels)` section to the end of the file. Do not touch any existing section. Do not "merge" — keep prescriptive prose exactly as-is.

3. **voice.md already has an observed-voice section** (Stage 3 was run before):
   Use `Edit` to replace only the contents of the `## Observed Voice (live channels)` section. Use the `Edit` tool with the section's H2 line as part of `old_string` to scope the replacement. Do not touch other sections.

**Never use `Write` to overwrite voice.md when prescriptive content exists.** If you're unsure whether prescriptive content is present, read the file first and look for any of: `## Voice Principles`, `## Tone Spectrum`, `## Vocabulary`, `## Microcopy Patterns`, `## Writing Rules`. If any are present, you're in case 2 or 3 — use `Edit`, not `Write`.

**Section content per `schema/brand/voice.schema.md`:**

```markdown
## Observed Voice (live channels)

> Descriptive observations from live channels — complements (does not replace) the prescriptive guidance above. Captured by `/brand-extract` Stage 3 on YYYY-MM-DD.

**Sources:** {website pages}, {social platforms}, {app store listings}
**Sample corpus:** {N} samples — {breakdown by type} | {breakdown by channel}
**Confidence summary:** HIGH ({n}) · MEDIUM ({n}) · LOW ({n})

### Observed attributes
- **{attribute}** *(HIGH — {n} samples)* — {one-line characterisation with example}
- ...

### Observed tone by context
| Context | Observed tone | Example | Source |
|---|---|---|---|
| Error | ... | "..." | URL |
| CTA | ... | "..." | URL |
| ... |

### Channel deltas
- {Channel A vs. Channel B}: {observation}

### Divergences from prescriptive
> ⚠️ **Diverges from prescriptive:** Brand guide specifies sentence case for CTAs; observed live: title case ("Talk To a Pro") and mixed/all-caps H3s ("Lawn CARE PLANS"). Flag for Stage 5 conflict resolution.
```

Include the divergences subsection only when there are real divergences to surface. Otherwise omit it.

**Pitch mode** (when `mode: pitch`): inside the section, append a confidence-cap note: `> Pitch mode — confidence capped at MEDIUM.` Do not touch the file's top-level pitch disclaimer (if any) — that's owned by other stages.

**Provenance block** (only when writing the section for the first time, case 1 or 2): immediately after the `## Observed Voice (live channels)` content, before any subsequent section, place:

```markdown
<!--
Observed Voice section generated by /brand-extract Stage 3 on YYYY-MM-DD.
Sources: {websites}, {social platforms}, {app store listings}.
Total samples: N (HIGH ≥10 · MEDIUM 5-9 · LOW <5).
This section is regenerated on each Stage 3 run; the rest of voice.md is preserved.
-->
```

## 5. Write token files

**Scope:** This section applies only to the four token files: `.brand/tokens/colors.md`, `tokens/typography.md`, `tokens/spacing.md`, `tokens/surfaces.md`. **It does not apply to `voice.md`** — that's owned by Section 4f's additive-only policy. Do not prompt the practitioner with overwrite/merge/skip options for voice.md.

### 5a. Apply the overwrite policy

Read the existing file. If it contains the placeholder marker `<!-- Fill this file following the schema at schema/brand/...schema.md -->`, the file is untouched scaffolding — overwrite without asking.

If the marker is **absent** and the file has content beyond just frontmatter, ask the user:
> `tokens/colors.md` has been edited. **Overwrite** (replace entirely), **merge** (refresh the YAML frontmatter, keep your prose), or **skip** (leave alone)?

Default to **skip** if the user is ambiguous. Only proceed when explicit.

### 5b. Generate the file content

Build the file as: YAML frontmatter (between `---` delimiters) + a markdown body.

**Frontmatter:** the relevant token map for that file:
- `colors.md` → `colors:` map (hex strings only)
- `typography.md` → `typography:` map (Typography objects)
- `spacing.md` → `spacing:` map (Dimensions or unitless numbers)
- `surfaces.md` → `rounded:` and `elevation:` maps

Example frontmatter for `tokens/colors.md`:

```yaml
---
colors:
  primary: "#E2231A"
  primary-dark: "#C1190F"
  neutral-900: "#1A1A1A"
  neutral-50: "#F8F8F8"
  white: "#FFFFFF"
  error: "#D32F2F"
---
```

**Body:** start with a one-line provenance comment, then the schema-prescribed sections with content derived from extraction:

```markdown
<!-- Generated by /brand-extract on {YYYY-MM-DD}. Sources: Figma file abc123, https://example.com -->

# Color System

## Philosophy
{2–3 sentences inferred from the brand. If you can't infer, write a placeholder: "TODO: describe how color functions in this brand."}

## Primary Palette
| Token | Hex | Source |
|-------|-----|--------|
| `primary` | #E2231A | Figma `Color/Primary/Default` + verified on web (#E2231A) |
| ... |

## Application Context
{If you observed real usage on the website, describe it: "On wendys.com, primary red appears as: CTA buttons, badges, and navigation accents — not as full-section backgrounds."}

<!-- Sections like "Dark Mode" omitted — no source data. /brand-audit will flag missing sections. -->
```

Apply the same shape to `typography.md`, `spacing.md`, `surfaces.md` per their schemas in `schema/brand/`.

### 5c. Pitch mode

If `mode: pitch` in `.brandrc.yaml`, prepend the disclaimer:

```
> ⚠️ **PITCH MODE** — derived from public sources only. Not validated against internal brand standards.
```

### 5d. Write the file

Use the `Write` tool to write the full content. Do not use `Edit` — token files are regenerated wholesale.

## 6. Stage 4 — Multimodal analysis (overview.md)

This stage reads brand-guide PDFs, reference screenshots, and the website screenshots already captured by Stage 2 to populate `.brand/overview.md` — brand identity, personality, audience, visual language, competitive context, aesthetic anti-patterns, and the brand self-test.

Run this stage when **any** of these inputs are present:
- `sources.brand_guide` (path to a PDF, relative to project root)
- `sources.screenshots` (paths to reference images)
- Stage 2 captured at least one website screenshot (always true if Stage 2 ran)

If none of those are present, skip Stage 4 with a clear note and leave `overview.md` as the placeholder.

### 6a. Read the inputs

Use the `Read` tool — it handles PDFs and images natively.

- **Brand guide PDF.** If `sources.brand_guide` is set, read up to 20 pages. Prioritize: cover, executive summary, mission/positioning, brand voice, visual identity, color, typography, photography, anti-patterns, do/don't pages. Use the `pages` parameter to read in batches if the PDF is long; do not read all 20 pages at once if you can target the key ones.
- **Reference screenshots.** Read each path under `sources.screenshots` (cap at 10 — if more are listed, ask the practitioner which ones matter most).
- **Web screenshots.** Read the top 3 captured by Stage 2 (homepage desktop + mobile, plus the most content-rich landing page from `sources.website_pages`).

If the PDF is encrypted, corrupt, or fails to read, log "Stage 4: brand-guide PDF unreadable — falling back to screenshots only" and continue with whatever screenshots are available.

### 6b. Extract per overview.md schema

Synthesize content for each required section of `schema/brand/overview.schema.md`. Anchor every claim in specific source material — cite page numbers for the PDF, filenames for screenshots, URLs for web captures.

**Brand Identity:**
- Brand name, tagline, one-sentence positioning. The brand guide is authoritative; cross-check against the website hero copy.

**Brand Personality:**
- 3–5 trait adjectives. Each trait must appear in the brand guide either explicitly named or inferable from a personality description / tone-of-voice section.
- Archetype if the guide names one (Jungian or otherwise). Do not invent.
- 2–3 sentence description expanding on the traits.

**Audience:**
- Primary audience (demographics, psychographics, or behavioral description) — usually in a "who we serve" / "target audience" / "user" section of the guide.
- Optional secondary audiences.
- Audience context (insight that influences design).
- Key use cases (the jobs users are getting done).

**Visual Language:**
- Direction (2–3 sentences on the visual approach). Read the visual identity section of the guide and cross-check against website screenshots.
- 3–5 design principles, taken verbatim from the guide where possible.
- Signature elements (distinctive visual hooks unique to this brand — see the guide's "key elements" section, plus what's actually visible on the website).

**Competitive Context:**
- Differentiation: how the brand positions vs. competitors.
- Avoid-resemblance-to: specific brands or styles to not look like (the guide often calls these out explicitly).
- **Aesthetic anti-patterns:** what the brand explicitly rejects. Mix the guide's stated rejections with inference from personality (e.g., a "confident, direct" brand is NOT "tentative, hedging"). Frame as `NOT corporate minimalist (too sterile)`, `NOT retro nostalgic (too backward-looking)`, etc.

**Brand self-test (5–10 yes/no questions):**
- Generate from the personality traits, visual direction, signature elements, and anti-patterns.
- The first question is always: `Could this screen belong to a competitor? (should be NO)`.
- The last question should be an overall feel check tied to visual atmosphere.
- Each question must be falsifiable — a "no" answer means something specific needs to change.

### 6c. Citation style

Inline citations make the prose auditable and trustworthy. Use lightweight footnote-style references:

```markdown
**Personality traits:** Bold, playful, irreverent, confident, witty *(per p. 4 of brand-guide.pdf and the consistent voice across @Wendys Twitter samples)*.
```

For the source list at the bottom of `overview.md`, cite explicitly:

```markdown
<!--
Generated by /brand-extract Stage 4 on YYYY-MM-DD.
Sources:
- brand-guide.pdf (pages 1, 4, 7, 12-14, 22)
- assets/screenshot-hero-desktop.png
- web capture: https://wendys.com (desktop + mobile)
-->
```

### 6d. Apply overwrite policy

`overview.md` is a single coherent document, not split prescriptive vs. descriptive like voice.md. Use the same overwrite policy as token files (Section 5a):

- **Placeholder marker present** (`<!-- Fill this file following the schema at schema/brand/overview.schema.md -->`) — overwrite without prompting.
- **Empty file** — overwrite without prompting.
- **Populated, no marker** — prompt: **overwrite** / **merge** / **skip**. For merge, regenerate only the brand self-test block (it has the clear `## Brand self-test` heading delimiter); preserve all other prose.

When in doubt, default to **skip** and leave the file alone.

### 6e. Pitch mode

In pitch mode (`mode: pitch`), prepend the disclaimer block to `overview.md`:

```markdown
> ⚠️ **PITCH MODE** — derived from public sources only. Not validated against internal brand standards.
```

Cap inferred confidence: if a personality trait or audience claim relies on inference (rather than a direct guide quote), note it inline as `*(inferred from public materials)*`.

### 6f. Write the file

Use the `Write` tool when overwriting (or scaffolding from placeholder). Use `Edit` when merging. Build the file per `schema/brand/overview.schema.md`. The Wendy's fixture at `tests/fixtures/wendys/.brand/overview.md` shows the target shape and citation density.

After writing, verify the file is no longer the placeholder by checking that the brand identity, personality, and visual language sections are populated.

## 7. Regenerate design.md (required — do not skip)

After all four token files are written, regenerate `design.md` at the project root. **This is a required step, not optional.** `design.md` is a self-contained, spec-compliant artifact (per https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) — it inlines the actual token values in the YAML frontmatter so external tools can read them. Without this step, `design.md` stays the empty skeleton from `init` and the extraction work is invisible to spec consumers.

Use the dedicated CLI command — it's deterministic and avoids hand-building the file:

```bash
xd-toolkit refresh-design
```

Run it via the `Bash` tool. The command reads `.brand/` and overwrites `design.md`. It exits 0 on success and prints the brand directory it used.

If `xd-toolkit refresh-design` is unavailable (older toolkit version on the practitioner's machine), fall back to building `design.md` inline: read each `.brand/` file, merge the `colors` / `typography` / `spacing` / `rounded` / `elevation` frontmatter blocks into a single design.md frontmatter, then assemble the body sections (Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's and Don'ts) per the spec.

After regeneration, verify the file is no longer the placeholder by checking that the frontmatter contains at least one populated token map.

## 8. Final summary

Post a message to the user with:

- **Token counts:** how many color tokens, typography tokens, spacing tokens, surface tokens were extracted
- **Voice corpus:** total samples, breakdown by type (headlines / CTAs / body / errors / nav / microcopy / transactional) and channel (website / social / app-store), plus HIGH / MEDIUM / LOW claim counts
- **Overview sources:** brand-guide PDF (yes/no, page count read), reference screenshots (count), web screenshots (count). Confidence note if PDF was absent.
- **Sources used (overall):** Figma (yes/no, which files), web pages crawled, social platforms, app stores, PDFs, screenshots
- **Files written:** four token files + `voice.md` + `overview.md` + `design.md`
- **Files skipped:** if any (with reason)
- **Stage status:** Stage 1 / Stage 2 / Stage 3 / Stage 4 — ran / skipped / partial / stub
- **What's next:** "Phase 4 covers tokens, voice, and overview. Conflict detection (`conflicts.md`) and design-system repo scanning are the remaining stages. Run `/brand-check` to see overall completeness."

Be concise. The summary is one short message, not a wall of text.

## Failure handling

| Failure | What to do |
|---|---|
| `claude mcp list` errors | Tell the user setup may be incomplete. Stop. |
| Figma file private (Stage 1) | Skip Stage 1, note in summary, continue with Stage 2 |
| Playwright blocked by CAPTCHA / login wall (Stage 2) | Stop Stage 2, ask user for screenshots. Stage 4 can use those. |
| Stage 3: a social URL is private/login-walled | Skip that one source, continue with the rest. Note in summary. |
| Stage 3: total samples <10 | Write the stub `voice.md` per Section 4e. Don't infer. Ask for additional sources. |
| Stage 3: snapshot returns sparse content (SPA with delayed render) | Wait 2 seconds via `mcp__playwright__browser_wait_for`, retry once. If still sparse, fall back to `browser_evaluate` selector script. |
| Stage 4: brand-guide PDF unreadable (encrypted, corrupt) | Note it in summary. Continue with screenshots only. Lower confidence. |
| Stage 4: PDF >20 pages | Read the prioritized pages (cover, mission, voice, visual identity, anti-patterns). Ask the practitioner if specific pages matter that you didn't read. |
| Stage 4: no PDF, no screenshots, no Stage 2 captures | Skip Stage 4. Leave overview.md as placeholder. Ask the practitioner to provide a brand guide or screenshots. |
| Stage 4: practitioner has hand-curated `overview.md` already | Default to skip. Only merge if explicitly requested — and merge replaces only the brand self-test block. |
| All stages fail | Don't write any files. Tell the user what failed and what to fix. |
| Practitioner says "skip" on overwrite for a file | Honor it — leave that file alone, write the others |
| Conflict between Figma and web token values | Use Figma value; mention the web value in the prose with a note. Real conflict resolution is Phase 5. |
| Overview claim contradicts a token value | Surface inline in overview.md prose. Real conflict resolution is Phase 5. |

## Phase 4 scope reminder

Implemented in this phase:
- Stage 1: Figma → tokens
- Stage 2: Web → tokens (always run when website is set)
- Stage 3: Voice extraction (always run when website is set; uses social and app-store sources when present)
- Stage 4: Multimodal analysis → overview.md (always run when at least one of: brand-guide PDF, reference screenshots, or Stage 2 web screenshots is available)
- Token files + voice.md + overview.md writing with overwrite policy
- design.md regeneration

**Not yet implemented** (do not attempt):
- Stage 5: Conflict detection (`conflicts.md`)
- Stage 6: Design-system repo scan (`components/`)
- Stage 8: `.impeccable.md` regeneration

If the user asks for any of these, say: "That lands in a later phase of /brand-extract. For now, /brand-extract handles tokens and voice. The other files in `.brand/` need to be filled manually or wait for the next phase."
