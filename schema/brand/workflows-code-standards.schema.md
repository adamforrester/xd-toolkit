# Schema: .brand/workflows/code-standards.md

**Purpose:** Framework conventions, file structure, and coding patterns for this specific client project. Agents reference this when generating any code to ensure consistency with the project's technical decisions.

**Tier:** Comprehensive
**Loaded:** Code generation tasks (CLAUDE.md routing rule)

---

## Sections

### Tech Stack (required)

The project's technology choices.

| Field | Required | Description |
|-------|----------|-------------|
| `Framework` | required | Primary framework and version (e.g., "Next.js 15", "Astro 4", "React + Vite") |
| `Styling` | required | CSS approach (e.g., "Tailwind CSS 4", "CSS Modules", "styled-components") |
| `Language` | required | TypeScript or JavaScript, and strictness level |
| `Key dependencies` | optional | Other significant dependencies and their purpose |

### File Structure (required)

How the project is organized.

| Field | Required | Description |
|-------|----------|-------------|
| `Directory structure` | required | Key directories and their purpose |
| `Naming conventions` | required | File naming (kebab-case, PascalCase, etc.), component file structure (single file, folder per component) |
| `Import conventions` | optional | Absolute vs. relative imports, path aliases |

### Component Conventions (required)

How components are built in this project.

| Field | Required | Description |
|-------|----------|-------------|
| `Component structure` | required | The expected structure of a component file (imports, types, component, exports) |
| `Props pattern` | required | How props are typed and destructured |
| `State management` | optional | How state is managed (local, context, store) |
| `Styling pattern` | required | How styles are applied to components (e.g., "Tailwind utility classes in JSX, no @apply") |

### Code Rules (required)

Project-specific code conventions.

| Field | Required | Description |
|-------|----------|-------------|
| `Rules` | required | Explicit rules: token usage enforcement, component reuse requirements, accessibility patterns, performance patterns |

---

## Example

```markdown
# Code Standards

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4 with design system tokens as CSS custom properties
- **Language:** TypeScript (strict mode)
- **Key deps:** Framer Motion (animation), Radix UI (accessible primitives)

## File Structure
```
src/
  app/           # Next.js App Router pages
  components/
    ui/          # Design system primitives (Button, Card, Input)
    features/    # Feature-specific composed components
    layout/      # Header, Footer, Sidebar, PageShell
  lib/           # Utilities, hooks, API clients
  styles/        # Global CSS, token definitions
```

**Naming:** Components: PascalCase folders with `index.tsx` + `[name].module.css` if needed. Pages: Next.js conventions (page.tsx, layout.tsx).
**Imports:** Use `@/` path alias for `src/` directory.

## Component Conventions
**Structure:**
1. Imports (external → internal → styles → types)
2. Type definitions (exported interface for props)
3. Component function (named export, not default)
4. No barrel exports in component directories

**Props:** Interface with descriptive names. Extend HTML element props where appropriate.
**Styling:** Tailwind utility classes. Design tokens via `var(--token-name)`. No inline styles. No `@apply`.

## Code Rules
- Every color must reference a CSS custom property from the design system. No hex in JSX.
- Every spacing value must use a Tailwind spacing class that maps to a token. No arbitrary values (`[13px]`).
- Use Radix UI primitives for: Dialog, Dropdown, Tabs, Accordion, Tooltip. Don't rebuild these.
- All images: Next.js `Image` component with explicit width/height or `fill`. No `<img>` tags.
- All interactive elements must be keyboard-navigable. Test with Tab key.
```
