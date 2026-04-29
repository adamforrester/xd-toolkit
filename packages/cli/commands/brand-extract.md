---
description: Extract brand tokens from Figma and the live website into .brand/tokens/*.md and regenerate design.md. Use after /new-project or when sources change.
argument-hint: ""
---

Invoke the `brand-extract` skill. The skill handles the full flow: pre-flight checks, scope confirmation with the practitioner, Figma variable extraction (when available), Playwright-based web token extraction (always), token-file writing with overwrite policy, and design.md regeneration.

**Phase 2 scope:** This command currently extracts design tokens only — colors, typography, spacing, and surfaces. Voice extraction, brand overview generation, conflict detection, and design-system repo scanning will land in subsequent phases.

**Pre-flight requirements:**
- `.brandrc.yaml` must exist (run `xd-toolkit init` or `/new-project` first)
- Playwright MCP must be installed and connected (run `xd-toolkit setup` or `xd-toolkit doctor`)
- Figma Console MCP is recommended but optional — without it, Stage 1 (Figma) is skipped and only Stage 2 (web) runs

If the practitioner runs `/brand-extract` and any pre-flight check fails, surface the specific issue and the fix command before stopping.
