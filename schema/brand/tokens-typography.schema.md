# Schema: .brand/tokens/typography.md

**Purpose:** The type system — font families, scale, pairing rationale, and usage rules. Agents reference this for all text rendering decisions.

**Tier:** Minimum
**Loaded:** Visual implementation tasks (CLAUDE.md routing rule)
**Format:** YAML frontmatter (machine-readable type tokens, design.md-compatible) + markdown prose (rationale, font sources, usage rules).

The frontmatter values are normative. The prose explains *how* to apply them. Tools that consume `design.md` read the frontmatter; agents working in this project read both.

---

## Frontmatter (required)

A YAML block at the top of the file, between `---` delimiters. The `typography` key is a map from token name to a structured Typography object.

```yaml
---
typography:
  headline-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
---
```

**Typography object fields** (per design.md spec):
- `fontFamily` (string, required)
- `fontSize` (Dimension: `<number>px`, `<number>em`, or `<number>rem`, required)
- `fontWeight` (number — 100–900, required)
- `lineHeight` (Dimension or unitless number — `1.6` means 1.6× fontSize, recommended)
- `letterSpacing` (Dimension, optional)
- `fontFeature` (string, optional — sets `font-feature-settings`)
- `fontVariation` (string, optional — sets `font-variation-settings`)

**Recommended token names:** `headline-display`, `headline-lg`, `headline-md`, `body-lg`, `body-md`, `body-sm`, `label-lg`, `label-md`, `label-sm`. Custom names are allowed.

---

## Sections

### Typography Philosophy (required)

The strategic role of typography in this brand.

| Field | Required | Description |
|-------|----------|-------------|
| `Approach` | required | 2-3 sentences on what typography communicates for this brand |
| `Pairing rationale` | required | Why these specific fonts were chosen and how they work together |

### Font Families (required)

The typefaces in use.

| Field | Required | Description |
|-------|----------|-------------|
| `Primary font` | required | Family name, weight range, source (Google Fonts, Adobe, self-hosted), and role (headings, body, or both) |
| `Secondary font` | optional | Same format. Usually the pairing partner (e.g., sans-serif headings + serif body) |
| `Monospace font` | optional | For code, data, or tabular content |
| `Loading strategy` | optional | How fonts are loaded (e.g., `font-display: swap`, preload, FOUT/FOIT preference) |
| `Fallback stack` | required | System font fallbacks for each family |

### Type Scale (required)

The size system.

| Field | Required | Description |
|-------|----------|-------------|
| `Scale type` | required | The scale approach: modular (ratio-based), custom, or fluid (clamp-based) |
| `Scale definition` | required | Each step: token name, size value (px or rem), line-height, letter-spacing, intended use |
| `Responsive behavior` | optional | How the scale adapts across breakpoints (e.g., "headings scale down 20% on mobile") |

### Font Weights (required)

Which weights are available and when to use them.

| Field | Required | Description |
|-------|----------|-------------|
| `Weights` | required | Each weight: token name or numeric value, when to use it, what it communicates |
| `Weight restrictions` | optional | Weights that should never be used (e.g., "Never use Light (300) for body text — fails readability") |

### Typography Usage Rules (required)

Constraints for type application.

| Field | Required | Description |
|-------|----------|-------------|
| `Minimum sizes` | required | Smallest allowed size for body text, captions, labels |
| `Maximum line length` | required | Character count or width constraint for readability (e.g., "45-75 characters for body text") |
| `Hierarchy rules` | required | How to establish visual hierarchy (e.g., "Headings: weight contrast. Body: size contrast only. Never use color alone for hierarchy.") |
| `OpenType features` | optional | Which OpenType features to enable (e.g., `font-feature-settings: "kern" 1, "liga" 1`) |

---

## Example

```markdown
---
typography:
  headline-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0.02em
---

# Typography

## Philosophy
Type does the heavy lifting. Wendy's voice is distinctive — the typography needs to carry that personality without relying on illustration or decoration. Bold, clear, no-nonsense.

**Pairing:** A geometric sans (headings) for personality and a humanist sans (body) for warmth and readability. Both are unpretentious — no serifs, no scripts.

## Font Families
**Primary:** Inter
- Weights: 400 (Regular), 500 (Medium), 700 (Bold)
- Role: Body text, UI elements, secondary headings
- Source: Google Fonts
- Fallback: `system-ui, -apple-system, sans-serif`

**Display:** Plus Jakarta Sans
- Weights: 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- Role: H1-H3 headings, hero text, CTAs
- Source: Google Fonts
- Fallback: `Inter, system-ui, sans-serif`

**Loading:** `font-display: swap` for both. Preload display font (used above fold).

## Type Scale
| Token | Size | Line Height | Letter Spacing | Use |
|-------|------|-------------|----------------|-----|
| `text-xs` | 0.75rem (12px) | 1.5 | 0.02em | Captions, legal text |
| `text-sm` | 0.875rem (14px) | 1.5 | 0 | Labels, secondary text |
| `text-base` | 1rem (16px) | 1.6 | 0 | Body text |
| `text-lg` | 1.125rem (18px) | 1.55 | 0 | Lead paragraphs |
| `text-xl` | 1.25rem (20px) | 1.4 | -0.01em | H4, card titles |
| `text-2xl` | 1.5rem (24px) | 1.3 | -0.01em | H3 |
| `text-3xl` | 1.875rem (30px) | 1.25 | -0.02em | H2 |
| `text-4xl` | 2.25rem (36px) | 1.2 | -0.02em | H1 |
| `text-5xl` | 3rem (48px) | 1.1 | -0.03em | Hero headlines |

**Responsive:** Headings (2xl+) scale down by ~20% below 768px. Body text stays fixed.

## Font Weights
| Weight | Value | Use |
|--------|-------|-----|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, nav items, emphasis within body |
| SemiBold | 600 | Sub-headings (display font only) |
| Bold | 700 | Headings, CTAs, key data |
| ExtraBold | 800 | Hero headlines only (display font only) |

**Restriction:** Never use 300 (Light) — not in either font's loaded weight range, and too thin for brand personality.

## Usage Rules
- Minimum body text: 16px (1rem). No exceptions.
- Maximum line length: 65 characters for body text
- Hierarchy: size + weight, never color alone
- Headings always use display font. Body always uses primary font. No mixing.
- Enable `font-feature-settings: "kern" 1, "liga" 1` on all text
```
