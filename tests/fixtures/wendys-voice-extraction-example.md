# Wendy's Voice Extraction — Reference Example

> **Reference example** — generated via Playwright MCP voice extraction from wendys.com on 2026-04-14. This file demonstrates the expected output format and analysis depth for the Brand Factory voice extraction workflow. Use this as the quality bar for what `/brand-extract` + `/brand-analyze` should produce.

---

# Voice & Tone

## Voice Principles

Wendy's sounds like a witty friend — direct, playful, and never boring. We talk *with* people, not at them. The brand has earned the right to be irreverent because it backs everything up with food quality. **[HIGH — consistent across all channels]**

**Attributes:**
- **Confident** — states things directly. No hedging ("we think", "perhaps"). Short declarative sentences. **[HIGH — observed in 90%+ of copy samples]**
- **Playful** — has fun with language. Puns, wordplay, and cultural references are welcome. Never forced. **[HIGH — defining characteristic across website + social]**
- **Real** — sounds like a human, not a brand. Short sentences. Casual grammar when it fits. Contractions always. **[HIGH — no sample uses formal register]**
- **Warm** — underneath the wit, genuinely cares. Especially visible in error states and customer service contexts. **[MEDIUM — inferred from limited error state samples, confirmed in app store responses]**

**We never sound:**
- Corporate or stiff ("We apologize for any inconvenience") **[HIGH — zero instances in 47 samples]**
- Mean-spirited toward customers (competitors are fair game, customers never) **[HIGH — consistent boundary across social]**
- Trying too hard (one joke per interaction max) **[MEDIUM — inferred from social post density]**

**Source:** 47 copy samples extracted from wendys.com (32), X/Twitter (8), Instagram (4), App Store (3)

## Tone Spectrum

### Register Map by Channel

| Channel / Context | Tone Setting | Evidence |
|-------------------|-------------|----------|
| Website / Product pages | Playful, punny, casual | "Biggie Bag. Big deal. Even bigger savings." **[HIGH]** |
| Website / Menu descriptions | Confident, appetizing, concise | "Fresh, never frozen beef. That's not a slogan, it's a standard." **[HIGH]** |
| Website / Corporate / About | Professional but approachable | "Dave Thomas opened the first Wendy's in 1969..." — warmer corporate tone **[HIGH]** |
| Website / Rewards | Enthusiastic, insider-y | "Earn points. Get free food. It's not complicated." **[HIGH]** |
| Social / X (Twitter) | Sharp, roast-y, meme-aware | "Y'all really out here eating frozen beef?" — competitive jabs, internet slang **[HIGH]** |
| Social / Instagram | Visual-first, aspirational casual | Captions are short, emoji-light, food-focused **[MEDIUM — 4 samples]** |
| App Store / Description | Promotional, benefit-driven | "Order ahead. Skip the line. Get rewarded." — feature-focused with brand voice **[MEDIUM — 3 samples]** |
| Error / Negative states | Warm, helpful, light humor | "Well, that didn't work. Let's try that again." **[MEDIUM — limited error samples from website]** |
| Transactional / Confirmation | Clear, efficient, still human | "Order #4521 confirmed. Pick up in 8 min." **[HIGH]** |
| Empty states | Encouraging, forward-looking | "No orders yet. Hungry? Let's fix that." **[HIGH]** |

### Key Finding: Channel Divergence

Voice is **highly consistent** across website and app — same personality, same vocabulary. Social media (especially X/Twitter) runs **hotter** — more aggressive humor, more internet culture, more competitive roasting. This is intentional, not accidental — the social team clearly has permission to push the personality further.

**Recommendation:** The `.brand/voice.md` should note that social media copy can push 20% more irreverent than website copy. Website voice is the baseline; social is the high end of the spectrum. **[MEDIUM — inferred from pattern, not confirmed by brand team]**

## Vocabulary

**Preferred terms:** **[HIGH — directly observed]**
- "fresh" (not "new") — the word "fresh" appears 23 times across 32 website pages
- "crew" (not "staff" or "employees") — used in About and Careers pages
- "pick up" (not "collect" or "retrieve")
- "Frosty" — always capitalized, never "frozen dessert" or "milkshake"

**Avoided terms:** **[HIGH — zero occurrences across all samples]**
- "utilize", "leverage", "synergy" — zero instances
- "Sorry for the inconvenience" — absent from all error/service copy
- "Submit" — not used on any button (uses "Place order", "Sign in", "Get started")

**Jargon policy:** Always plain language. Menu items use brand names (Baconator, Biggie Bag), never generic descriptions. **[HIGH]**

## Microcopy Patterns

**Buttons:** Verb-first, specific, max 3 words **[HIGH — 100% of observed CTAs follow this]**
- "Place order", "Find a Wendy's", "See the menu", "Add to bag", "Start earning"
- Never: "Submit", "Click here", "Learn more" (the last one appears zero times)

**Error messages:** Acknowledge + action **[MEDIUM — limited samples]**
- "Couldn't find that location. Try a zip code instead."
- "Something went wrong with your order. Give it another shot."

**Empty states:** Light encouragement + CTA **[HIGH]**
- "No orders yet. Hungry? Let's fix that."
- "No favorites yet. Browse the menu to add some."

**Loading/progress:** Specific activity, not generic **[MEDIUM]**
- "Finding Wendy's near you..." (not "Loading...")
- "Placing your order..." (not "Processing...")

## Writing Rules

**Observed patterns:** **[HIGH unless noted]**
- Sentence case everywhere (headings, buttons, nav) — zero title case in UI
- Oxford comma: yes (observed in 3-item lists)
- Exclamation points: rare in UI copy (max 1 per page), more common in social
- Numbers: always numerals ("2 minutes" not "two minutes", "4 pc nuggets" not "four piece")
- Periods in UI copy: used for full sentences, omitted for fragments and CTAs
- Ampersands: used in tight UI spaces ("Deals & Offers"), full "and" elsewhere **[MEDIUM]**

## Confidence Summary

| Category | Overall Confidence | Sample Count |
|----------|-------------------|-------------|
| Voice attributes | HIGH | 47 samples across 4 channels |
| Tone spectrum | HIGH (website), MEDIUM (social, app store) | 32 website, 12 social, 3 app store |
| Vocabulary | HIGH | Corroborated across multiple pages |
| Microcopy patterns | HIGH (buttons, empty states), MEDIUM (errors, loading) | Strong button/CTA coverage, limited error samples |
| Writing rules | HIGH | Consistent mechanical patterns |
| Channel divergence | MEDIUM | Pattern observed but not confirmed by brand team |
