---
name: brand-extract
description: Extract a structured brand package from a client's Figma file, live website, social profiles, brand-guide PDF, and reference screenshots — populating .brand/tokens/*.md, .brand/voice.md, .brand/overview.md, .brand/conflicts.md, and regenerating design.md. Use when the user says "extract the brand", "/brand-extract", "build a brand package from these assets", "pull tokens from Figma", "analyze the voice", "summarize the brand from this PDF", "find brand conflicts", or after running /new-project for the first time. Currently implements Phase 5 (tokens, voice, overview, and conflict detection). Design-system repo scanning and .impeccable.md regeneration are the remaining stages of the full pipeline.
---

# /brand-extract — Phase 5 (tokens + voice + overview + conflicts)

You are running the brand-extract skill to populate this project's `.brand/` package: `tokens/*.md`, `voice.md`, `overview.md`, and `conflicts.md` — and to regenerate `design.md` at the project root.

**Phase 5 scope:** Stages 1, 2, 3, 4, and 5. Stages 6–8 (design-system repo scan, .impeccable.md regen) are not yet implemented. Stop after Stage 5 and tell the user what's left for later phases.

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

## 8. Stage 5 — Conflict detection (`conflicts.md`)

Reconcile what Stages 1–4 surfaced. Three things land in `.brand/conflicts.md`:

1. **Genuine conflicts** — sources disagree about the same thing and a choice is needed. Examples: brand guide says `#007749`, Figma says `#008542`, web computed style is `#00794a`. Or: brand guide rules sentence case, live site uses title case CTAs.
2. **Intentional adaptations** — divergences that are *not* conflicts because the practitioner has a legitimate reason (licensed display font swapped for a free body font on web; simplified palette for email; relaxed tone on social).
3. **Auto-resolutions** — previously-flagged conflicts that no longer reproduce because the source was fixed.

Run this stage after design.md regenerates (Section 7) so design.md is the consolidated artifact and conflicts.md describes what was reconciled to produce it.

### 8a. Inputs to compare

Read these files into memory:
- `.brand/tokens/colors.md`, `tokens/typography.md`, `tokens/spacing.md`, `tokens/surfaces.md` — frontmatter + prose
- `.brand/voice.md` — both prescriptive sections AND the `## Observed Voice (live channels)` divergences subsection (Stage 3 already flagged candidates there)
- `.brand/overview.md` — brand identity, personality, anti-patterns, visual direction
- Stage 1 raw Figma values (still in memory if Stage 1 ran)
- Stage 2 raw web computed styles (still in memory if Stage 2 ran)
- Stage 4 brand-guide PDF citations (page references for prescriptive claims)

If a file is missing or stub, note it as "no input from {file}" and continue.

### 8b. Detect

Apply these detection rules. Each is independent — run all of them and aggregate.

**Token disagreements:**
- For each named token (e.g., `colors.primary`), compare the value across Figma (Stage 1), web (Stage 2), and any value mentioned in the brand-guide PDF prose (Stage 4). If two or more sources disagree by more than a trivial threshold (>3% delta on color hex; non-trivial size delta on type), flag a `token-level` conflict.
- A trivial delta (e.g., `#E2231A` vs. `#E22319`) is not worth flagging; note silently.

**Voice rule disagreements:**
- For each prescriptive rule in `voice.md` (capitalization, punctuation, vocabulary, microcopy patterns), check whether Stage 3's observed-voice divergences subsection contradicts it. The Stage 3 divergence callouts (`> ⚠️ Diverges from prescriptive: ...`) are pre-flagged candidates — promote them into formal conflicts here.
- Also compare brand-guide prose (Stage 4) against the `## Voice Principles` and `## Writing Rules` sections for internal contradictions.

**Structural disagreements:**
- Brand guide positioning vs. live website hero copy (does the website speak the same brand vs. a sub-brand?).
- Visual direction principles in `overview.md` vs. observed live atmosphere from Stage 4 screenshots.
- Audience description vs. who the live site clearly addresses.

**Intentional adaptation candidates:**
- Font substitutions (display family in guide → body family on web) — usually intentional.
- Palette simplifications between print and digital — usually intentional.
- Tone shifts between channels (formal on website, casual on social) — usually intentional.

When a divergence has the shape of an intentional adaptation, **do not file it as a conflict**. File it under "Intentional Adaptations" and ask the practitioner during the walkthrough whether to confirm.

### 8c. Apply the source authority hierarchy

For each conflict, propose a resolution grounded in the hierarchy from `schema/brand/conflicts.schema.md`:

1. Practitioner-provided live brand guide (PDF, recent)
2. Figma variables (if maintained by brand team)
3. Live website CSS (current behavior)
4. Social profiles

If the project has a hierarchy override at the top of `conflicts.md`, use that instead.

The recommended resolution should be one paragraph: which source wins, why, and what the consequence is for the prototype/build.

### 8d. Walk the practitioner through (required interaction)

Before writing `conflicts.md`, present each detected item to the practitioner and get explicit input:

