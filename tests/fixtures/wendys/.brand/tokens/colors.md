# Color System

## Philosophy
Red is the brand. It's warm, energetic, and unmistakable. The palette supports red with clean neutrals and minimal secondary colors — we don't dilute the red's impact with competing hues.

**Strategy:** Monochromatic primary with neutral support. Secondary colors exist for data visualization and status only.

## Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `color-primary` | #E2231A | Brand red. Hero sections, primary CTAs, key accents. Never on large background areas. |
| `color-primary-dark` | #C1190F | Hover/active states on primary. High-contrast pairing with white text (7.2:1). |
| `color-primary-light` | #FF6B61 | Highlights, tags, subtle accents. Not for text. |

## Neutral Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `color-neutral-900` | #1A1A1A | Primary text |
| `color-neutral-700` | #4A4A4A | Secondary text |
| `color-neutral-400` | #999999 | Placeholder text, disabled states (use sparingly — check contrast) |
| `color-neutral-200` | #E5E5E5 | Borders, dividers |
| `color-neutral-50` | #F8F8F8 | Surface backgrounds |
| `color-white` | #FFFFFF | Primary background |

## Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `color-success` | #2E7D32 | Success states, confirmations, positive indicators |
| `color-warning` | #F9A825 | Warnings, caution states. Always pair with icon — not colorblind-safe alone. |
| `color-error` | #D32F2F | Errors, destructive actions. Distinct from brand red (cooler, more urgent). |
| `color-info` | #1565C0 | Informational states, links, interactive elements |

## Application Context
**Backgrounds:**
- Page backgrounds: `color-white` or `color-neutral-50` only
- Section backgrounds: `color-white`, `color-neutral-50`, or `color-primary` as a narrow color-block accent strip (not full-bleed). Red backgrounds are for small contained areas (badges, banners, promotional strips) — never full page sections.
- Card backgrounds: `color-white` with `color-neutral-200` border or subtle shadow
- Hero sections: white or neutral-50 background. Red appears as accent (CTA button, headline underline) not as the section background.

**Text:**
- Headings: `color-neutral-900` on light backgrounds, `color-white` on red accent areas
- Body: `color-neutral-900` (primary), `color-neutral-700` (secondary)
- Links: `color-info` with underline on hover

**Accents (where primary red appears):**
- Primary CTA buttons (filled red)
- Badges, tags, and promotional labels
- Active/selected states (nav items, tabs)
- Icon highlights and small graphic elements
- The Wendy cameo and brand marks
- NOT as full-section or full-page backgrounds

## Technical Constraints
- Minimum contrast: 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- `color-primary` on white: 4.6:1 — passes AA for large text only. Use `color-primary-dark` for small text on white.
- Never use brand red for error states — use `color-error` (distinct hue avoids confusion)
- Maximum 3 colors per component (excluding neutrals)
