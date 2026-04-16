# Bundled Skill Versions

Track what's bundled and when it was last updated. When upstream releases ship, update the bundle and bump the CLI version.

| Source | Skills | Commit | Date | License |
|--------|--------|--------|------|---------|
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 18 skills (adapt, animate, audit, bolder, clarify, colorize, critique, delight, distill, harden, impeccable, layout, optimize, overdrive, polish, quieter, shape, typeset) | `00d4856` | 2026-04-10 | MIT |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | 2 skills (web-design-guidelines, composition-patterns) | `47863b2` | 2026-04-14 | Apache 2.0 |
| xd-toolkit (custom) | 1 skill (figma-plugin-dev) | bundled | 2026-04-16 | MIT |

**Total: 21 skills bundled**

## Update Process

1. Check upstream monitoring issues (`.github/workflows/upstream-check.yml`)
2. Clone the upstream repo, copy updated skill files to `packages/cli/skills/core/`
3. Update this table with new commit hash and date
4. Bump CLI version in `packages/cli/package.json`
5. Commit, push, publish
