# Schema: .brand/voice.md

**Purpose:** Voice and tone guidelines for all user-facing copy. Agents reference this when writing headlines, button labels, error messages, empty states, tooltips, and any other microcopy.

**Tier:** Minimum
**Loaded:** Copywriting tasks (CLAUDE.md routing rule)

---

## Sections

### Voice Principles (required)

The brand's consistent voice — how it always sounds regardless of context.

| Field | Required | Description |
|-------|----------|-------------|
| `Voice description` | required | 2-3 sentences describing the brand's voice character |
| `Voice attributes` | required | 3-5 attributes with brief explanations (e.g., "Confident — states things directly, avoids hedging language") |
| `Voice anti-attributes` | required | What the voice is NOT (e.g., "Never sarcastic at the user's expense", "Never corporate jargon") |

### Tone Spectrum (required)

Tone shifts by context while voice stays constant. Define how tone adapts.

| Field | Required | Description |
|-------|----------|-------------|
| `Tone by context` | required | How tone shifts across contexts: celebration, error/failure, onboarding, transactional, empty states. Minimum 3 contexts. |

### Vocabulary (required)

Specific word choices that reinforce the brand.

| Field | Required | Description |
|-------|----------|-------------|
| `Preferred terms` | required | Words/phrases the brand uses (e.g., "Sign in" not "Log in", "Team members" not "Users") |
| `Avoided terms` | required | Words/phrases the brand never uses, with rationale |
| `Jargon policy` | optional | How the brand handles industry/technical jargon |

### Microcopy Patterns (optional)

Reusable patterns for common UI copy situations.

| Field | Required | Description |
|-------|----------|-------------|
| `Button labels` | optional | Pattern for CTAs (e.g., "Action-oriented verbs: 'Get started', 'Place order' — not 'Submit', 'Click here'") |
| `Error messages` | optional | Formula for error copy (e.g., "What happened + what to do: 'We couldn't save your changes. Try again, or contact support.'") |
| `Empty states` | optional | Pattern for empty/zero-data states |
| `Confirmation messages` | optional | Pattern for success/confirmation copy |
| `Loading states` | optional | How to communicate waiting (e.g., "Use specific activity: 'Finding your order...' not 'Loading...'") |

### Writing Rules (optional)

Mechanical rules for consistency.

| Field | Required | Description |
|-------|----------|-------------|
| `Capitalization` | optional | Title case vs. sentence case for headings, buttons, nav items |
| `Punctuation` | optional | Oxford comma, exclamation point policy, ellipsis usage |
| `Number formatting` | optional | Numerals vs. words, currency format, date format |
| `Abbreviations` | optional | Which abbreviations are acceptable |

---

## Example

```markdown
# Voice & Tone

## Voice Principles
Wendy's sounds like a witty friend — direct, playful, and never boring. We talk *with* people, not at them.

**Attributes:**
- **Confident** — we state things directly. No "we think" or "perhaps you might."
- **Playful** — we have fun with language. Puns welcome. Wordplay encouraged.
- **Real** — we sound like a human, not a brand. Short sentences. Casual grammar when it fits.
- **Warm** — underneath the wit, we genuinely care. Especially in error states.

**We never sound:**
- Corporate or stiff ("We apologize for any inconvenience")
- Mean-spirited (roast competitors, never customers)
- Trying too hard (one joke per interaction max)

## Tone Spectrum
| Context | Tone | Example |
|---------|------|---------|
| Celebration | Enthusiastic, high-energy | "Nailed it. Your order's on the way." |
| Error | Warm, helpful, light touch of humor | "Well, that didn't work. Let's try that again." |
| Onboarding | Welcoming, clear, minimal cleverness | "Let's get you set up. It takes about 2 minutes." |
| Transactional | Clear, efficient, still human | "Order #4521 confirmed. Pick up in 8 min." |
| Empty state | Encouraging, forward-looking | "No orders yet. Hungry? Let's fix that." |

## Vocabulary
**Preferred:** "fresh" (not "new"), "crew" (not "staff"), "pick up" (not "collect")
**Avoided:** "utilize", "leverage", "synergy", any corporate buzzword. "Sorry for the inconvenience" is banned.
**Jargon:** Always plain language. If a term needs explaining, we're using the wrong term.

## Microcopy Patterns
**Buttons:** Verb-first, specific: "Place order", "Find a Wendy's", "See the menu"
**Errors:** Acknowledge + action: "Couldn't find that location. Try a zip code instead."
**Empty states:** Light encouragement + CTA: "No favorites yet. Browse the menu to add some."

## Writing Rules
- Sentence case everywhere (headings, buttons, nav)
- Oxford comma: yes
- Exclamation points: max 1 per screen
- Numbers: always numerals ("2 minutes" not "two minutes")
```
