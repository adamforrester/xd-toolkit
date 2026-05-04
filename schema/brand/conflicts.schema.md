# Schema: .brand/conflicts.md

**Purpose:** Track contradictions surfaced during brand extraction between brand guide, Figma variables, live website behavior, and observed user-facing copy. Distinguishes genuine conflicts (which need resolution) from intentional digital adaptations (which need documentation, not resolution). Owned by `/brand-extract` Stage 5.

**Tier:** Standard (and above)
**Loaded:** When the practitioner asks about brand conflicts, makes design decisions that touch a flagged token, or runs `/brand-check`. Not loaded by default in every visual implementation task — the resolution lives in the relevant `.brand/` file's prose.

---

## Sections

### Header

A short paragraph stating who maintains this file (Stage 5 of `/brand-extract`) and a pointer to the source authority hierarchy below. Date of last update.

### Source Authority Hierarchy (required)

A static block agents reference when proposing resolutions. Same in every project unless the practitioner overrides:

| Rank | Source | Notes |
|---|---|---|
| 1 | Practitioner-provided live brand guide (PDF, recent) | Authoritative for prescriptive intent |
| 2 | Figma variables (if maintained by brand team) | Authoritative for design tokens when current |
| 3 | Live website CSS (current behavior) | Authoritative for "what the world sees today" |
| 4 | Social profiles | Tone signal, not token authority — often relaxed |

Practitioners may override the hierarchy for a specific project (e.g., when the brand guide is years old and Figma is the live source of truth). Document overrides at the top of this section.

### Active Conflicts (required, may be empty)

Conflicts that need resolution. Each conflict is its own subsection:

| Field | Required | Description |
|-------|----------|-------------|
| Title | required | One-line description (e.g., "Primary red: brand guide #007749 vs. live site #008542") |
| Severity | required | `token-level` (specific value disagreement), `voice-level` (rule disagreement), or `structural` (positioning, audience, visual direction) |
| Sources in tension | required | A bulleted list — for each source, what it says + citation (page #, file path, URL) |
| Recommended resolution | required | A one-paragraph recommendation grounded in the source authority hierarchy |
| Status | required | `unresolved`, `resolved-with-rationale`, or `intentional-adaptation` |
| Resolution rationale | required when status ≠ `unresolved` | Why this resolution was chosen. Filled in by the practitioner during the Stage 5 walkthrough or later via `/brand-extract` re-run. |
| Date raised | required | YYYY-MM-DD when first detected |
| Date resolved | required when status ≠ `unresolved` | YYYY-MM-DD |

If there are no active conflicts, write: `_No active conflicts as of {date}._`

### Intentional Adaptations (optional, may be empty)

Documentation for divergences that are *not* conflicts — places where the digital experience deliberately differs from the brand guide for legitimate reasons (font substitution for performance, simplified palette for email clients, looser tone on social, etc.).

| Field | Required | Description |
|-------|----------|-------------|
| Title | required | One-line description (e.g., "Display font 'Knockout' replaced with 'Inter' for body copy on web") |
| What | required | Concrete description of the adaptation |
| Why intentional | required | Practitioner rationale (performance, channel fit, accessibility, etc.) |
| Where it applies | required | The medium / context where the adaptation lives |
| Date documented | required | YYYY-MM-DD |

### Resolved Conflicts Archive (optional, may be empty)

Conflicts that were resolved and have been moved out of "Active Conflicts." Format identical to Active Conflicts — preserved for audit history. Re-runs of Stage 5 do not modify entries here.

---

## Behavior on re-run

Stage 5 is **additive**. It must:
- Preserve any entry whose status is `resolved-with-rationale` or `intentional-adaptation` exactly as written.
- Detect new conflicts and append them to "Active Conflicts" with status `unresolved`.
- For an existing `unresolved` conflict that no longer reproduces (e.g., the live site was fixed), update its status to `resolved-with-rationale` with a note `Auto-resolved: source disagreement no longer reproduces as of {date}.` and move it to the archive.
- Never delete entries.

---

## Example

```markdown
# Conflicts

Maintained by `/brand-extract` Stage 5. Last updated 2026-04-29.

## Source Authority Hierarchy

| Rank | Source | Notes |
|---|---|---|
| 1 | TruGreen_BrandDesign_AUTHOR_10.13.pdf | Authoritative |
| 2 | Prism Foundations Figma file | Maintained current |
| 3 | trugreen.com | Current behavior |
| 4 | @TruGreen Twitter | Tone signal only |

## Active Conflicts

### CTA casing: brand guide sentence case vs. live site title case

- **Severity:** voice-level
- **Sources in tension:**
  - Brand guide (p. 18, "Voice & Tone — Capitalization"): "Use sentence case for all UI copy, including buttons."
  - Live site (https://www.trugreen.com/): CTAs use title case ("Talk To a Pro", "Find My Plan").
- **Recommended resolution:** Per hierarchy rank 1, follow the brand guide. The prototype should ship sentence-case CTAs ("Talk to a pro", "Find my plan") even though the production site has not yet been updated.
- **Status:** unresolved
- **Date raised:** 2026-04-29

## Intentional Adaptations

### Display font substituted for body on web

- **What:** Brand guide specifies "Knockout HTF49 Liteweight" as the display family. Web implementations use Inter for body copy.
- **Why intentional:** Knockout is a paid foundry license and is not licensed for web body copy. Performance and licensing constraints make the substitution mandatory.
- **Where it applies:** Web product surfaces (marketing site + dashboard). Print and out-of-home keep Knockout.
- **Date documented:** 2026-04-29

## Resolved Conflicts Archive

_No resolved conflicts yet._
```
