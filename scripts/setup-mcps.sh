#!/bin/bash
# XD Toolkit — MCP Setup Script
# Installs the 8 core MCP servers for the XD Vibe Coding Toolkit.
# Run: bash scripts/setup-mcps.sh

set -euo pipefail

echo "================================================"
echo "  XD Toolkit — MCP Setup"
echo "  Installing 8 core MCP servers"
echo "================================================"
echo ""

# Check prerequisites
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed."
  echo "Install it from https://nodejs.org (LTS version), restart Terminal, and try again."
  exit 1
fi

if ! command -v claude &> /dev/null; then
  echo "ERROR: Claude Code is not installed."
  echo "Install it: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "Node.js: $NODE_VERSION"
echo "Claude Code: $(claude --version 2>/dev/null || echo 'installed')"
echo ""

# Collect tokens
echo "--- Tokens ---"
echo "You'll need your Figma PAT and GitHub PAT."
echo "See docs/setup-guide.md for how to create these."
echo ""

read -p "Figma Personal Access Token (starts with figd_): " FIGMA_TOKEN
read -p "GitHub Personal Access Token (starts with ghp_): " GITHUB_TOKEN
echo ""

# 1. Figma Official
echo "[1/8] Figma Official MCP"
echo "  Reads Figma designs and generates code."
claude mcp add figma -s user -- npx -y @anthropic-ai/figma-mcp@latest
echo "  ✓ Done"
echo ""

# 2. Figma Console
echo "[2/8] Figma Console MCP"
echo "  Writes to Figma, manages variables, audits design systems."
claude mcp add figma-console -s user \
  -e FIGMA_ACCESS_TOKEN="$FIGMA_TOKEN" \
  -e ENABLE_MCP_APPS=true \
  -- npx -y figma-console-mcp@latest
echo "  ✓ Done"
echo ""

# 3. Playwright
echo "[3/8] Playwright MCP"
echo "  Browser automation, visual verification, and accessibility auditing."
claude mcp add playwright -s user -- npx -y @playwright/mcp@latest
echo "  ✓ Done"
echo ""

# 4. GitHub
echo "[4/8] GitHub MCP"
echo "  Repo management, PRs, code search, and git workflows."
claude mcp add github -s user \
  -e GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN" \
  -- npx -y @modelcontextprotocol/server-github
echo "  ✓ Done"
echo ""

# 5. Netlify
echo "[5/8] Netlify MCP"
echo "  Deploy projects to Netlify. Browser auth on first deploy."
claude mcp add netlify -s user -- npx -y @netlify/mcp
echo "  ✓ Done"
echo ""

# 6. Vercel
echo "[6/8] Vercel MCP"
echo "  Deploy Next.js projects to Vercel. Browser auth on first deploy."
claude mcp add vercel -s user --transport http https://mcp.vercel.com
echo "  ✓ Done"
echo ""

# 7. Context7
echo "[7/8] Context7 MCP"
echo "  Current documentation for any framework or library."
claude mcp add context7 -s user -- npx -y @context7/mcp
echo "  ✓ Done"
echo ""

# 8. Storybook (project-scoped — info only)
echo "[8/8] Storybook MCP (project-scoped)"
echo "  Storybook MCP is installed per-project, not globally."
echo "  When working on a project with Storybook, run:"
echo "    npx storybook add @storybook/addon-mcp"
echo "    npx mcp-add --type http --url \"http://localhost:6006/mcp\" --scope project"
echo "  Skipping for now."
echo ""

# Optional: Firecrawl
echo "--- Optional ---"
echo ""
read -p "Install Firecrawl MCP? (faster bulk scraping for brand onboarding, requires API key) [y/N]: " INSTALL_FIRECRAWL
if [[ "$INSTALL_FIRECRAWL" =~ ^[Yy]$ ]]; then
  read -p "Firecrawl API key (starts with fc_): " FIRECRAWL_KEY
  claude mcp add firecrawl -s user \
    -e FIRECRAWL_API_KEY="$FIRECRAWL_KEY" \
    -- npx -y firecrawl-mcp
  echo "  ✓ Firecrawl installed"
else
  echo "  Skipped Firecrawl (Playwright handles extraction by default)"
fi
echo ""

# Verify
echo "================================================"
echo "  Verifying MCP connections..."
echo "================================================"
echo ""
claude mcp list

echo ""
echo "================================================"
echo "  Setup complete!"
echo ""
echo "  All MCPs showing 'Connected' are ready to use."
echo "  If any show 'Disconnected', check your tokens"
echo "  and re-run the add command. See docs/setup-guide.md"
echo "  for troubleshooting."
echo "================================================"
