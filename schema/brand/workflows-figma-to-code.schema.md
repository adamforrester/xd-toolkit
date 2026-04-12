# Schema: .brand/workflows/figma-to-code.md

**Purpose:** The step-by-step process for translating a Figma design into code. Defines the tool sequence, validation checkpoints, and how to handle ambiguity.

**Tier:** Comprehensive
**Loaded:** Figma-to-code translation tasks (CLAUDE.md routing rule)

---

## Sections

### Workflow Steps (required)

The ordered process for translating Figma to code.

| Field | Required | Description |
|-------|----------|-------------|
| `Steps` | required | Numbered, ordered list of steps. Each step: what to do, which tool/MCP to use, what to check before proceeding. Minimum 5 steps. |

### Token Mapping Rules (required)

How to map Figma values to design tokens.

| Field | Required | Description |
|-------|----------|-------------|
| `Color mapping` | required | How Figma fill/stroke colors map to color tokens |
| `Typography mapping` | required | How Figma text styles map to type scale tokens |
| `Spacing mapping` | required | How Figma auto-layout/padding maps to spacing tokens |
| `Rounding rules` | required | How to handle Figma values that don't exactly match a token (e.g., "13px padding → round to `space-3` (12px)") |

### Component Mapping (required)

How to identify and use existing components.

| Field | Required | Description |
|-------|----------|-------------|
| `Component matching` | required | How to match a Figma component to a code component (by name, by Storybook search, by Code Connect) |
| `Variant mapping` | required | How Figma component variants map to code props |
| `Missing components` | required | What to do when a Figma component has no code equivalent |

### Ambiguity Handling (optional)

How to handle underspecified designs.

| Field | Required | Description |
|-------|----------|-------------|
| `Missing states` | optional | What to do when hover/focus/active/error states aren't designed |
| `Missing responsive` | optional | What to do when only one breakpoint is designed |
| `Conflicting specs` | optional | How to handle Figma values that conflict with brand tokens |

---

## Example

```markdown
# Figma to Code Workflow

## Steps
1. **Extract design context** — Use Figma Official MCP `get_design_context` to read the design frame. Note the component names, layer structure, and auto-layout settings.
2. **Inventory components** — List every component instance in the design. Search Storybook MCP for existing code components. Check `.brand/components/` for brand guidance on each.
3. **Map tokens** — Translate Figma values to design tokens (see mapping rules below). Flag any values that don't match a known token.
4. **Generate code** — Build the page using design system components + correct tokens. Reference `.brand/composition/page-types.md` for layout structure.
5. **Verify visually** — Use Playwright MCP to open the page in a browser. Compare against the Figma design (screenshot comparison if needed).
6. **Run parity check** — Use Figma Console MCP `figma_check_design_parity` for a scored diff between design and implementation.
7. **Accessibility audit** — Run A11y Scanner MCP. Fix any violations before considering complete.

## Token Mapping
**Colors:** Match Figma fill hex → closest color token. If no exact match, flag it — don't invent tokens.
**Typography:** Match Figma text style → type scale token by size. Match font weight by value.
**Spacing:** Match auto-layout padding/gap → spacing scale. Round to nearest scale value.
**Rounding:** Always round to the nearest smaller token value. 13px → `space-3` (12px), not `space-4` (16px). Document the rounding in a code comment.

## Component Mapping
**Matching:** Search Storybook MCP first. If not found, check component name against `.brand/components/` directory. If still no match, it's a custom component — build it using design system tokens.
**Variants:** Map Figma variant properties (e.g., "State=Hover, Size=Large") to component props.
**Missing:** If a Figma component has no code equivalent: build it as a new component following `.brand/workflows/code-standards.md`, write a Storybook story, add a `.brand/components/[name].md` entry.

## Ambiguity
**Missing states:** Derive from component spec. If no spec exists, use sensible defaults from the design system and flag for designer review.
**Missing responsive:** Build desktop first (from the Figma). Apply responsive rules from `.brand/composition/page-types.md`. Flag for designer review.
```
