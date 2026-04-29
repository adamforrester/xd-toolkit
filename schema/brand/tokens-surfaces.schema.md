# Schema: .brand/tokens/surfaces.md

**Purpose:** Borders, border radii, shadows, and elevation — the physical treatment of UI surfaces. These are significant brand differentiators (sharp vs. rounded, flat vs. elevated) that don't fit cleanly into the other token files.

**Tier:** Minimum
**Loaded:** Visual implementation tasks (CLAUDE.md routing rule)
**Format:** YAML frontmatter (machine-readable rounded + elevation tokens, design.md-compatible) + markdown prose (philosophy, usage rules, shadow system).

**Note:** This file is an addition to the original architecture (which covered colors, typography, spacing, and motion). Surfaces warrant their own token file because border-radius and elevation are strong brand signals — a brand with sharp corners and no shadows feels fundamentally different from one with rounded corners and layered elevation.

In design.md terms, this file populates the `## Shapes` (radius) and `## Elevation & Depth` (shadows) sections.

---

## Frontmatter (required)

A YAML block at the top of the file, between `---` delimiters.

- `rounded`: a map from scale identifier to a Dimension (per design.md spec). Recommended identifiers: `none`, `sm`, `md`, `lg`, `xl`, `full`.
- `elevation` (XD Toolkit extension — not in design.md spec but read by our tools): a map from elevation level to a CSS box-shadow string.

```yaml
---
rounded:
  none: 0
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  full: 9999px
elevation:
  flat: none
  sm: "0 1px 2px rgba(0,0,0,0.04)"
  md: "0 4px 8px rgba(0,0,0,0.06)"
  lg: "0 12px 24px rgba(0,0,0,0.08)"
---
```

**Rules:**
- `rounded` values must be Dimensions (`px`, `em`, `rem`) or the integer `0`.
- `elevation` values are CSS box-shadow strings. Use `none` for the flat level.
- If the brand is strictly flat, define only `elevation.flat: none` and explain in prose.

---

## Sections

### Surface Philosophy (required)

How physical treatment reflects the brand.

| Field | Required | Description |
|-------|----------|-------------|
| `Approach` | required | 2-3 sentences on the brand's relationship with depth, edges, and containment (e.g., "Flat and sharp — minimal elevation, defined edges" or "Soft and layered — rounded corners, subtle shadows create depth") |

### Border Radius (required)

The radius scale.

| Field | Required | Description |
|-------|----------|-------------|
| `Scale` | required | Each step: token name, value, use case. Minimum: none, small, medium, large, full/pill. |
| `Default radius` | required | Which radius value is the default for interactive elements (buttons, inputs, cards) |

### Borders (required)

Border treatments.

| Field | Required | Description |
|-------|----------|-------------|
| `Border widths` | required | Token names and values (e.g., `border-thin: 1px`, `border-thick: 2px`) |
| `Border colors` | required | Reference to color tokens used for borders (e.g., "Use `color-neutral-200` for default borders") |
| `Border usage` | required | When borders are used vs. shadows vs. background contrast for element separation |

### Elevation / Shadows (required)

The depth system.

| Field | Required | Description |
|-------|----------|-------------|
| `Elevation scale` | required | Named levels: token name, CSS box-shadow value, use case. Minimum 3 levels (subtle, default, elevated). |
| `Elevation rules` | required | When to use elevation vs. borders vs. background contrast |

### Surface Anti-patterns (optional)

| Field | Required | Description |
|-------|----------|-------------|
| `Anti-patterns` | optional | Specific surface treatment mistakes (e.g., "Don't combine borders and shadows on the same element", "No inset shadows") |

---

## Example

```markdown
---
rounded:
  none: 0
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  full: 9999px
elevation:
  flat: none
  sm: "0 1px 2px rgba(0,0,0,0.04)"
  md: "0 4px 8px rgba(0,0,0,0.06)"
  lg: "0 12px 24px rgba(0,0,0,0.08)"
---

# Surfaces

## Philosophy
Wendy's UI is flat and confident. Depth is used sparingly — to lift interactive elements (modals, dropdowns) off the page, not to decorate. Corners are slightly rounded (not sharp, not pillowy) — approachable but not childish.

## Border Radius
| Token | Value | Use |
|-------|-------|-----|
| `radius-none` | 0 | Images, full-bleed sections |
| `radius-sm` | 4px | Small elements: tags, badges, tooltips |
| `radius-md` | 8px | Default: buttons, inputs, cards, containers |
| `radius-lg` | 12px | Large cards, modal dialogs |
| `radius-xl` | 16px | Hero cards, featured sections |
| `radius-full` | 9999px | Pills, avatars, round icon buttons |

**Default:** `radius-md` (8px) for all interactive elements unless otherwise specified.

## Borders
**Widths:**
- `border-default`: 1px — standard borders
- `border-thick`: 2px — focus rings, emphasis borders

**Colors:** `color-neutral-200` for default. `color-primary` for active/selected states.

**Usage:** Prefer borders over shadows for cards in lists. Use shadows only for floating elements (dropdowns, modals, tooltips).

## Elevation
| Token | Value | Use |
|-------|-------|-----|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift: cards on hover, sticky headers |
| `shadow-md` | `0 4px 8px rgba(0,0,0,0.1)` | Dropdowns, popovers, floating elements |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.15)` | Modals, dialogs, notification panels |

**Rules:**
- Static cards: no shadow (use border). Shadow on hover only for interactive cards.
- Floating elements always get shadow (they're visually detached from the page)
- Never stack shadows (no `shadow-sm` + `shadow-md` on same element)

## Anti-patterns
- No inset shadows — doesn't match brand
- Don't combine thick borders and shadows on the same element
- No gradient borders
- Avoid `radius-full` on rectangular containers — pills are for compact elements only
```
