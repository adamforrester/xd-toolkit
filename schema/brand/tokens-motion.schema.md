# Schema: .brand/tokens/motion.md

**Purpose:** Animation and transition principles — timing, easing, and when motion is appropriate. Agents reference this for all transitions, animations, and micro-interactions.

**Tier:** Minimum
**Loaded:** Visual implementation tasks (CLAUDE.md routing rule)

---

## Sections

### Motion Philosophy (required)

The brand's relationship with animation.

| Field | Required | Description |
|-------|----------|-------------|
| `Motion personality` | required | How motion reflects the brand (e.g., "Quick and playful" vs. "Slow and elegant") |
| `Purpose rule` | required | When motion is appropriate — every animation must serve a purpose |
| `Reduced motion` | required | How to handle `prefers-reduced-motion` — which animations are essential (keep) vs. decorative (remove) |

### Duration Scale (required)

Named duration values.

| Field | Required | Description |
|-------|----------|-------------|
| `Durations` | required | Each step: token name, millisecond value, use case. Minimum 3 steps (fast, normal, slow). |

### Easing Functions (required)

Named easing curves.

| Field | Required | Description |
|-------|----------|-------------|
| `Easings` | required | Each curve: token name, CSS value (cubic-bezier or keyword), when to use it |

### Transition Patterns (optional)

Common transition recipes.

| Field | Required | Description |
|-------|----------|-------------|
| `Patterns` | optional | Named patterns: what triggers them, what properties animate, duration + easing to use (e.g., "Page enter: opacity 0→1 + translateY 8px→0, 200ms ease-out") |

### Motion Anti-patterns (optional)

What to avoid.

| Field | Required | Description |
|-------|----------|-------------|
| `Anti-patterns` | optional | Specific motion mistakes (e.g., "Never animate layout properties (width, height, top, left) — use transform instead", "No bounce easing — doesn't match brand") |

---

## Example

```markdown
# Motion

## Philosophy
**Personality:** Quick and snappy. Wendy's doesn't linger. Transitions are fast enough to feel responsive, slow enough to be perceived.
**Purpose:** Every animation must either (1) show cause and effect, (2) guide attention, or (3) provide feedback. Decorative animation is not Wendy's — save it for luxury brands.
**Reduced motion:** Honor `prefers-reduced-motion: reduce`. Remove all decorative transitions. Keep: focus rings, loading indicators, and critical state changes (use `opacity` only, no movement).

## Duration Scale
| Token | Value | Use |
|-------|-------|-----|
| `duration-fast` | 100ms | Hover states, color changes, opacity toggles |
| `duration-normal` | 200ms | Element enter/exit, expand/collapse, most transitions |
| `duration-slow` | 350ms | Page transitions, large layout shifts, modal open/close |
| `duration-slower` | 500ms | Complex choreographed sequences only (rare) |

## Easing
| Token | Value | Use |
|-------|-------|-----|
| `ease-default` | `cubic-bezier(0.2, 0, 0, 1)` | Standard transitions — elements entering or changing state |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements exiting the viewport or disappearing |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the viewport or appearing |
| `ease-linear` | `linear` | Progress bars, loading indicators only |

## Transition Patterns
- **Hover:** `background-color` or `color`, `duration-fast`, `ease-default`
- **Modal open:** overlay `opacity` `duration-normal`, panel `translateY` 16px→0 + `opacity` `duration-normal` `ease-out`
- **Modal close:** reverse of open, `ease-in`
- **Toast enter:** `translateY` -100%→0 + `opacity`, `duration-normal`, `ease-out`
- **Skeleton → content:** `opacity` crossfade, `duration-slow`

## Anti-patterns
- No bounce easing — too playful for UI (reserve for marketing animations if ever)
- Never animate `width`, `height`, `top`, `left`, `margin`, `padding` — use `transform` and `opacity`
- No animation longer than 500ms in UI — the user is waiting
- Don't chain more than 2 sequential animations — feels sluggish
```
