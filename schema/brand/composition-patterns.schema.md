# Schema: .brand/composition/patterns.md

**Purpose:** Recurring composition patterns — reusable layout fragments that appear across multiple pages. These are higher-level than individual components but smaller than full pages.

**Tier:** Standard
**Loaded:** Building new pages/views (CLAUDE.md routing rule)

---

## Sections

### Pattern Catalog (required)

Each composition pattern. Minimum 3 patterns.

For each pattern:

| Field | Required | Description |
|-------|----------|-------------|
| `Name` | required | Pattern name (e.g., "Hero with media", "Card grid", "Feature alternating", "Pricing table", "Testimonial strip") |
| `Purpose` | required | What this pattern communicates or achieves |
| `Structure` | required | Visual structure: how elements are arranged, what's required vs. optional |
| `Tokens used` | required | Which spacing/color tokens to use (references `tokens/` files) |
| `Responsive behavior` | required | How the pattern adapts across breakpoints |
| `When to use` | required | Situations where this pattern is the right choice |
| `When NOT to use` | optional | Situations where this pattern is wrong |

---

## Example

```markdown
# Composition Patterns

## Card Grid
**Purpose:** Display a collection of equal-weight items (menu items, locations, blog posts).
**Structure:**
- 3 columns (desktop), 2 columns (tablet), 1 column (mobile)
- All cards same height per row (CSS Grid `auto-fill`)
- Card order: image top → title → description → metadata/CTA
- Gap: `space-6` between cards

**Tokens:** Card padding `space-5`, card radius `radius-md`, card border `color-neutral-200`
**Responsive:** 3 → 2 columns at 1024px, 2 → 1 at 640px. Cards go full-width on mobile.
**When to use:** 3+ items of equal importance. Menu categories, location list, blog index.
**When NOT to use:** Fewer than 3 items (use a different layout). Items with very different importance levels (use featured + list).

## Hero with Media
**Purpose:** The opening statement of a page — grab attention, communicate the primary message, drive action.
**Structure:**
- Split layout: text left, image/video right (desktop). Stacked: image → text (mobile).
- Text block: headline (text-5xl) + subhead (text-lg) + CTA button (primary)
- Image: cropped to 1:1 or 4:3. Never letterboxed.
- Background: `color-white` or `color-neutral-50`. Brand red background variant for high-impact pages.

**Tokens:** Container padding `space-16` (desktop) / `space-8` (mobile). Text-to-CTA gap: `space-6`.
**Responsive:** Side-by-side → stacked at 768px. Image scales to full-width on mobile.
**When to use:** Page openers, campaign landing pages, product launches.
**When NOT to use:** Interior pages where the user has already committed (checkout, account settings).

## Feature Alternating
**Purpose:** Explain multiple features or benefits with visual support.
**Structure:**
- Alternating rows: image-left/text-right, then text-left/image-right
- Each row: image (50% width) + text block (headline + body + optional CTA)
- Maximum 4 rows before fatigue sets in
- Section gap: `space-12`

**Tokens:** Row padding `space-10` vertical. Image radius `radius-lg`.
**Responsive:** Side-by-side → stacked at 768px. All images appear above text on mobile.
**When to use:** Product feature pages, "how it works" sections, value proposition deep-dives.
**When NOT to use:** If all items are equal weight (use card grid instead). If there are more than 4 items.
```
