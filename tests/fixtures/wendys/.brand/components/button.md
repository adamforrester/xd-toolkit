# Button

## Overview
**Purpose:** Triggers actions — form submissions, navigation, state changes.
**Brand role:** Buttons are where the brand's confident personality shows most. Short, direct labels. No wishy-washy "Submit" or "Click here."

## Variants
| Variant | Use When |
|---------|----------|
| `primary` | The main action on a page. Maximum 1 per visible area. Bold, filled, brand-red. |
| `secondary` | Supporting actions that aren't the main CTA. Outlined, neutral. |
| `ghost` | Tertiary actions, in-context actions within cards or toolbars. Text-only with hover state. |
| `destructive` | Irreversible actions (delete, cancel subscription). Red outlined — never filled red (that's `primary`). |

**Default:** `secondary`. Primary must be intentionally chosen — it's a commitment to "this is the most important action here."

## Content Guidelines
- Verb + object: "Place order", "Add to bag", "Sign in"
- Max 3 words. If it needs more, rethink the action.
- No gerunds: "Ordering..." → "Place order"
- Sentence case always

## Anti-patterns
- Don't put 2+ primary buttons in the same section — dilutes the hierarchy
- Don't use `ghost` on backgrounds with low contrast — it disappears
- Don't use buttons for navigation between pages — use links styled as buttons if needed
- Don't disable buttons without explanation — show a tooltip on hover explaining why

## Accessibility
**ARIA:** `role="button"` (implicit on `<button>`). Destructive buttons: `aria-describedby` pointing to a confirmation message.
**Keyboard:** Enter/Space activates. Visible focus ring (`border-thick` + `color-primary`).
**Screen reader:** Label must describe the action, not the appearance ("Delete order" not "Red button").

## Composition
**Used with:** Forms, cards, dialogs, hero sections, empty states
**Spacing:** `space-3` between adjacent buttons. `space-6` between button group and preceding content.
