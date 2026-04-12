# Schema: .brand/tokens/colors.md

**Purpose:** The complete color system with semantic intent and usage rules. Agents reference this for every visual implementation to ensure correct color token usage — never raw hex/RGB/HSL values.

**Tier:** Minimum
**Loaded:** Visual implementation tasks (CLAUDE.md routing rule)

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

### Color Usage Rules (required)

Constraints agents must follow when applying color.

| Field | Required | Description |
|-------|----------|-------------|
| `Rules` | required | Explicit rules: minimum contrast ratios, where primary color can/cannot be used, background restrictions, text color constraints |
| `Combinations` | optional | Approved color pairings and combinations to avoid |

### Dark Mode (optional)

How the color system adapts for dark contexts.

| Field | Required | Description |
|-------|----------|-------------|
| `Strategy` | optional | How dark mode is handled (inverted, remapped, separate palette) |
| `Token mapping` | optional | How light-mode tokens map to dark-mode values |

---

## Example

```markdown
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

## Usage Rules
- Minimum contrast: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- `color-primary` on white: 4.6:1 — passes AA for large text only. Use `color-primary-dark` for small text.
- Never use brand red for error states — use `color-error` (distinct hue avoids confusion)
- Maximum 3 colors per component (excluding neutrals)
- Background surfaces: only `color-white`, `color-neutral-50`, or `color-primary` (for hero sections)
```
