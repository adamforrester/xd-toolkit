# Schema: .brand/composition/page-types.md

**Purpose:** Canonical page layouts — the recurring page structures this brand uses. Agents reference this when building new pages to ensure layout consistency and appropriate information hierarchy.

**Tier:** Standard
**Loaded:** Building new pages/views (CLAUDE.md routing rule)

---

## Sections

### Layout Philosophy (required)

How pages are structured in this brand.

| Field | Required | Description |
|-------|----------|-------------|
| `Grid system` | required | Grid approach: columns, gutter, container width, breakpoints |
| `Density approach` | required | How content density is managed across page types |
| `Hierarchy principle` | required | How visual hierarchy is established (e.g., "Size and position over color", "F-pattern for content pages, Z-pattern for landing pages") |

### Page Types (required)

Each canonical page layout. Minimum 2 page types.

For each page type:

| Field | Required | Description |
|-------|----------|-------------|
| `Name` | required | Page type name (e.g., "Landing page", "Product detail", "Content/article", "Dashboard", "Form page") |
| `Purpose` | required | What this page type achieves |
| `Structure` | required | Ordered list of sections/zones with their role (e.g., "Hero → value props → social proof → CTA") |
| `Key constraints` | required | Rules specific to this page type (e.g., "Maximum 3 CTAs", "Hero image required") |
| `Responsive behavior` | optional | How the layout adapts across breakpoints |

### Shared Page Elements (optional)

Elements that appear across multiple page types.

| Field | Required | Description |
|-------|----------|-------------|
| `Header` | optional | Header structure, navigation pattern, height |
| `Footer` | optional | Footer structure, content areas |
| `Sidebar` | optional | When and how sidebars are used |

---

## Example

```markdown
# Page Types

## Layout Philosophy
**Grid:** 12-column, 24px gutter, max-width 1200px. 4-column below 768px.
**Density:** Content pages are generous with whitespace. Transactional pages (ordering, checkout) are more compact — respect the user's time.
**Hierarchy:** Position first (top = important), then size, then weight. Color accents are highlights, not hierarchy drivers.

## Landing Page
**Purpose:** Convert visitors — communicate value and drive a single primary action.
**Structure:**
1. Hero — headline + sub + primary CTA + hero image/video
2. Value propositions — 3-4 cards or icon+text blocks
3. Social proof — testimonials, stats, or partner logos
4. Feature deep-dive — alternating image+text sections (max 3)
5. Final CTA — restated primary action

**Constraints:**
- One primary CTA, repeated max 2 times (hero + final)
- Hero headline: max 8 words
- No sidebar
- No more than 5 sections between hero and final CTA

## Product Detail (Menu Item)
**Purpose:** Show the item and drive "add to order."
**Structure:**
1. Product hero — large image + name + price + CTA
2. Customization — options/modifiers
3. Nutrition info — expandable/collapsible
4. Related items — horizontal scroll of 3-4 items

**Constraints:**
- Image must be above the fold on mobile
- CTA ("Add to order") sticky on mobile scroll
- Nutrition data is always available but never prominent

## Shared Elements
**Header:** Sticky. Logo left, nav center (desktop) / hamburger (mobile), order CTA right. Height: 64px desktop, 56px mobile.
**Footer:** 4-column link grid (desktop) → accordion (mobile). Legal links + social icons in sub-footer.
```
