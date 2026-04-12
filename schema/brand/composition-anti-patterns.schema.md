# Schema: .brand/composition/anti-patterns.md

**Purpose:** Explicit "never do this" list for layout and composition. Agents check this before proposing any layout to avoid common mistakes and brand violations.

**Tier:** Standard
**Loaded:** Building new pages/views (CLAUDE.md routing rule: "Check `.brand/composition/anti-patterns.md` before proposing any layout")

---

## Sections

### Anti-patterns (required)

Each anti-pattern. Minimum 5.

For each anti-pattern:

| Field | Required | Description |
|-------|----------|-------------|
| `Name` | required | Short descriptive name (e.g., "The wall of cards", "Competing CTAs") |
| `Description` | required | What the anti-pattern looks like and why it's a problem |
| `Example` | optional | A concrete "bad" example — what an agent might generate if it doesn't know the rule |
| `Instead` | required | What to do instead — the correct approach |
| `Severity` | required | `error` (never ship this) or `warning` (avoid, but context-dependent) |

---

## Example

```markdown
# Composition Anti-patterns

## The Wall of Cards
**Description:** More than 9 cards in a grid without filtering, pagination, or progressive disclosure. Overwhelms the user and makes everything equally (un)important.
**Example:** Showing all 40 menu items in a single grid on the category page.
**Instead:** Show 6-9 cards max. Add filtering (category tabs) or "Show more" progressive loading. Feature 1-2 items prominently, then grid the rest.
**Severity:** error

## Competing CTAs
**Description:** Two or more primary-styled buttons visible in the same viewport. Destroys hierarchy — the user doesn't know what to do first.
**Instead:** One primary CTA per visible area. Demote others to secondary or ghost. If two actions are genuinely equal, use two secondary buttons.
**Severity:** error

## The Orphan Section
**Description:** A page section with a single line of text or a lone component surrounded by massive whitespace. Looks broken, not intentional.
**Instead:** Combine with adjacent content, or add supporting elements (subhead, icon, secondary text). If the section really only has one thing, reduce its vertical padding.
**Severity:** warning

## Rainbow Text
**Description:** Using brand colors on text for visual variety. Multiple colored headings, colored body text, or color used as the only differentiator between text blocks.
**Instead:** Text is `color-neutral-900` (primary) or `color-neutral-700` (secondary). Color on text only for links (`color-info`) and brand accent in hero headlines (sparingly). Differentiate with size, weight, and spacing — not color.
**Severity:** error

## The False Floor
**Description:** Page layout that makes it look like the content has ended when there's more below the fold. Usually caused by a full-width colored section followed by significant whitespace.
**Instead:** Ensure visual continuity — partial visibility of the next section, a scroll indicator, or content that clearly continues below the section boundary.
**Severity:** warning

## Modal Overload
**Description:** Using modals for content that should be on-page. Multi-step flows in modals. Modals that open modals.
**Instead:** Modals for confirmations, quick inputs, and non-navigational actions only. Multi-step flows get their own page. Never nest modals.
**Severity:** error
```
