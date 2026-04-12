# Schema: .brand/workflows/qa-checklist.md

**Purpose:** Brand-specific QA steps beyond standard technical checks. Agents run through this checklist before considering a page or feature complete.

**Tier:** Comprehensive
**Loaded:** QA and final review tasks (CLAUDE.md routing rule)

---

## Sections

### Brand Compliance Checks (required)

Visual and tonal checks against the brand package.

| Field | Required | Description |
|-------|----------|-------------|
| `Checks` | required | Each check: what to verify, how to verify it (manual or tooling), pass/fail criteria. Minimum 5 checks. |

### Technical Quality Checks (required)

Standard quality gates that are always enforced.

| Field | Required | Description |
|-------|----------|-------------|
| `Checks` | required | Accessibility, performance, responsive, cross-browser checks with specific pass criteria |

### Content Checks (optional)

Copy and content quality verification.

| Field | Required | Description |
|-------|----------|-------------|
| `Checks` | optional | Voice consistency, placeholder text removal, link validation, image alt text |

---

## Example

```markdown
# QA Checklist

## Brand Compliance
- [ ] All colors use design tokens — no hex/rgb in source (`grep -r "#[0-9a-fA-F]" src/`)
- [ ] Typography uses only approved fonts — no system font fallbacks visible
- [ ] Spacing uses scale tokens — no arbitrary values (`grep -r "\[.*px\]" src/`)
- [ ] Component variants match `.brand/components/` guidance
- [ ] No composition anti-patterns present (check against `.brand/composition/anti-patterns.md`)
- [ ] Primary CTA count: max 1 per viewport
- [ ] Brand red (`color-primary`) not used for error states

## Technical Quality
- [ ] WCAG 2.1 AA: A11y Scanner MCP passes with 0 critical violations
- [ ] Keyboard navigation: all interactive elements reachable via Tab, activatable via Enter/Space
- [ ] Lighthouse Performance > 80
- [ ] Lighthouse Accessibility > 90
- [ ] Responsive: renders correctly at 375px, 768px, 1024px, 1440px
- [ ] No console errors in browser DevTools
- [ ] Images: all use Next.js Image (or equivalent), have alt text, are optimized

## Content
- [ ] No lorem ipsum or placeholder text remaining
- [ ] All copy follows `.brand/voice.md` — correct tone for context
- [ ] Button labels follow the verb + object pattern
- [ ] Error messages follow the acknowledge + action formula
- [ ] All links resolve (no 404s)
```
