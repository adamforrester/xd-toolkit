# Schema: .brand/CHANGELOG.md

**Purpose:** Version history for the brand package. Tracks what changed, when, and why — useful for auditing brand evolution and understanding when specific guidance was added or modified.

**Tier:** Standard (auto-created; maintained at all tiers)
**Loaded:** On demand (not auto-loaded)

---

## Sections

### Changelog Entries (required)

Standard reverse-chronological changelog.

| Field | Required | Description |
|-------|----------|-------------|
| `Version` | required | SemVer: major (brand overhaul), minor (new sections/components), patch (corrections/refinements) |
| `Date` | required | ISO 8601 date |
| `Changes` | required | Bulleted list of changes, grouped by Added / Changed / Removed |
| `Source` | optional | What triggered the change (e.g., "Brand refresh Q3 2026", "/brand-refresh run against updated guidelines") |

---

## Example

```markdown
# Brand Package Changelog

## [1.1.0] - 2026-05-15
**Source:** New menu launch — updated food photography style
### Added
- `components/menu-card.md` — guidance for new menu item card component
- `tokens/colors.md` — added `color-accent-green` for health-focused menu items
### Changed
- `composition/page-types.md` — updated menu page structure for new category tabs

## [1.0.0] - 2026-04-01
**Source:** Initial brand package from /brand-analyze
### Added
- Complete brand package: overview, voice, all tokens, 8 components, 3 page types
- All composition patterns and anti-patterns
- Full workflow documentation
```
