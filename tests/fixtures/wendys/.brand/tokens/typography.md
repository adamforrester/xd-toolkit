# Typography

## Philosophy
Type does the heavy lifting. Wendy's voice is distinctive — the typography needs to carry that personality without relying on illustration or decoration. Bold, clear, no-nonsense.

**Pairing:** A geometric sans (headings) for personality and a humanist sans (body) for warmth and readability. Both are unpretentious — no serifs, no scripts.

## Font Families
**Primary:** Inter
- Weights: 400 (Regular), 500 (Medium), 700 (Bold)
- Role: Body text, UI elements, secondary headings
- Source: Google Fonts
- Fallback: `system-ui, -apple-system, sans-serif`

**Display:** Plus Jakarta Sans
- Weights: 600 (SemiBold), 700 (Bold), 800 (ExtraBold)
- Role: H1-H3 headings, hero text, CTAs
- Source: Google Fonts
- Fallback: `Inter, system-ui, sans-serif`

**Loading:** `font-display: swap` for both. Preload display font (used above fold).

## Type Scale
| Token | Size | Line Height | Letter Spacing | Use |
|-------|------|-------------|----------------|-----|
| `text-xs` | 0.75rem (12px) | 1.5 | 0.02em | Captions, legal text |
| `text-sm` | 0.875rem (14px) | 1.5 | 0 | Labels, secondary text |
| `text-base` | 1rem (16px) | 1.6 | 0 | Body text |
| `text-lg` | 1.125rem (18px) | 1.55 | 0 | Lead paragraphs |
| `text-xl` | 1.25rem (20px) | 1.4 | -0.01em | H4, card titles |
| `text-2xl` | 1.5rem (24px) | 1.3 | -0.01em | H3 |
| `text-3xl` | 1.875rem (30px) | 1.25 | -0.02em | H2 |
| `text-4xl` | 2.25rem (36px) | 1.2 | -0.02em | H1 |
| `text-5xl` | 3rem (48px) | 1.1 | -0.03em | Hero headlines |

**Responsive:** Headings (2xl+) scale down by ~20% below 768px. Body text stays fixed.

## Font Weights
| Weight | Value | Use |
|--------|-------|-----|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, nav items, emphasis within body |
| SemiBold | 600 | Sub-headings (display font only) |
| Bold | 700 | Headings, CTAs, key data |
| ExtraBold | 800 | Hero headlines only (display font only) |

**Restriction:** Never use 300 (Light) — not in either font's loaded weight range, and too thin for brand personality.

## Usage Rules
- Minimum body text: 16px (1rem). No exceptions.
- Maximum line length: 65 characters for body text
- Hierarchy: size + weight, never color alone
- Headings always use display font. Body always uses primary font. No mixing.
- Enable `font-feature-settings: "kern" 1, "liga" 1` on all text
