# Schema: .brand/tokens/colors.md

**Purpose:** The complete color system with semantic intent and usage rules. Agents reference this for every visual implementation to ensure correct color token usage — never raw hex/RGB/HSL values.

**Tier:** Minimum
**Loaded:** Visual implementation tasks (CLAUDE.md routing rule)
**Format:** YAML frontmatter (machine-readable token values, design.md-compatible) + markdown prose (human-readable rationale and usage rules).

The frontmatter values are normative. The prose explains *how* to apply them. Tools that consume `design.md` (per [google-labs-code/design.md](https://github.com/google-labs-code/design.md)) read the frontmatter directly; agents working in this project read both.

---

## Frontmatter (required)

A YAML block at the top of the file, between `---` delimiters. The `colors` key is a flat map from token name to hex value (sRGB). Token names should follow a consistent convention; the recommended set is `primary`, `secondary`, `tertiary`, `neutral`, `surface`, `on-surface`, `error`, plus scale variants like `primary-50`, `primary-60`, etc.

```yaml
---
colors:
  primary: "#E2231A"
  primary-dark: "#C1190F"
  primary-light: "#FF6B61"
  neutral-900: "#1A1A1A"
  neutral-700: "#4A4A4A"
  neutral-400: "#999999"
  neutral-200: "#E5E5E5"
  neutral-50: "#F8F8F8"
  white: "#FFFFFF"
  success: "#2E7D32"
  warning: "#F9A825"
  error: "#D32F2F"
  info: "#1565C0"
---
```

**Rules:**
- Color values must be hex strings prefixed with `#` (sRGB). No `rgb()`, `hsl()`, or named CSS colors.
- Every color named in the markdown prose must appear as a token in the frontmatter (or be a documented reference to one).
- If `dark mode` tokens exist, namespace them: `dark.primary: "#..."` or use a separate `## Dark Mode` block (see Dark Mode section below).

---

## Sections

### Color Philosophy (required)

The strategic intent behind the color system.

| Field | Required | Description |
|-------|----------|-------------|
| `Approach` | required | 2-3 sentences on how color functions in this brand (e.g., "Color is our primary differentiator. The red carries the brand; everything else supports it.") |
| `Palette strategy` | required | How the palette is structured — primary/secondary/neutral, or semantic groupings |

### Primary Palette (required)

The core brand colors. These are the most recognizable and frequently used.

| Field | Required | Description |
|-------|----------|-------------|
| `Colors` | required | For each color: token name, hex value, usage description, accessibility notes. Minimum: 1 primary color. |

### Secondary Palette (optional)

Supporting colors that complement the primary palette.

| Field | Required | Description |
|-------|----------|-------------|
| `Colors` | optional | Same format as primary. Accent colors, category colors, illustration palette, etc. |

### Neutral Palette (required)

Grays, whites, blacks — the structural colors.

| Field | Required | Description |
|-------|----------|-------------|
| `Colors` | required | Full neutral scale with token names and intended use (e.g., "text-primary", "surface-default", "border-subtle") |

### Semantic Colors (required)

Colors assigned by meaning, not appearance.

| Field | Required | Description |
|-------|----------|-------------|
| `Success` | required | Token name + hex. What constitutes "success" visually. |
| `Warning` | required | Token name + hex |
| `Error` | required | Token name + hex |
| `Info` | required | Token name + hex |

### Color Application Context (required)

Where each color appears in the UI. Values alone aren't enough — agents need to know *how* colors are used, not just what they are. Without this, agents make plausible but wrong decisions (e.g., full-bleed primary backgrounds when primary is meant for accents).

| Field | Required | Description |
|-------|----------|-------------|
| `Background rules` | required | Which colors can be used as page/section/component backgrounds. Be specific about primary color: is it for full-bleed backgrounds, color-block accents, or never as a background? |
| `Text color rules` | required | Which colors for headings, body, secondary text, links, on-dark-background text |
| `Accent usage` | required | Where primary/secondary colors appear as accents: CTAs, badges, icons, borders, highlights |
| `Combinations` | optional | Approved color pairings and combinations to avoid |

### Color Technical Constraints (required)

Accessibility and technical rules for color application.

| Field | Required | Description |
|-------|----------|-------------|
| `Contrast rules` | required | Minimum contrast ratios for text, large text, UI components (WCAG AA/AAA targets) |
| `Restrictions` | required | Hard constraints: max colors per component, color-semantic conflicts to avoid (e.g., "don't use brand red for errors") |

### Usage by Medium (optional)

How colors are applied differently across channels and media. Brands often use color differently in digital vs. print vs. social — this is intentional, not a conflict.

| Field | Required | Description |
|-------|----------|-------------|
| `Website / Web App` | optional | How colors are actually used on the live site — typically white backgrounds with brand colors as accents, not leads |
| `Print / Campaign` | optional | How the brand guide prescribes color usage for print — often more color-forward (e.g., "lead with Sand") |
| `Social Media` | optional | Social profile color usage — typically bolder, more color-forward to stop the scroll |
| `CRM / Email` | optional | Simplified palette, higher contrast requirements for email clients |

**Key insight:** When the brand guide says "lead with [color]" but the website uses white backgrounds, document this as intentional medium-specific usage. The brand guide describes print/campaign intent; the website reflects digital best practices. Both are correct in context.

### Dark Mode (optional)

How the color system adapts for dark contexts.

| Field | Required | Description |
|-------|----------|-------------|
| `Strategy` | optional | How dark mode is handled (inverted, remapped, separate palette) |
| `Token mapping` | optional | How light-mode tokens map to dark-mode values |

---

## Example

```markdown
---
colors:
  primary: "#E2231A"
  primary-dark: "#C1190F"
  primary-light: "#FF6B61"
  neutral-900: "#1A1A1A"
  neutral-700: "#4A4A4A"
  neutral-400: "#999999"
  neutral-200: "#E5E5E5"
  neutral-50: "#F8F8F8"
  white: "#FFFFFF"
  success: "#2E7D32"
  warning: "#F9A825"
  error: "#D32F2F"
  info: "#1565C0"
---

# Color System

## Philosophy
Red is the brand. It's warm, energetic, and unmistakable. The palette supports red with clean neutrals and minimal secondary colors — we don't dilute the red's impact with competing hues.

**Strategy:** Monochromatic primary with neutral support. Secondary colors exist for data visualization and status only.

## Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `color-primary` | #E2231A | Brand red. Hero sections, primary CTAs, key accents. Never on large background areas. |
| `color-primary-dark` | #C1190F | Hover/active states on primary. High-contrast pairing with white text (7.2:1). |
| `color-primary-light` | #FF6B61 | Highlights, tags, subtle accents. Not for text. |

## Neutral Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `color-neutral-900` | #1A1A1A | Primary text |
| `color-neutral-700` | #4A4A4A | Secondary text |
| `color-neutral-400` | #999999 | Placeholder text, disabled states (use sparingly — check contrast) |
| `color-neutral-200` | #E5E5E5 | Borders, dividers |
| `color-neutral-50` | #F8F8F8 | Surface backgrounds |
| `color-white` | #FFFFFF | Primary background |

## Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `color-success` | #2E7D32 | Success states, confirmations, positive indicators |
| `color-warning` | #F9A825 | Warnings, caution states. Always pair with icon — not colorblind-safe alone. |
| `color-error` | #D32F2F | Errors, destructive actions. Distinct from brand red (cooler, more urgent). |
| `color-info` | #1565C0 | Informational states, links, interactive elements |

## Application Context
**Backgrounds:**
- Page backgrounds: `color-white` or `color-neutral-50` only
- Section backgrounds: `color-white`, `color-neutral-50`, or `color-primary` as a narrow color-block accent strip (not full-bleed). Red backgrounds are for small contained areas (badges, banners, promotional strips) — never full page sections.
- Card backgrounds: `color-white` with `color-neutral-200` border or subtle shadow
- Hero sections: white or neutral-50 background. Red appears as accent (CTA button, headline underline) not as the section background.

**Text:**
- Headings: `color-neutral-900` on light backgrounds, `color-white` on red accent areas
- Body: `color-neutral-900` (primary), `color-neutral-700` (secondary)
- Links: `color-info` with underline on hover

**Accents (where primary red appears):**
- Primary CTA buttons (filled red)
- Badges, tags, and promotional labels
- Active/selected states (nav items, tabs)
- Icon highlights and small graphic elements
- The Wendy cameo and brand marks
- NOT as full-section or full-page backgrounds

## Technical Constraints
- Minimum contrast: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- `color-primary` on white: 4.6:1 — passes AA for large text only. Use `color-primary-dark` for small text on white.
- Never use brand red for error states — use `color-error` (distinct hue avoids confusion)
- Maximum 3 colors per component (excluding neutrals)

## Usage by Medium

### Website / Web App
- Page backgrounds: White primary, neutral-50 secondary
- Brand red: CTAs, badges, accent strips — never full-bleed section backgrounds
- Hero sections: white or neutral background with red accents

### Print / Campaign
- Red leads most campaign materials
- White space balanced differently than digital (denser)
- CMYK values may differ slightly from hex — use hex for digital

### Social Media
- Bolder color usage — red backgrounds acceptable for posts
- Higher saturation to stand out in feed
- Simplified palette (primary red + white + one neutral)
```
