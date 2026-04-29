#!/usr/bin/env bash
# XD Toolkit installer
# Handles the common macOS npm permission issue automatically.
# Read this script before piping it to bash: it's short on purpose.
set -e

REPO="github:adamforrester/xd-toolkit"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }
dim() { printf "\033[2m%s\033[0m\n" "$1"; }

echo ""
bold "  XD Toolkit installer"
echo ""

# ── Node ──
if ! command -v node >/dev/null 2>&1; then
  red "✗ Node.js is not installed."
  dim "  Install the LTS version from https://nodejs.org, then re-run this script."
  exit 1
fi
NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  red "✗ Node.js $(node -v) is too old. Version 18+ is required."
  dim "  Update from https://nodejs.org, then re-run this script."
  exit 1
fi
green "✓ Node.js $(node -v)"

# ── git ──
if ! command -v git >/dev/null 2>&1; then
  yellow "⚠ git is not installed."
  if [ "$(uname)" = "Darwin" ]; then
    dim "  Triggering xcode-select --install..."
    xcode-select --install || true
    echo ""
    bold "  A macOS install dialog should have appeared."
    dim "  Click Install, wait for it to finish (a few minutes), then re-run this script."
    exit 0
  else
    dim "  Install from https://git-scm.com/downloads, then re-run this script."
    exit 1
  fi
fi
green "✓ $(git --version)"

# ── Claude Code ──
if ! command -v claude >/dev/null 2>&1; then
  yellow "⚠ Claude Code is not installed."
  dim "  Install: npm install -g @anthropic-ai/claude-code"
  dim "  Docs: https://docs.anthropic.com/en/docs/claude-code"
  echo ""
  dim "  (You can install it after this script finishes.)"
fi

# ── npm prefix permissions ──
PREFIX=$(npm config get prefix)
PREFIX_LIB="$PREFIX/lib/node_modules"

if [ ! -w "$PREFIX" ] || { [ -d "$PREFIX_LIB" ] && [ ! -w "$PREFIX_LIB" ]; }; then
  echo ""
  yellow "⚠ Your global npm directory ($PREFIX) needs admin permissions for installs."
  dim "  Reconfiguring npm to use ~/.npm-global instead. No sudo needed."
  echo ""

  mkdir -p "$HOME/.npm-global"
  npm config set prefix "$HOME/.npm-global"

  # Add to PATH in the user's shell rc
  case "$SHELL" in
    */zsh)  SHELL_RC="$HOME/.zshrc" ;;
    */bash) SHELL_RC="$HOME/.bash_profile" ;;
    *)      SHELL_RC="" ;;
  esac

  if [ -n "$SHELL_RC" ] && ! grep -q ".npm-global/bin" "$SHELL_RC" 2>/dev/null; then
    echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> "$SHELL_RC"
    green "✓ Added ~/.npm-global/bin to PATH in $SHELL_RC"
  fi

  export PATH="$HOME/.npm-global/bin:$PATH"
fi

# ── Install ──
echo ""
bold "  Installing xd-toolkit..."
npm install -g "$REPO"
green "✓ xd-toolkit installed"

# Ensure the npm prefix's bin dir is on PATH for the rest of this script,
# even if we didn't have to reconfigure the prefix above.
NPM_BIN="$(npm config get prefix)/bin"
case ":$PATH:" in
  *":$NPM_BIN:"*) ;;
  *) export PATH="$NPM_BIN:$PATH" ;;
esac

# ── Done — point user at setup ──
# We don't auto-run `xd-toolkit setup` because curl|bash doesn't provide a
# real TTY, and inquirer's password prompts (Figma PAT, GitHub PAT) crash
# without one. Running setup directly from the user's shell works fine.
echo ""
bold "  Done. Now run:"
echo ""
echo "    xd-toolkit setup"
echo ""
dim "  If 'xd-toolkit: command not found', open a new terminal or run:"
dim "    source ${SHELL_RC:-~/.zshrc or ~/.bash_profile}"
echo ""
