# Schema: .brand/workflows/build-sequence.md

**Purpose:** Defines the order of operations for building a prototype — what to build first, how to layer components, and how the sequence changes based on whether a code component library exists.

**Tier:** Comprehensive
**Loaded:** Starting a new build, asking about build order (CLAUDE.md routing rule)

---

## Sections

### When a Code Component Library Exists (required)

The build sequence when the project has an installable component library (npm package, GitHub repo, or local).

| Field | Required | Description |
|-------|----------|-------------|
| `Steps` | required | Ordered steps: install library, configure Storybook MCP, read component guidance, build pages using library components, build only net-new components, follow library patterns for new components |

### When Components Exist Only in Figma (required)

The build sequence when components are designed in Figma but no code library exists.

| Field | Required | Description |
|-------|----------|-------------|
| `Steps` | required | Ordered steps: extract specs from Figma, build atomic components first (button, input, badge), review in Storybook, build composite components (card, nav, hero), review composites, assemble sections, assemble pages |

### When Prototyping Quickly (required)

The build sequence for pitch mode or rapid prototyping where speed matters more than reusability.

| Field | Required | Description |
|-------|----------|-------------|
| `Steps` | required | Ordered steps: build directly into pages, extract components after if the pitch wins |

---

## Example

```markdown
# Build Sequence

## When a code component library exists
1. Install the library as a dependency
2. Configure Storybook MCP if Storybook is available
3. Read .brand/components/ for usage guidance
4. Build pages using imported library components
5. Only build new components for things the library doesn't cover
6. New components follow the library's patterns and token usage

## When components exist only in Figma
1. Extract component specs from Figma (via MCPs)
2. Build atomic components first (button, input, badge, icon)
3. Review in Storybook — verify tokens, states, a11y
4. Build composite components (card, nav, hero, form)
5. Review composites in Storybook
6. Assemble into page sections
7. Assemble sections into full pages

## When prototyping quickly (pitch mode)
1. Build directly into pages — speed over reusability
2. Extract components after if the pitch wins
```
