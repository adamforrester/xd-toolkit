# Schema: .brand/workflows/deploy.md

**Purpose:** Deployment instructions for this specific client project. Agents reference this when deploying to ensure the correct platform, configuration, and process.

**Tier:** Comprehensive
**Loaded:** Deployment tasks (CLAUDE.md routing rule)

---

## Sections

### Deployment Target (required)

Where and how this project deploys.

| Field | Required | Description |
|-------|----------|-------------|
| `Platform` | required | Netlify, Vercel, or other. Include why this platform was chosen. |
| `Repo` | required | GitHub repo location (e.g., "practitioner's personal GitHub — not the org repo") |
| `Branch strategy` | required | Which branch deploys to production, preview branch conventions |

### Environment Configuration (required)

Environment-specific settings.

| Field | Required | Description |
|-------|----------|-------------|
| `Environment variables` | required | Required env vars (names only — never values) with purpose |
| `Build command` | required | The build command and any prerequisites |
| `Output directory` | required | Where the build artifacts live |

### Deploy Process (required)

Step-by-step deployment instructions.

| Field | Required | Description |
|-------|----------|-------------|
| `Steps` | required | Ordered deployment steps, including which MCP tools to use |
| `Post-deploy checks` | required | What to verify after deployment (e.g., "Check build logs for warnings, verify homepage loads, run Lighthouse") |

### Domain & URLs (optional)

| Field | Required | Description |
|-------|----------|-------------|
| `Production URL` | optional | The live site URL |
| `Preview URL pattern` | optional | How preview deploy URLs are structured |
| `Custom domain` | optional | If a custom domain is configured, the setup details |

---

## Example

```markdown
# Deployment

## Target
**Platform:** Netlify (free tier — allows commercial use for client prototypes)
**Repo:** Personal GitHub (`github.com/[practitioner]/wendys-prototype`)
**Branches:** `main` → production. Any other branch → preview deploy.

## Environment
**Variables:**
- `NEXT_PUBLIC_SITE_URL` — production URL (for og:image, sitemap)
- `FIGMA_FILE_ID` — for automated design-code parity checks (optional)

**Build:** `npm run build` (runs `next build`)
**Output:** `.next/` (Netlify handles this automatically with the Next.js plugin)

## Deploy Process
1. Commit and push to GitHub (use GitHub MCP if needed)
2. Netlify auto-deploys from push (if already connected) — or use Netlify MCP `deploy` for first-time setup
3. Check build logs via Netlify MCP for errors/warnings
4. Verify: homepage loads, navigation works, images render, no console errors
5. Run Lighthouse via Playwright MCP — check Performance > 80, Accessibility > 90

## URLs
**Production:** https://wendys-prototype.netlify.app
**Preview:** https://deploy-preview-{PR#}--wendys-prototype.netlify.app
```