- For each **conflict**: show the title, sources in tension, recommended resolution. Ask: confirm the resolution, override it (and capture rationale), or mark it as `intentional-adaptation` if the practitioner says it's not actually a conflict.
- For each **intentional adaptation candidate**: confirm it's intentional + capture the rationale.
- For each conflict that previously existed and no longer reproduces: confirm the auto-resolution and move to the archive.

This is the "structured conflict resolution" practitioners care about — keep the prompts crisp and one item at a time. Do not batch-prompt.

If there are zero detected items, skip the walkthrough and write `_No active conflicts as of {date}._`.

### 8e. Apply the additive policy

`conflicts.md` is **additive** — Stage 5 must preserve practitioner-resolved entries on every re-run.

Read the existing `conflicts.md` first. Build the new file as:

1. **Header** — regenerate (date stamp, skill provenance)
2. **Source Authority Hierarchy** — preserve any practitioner overrides; otherwise regenerate the standard table
3. **Active Conflicts** — start fresh; populate with currently-detected `unresolved` items + any practitioner-overridden resolutions captured during the walkthrough
4. **Intentional Adaptations** — preserve all existing entries; append newly-confirmed ones
5. **Resolved Conflicts Archive** — preserve all existing entries; append any auto-resolutions detected this run

**Never delete entries from Intentional Adaptations or Resolved Conflicts Archive.** Use the `Edit` tool to surgically update sections, or `Write` to rebuild the file from in-memory state — but verify the diff in either case.

### 8f. Pitch mode

In pitch mode (`mode: pitch`), do not run the practitioner walkthrough — there's no internal access to resolve conflicts authoritatively. Instead:
- Detect conflicts as usual
- Write all detected items as `unresolved` with `Recommended resolution: pending — pitch mode (public sources only)`
- Surface the count in the Final summary so the practitioner can resolve later when client access is available

### 8g. Provenance

End the file with:

```markdown
<!--
Generated by /brand-extract Stage 5 on YYYY-MM-DD.
Inputs: .brand/tokens/*.md, .brand/voice.md, .brand/overview.md, Stage 1 Figma values, Stage 2 web computed styles, Stage 4 PDF citations.
Detected: N conflicts, M intentional adaptations, K auto-resolutions.
This section preserves practitioner-resolved entries on every re-run.
-->
```

## 9. Final summary

Post a message to the user with:

- **Token counts:** how many color tokens, typography tokens, spacing tokens, surface tokens were extracted
- **Voice corpus:** total samples, breakdown by type and channel, plus HIGH / MEDIUM / LOW claim counts
- **Overview sources:** brand-guide PDF (yes/no, page count read), reference screenshots (count), web screenshots (count)
- **Conflicts surfaced:** count of new `unresolved` conflicts, intentional adaptations confirmed, auto-resolutions
- **Sources used (overall):** Figma, web pages, social, app stores, PDFs, screenshots
- **Files written:** four token files + `voice.md` + `overview.md` + `conflicts.md` + `design.md`
- **Files skipped:** if any (with reason)
- **Stage status:** Stage 1 / Stage 2 / Stage 3 / Stage 4 / Stage 5 — ran / skipped / partial / stub
- **What's next:** "Phase 5 covers tokens, voice, overview, and conflicts. Design-system repo scan and `.impeccable.md` regeneration are the remaining stages. Run `/brand-check` to see overall completeness."

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
| Stage 5: practitioner declines a recommended resolution | Capture their override + rationale, write the conflict with `status: resolved-with-rationale` and the practitioner's text. |
| Stage 5: practitioner can't resolve right now | Leave the conflict as `unresolved`. They can re-run later. |
| Stage 5: a previously-resolved conflict re-surfaces | Treat as a new active conflict. Note in the new entry that it had been resolved on a prior date. |
| Stage 5: only one source is present (e.g., no Figma, no PDF) | Cannot detect cross-source conflicts. Stage 5 writes "_No active conflicts as of {date}._" and notes the limited input in the provenance block. |
| All stages fail | Don't write any files. Tell the user what failed and what to fix. |
| Practitioner says "skip" on overwrite for a file | Honor it — leave that file alone, write the others |
| Conflict between Figma and web token values | Stage 5 captures it formally. In token file prose, note the divergence; in conflicts.md, file with `severity: token-level`. |
| Overview claim contradicts a token value | Stage 5 captures it as `severity: structural`. |

## Phase 5 scope reminder

Implemented in this phase:
- Stage 1: Figma → tokens
- Stage 2: Web → tokens (always run when website is set)
- Stage 3: Voice extraction (always run when website is set; uses social and app-store sources when present)
- Stage 4: Multimodal analysis → overview.md (always run when at least one of: brand-guide PDF, reference screenshots, or Stage 2 web screenshots is available)
- Stage 5: Conflict detection → conflicts.md (additive, with practitioner walkthrough)
- Token files + voice.md + overview.md + conflicts.md writing with overwrite/additive policies
- design.md regeneration

**Not yet implemented** (do not attempt):
- Stage 6: Design-system repo scan (`components/`)
- Stage 8: `.impeccable.md` regeneration

If the user asks for any of these, say: "That lands in a later phase of /brand-extract. For now, /brand-extract handles tokens and voice. The other files in `.brand/` need to be filled manually or wait for the next phase."
