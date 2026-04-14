# Schema: .brandrc.yaml

**Purpose:** Project-level configuration for the brand toolkit. Controls CLI behavior, declares which brand tier the project targets, and stores references to external assets (Figma files, URLs, etc.) used by the Brand Factory.

**Location:** Project root (alongside `CLAUDE.md`)
**Created by:** `xd-toolkit init`
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

References to source materials for the Brand Factory extraction pipeline. Drives what `/brand-extract` crawls without prompting the practitioner during extraction.

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `sources.website` | optional | string | Primary website URL (always crawled for voice + token extraction) |
| `sources.website_pages` | optional | string[] | Additional paths beyond homepage to crawl (e.g., ["/about", "/products", "/contact"]) |
| `sources.social.twitter` | optional | string | X/Twitter profile URL |
| `sources.social.instagram` | optional | string | Instagram profile URL |
| `sources.social.linkedin` | optional | string | LinkedIn company page URL |
| `sources.social.facebook` | optional | string | Facebook page URL |
| `sources.social.tiktok` | optional | string | TikTok profile URL |
| `sources.app_store.ios` | optional | string | iOS App Store listing URL |
| `sources.app_store.android` | optional | string | Google Play Store listing URL |
| `sources.figma` | optional | string[] | Figma file IDs for extraction via specs CLI + Figma MCP |
| `sources.figma_variable_collections` | optional | string[] | Specific variable collection names to extract |
| `sources.live_urls` | optional | string[] | Live product URLs for token extraction via Layout CLI |
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
| `extensions` | optional | string[] | Active extensions: `ds-pack`, `ux-design-skills` |

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
  website: "https://www.wendys.com"
  website_pages:
    - "/menu"
    - "/rewards"
    - "/about"
    - "/careers"
  social:
    twitter: "https://x.com/Wendys"
    instagram: "https://instagram.com/wendys"
    linkedin: "https://linkedin.com/company/wendys"
  app_store:
    ios: "https://apps.apple.com/app/wendys/id540518599"
    android: "https://play.google.com/store/apps/details?id=com.wendys.nutritiontool"
  figma:
    - "abc123def456"
    - "ghi789jkl012"
  figma_variable_collections:
    - "Brand Colors"
    - "Typography"
    - "Spacing"
  live_urls:
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

The `xd-toolkit validate` command checks:
1. `client` and `tier` are present
2. `tier` value is one of: `minimum`, `standard`, `comprehensive`
3. If `tier` is `standard` or `comprehensive`, the corresponding `.brand/` files exist
4. If `sources.figma_file_ids` is set, the Figma MCP is configured (via `xd-toolkit doctor`)
5. If `deploy.platform` is set, the corresponding MCP is configured
