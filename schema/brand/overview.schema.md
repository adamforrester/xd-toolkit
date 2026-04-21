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
| `Key use cases` | optional | Primary tasks users perform — the jobs they're trying to get done (e.g., "order food for pickup", "check loyalty points", "browse the menu"). Used by Impeccable's context gathering protocol. |

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
| `Aesthetic anti-patterns` | optional | Styles and aesthetics this brand explicitly rejects. Not just competitor avoidance — broader aesthetic directions that conflict with the brand personality (e.g., "NOT corporate minimalist, NOT startup playful, NOT enterprise gray, NOT glassmorphic, NOT neobrutalist"). Inferred from brand personality and visual direction: if the brand is "confident, professional, playful" then it's NOT "austere, minimal, serious." |

### Brand Self-Test (optional)

A short checklist (5-10 yes/no questions) that agents run against any output to verify it "feels like" the brand. These questions are brand-specific, not generic — they're generated from the brand personality, visual direction, signature elements, and anti-patterns.

| Field | Required | Description |
|-------|----------|-------------|
| `Questions` | optional | 5-10 yes/no questions. Each question tests one specific brand attribute. Mix of visual (typography, color, layout), tonal (copy, voice), and holistic (overall feel) questions. The first question should always be: "Could this screen belong to a competitor? (should be NO)". The last should be an overall feel check tied to the visual atmosphere. |

**When to run:** Before presenting any visual work. The `/critique` skill and `/brand-check` command should reference this self-test when evaluating output.

**How to generate:** Infer from brand personality traits, visual direction, design principles, signature elements, and anti-patterns. Each question should be falsifiable — a wrong answer means something specific needs to change.

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
**Key use cases:** Order food for pickup or delivery, browse the menu, check Wendy's Rewards points, find a nearby location, customize an order

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
**Aesthetic anti-patterns:** NOT corporate minimalist (too sterile), NOT fast-casual upscale (too serious), NOT retro diner (too nostalgic), NOT flat/generic (too forgettable). Wendy's is modern and energetic — never stuffy, never trying to be something it isn't.

## Brand self-test (run before presenting work)
1. Could this screen belong to a competitor? (should be NO)
2. Is the food photography front and center — not buried below the fold?
3. Does the copy have personality — would you smile reading it?
4. Is the red warm (Wendy's red), not aggressive or cool?
5. Does the layout feel confident — strong hierarchy, no clutter?
6. Could this headline work as a tweet? (tone check)
7. Is the Wendy cameo present (header, footer, or watermark)?
8. Are interactive elements obvious — no mystery meat navigation?
9. Does this feel mobile-native, not desktop-shrunk?
10. Would a 22-year-old scrolling on their phone stop and engage? (energy check)
```
