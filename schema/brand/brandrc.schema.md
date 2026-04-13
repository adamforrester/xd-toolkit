# Schema: .brandrc.yaml

**Purpose:** Project-level configuration for the brand toolkit. Controls CLI behavior, declares which brand tier the project targets, and stores references to external assets (Figma files, URLs, etc.) used by the Brand Factory.

**Location:** Project root (alongside `CLAUDE.md`)
**Created by:** `vml-brand init`
**Used by:** CLI commands (`validate`, `update`, `doctor`), Brand Factory skills (`/brand-extract`, `/brand-analyze`)

---

## Fields

### Project Identity (required)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `client` | required | string | Client name as used in brand materials |
| `project` | optional | string | Project name within the client (e.g., "rewards-app", "2026-redesign") |
| `tier` | required | enum | Target completeness tier: `minimum`, `standard`, or `comprehensive` |

### Deployment (optional)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `deploy.platform` | optional | enum | `netlify` or `vercel` |
| `deploy.repo` | optional | string | GitHub repo (e.g., "username/project-name") |

### Brand Sources (optional)

References to source materials for the Brand Factory extraction pipeline.

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `sources.figma_file_ids` | optional | string[] | Figma file IDs for extraction (e.g., ["abc123def456"]) |
| `sources.figma_variable_collections` | optional | string[] | Specific variable collection names to extract |
| `sources.website_urls` | optional | string[] | URLs to analyze for Layout CLI extraction |
| `sources.brand_guide` | optional | string | Path to brand guide PDF (relative to project root) |
| `sources.screenshots` | optional | string[] | Paths to brand reference screenshots |

### Tool Configuration (optional)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `tools.agent` | optional | enum | Primary agent tool: `claude-code`, `cursor`, `vscode-copilot`, `codex`, `gemini` |
| `tools.storybook` | optional | boolean | Whether this project uses Storybook |
| `tools.specs_cli_pro` | optional | boolean | Whether to use specs CLI PRO features |

### Extensions (optional)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `extensions` | optional | string[] | Active extensions: `ds-pack`, `designer-skills` |

---

## Example

```yaml
# .brandrc.yaml — XD Toolkit project configuration
client: "Wendy's"
project: "rewards-app-2026"
tier: standard

deploy:
  platform: netlify
  repo: jsmith/wendys-rewards

sources:
  figma_file_ids:
    - "abc123def456"
    - "ghi789jkl012"
  figma_variable_collections:
    - "Brand Colors"
    - "Typography"
    - "Spacing"
  website_urls:
    - "https://www.wendys.com"
    - "https://www.wendys.com/rewards"
  brand_guide: "assets/wendys-brand-guide-2026.pdf"

tools:
  agent: claude-code
  storybook: true
  specs_cli_pro: false

extensions:
  - ds-pack
```

---

## Validation Rules

The `vml-brand validate` command checks:
1. `client` and `tier` are present
2. `tier` value is one of: `minimum`, `standard`, `comprehensive`
3. If `tier` is `standard` or `comprehensive`, the corresponding `.brand/` files exist
4. If `sources.figma_file_ids` is set, the Figma MCP is configured (via `vml-brand doctor`)
5. If `deploy.platform` is set, the corresponding MCP is configured
