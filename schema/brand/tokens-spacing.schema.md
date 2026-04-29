# Schema: .brand/tokens/spacing.md

**Purpose:** The spacing system — scale, density philosophy, and application rules. Agents reference this for all layout spacing, padding, margins, and gaps.

**Tier:** Minimum
**Loaded:** Visual implementation tasks (CLAUDE.md routing rule)
**Format:** YAML frontmatter (machine-readable spacing tokens, design.md-compatible) + markdown prose (density philosophy, application rules).

---

## Frontmatter (required)

A YAML block at the top of the file, between `---` delimiters. The `spacing` key is a map from scale identifier to a Dimension (e.g., `16px`) or a unitless number (e.g., column counts).

```yaml
---
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  2xl: 96px
  gutter: 24px
  margin: 32px
---
```

**Recommended scale identifiers:** `base`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`. Layout-specific values (`gutter`, `margin`, `column`, etc.) may be added.

**Rules:**
- Dimension values use `px`, `em`, or `rem` units. No `%` or `vh`/`vw` here — those belong in layout prose.
- Unitless numbers are valid for column counts, ratios (e.g., `columns: 12`).

---

## Sections

### Spacing Philosophy (required)

How space functions in this brand's design language.

| Field | Required | Description |
|-------|----------|-------------|
| `Density approach` | required | Where this brand falls on the density spectrum (airy/generous, balanced, compact/dense) and why |
| `Spacing principle` | required | The governing principle (e.g., "Consistent rhythm over rigid uniformity", "Whitespace is a brand asset") |

### Spacing Scale (required)

The defined spacing values.

| Field | Required | Description |
|-------|----------|-------------|
| `Base unit` | required | The base value the scale is built on (e.g., 4px, 8px) |
| `Scale` | required | Each step: token name, value (px and rem), intended use. Minimum 6 steps. |

### Application Rules (required)

How to apply spacing in different contexts.

| Field | Required | Description |
|-------|----------|-------------|
| `Component internal` | required | Spacing within components (padding, gap between elements) |
| `Component external` | required | Spacing between components (margins, section gaps) |
| `Page-level` | required | Section spacing, header/footer margins, container padding |
| `Responsive adjustments` | optional | How spacing adapts across breakpoints |

### Spacing Anti-patterns (optional)

Common spacing mistakes to avoid.

| Field | Required | Description |
|-------|----------|-------------|
| `Anti-patterns` | optional | Specific spacing mistakes with corrections (e.g., "Don't use spacing-1 between form fields — too tight. Use spacing-3 minimum.") |

---

## Example

```markdown
---
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  2xl: 96px
  gutter: 24px
  margin: 32px
---

# Spacing

## Philosophy
**Density:** Generous — Wendy's design breathes. Whitespace signals confidence and makes content scannable on mobile.
**Principle:** Use the scale. No magic numbers. When in doubt, go larger — cramped layouts undermine the brand's confident personality.

## Scale
Base unit: 4px

| Token | Value | Use |
|-------|-------|-----|
| `space-0` | 0 | Reset only |
| `space-1` | 0.25rem (4px) | Tight pairs: icon + label, avatar + name |
| `space-2` | 0.5rem (8px) | Compact gaps: list items, inline elements, tag groups |
| `space-3` | 0.75rem (12px) | Form field internal padding, small card padding |
| `space-4` | 1rem (16px) | Default component padding, paragraph spacing |
| `space-5` | 1.25rem (20px) | Card padding, related content groups |
| `space-6` | 1.5rem (24px) | Section sub-headings, large card padding |
| `space-8` | 2rem (32px) | Section spacing within a page area |
| `space-10` | 2.5rem (40px) | Major section breaks |
| `space-12` | 3rem (48px) | Page section spacing |
| `space-16` | 4rem (64px) | Hero padding, major page divisions |
| `space-20` | 5rem (80px) | Top-level section gaps (desktop) |

## Application Rules
**Component internal:**
- Buttons: `space-2` vertical, `space-4` horizontal
- Cards: `space-5` or `space-6` padding
- Form fields: `space-3` padding, `space-4` gap between fields

**Component external:**
- Related components: `space-4` to `space-6`
- Unrelated components: `space-8` to `space-10`

**Page-level:**
- Container max-width: 1200px, padding `space-4` (mobile) / `space-8` (desktop)
- Section gaps: `space-12` (mobile) / `space-20` (desktop)
- Header/footer: `space-4` vertical padding

**Responsive:** Spacing tokens above `space-8` reduce by one step on viewports below 768px.

## Anti-patterns
- Never use raw pixel values — always a scale token
- Don't mix spacing-1 and spacing-2 in the same row of elements — pick one rhythm
- Section spacing below `space-8` makes the page feel cramped — this brand needs room to breathe
```
