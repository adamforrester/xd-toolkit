# Schema: .brand/components/[name].md

**Purpose:** Per-component brand guidance — when to use a component, which variants to prefer, anti-patterns, and accessibility requirements. This is an AI guidance layer that supplements (not replaces) component documentation in Storybook or code.

**Tier:** Standard
**Loaded:** When working on a specific component (CLAUDE.md routing rule)
**File naming:** Lowercase kebab-case matching the component name (e.g., `button.md`, `card.md`, `navigation-bar.md`)

---

## Sections

### Overview (required)

What this component is and its role in the brand's UI.

| Field | Required | Description |
|-------|----------|-------------|
| `Purpose` | required | One sentence: what this component does and why it exists |
| `Brand role` | required | How this component expresses the brand (e.g., "Buttons are where the brand voice is most concentrated — CTAs should feel like Wendy's talking to you") |

### Variants (required)

The available variants and when to use each.

| Field | Required | Description |
|-------|----------|-------------|
| `Variants` | required | Each variant: name, visual description, when to use it. Include the primary/default variant. |
| `Default variant` | required | Which variant is the default and why |
| `Variant selection rules` | optional | Decision logic for choosing between variants (e.g., "Use `ghost` only inside cards or on dark backgrounds") |

### Content Guidelines (optional)

Copy and content rules specific to this component.

| Field | Required | Description |
|-------|----------|-------------|
| `Label patterns` | optional | How to write labels/text for this component (e.g., "Button labels: verb + noun, max 3 words") |
| `Content limits` | optional | Character counts, line limits, truncation rules |

### Anti-patterns (required)

What NOT to do with this component.

| Field | Required | Description |
|-------|----------|-------------|
| `Anti-patterns` | required | Specific misuses with explanation. Minimum 2. (e.g., "Don't use a card as a button — if the whole thing is clickable, use a link or button with appropriate ARIA.") |

### Accessibility (required)

Component-specific a11y requirements beyond WCAG baseline.

| Field | Required | Description |
|-------|----------|-------------|
| `ARIA requirements` | required | Required ARIA attributes, roles, and states |
| `Keyboard behavior` | required | Expected keyboard interaction (e.g., "Enter/Space activates. Tab moves focus to next element.") |
| `Screen reader` | optional | What should be announced, in what order |

### Composition Rules (optional)

How this component relates to others.

| Field | Required | Description |
|-------|----------|-------------|
| `Used with` | optional | Components this one is commonly composed with |
| `Nesting rules` | optional | Can this component contain other instances of itself? What can/can't go inside it? |
| `Spacing` | optional | Recommended spacing tokens when placing this component (references `tokens/spacing.md`) |

---

## Example

```markdown
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
```
