# Schema: .brand/overview.md

**Purpose:** The brand's core identity — personality, audience, visual language, and positioning. This is the single most important file in the brand package. It loads every session and provides the foundational context that all other brand files build on.

**Tier:** Minimum
**Loaded:** Every session (referenced directly in CLAUDE.md)
**Target size:** ~200 tokens (keep it dense — this is always in context)
**Auto-generates:** `.impeccable.md` in project root (for Impeccable skill brand context)

---

## Sections

### Brand Identity (required)

The brand's name, tagline, and one-sentence positioning statement.

| Field | Required | Description |
|-------|----------|-------------|
| `Brand name` | required | Official brand name as used in customer-facing materials |
| `Tagline` | optional | Brand tagline or slogan, if one exists |
| `Positioning` | required | One sentence: what the brand is, who it's for, what makes it distinct |

### Brand Personality (required)

How the brand feels. These adjectives and descriptions drive design decisions — they're what agents use to make judgment calls about visual treatment, tone, and interaction style.

| Field | Required | Description |
|-------|----------|-------------|
| `Personality traits` | required | 3-5 adjectives that define the brand character (e.g., "bold, playful, irreverent") |
| `Brand archetype` | optional | Jungian archetype or equivalent framework position (e.g., "The Jester", "The Explorer") |
| `Personality description` | required | 2-3 sentences expanding on the traits — how they manifest in design and communication |

### Audience (required)

Who the brand speaks to. Agents use this to calibrate complexity, tone, and design assumptions.

| Field | Required | Description |
|-------|----------|-------------|
| `Primary audience` | required | Who the main users/customers are — demographics, psychographics, or behavioral description |
| `Secondary audiences` | optional | Other important audience segments |
| `Audience context` | optional | Key insight about the audience that should influence design (e.g., "primarily mobile, often in a hurry") |

### Visual Language (required)

The high-level visual direction. Not specific tokens (those live in `tokens/`) — this is the *feel*.

| Field | Required | Description |
|-------|----------|-------------|
| `Visual direction` | required | 2-3 sentences describing the overall visual approach (e.g., "Clean and modern with bold color accents. Photography-forward. Generous whitespace.") |
| `Design principles` | required | 3-5 design principles that guide visual decisions (e.g., "Clarity over cleverness", "Warmth through color, not decoration") |
| `Signature elements` | optional | Distinctive visual elements unique to this brand (e.g., "diagonal cuts on containers", "rounded everything", "the red swoosh motif") |

### Competitive Context (optional)

Where the brand sits relative to competitors. Helps agents avoid designs that look like the wrong brand.

| Field | Required | Description |
|-------|----------|-------------|
| `Differentiation` | optional | What visually or tonally distinguishes this brand from competitors |
| `Avoid resemblance to` | optional | Specific brands or styles to avoid looking like |

---

## Example

```markdown
# Brand Overview

## Brand Identity
**Brand:** Wendy's
**Tagline:** Fresh, never frozen
**Positioning:** A fast-food restaurant that competes on food quality and personality, not just speed and price.

## Brand Personality
**Traits:** Bold, playful, irreverent, confident, witty
**Archetype:** The Jester
Wendy's doesn't take itself too seriously, but it takes its food seriously. The brand voice is the friend who roasts you but always has your back. Design should feel energetic and unpretentious — never corporate, never trying too hard.

## Audience
**Primary:** Fast-food consumers ages 18-35 who value quality and personality over pure convenience
**Context:** Mobile-first ordering. Often browsing during commute or downtime. Short attention spans, high design literacy from social media.

## Visual Language
**Direction:** High-energy, photography-forward, bold color blocking. The red is *the* red — it's warm, not aggressive. Layouts are confident with strong hierarchy and minimal decoration.
**Principles:**
1. Food is the hero — every layout puts the product front and center
2. Bold, not loud — confident use of space and color without visual clutter
3. Personality through copy, not decoration — let the voice do the heavy lifting
4. Mobile-native — design for the phone first, always

**Signature elements:** The Wendy cameo, red-and-white color blocking, the square hamburger motif

## Competitive Context
**Differentiation:** Personality-driven where competitors (McDonald's, Burger King) lean on scale or flame-grilling. Wendy's wins on wit.
**Avoid resemblance to:** McDonald's yellow/red warmth (Wendy's red is cooler), Burger King's flame aesthetic, Chick-fil-A's earnestness
```
