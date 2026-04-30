---
name: brand-extract
description: Extract a structured brand package from a client's Figma file and live website, populating .brand/tokens/*.md and regenerating design.md. Use when the user says "extract the brand", "/brand-extract", "build a brand package from these assets", "pull tokens from Figma", or after running /new-project for the first time. Currently implements Phase 2 (token extraction from Figma + web). Voice extraction, multimodal analysis, conflict detection, and design-system repo scanning are stages of the full pipeline that will land in subsequent phases.
---

# /brand-extract — Phase 2 (token extraction)

You are running the brand-extract skill to populate this project's `.brand/tokens/*.md` files from the client's Figma file (when available) and live website.

**Phase 2 scope:** Stages 1 and 2 only — token extraction. Stages 3–8 (voice, overview, conflicts, repo scan, design.md/impeccable.md regen) are not yet implemented. Stop after Stage 2 and tell the user what's left for later phases.

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

## 4. Write token files

For each of the four target files (`.brand/tokens/colors.md`, `tokens/typography.md`, `tokens/spacing.md`, `tokens/surfaces.md`):

### 4a. Apply the overwrite policy

Read the existing file. If it contains the placeholder marker `<!-- Fill this file following the schema at schema/brand/...schema.md -->`, the file is untouched scaffolding — overwrite without asking.

If the marker is **absent** and the file has content beyond just frontmatter, ask the user:
> `tokens/colors.md` has been edited. **Overwrite** (replace entirely), **merge** (refresh the YAML frontmatter, keep your prose), or **skip** (leave alone)?

Default to **skip** if the user is ambiguous. Only proceed when explicit.

### 4b. Generate the file content

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

### 4c. Pitch mode

If `mode: pitch` in `.brandrc.yaml`, prepend the disclaimer:

```
> ⚠️ **PITCH MODE** — derived from public sources only. Not validated against internal brand standards.
```

### 4d. Write the file

Use the `Write` tool to write the full content. Do not use `Edit` — token files are regenerated wholesale.

## 5. Regenerate design.md (required — do not skip)

After all four token files are written, regenerate `design.md` at the project root. **This is a required step, not optional.** `design.md` is a self-contained, spec-compliant artifact (per https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) — it inlines the actual token values in the YAML frontmatter so external tools can read them. Without this step, `design.md` stays the empty skeleton from `init` and the extraction work is invisible to spec consumers.

Use the dedicated CLI command — it's deterministic and avoids hand-building the file:

```bash
xd-toolkit refresh-design
```

Run it via the `Bash` tool. The command reads `.brand/` and overwrites `design.md`. It exits 0 on success and prints the brand directory it used.

If `xd-toolkit refresh-design` is unavailable (older toolkit version on the practitioner's machine), fall back to building `design.md` inline: read each `.brand/` file, merge the `colors` / `typography` / `spacing` / `rounded` / `elevation` frontmatter blocks into a single design.md frontmatter, then assemble the body sections (Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's and Don'ts) per the spec.

After regeneration, verify the file is no longer the placeholder by checking that the frontmatter contains at least one populated token map.

## 6. Final summary

Post a message to the user with:

- **Counts:** how many color tokens, typography tokens, spacing tokens, surface tokens were extracted
- **Sources used:** Figma (yes/no, which files), web (yes — which URL)
- **Files written:** list the four token paths
- **Files skipped:** if any (with reason)
- **Stage 1 / Stage 2 status:** ran / skipped / partial
- **What's next:** "Phase 2 only extracted tokens. Voice (`voice.md`), overview (`overview.md`), conflicts (`conflicts.md`), and design-system repo scanning are coming in subsequent phases. Run `/brand-check` to see overall completeness."

Be concise. The summary is one short message, not a wall of text.

## Failure handling

| Failure | What to do |
|---|---|
| `claude mcp list` errors | Tell the user setup may be incomplete. Stop. |
| Figma file private (Stage 1) | Skip Stage 1, note in summary, continue with Stage 2 |
| Playwright blocked by CAPTCHA / login wall | Stop Stage 2, ask user for screenshots. Note: full screenshot flow is Phase 4. For Phase 2, just stop and report. |
| Both Stage 1 and Stage 2 fail | Don't write any token files. Tell the user what failed and what to fix. |
| Practitioner says "skip" on overwrite for a file | Honor it — leave that file alone, write the others |
| Conflict between Figma and web values | Use Figma value; mention the web value in the prose with a note. Real conflict resolution is Phase 5. |

## Phase 2 scope reminder

Implemented in this phase:
- Stage 1: Figma → tokens
- Stage 2: Web → tokens (always run when website is set)
- Token file writing with overwrite policy
- design.md regeneration

**Not yet implemented** (do not attempt):
- Stage 3: Voice extraction (`voice.md`)
- Stage 4: Multimodal analysis (`overview.md`)
- Stage 5: Conflict detection (`conflicts.md`)
- Stage 6: Design-system repo scan (`components/`)
- Stage 8: `.impeccable.md` regeneration

If the user asks for any of these, say: "That lands in a later phase of /brand-extract. For now, /brand-extract handles tokens. The other files in `.brand/` need to be filled manually or wait for the next phase."
