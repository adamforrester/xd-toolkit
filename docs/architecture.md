# XD Vibe Coding Toolkit: Architecture & Workflow

## What This Is

An end-to-end suite of tools for Experience Design (XD) practitioners to produce production-quality, brand-consistent digital products using AI agents. The system covers the full pipeline: design → build → test → deploy → validate.

It's built for an agency context: multiple brands, multiple practitioners, variable client inputs, and the practical constraint that XD team members will publish from personal GitHub repos to free-tier hosting because organizational repo seats are scarce and org repos can't deploy to free hosting tiers.

---

## Three Packages + Optional Extensions

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  PACKAGE 1: Core Toolkit                                         │
│  Universal design quality + workflow skills + MCP stack          │
│  Installed per-practitioner (MCPs) + per-project (skills/files)  │
│  Brand-agnostic                                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  PACKAGE 2: Brand Factory                                 │   │
│  │  Analysis + generation skills + extraction CLIs           │   │
│  │  Used during client onboarding — produces Package 3       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  EXTENSIONS (optional, per-practitioner)                   │   │
│  │  ○ DS Pack — Design System Ops (21 skills) + community    │   │
│  │  ○ Designer Skills Pack — 63 skills, 8 plugins (research,│   │
│  │    strategy, UI, interaction, prototyping, ops, toolkit,  │   │
│  │    design systems)                                        │   │
│  │  ○ XD Manager Pack — reviews, scoping, ops (future)      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           │ produces
                           ▼
      ┌─────────┐    ┌─────────┐    ┌─────────┐
      │ .brand/ │    │ .brand/ │    │ .brand/ │
      │ Wendy's │    │ Hotel   │    │ Client  │
      │         │    │ Chain   │    │ C       │
      └─────────┘    └─────────┘    └─────────┘
        PACKAGE 3      PACKAGE 3      PACKAGE 3
        (per-client)   (per-client)   (per-client)
```

---

## Four Categories of Components

Everything in the toolkit falls into one of four categories. Each installs differently, updates differently, and serves a different purpose.

### Category 1: MCP Servers (Running Services)

MCP servers give agents the **ability** to do things — tools the agent calls. They require configuration (auth tokens, ports, processes). They're installed **per-practitioner**, not per-project. Each agent tool (Claude Code, Cursor, etc.) configures them in its own way.

### Category 2: Skills (Instruction Files)

Skills teach agents **how** to do things. They're markdown files (`SKILL.md`) in tool-specific directories (`.claude/skills/`, `.cursor/skills/`, etc.). They travel with the project repo — everyone who clones the repo gets them. They're invoked via slash commands or auto-triggered by the agent based on task context.

### Category 3: Instruction Files (Project Context)

`CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.github/copilot-instructions.md` — project-level context that loads automatically at session start. These tell the agent the project's rules, architecture, and where to find brand-specific guidance. They act as a **router** to deeper resources.

### Category 4: Data Files (Brand Intelligence)

The `.brand/` directory — structured markdown and JSON files containing brand-specific intelligence. No executable behavior. Skills and instruction files reference these. They're the **product** of the Brand Factory.

---

## Category 1: The MCP Stack

Nine core MCP servers organized by pipeline phase, installed per-practitioner and available across every project. One optional MCP (Firecrawl) provides faster bulk scraping for frequent client onboarding.

### Design Phase

#### Figma Official MCP
- **What:** Design context extraction, code generation, write-to-canvas (beta), Code Connect component mapping, design system rules generation
- **Tools:** `get_design_context`, `get_variable_defs`, `get_screenshot`, `use_figma`, `search_design_system`, `create_design_system_rules`, `get_code_connect_map`
- **Why essential:** The baseline for reading Figma files and generating code from designs. Write-to-canvas enables agents to create directly on the Figma canvas.
- **License:** Figma terms (free during beta for paid Figma seats)

**Installation:**
```bash
# Claude Code (via plugin — recommended)
/plugin marketplace add figma/mcp-server-guide

# Cursor
# Settings → MCP tab → Add Figma MCP per Figma's docs

# All tools (manual config)
# Add to your MCP config file:
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/figma-mcp@latest"],
      "env": { "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN" }
    }
  }
}
```

#### Figma Console MCP (Southleft)
- **What:** 56+ tools including `figma_execute` (run any Figma Plugin API code), variable CRUD, component instantiation, design-code parity checking, Design System Dashboard (health scoring across naming, tokens, components, accessibility, consistency, coverage), screenshot capture, console debugging
- **Why essential:** Does things the official MCP can't — direct Plugin API execution, variable management without Enterprise plan, `figma_check_design_parity` (scored diff between Figma component and code implementation), and the Design System Dashboard health audit
- **License:** MIT
- **Key distinction from official:** Official MCP = read + code generation. Console MCP = write + debug + audit. Use both together.

**Installation:**
```bash
# Claude Code
claude mcp add figma-console -s user \
  -e FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN \
  -e ENABLE_MCP_APPS=true \
  -- npx -y figma-console-mcp@latest

# Then connect Desktop Bridge plugin in Figma:
# Plugins → Development → Import plugin from manifest
# Select figma-desktop-bridge/manifest.json
```

#### Storybook MCP
- **What:** Gives agents component metadata, stories, API docs. Live story previews embedded in chat. Agent self-verification via component and accessibility tests. Remote MCP sharing across teams via Chromatic.
- **Why essential:** Forces agents to reuse existing components instead of inventing new ones. Benchmarks show 12.8% better code reuse, 2.76x faster generation, 27% fewer tokens versus no MCP. The self-verification loop (generate → write story → test → fix) is the closest thing to automated QA for component quality.
- **License:** MIT (addon). Chromatic hosting free tier available.
- **Requires:** Storybook 10.3+ with React

**Installation:**
```bash
# In project with Storybook
npx storybook@latest upgrade
npx storybook add @storybook/addon-mcp

# Add MCP to agent
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project

# For remote team access (via Chromatic)
# Publish to Chromatic → team connects to published MCP URL
```

### Build & Test Phase

#### Playwright MCP (Microsoft)
- **What:** Browser automation — navigate, click, fill forms, take screenshots, run E2E tests conversationally. Agent verifies its own output in a real browser.
- **Why essential:** The agent can say "navigate to localhost:3000, log in, check the dashboard loads, verify the notification toast appears" and actually do it. Closes the loop between generation and verification. No test scripts to write.
- **License:** Apache 2.0

**Installation:**
```bash
# Claude Code
claude mcp add playwright -s user -- npx -y @playwright/mcp@latest

# All tools (config file)
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

#### Accessibility Scanner MCP
- **What:** Axe-core powered WCAG 2.0/2.1/2.2 auditing at A/AA/AAA levels. Single page scans and site-wide crawling. Keyboard navigation auditing. Generates JSON reports with violation severity, affected elements, and remediation guidance. Visual annotations on violations.
- **Why essential:** ADA Title II requires WCAG 2.1 AA compliance for government-serving entities by April 2026. Agencies serving government clients need automated a11y validation. Even for non-government work, accessibility is a quality bar. The agent can audit its own output before shipping.
- **License:** MIT

**Installation:**
```bash
# Claude Code
claude mcp add a11y -s user -- npx -y mcp-accessibility-scanner

# All tools (config file)
{
  "mcpServers": {
    "accessibility": {
      "command": "npx",
      "args": ["-y", "mcp-accessibility-scanner"]
    }
  }
}
```

### Deploy Phase

#### GitHub MCP
- **What:** Repo management, PR creation, code search, issue management, branch operations.
- **Why essential for XD:** Practitioners need to push projects to personal GitHub repos for deployment. The agent handles git workflows conversationally: "Create a repo, push this project, and set it up for Netlify deployment." Removes the git barrier for designers who aren't comfortable with CLI git.
- **License:** MIT

**Installation:**
```bash
# Claude Code
claude mcp add github -s user \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_YOUR_TOKEN \
  -- npx -y @modelcontextprotocol/server-github

# All tools (config file)
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_YOUR_TOKEN" }
    }
  }
}
```

#### Vercel MCP
- **What:** Deploy, check build logs, manage environment variables, debug failed deployments, project management.
- **Why relevant:** Strong Next.js integration. Agent deploys, checks build logs, debugs failures — all without leaving the editor. Best for Next.js projects.
- **License:** Vercel terms (free Hobby tier — note: prohibits commercial use)
- **Free tier constraint:** Vercel Hobby plan prohibits commercial use. Practitioners deploying client prototypes may need Pro ($20/month) or use Netlify instead.

**Installation:**
```bash
# Claude Code
claude mcp add vercel -s user --transport http https://mcp.vercel.com
```

#### Netlify MCP
- **What:** Create projects, build, deploy, manage sites via natural language. Build log access, environment variables, site management.
- **Why relevant:** Framework-agnostic. Free tier **allows commercial use** — better for XD practitioners deploying client work from personal repos. Built-in forms, identity, split testing. Good for non-Next.js projects.
- **License:** Netlify terms (free Starter tier allows commercial use)

**Installation:**
```bash
# Claude Code
claude mcp add netlify -s user -- npx -y @netlify/mcp
```

**Vercel vs. Netlify recommendation for XD:** Default to **Netlify** for most XD prototype deployments because its free tier allows commercial use. Use **Vercel** when the project is Next.js-based and performance optimization matters. Install both MCPs — the practitioner picks per project.

### Context Phase

#### Context7 MCP
- **What:** Up-to-date, version-specific documentation for any library or framework. Agent gets current React/Next.js/Tailwind/etc. docs instead of training data.
- **Why essential:** Prevents outdated API usage. When the agent generates Next.js code, it references the actual current docs rather than training data that may be 6-12 months stale.
- **License:** Open source

**Installation:**
```bash
# Claude Code
claude mcp add context7 -s user -- npx -y @context7/mcp

# All tools (config file)
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp"]
    }
  }
}
```

### Optional: Brand Factory Enhancement

#### Firecrawl MCP (optional)
- **What:** Web scraping and content extraction. Converts web pages into structured markdown. Supports bulk site crawling, single-page scraping, and content extraction with CSS selectors.
- **Why useful:** Faster bulk scraping for practitioners doing frequent client onboarding. Not required — Playwright MCP (already in core stack) handles the default voice extraction and content analysis workflow.
- **License:** Firecrawl terms (free tier: 500 credits one-time, covers ~2-3 clients. Paid plans start at $16/month.)
- **When to install:** Recommended for practitioners doing frequent client onboarding who want faster bulk scraping. Skip if you're doing occasional onboarding or working with a small number of clients.

**Installation:**
```bash
# Claude Code (optional — only if you want faster bulk scraping)
claude mcp add firecrawl -s user \
  -e FIRECRAWL_API_KEY=fc_KEY \
  -- npx -y firecrawl-mcp
```

### MCP Installation Summary

| MCP | Install Command (Claude Code) | Auth Required | Phase |
|-----|-------------------------------|---------------|-------|
| Figma Official | `/plugin marketplace add figma/mcp-server-guide` | Figma PAT | Design |
| Figma Console | `claude mcp add figma-console -s user -e FIGMA_ACCESS_TOKEN=... -- npx -y figma-console-mcp@latest` | Figma PAT | Design |
| Storybook | `npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project` | None | Design/Test |
| Playwright | `claude mcp add playwright -s user -- npx -y @playwright/mcp@latest` | None | Test |
| A11y Scanner | `claude mcp add a11y -s user -- npx -y mcp-accessibility-scanner` | None | Test |
| GitHub | `claude mcp add github -s user -e GITHUB_PERSONAL_ACCESS_TOKEN=... -- npx -y @modelcontextprotocol/server-github` | GitHub PAT | Deploy |
| Vercel | `claude mcp add vercel -s user --transport http https://mcp.vercel.com` | Vercel OAuth | Deploy |
| Netlify | `claude mcp add netlify -s user -- npx -y @netlify/mcp` | Netlify OAuth | Deploy |
| Context7 | `claude mcp add context7 -s user -- npx -y @context7/mcp` | None | Context |

**Optional:**

| MCP | Install Command (Claude Code) | Auth Required | Phase |
|-----|-------------------------------|---------------|-------|
| Firecrawl | `claude mcp add firecrawl -s user -e FIRECRAWL_API_KEY=... -- npx -y firecrawl-mcp` | Firecrawl API key ($16+/mo for heavy use) | Brand Factory |

**Total practitioner setup time:** ~30-45 minutes (one-time). Requires: Node.js 18+, Figma PAT, GitHub PAT, Vercel/Netlify accounts.

---

## Category 2: The Skills Stack

### Package 1: Core Toolkit Skills (per-project)

These travel with each client repo. Everyone who clones gets them.

#### Design Quality (Impeccable — unforked, 18 skills)

| Skill | Category | Trigger | What It Does |
|-------|----------|---------|--------------|
| `/impeccable` | Create | User or auto | Core design skill — context gathering, design direction, font selection procedure, anti-"AI slop" guidelines. Reads `.impeccable.md` for brand context. |
| `/impeccable craft` | Create | User | Shape-then-build: runs discovery interview → design brief → implements with quality guardrails |
| `/impeccable extract` | Create | User | Identifies reusable patterns, extracts components/tokens into design system |
| `/shape` | Create | User | UX planning: structured discovery interview → design brief. No code. |
| `/critique` | Evaluate | User | Dual assessment: LLM design review (Nielsen heuristics, cognitive load, emotional journey, AI slop detection) + automated 25-pattern scanner |
| `/audit` | Evaluate | User | Technical quality: accessibility, performance, theming, responsive, anti-patterns. Scored 0-4 per dimension. |
| `/typeset` | Refine | User | Typography refinement — scales, pairing, OpenType features |
| `/colorize` | Refine | User | Color system refinement |
| `/layout` | Refine | User | Spatial design refinement |
| `/animate` | Refine | User | Motion design — purposeful transitions, easing, duration |
| `/bolder` | Refine | User | Increase visual impact |
| `/quieter` | Refine | User | Reduce visual noise |
| `/overdrive` | Refine | User | Push design to maximum expressiveness |
| `/delight` | Refine | User | Micro-interactions and surprise moments |
| `/adapt` | Simplify | User | Adapt for different contexts/constraints |
| `/clarify` | Simplify | User | Reduce ambiguity in UI |
| `/distill` | Simplify | User | Strip to essentials |
| `/harden` | Harden | User | Edge cases, error states, defensive design |
| `/optimize` | Harden | User | Performance optimization |
| `/polish` | Harden | User | Final production-readiness pass |

**Why unforked:** Impeccable already reads `.impeccable.md` from the project root for brand context. The Brand Factory (Package 2) auto-generates this file from `.brand/overview.md`. So Impeccable gets brand-specific context without any modification. We stay on upstream, get free updates, avoid maintaining a fork of 18 skills across 10+ tool directories.

**Micro-animations coverage:** `/animate` provides a dedicated animation skill with a full `motion-design.md` reference covering easing curves, duration principles, purposeful vs. decorative motion, and the rule that motion should communicate meaning. `/delight` covers micro-interactions specifically. The brand package's `.brand/tokens/motion.md` adds client-specific animation principles (e.g., "Wendy's uses quick, playful transitions; the hotel chain uses slow, elegant fades"). Between these three layers, motion is well covered.

#### UX Coverage in Core

Impeccable already covers UX execution comprehensively:
- **Interaction design**: 8 interactive states, focus rings, form design, loading states, modals, optimistic updates
- **UX writing**: Button label patterns, error message formula, empty states, microcopy
- **Evaluation**: `/critique` runs Nielsen heuristics (scored 0-4), cognitive load checklist (8 items), emotional journey (peak-end rule)
- **Planning**: `/shape` runs a structured discovery interview covering purpose, audience, content/data ranges, design goals, constraints, and anti-goals — produces a design brief

No additional UX skills are needed in the core toolkit for vibe coding workflows.

For dedicated UX research, strategy, and design ops work, see the **Designer Skills Pack** extension below.

#### Engineering Quality Skills (curated, per-project)

| Skill | Source | What It Does |
|-------|--------|--------------|
| Web Interface Guidelines | vercel-labs/agent-skills | 100+ rules covering a11y, performance, UX best practices. Reviews existing code against standards. |
| Composition Patterns | vercel-labs/agent-skills | Compound components, context providers, explicit variants. Prevents boolean prop proliferation. |

#### Utility Skills (per-project)

| Skill | Source | What It Does |
|-------|--------|--------------|
| `/figma-plugin-dev` | **Custom (previously built)** | Figma plugin development — two-context architecture (sandbox vs. UI iframe), message passing protocol, NEVER/ALWAYS rules preventing common LLM mistakes, code organization (plugin/ui/shared), TypeScript config, build setup with esbuild. Auto-triggers on any Figma plugin work. 501 lines. |

### Extension: Designer Skills Pack (Optional)

A comprehensive collection of 63 skills, 27 commands, and 8 plugins covering the full UX/UI design practice — research, strategy, UI design, interaction design, prototyping, design ops, and more. Powered by **Owl-Listener/designer-skills** (664 GitHub stars, MIT license).

Not needed for day-to-day vibe coding but valuable for the UX team's broader practice: dedicated research, strategy work, design ops, and structured handoffs.

Installed **per-practitioner**, not per-project.

**The 8 plugins:**

| Plugin | Skills | Commands | What It Does |
|--------|--------|----------|-------------|
| design-research | 10 | 4 | Personas, empathy maps, journey maps, JTBD, interviews, usability testing, card sorting, diary studies |
| ux-strategy | 8 | 3 | Competitive analysis, design principles, north star vision, stakeholder alignment, metrics, opportunity framework |
| ui-design | 9 | 4 | Color systems, typography, layout grids, responsive, data viz, iconography, illustration style |
| interaction-design | 7 | 3 | State machines, micro-animation, gesture design, loading patterns, error handling |
| prototyping-testing | 8 | 4 | Prototype fidelity, usability testing, heuristic evaluation, A/B experiment design |
| design-ops | 7 | 3 | Developer handoff specs (token-first), sprint planning, design critique, QA checklists, version control |
| designer-toolkit | 6 | 3 | UX writing, design rationale, presentations, case studies, system adoption |
| design-systems | 8 | 3 | Token architecture, component specs, theming, documentation (lighter weight overlap with DS Ops) |

**Installation:**
```bash
# Claude Code (recommended)
claude install github:Owl-Listener/designer-skills

# Manual
git clone https://github.com/Owl-Listener/designer-skills.git
# Follow repo installation instructions
```

**When to use vs. core Impeccable:**
- Building a feature? → `/shape` (Impeccable) handles discovery + design brief
- Doing user research? → `/design-research:discover` chains persona → empathy → journey → synthesis
- Need strategy work? → `/ux-strategy:strategize`
- Planning a sprint? → `/design-ops:plan-sprint`
- Handing off to devs? → `/design-ops:handoff` generates complete handoff package
- Running a design critique? → `/critique` (Impeccable) for quality + `design-ops` critique for structured feedback
- Competitive analysis? → `/ux-strategy:benchmark`
- Reviewing UI quality? → `/critique` (Impeccable) covers heuristics + cognitive load

### Extension: Design System Pack (Optional)

For design system maintainers — the people responsible for building, governing, and evolving a design system, not just using one. Powered by **Design System Ops** (murphytrueman/design-system-ops), a 21-skill MIT-licensed pack built specifically for DS practitioners.

Installed **per-practitioner** (personal skills directory), not per-project.

**Audit skills (understand what you have):**

| Skill | What It Does |
|-------|--------------|
| `token-audit` | Reads actual token files (JSON, SCSS, CSS vars, Tailwind). Identifies tier leakage, naming violations, DTCG 2025.10 alignment gaps, Style Dictionary v4 readiness, and architectural debt. Produces prioritized findings with severity, location, and recommended fix. |
| `component-audit` | Inventories component library with usage signals, duplication analysis, coverage gaps, and AI-readiness scoring. |
| `system-health` | Scores DS across 7 dimensions (tokens, components, documentation, adoption, governance, AI readiness, platform maturity) calibrated to maturity level. |
| `drift-detection` | Finds where consuming teams diverged. Classifies why: intentional divergence, version lag, accidental drift, misunderstanding, or system gap. |
| `naming-audit` | Audits naming conventions across components, tokens, and patterns for consistency and semantic clarity. |
| `triage` | "Where do I start?" — scans system maturity and produces a prioritized run plan for which skills to use first. |

**Governance skills (run the system as infrastructure):**

| Skill | What It Does |
|-------|--------------|
| `contribution-workflow` | 6-stage contribution process with templates and capacity calibration. |
| `deprecation-process` | Blast radius analysis, migration paths with code examples, communication timeline, sunset date recommendation. |
| `decision-record` | Captures architectural decisions with context, options, trade-offs, and consequences. |
| `change-communication` | Full communication package scaled to impact level — from changelog entry to migration guide with before/after code. |

**Documentation skills (make the system legible to humans and machines):**

| Skill | What It Does |
|-------|--------------|
| `ai-component-description` | Six-section MCP-optimized component descriptions for Figma. Purpose, props, anti-patterns, composition, accessibility, examples. Includes diagnostic mode. |
| `pattern-documentation` | Documents composed UI patterns — state coverage, a11y, composition rules. |
| `token-documentation` | Documents token intent by tier (primitive, semantic, component) with theming contracts and do/don't examples. Covers DTCG format, Style Dictionary structure, and taxonomy best practices. |
| `usage-guidelines` | Component usage docs with anti-patterns derived from actual codebase misuse. |

**Validation skills (verify quality before shipping):**

| Skill | What It Does |
|-------|--------------|
| `design-to-code-check` | Compares design spec vs. code across 5 dimensions. Dual scoring (check thoroughness + match quality). |
| `accessibility-per-component` | Component-level a11y audit: keyboard, screen reader, contrast, focus, ARIA. Maps to WCAG 2.1 AA criteria. |
| `token-compliance` | Scans codebase for hardcoded values, wrong-tier references, inconsistent token application. File, line, current value, recommended token. |

**Communication skills (move people and decisions):**

| Skill | What It Does |
|-------|--------------|
| `adoption-report` | Separates coverage from adoption. Flags at-risk teams, identifies blockers, tracks trends. |
| `stakeholder-brief` | Translates DS health into business language — risk, cost, velocity impact, investment recommendation. |
| `system-pitch` | Investment case with cost estimation, ROI, and pre-built objection responses. |
| `designer-onboarding` | Two-week onboarding guide calibrated to system complexity. |

**Workflow agents (chained pipelines):**

| Agent | What It Does |
|-------|--------------|
| `/component-to-release` | Pre-release validation: design-to-code → a11y audit → token compliance, with gates. |
| `/full-diagnostic` | 5-audit sweep with cross-skill pattern synthesis. |
| `/governance-review` | Quarterly governance package: adoption + drift + stakeholder brief. |
| `/migration` | End-to-end token migration: audit → transformation table → codemods → rollout strategy → communication package. |

**Also includes in DS Pack:**
- Figma community skills (design-system-bound generation, APCA contrast compliance)
- Storybook MCP becomes essential (vs. optional in core)
- specs CLI for ongoing DS analysis

**Installation:**
```bash
# Claude Code — via plugin file (recommended)
# Download design-system-ops.plugin from the repo's installable/ folder
# Open in Claude Desktop → skills install automatically

# Claude Code — via CLI
git clone https://github.com/murphytrueman/design-system-ops.git
cp -r design-system-ops/skills/* ~/.claude/skills/
cp -r design-system-ops/commands/* ~/.claude/commands/

# Claude Desktop (Cowork mode)
# Open the .plugin file directly — auto-installs
```

### Extension: XD Manager Pack (Future — Phase 4+)

For XD managers handling team operations — employee reviews, scoping, resource planning. Not part of the vibe coding pipeline but valuable for XD practice leadership.

**Planned skills (work in progress in separate threads):**

| Skill | What It Does |
|-------|--------------|
| `/thrive-review` | Assists with employee performance reviews through the Thrive platform — structures feedback, suggests growth areas, drafts review narratives |
| `/scope` | Project scoping — estimates effort, identifies risks, produces scope documents from requirements |
| Additional manager skills TBD | Resource planning, capacity management, team health assessments |

This extension will be developed in a future phase once the core toolkit, Brand Factory, and DS Pack are validated.

### Package 2: Brand Factory Skills (per-practitioner)

These are personal skills for the practitioners who run client onboarding. Not every team member needs them.

**Prerequisites:** specs CLI, Layout CLI — installed per-practitioner alongside the standard MCP stack. Playwright MCP (already in core) handles voice extraction. Firecrawl MCP is an optional upgrade for faster bulk scraping.

**Extraction method priority:**
1. **Playwright MCP** (default, free, already in core stack) — navigates pages, extracts copy, handles social profiles
2. **Firecrawl MCP** (optional upgrade, faster for bulk site crawling, requires API key + paid plan for heavy use)
3. **Manual input** (fallback when automated extraction fails — screenshots, copy/paste, uploaded docs)

The skill detects which tools are available and uses the best method. If both Playwright and Firecrawl are installed, prefers Firecrawl for bulk site crawling and Playwright for social media profiles and individual pages.

| Skill | Trigger | What It Does |
|-------|---------|--------------|
| `/brand-extract` | User | Orchestrates extraction pipeline: specs CLI (Figma component anatomy) + Layout CLI (CSS tokens from URLs) + Figma MCP (variable inventory) + **voice extraction** (Playwright MCP default, Firecrawl optional). Voice extraction scrapes 30-50 copy samples from live site + social profiles + app store listings, grouped by type (headlines, CTAs, body copy, error messages, nav labels, microcopy) and channel. Falls back to guided manual input if automated extraction yields fewer than 10 usable samples. Always prompts practitioner for supplementary sources (brand docs, email examples, campaign materials) after extraction. Sources configured in `.brandrc.yaml`. Supports `--public-only` flag for pitch scenarios. |
| `/brand-analyze` | User | Core analysis: reads extraction output + brand guide PDF (multimodal) + screenshots. Synthesizes into `.brand/` directory. Auto-generates `.impeccable.md`. Scores completeness. **Voice inference:** reads copy samples from extraction, infers formality level, sentence structure patterns, vocabulary preferences, humor/seriousness spectrum, active vs. passive voice, user address mode (you/we/brand name), error/negative state handling. Maps voice registers per channel (website/social/email/brand story), noting where voice is consistent vs. where it diverges. Outputs to `.brand/voice.md` with source samples cited for human validation. Every inference marked with confidence: HIGH (directly observed pattern) / MEDIUM (inferred from limited samples) / LOW (guessed from single instance). Supports `--mode pitch` (minimum tier + confidence markers only) and `--mode comprehensive` (full analysis + existing codebase integration). |
| `/brand-audit` | User | Evaluates output against brand-specific criteria: token compliance, component usage, composition patterns, voice consistency. Produces brand adherence score. |
| `/brand-score` | User | Completeness scoring across all brand package dimensions (modeled on Layout.design's 0-100 approach). |
| `/brand-refresh` | User | Re-analyzes updated assets, produces diff against existing brand package. |

---

## Category 3: Instruction Files

These load automatically at session start and act as a **router** — pointing the agent to the right brand files for the current task.

| File | Auto-loaded by | Purpose |
|------|---------------|---------|
| `CLAUDE.md` | Claude Code | Project rules + brand routing instructions |
| `AGENTS.md` | Codex, Gemini CLI, generic agents | Cross-tool equivalent of CLAUDE.md |
| `.cursorrules` | Cursor | Cursor-specific equivalent |
| `.github/copilot-instructions.md` | GitHub Copilot | Copilot-specific equivalent |
| `.impeccable.md` | Impeccable skills | Brand personality for design quality skills (auto-generated from `.brand/overview.md`) |

### CLAUDE.md Template (The Router)

```markdown
## Project Overview
[Client name] — [brief project description]

## Brand Context
Read `.brand/overview.md` for this client's brand identity, personality, and core visual language.

## Context Loading Rules (follow these, do not ignore)
- **Any visual implementation**: Read `.brand/tokens/` for the relevant dimension
- **Working on a specific component**: Check `.brand/components/[name].md` if it exists
- **Building a new page or view**: Read `.brand/composition/page-types.md` first
- **Writing any user-facing copy**: Read `.brand/voice.md`
- **Figma-to-code translation**: Follow `.brand/workflows/figma-to-code.md`
- **Code generation**: Follow `.brand/workflows/code-standards.md`

## Rules (enforce always)
- Every color value must use a design token. Never use hex, RGB, or HSL directly.
- Every spacing value must use the spacing scale. No magic numbers.
- Use design system components. Do not build custom versions of existing components.
- Check `.brand/composition/anti-patterns.md` before proposing any layout.
- Run accessibility checks before considering any page complete.

## Deployment
- Push to personal GitHub repo (not the org repo)
- Deploy via [Netlify/Vercel] — see `.brand/workflows/deploy.md`

## When to Ask for Help
- Figma variable doesn't map to a known design token
- Component behavior is ambiguous or underspecified
- Required semantic token doesn't exist
- Breaking changes needed for token system
```

This is ~40 lines. Short, imperative, router-style. The ETH Zurich research found this pattern outperforms long descriptive files.

---

## Category 4: Brand Package (`.brand/` Directory)

The structured output of the Brand Factory. Lives in each client's project repo. Contains no skills, no code — just brand intelligence that skills and instruction files reference.

```
.brand/
├── overview.md              # Brand personality, audience, core identity
├── voice.md                 # Voice & tone, vocabulary, microcopy patterns
│
├── tokens/
│   ├── colors.md            # Color system with semantic intent + usage rules
│   ├── typography.md        # Type scale, font choices, pairing rationale
│   ├── spacing.md           # Spacing scale, density philosophy
│   └── motion.md            # Animation principles, timing, easing
│
├── components/
│   ├── button.md            # When-to-use, anti-patterns, variant guidance
│   ├── card.md
│   └── [component].md       # One per component (AI guidance layer)
│
├── composition/
│   ├── page-types.md        # Canonical layouts with density/hierarchy
│   ├── patterns.md          # Recurring composition patterns
│   └── anti-patterns.md     # "Never do this" with examples
│
├── workflows/
│   ├── figma-to-code.md     # Tool sequence, validation steps
│   ├── code-standards.md    # Framework conventions, file structure
│   ├── deploy.md            # Deployment instructions (Netlify/Vercel)
│   └── qa-checklist.md      # Brand-specific QA steps
│
├── specs/                   # Output from specs CLI (Nathan Curtis)
│   ├── button.spec.json     # Deterministic component anatomy
│   └── [component].spec.json
│
└── CHANGELOG.md             # Brand package version history
```

### Loading Strategy

Only `overview.md` is referenced in CLAUDE.md (loaded every session, ~200 tokens). Everything else loads on-demand when the agent recognizes a relevant task.

| File | Loaded When | Mechanism |
|------|-------------|-----------|
| `overview.md` | Every session | CLAUDE.md reference |
| `.impeccable.md` | Any Impeccable skill | Impeccable's built-in protocol |
| `voice.md` | Copywriting tasks | CLAUDE.md routing rule |
| `tokens/*.md` | Visual implementation | CLAUDE.md routing rule |
| `components/*.md` | Working on that component | CLAUDE.md routing rule |
| `composition/*.md` | Building new pages/views | CLAUDE.md routing rule |
| `workflows/*.md` | Specific workflow tasks | CLAUDE.md routing rule |
| `specs/*.spec.json` | Component implementation | Agent loads when needed |

---

## The E2E Pipeline

### How It All Flows

```
DESIGN INTENT (human describes what they want)
     │
     ▼
┌─ DESIGN PHASE ──────────────────────────────────────────────┐
│  /shape → structured discovery interview → design brief      │
│  Figma Official MCP → read design context, extract tokens    │
│  Figma Console MCP → extract variables, audit DS health      │
│  Storybook MCP → discover existing components to reuse       │
│  .brand/ → brand personality, tokens, composition patterns   │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ BUILD PHASE ────────────────────────────────────────────────┐
│  /impeccable or /impeccable craft → generate with quality    │
│  Context7 MCP → current framework docs                       │
│  .brand/tokens/ → correct colors, spacing, typography        │
│  .brand/components/ → right component, right variant         │
│  .brand/composition/ → appropriate layout patterns           │
│  Storybook MCP → write stories for new components            │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ TEST & VALIDATE PHASE ─────────────────────────────────────┐
│  Playwright MCP → verify in real browser                     │
│  A11y Scanner MCP → WCAG 2.1 AA audit (axe-core)           │
│  Storybook MCP → run component tests, self-fix              │
│  Figma Console MCP → design-code parity check (scored diff)  │
│  /critique → dual assessment (LLM + automated scanner)       │
│  /audit → technical quality (a11y, perf, responsive)         │
│  /brand-audit → brand adherence scoring                      │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌─ DEPLOY PHASE ───────────────────────────────────────────────┐
│  GitHub MCP → create repo, commit, push                      │
│  Netlify MCP or Vercel MCP → deploy, check build logs        │
│  /polish → final production-readiness pass                   │
└──────────────────────────────────────────────────────────────┘
```

### Scenario: XD Practitioner Builds a Prototype

```
Practitioner opens the client project in Claude Code.

Session starts:
→ CLAUDE.md auto-loads (brand routing instructions)
→ Agent reads .brand/overview.md (~200 tokens of brand context)
→ Impeccable skills detected in .claude/skills/ (metadata scanned, ~100 tokens each)
→ 9 MCPs available (configured at practitioner level)

Practitioner: "Build a reservation confirmation page for the hotel website"

Agent behavior:
1. Recognizes "new page" → loads .brand/composition/page-types.md
2. Checks .brand/components/ for relevant components
3. Loads .brand/tokens/colors.md, typography.md, spacing.md
4. Calls Storybook MCP → searches for existing components to reuse
5. Calls Figma Official MCP → gets design context if Figma URL provided
6. Generates code using design system components + correct tokens
7. Calls Playwright MCP → opens localhost, verifies page renders correctly
8. Calls A11y Scanner MCP → runs WCAG 2.1 AA audit
9. Fixes any violations found
10. Writes Storybook stories for new components

Practitioner: "/critique"
→ Impeccable runs dual assessment with brand context from .impeccable.md

Practitioner: "Deploy this"
→ Agent calls GitHub MCP → creates repo on practitioner's personal GitHub
→ Agent calls Netlify MCP → creates site, deploys, returns live URL

Total: design-to-deployed prototype with brand adherence, a11y compliance,
and quality validation — in a single session.
```

---

## Installation: Per-Agent Setup

### Claude Code (Primary Target)

Claude Code has the richest support: progressive disclosure, plugin marketplace, subagent execution, skill auto-triggering, and MCP configuration.

**One-time practitioner setup (~30 min):**

```bash
# 1. Install MCPs (user-scoped — available across all projects)
claude mcp add figma -s user -- npx -y @anthropic-ai/figma-mcp@latest
claude mcp add figma-console -s user \
  -e FIGMA_ACCESS_TOKEN=figd_TOKEN \
  -e ENABLE_MCP_APPS=true \
  -- npx -y figma-console-mcp@latest
claude mcp add playwright -s user -- npx -y @playwright/mcp@latest
claude mcp add a11y -s user -- npx -y mcp-accessibility-scanner
claude mcp add github -s user \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_TOKEN \
  -- npx -y @modelcontextprotocol/server-github
claude mcp add vercel -s user --transport http https://mcp.vercel.com
claude mcp add netlify -s user -- npx -y @netlify/mcp
claude mcp add context7 -s user -- npx -y @context7/mcp
# Storybook MCP is project-scoped (see per-project setup)

# 2. Install Brand Factory skills (personal — for onboarding practitioners only)
# Option A: Plugin marketplace
/plugin marketplace add vml/brand-factory

# Option B: Manual
cp -r brand-factory-skills/* ~/.claude/skills/

# 3. Install prerequisite CLIs
npm install -g @directededges/specs-cli
npm install -g @uselayout/cli
```

**Per-project setup (when starting a new client project):**

```bash
# Initialize project with Core Toolkit
xd-brand init --client "ClientName" --mode standard

# Mode options:
#   --mode pitch          Minimum tier only. Adds disclaimer headers to all
#                         .brand/ files. Skips workflows/ and specs/.
#   --mode standard       Default. Standard tier scaffold.
#   --mode comprehensive  Full tier with knowledge capture scaffolding.

# All commands support --json for machine-readable output:
#   xd-brand init --client "Name" --json   → { "created": [...], "tier": "standard" }
#   xd-brand score --json                  → { "tier": "standard", "completeness": 72, "gaps": [...] }
#   xd-brand doctor --json                 → { "mcps": { "configured": [...], "missing": [...] } }
#   xd-brand validate --json               → { "valid": true, "warnings": [...] }

# Upgrade from pitch to standard (after winning the pitch):
#   xd-brand upgrade --tier standard
#   Preserves existing .brand/ files, adds empty scaffolds for higher tier,
#   removes pitch-mode disclaimers.

# This creates:
# .claude/skills/    ← Impeccable (18) + Vercel engineering skills (2)
# .cursor/skills/    ← Same (for Cursor users)
# .agents/skills/    ← Same (for VS Code Copilot / Codex users)
# .gemini/skills/    ← Same (for Gemini CLI users)
# .brand/            ← Empty scaffold (depth varies by mode)
# CLAUDE.md          ← Brand routing instructions
# AGENTS.md          ← Cross-tool equivalent
# .cursorrules       ← Cursor equivalent
# .github/copilot-instructions.md ← VS Code Copilot equivalent
# .impeccable.md     ← Empty (populated by /brand-analyze)
# .brandrc.yaml      ← Configuration (includes mode and tier)

# Add Storybook MCP if project uses Storybook
npx storybook add @storybook/addon-mcp
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

### Cursor / VS Code (with Copilot)

Both editors use the same MCP configuration format and the same skills architecture. The only differences are file paths:

| | Cursor | VS Code (Copilot) |
|---|--------|-------------------|
| Skills directory | `.cursor/skills/` | `.agents/skills/` |
| Instruction file | `.cursorrules` | `.github/copilot-instructions.md` |
| MCP config (global) | `~/.cursor/mcp.json` | VS Code settings or `code --add-mcp` CLI |
| MCP config (project) | `.cursor/mcp.json` | `.vscode/mcp.json` |

`vml-brand init` generates all of these. Both editors get identical skill content.

**One-time setup (same for both):**
```bash
# MCPs: Add via editor settings or config file
# Global config (Cursor: ~/.cursor/mcp.json, VS Code: settings JSON)
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "figma-console-mcp@latest"],
      "env": { "FIGMA_ACCESS_TOKEN": "figd_TOKEN", "ENABLE_MCP_APPS": "true" }
    },
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
    "accessibility": { "command": "npx", "args": ["-y", "mcp-accessibility-scanner"] },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_TOKEN" }
    },
    "netlify": { "command": "npx", "args": ["-y", "@netlify/mcp"] },
    "context7": { "command": "npx", "args": ["-y", "@context7/mcp"] }
  }
}
```

```bash
# VS Code specific: can also use CLI
code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

**Per-project:** `vml-brand init` creates both `.cursor/skills/` and `.agents/skills/` with identical content, plus `.cursorrules` and `.github/copilot-instructions.md` with the same brand routing.

**Key limitation vs. Claude Code:** Skill auto-triggering is less sophisticated in both editors. Skills mostly need explicit `/slash` invocation. Brand routing still works because the instruction files contain the same routing rules.

### Codex CLI / Gemini CLI

Same pattern. `vml-brand init` creates `.codex/skills/` and `.gemini/skills/`. Each tool reads `AGENTS.md` for project context. MCPs configure via each tool's own mechanism — same server commands, different config file locations.

### Claude.ai (Web/Desktop — Not Claude Code)

For non-technical team members who work in Claude.ai rather than a code editor.

| Component | How It Works in Claude.ai |
|-----------|--------------------------|
| **Skills** | Upload Impeccable universal zip via Settings → Features → Skills |
| **Brand Package** | Upload `.brand/` contents as Project Knowledge in a Claude Project |
| **MCPs** | Limited — Claude.ai supports MCP connectors but not all servers. Figma is available as a native connector. |

**Best approach for non-technical users:** Create a Claude Project per client with the brand package uploaded as project knowledge. Practitioners chat with Claude and get brand-aware responses without any MCP or skill setup.

**Team/Enterprise distribution:** Admins can provision skills organization-wide. Shared skills auto-update when the admin updates them.

---

## Distribution & Storage

### Where the Toolkit Lives

The toolkit needs to be accessible to ~95 XD practitioners. Given the constraint that VML org repo seats are difficult to get at scale, the distribution strategy is:

| Component | Where It Lives | Why |
|-----------|---------------|-----|
| **Core Toolkit + Brand Factory + UX Pack** (skills, templates, CLI) | **Public GitHub repo** (team-owned) | Skills are markdown files — the methodology isn't the secret. Impeccable, Figma community skills, specs CLI are all public. Our skills being public removes the org-seat bottleneck and allows `npm install` or `git clone` by anyone on the team. |
| **Brand Packages** (`.brand/` directories) | **Per-client project repos** (personal GitHub) | Client-specific brand intelligence. Never public. Lives alongside the code it governs. Practitioners use personal GitHub repos for deployment flexibility (free Netlify/Vercel hosting). |
| **Documentation** (guides, setup walkthroughs, troubleshooting) | **Same public repo** (in a `/docs` directory) + **internal SharePoint/OneDrive** for slide decks and leadership materials | Technical docs live with the code. Presentation materials for leadership live where the org already collaborates. |
| **MCP configurations** | **Documented in the repo** but installed per-practitioner | MCP configs contain auth tokens — they can't be committed. The repo provides template configs and setup scripts. |

### Why Public

Public may feel counterintuitive for an agency, but consider:

- Every tool in our stack is already public (Impeccable: 17k stars; Figma Console MCP: 436 stars; specs CLI: open source). Our skills are a thin integration layer on top of public tools.
- The competitive advantage isn't the skill files — it's the Brand Factory methodology, the practitioner expertise, and the client-specific brand packages (which are never public).
- Public repos have no seat limits. All 95 practitioners can clone, install, and contribute without procurement.
- If the team later decides to go private, moving a repo from public to private is trivial. The reverse is harder.

If public is a firm no, a **GitHub repo under a team member's personal account** (not the VML org) works as an interim step. Any practitioner can be added as a collaborator without org seat issues.

### How Practitioners Get the Toolkit

```bash
# Option A: npm install (preferred — versioned, updatable)
npm install -g @vml-xd/brand-toolkit
vml-brand init --client "ClientName"

# Option B: git clone (for contributors/customizers)
git clone https://github.com/[team]/xd-toolkit.git
cd xd-toolkit && npm install && npm link

# Option C: manual download (for non-CLI-comfortable practitioners)
# Download zip from GitHub releases → follow setup guide
```

---

## What We Create vs. What We Install

### Things We Install (No Custom Development)

These are third-party tools we use as-is. We configure them, document how to set them up, and define how they fit into our workflow — but we don't build or modify them.

| Component | Source | What We Do With It |
|-----------|--------|-------------------|
| Impeccable (18 skills) | pbakaus/impeccable | Install into every project. Impeccable reads `.impeccable.md` for brand context — we generate that file. No fork needed. |
| Vercel engineering skills (2) | vercel-labs/agent-skills | Install into every project alongside Impeccable. |
| **Design System Ops (21 skills + 3 agents)** | murphytrueman/design-system-ops | **Optional DS Pack extension.** Covers token audit (with DTCG/Style Dictionary), component audit, DS health scoring, governance, documentation, design-to-code parity, migration workflows. Saves us 8-12 days of custom development. |
| Figma Official MCP | Figma | Configure per-practitioner. Document setup. |
| Figma Console MCP | Southleft | Configure per-practitioner. Document setup. |
| Storybook MCP | Storybook | Configure per-project where Storybook exists. Essential for DS Pack. |
| Playwright MCP | Microsoft | Configure per-practitioner. Document setup. |
| Accessibility Scanner MCP | Community | Configure per-practitioner. Document setup. |
| GitHub MCP | Anthropic | Configure per-practitioner. Document setup. |
| Vercel MCP | Vercel | Configure per-practitioner. Document setup. |
| Netlify MCP | Netlify | Configure per-practitioner. Document setup. |
| Context7 MCP | Community | Configure per-practitioner. Document setup. |
| Firecrawl MCP (optional) | Firecrawl | Optional upgrade for faster bulk scraping during client onboarding. Not required — Playwright handles the default workflow. Free tier covers ~2-3 clients; paid plans start at $16/month. |
| specs CLI | Nathan Curtis / DirectedEdges | Install globally. Brand Factory orchestrates it; DS Pack uses it for ongoing analysis. |
| Layout CLI | Layout.design | Install globally when stable. Brand Factory orchestrates it. |
| Designer Skills Pack (63 skills, 27 commands, 8 plugins) | Owl-Listener/designer-skills (664 stars) | Install per-practitioner. Covers research, strategy, UI, interaction, prototyping, design ops, toolkit, design systems. |

### Things We Create (Custom Development Required)

These are the components we build from scratch. This is where our development effort goes.

| # | Deliverable | What It Is | Effort |
|---|------------|-----------|--------|
| **C1** | **`.brand/` schema specification** | Documented spec for every file in the brand package: what fields, what format, required vs. optional, tiered completeness model (minimum → standard → comprehensive) | 3-5 days |
| **C2** | **`xd-brand` CLI** | Node.js CLI with commands: `init` (scaffold project), `update` (refresh skills), `validate` (check completeness), `doctor` (MCP verification), `score` (completeness), `upgrade` (tier promotion). Supports `--mode pitch/standard/comprehensive` and `--json` flag for machine-readable output on all commands. Copies skills to all tool directories, generates instruction files from templates. | 5-8 days |
| **C3** | **CLAUDE.md template** | The brand routing instructions — ~40-50 lines that tell agents when to load which brand files. Plus AGENTS.md, .cursorrules, copilot-instructions.md equivalents. | 1-2 days |
| **C4** | **`/brand-extract` skill** | Orchestrates the extraction pipeline: specs CLI (Figma component anatomy) + Layout CLI (CSS tokens from URLs) + Figma MCP (variable inventory) + voice extraction via Playwright MCP (default) or Firecrawl (optional). Scrapes website, social profiles, and app store listings per `.brandrc.yaml` sources. Falls back to guided manual input when automated extraction fails. Supports `--public-only` flag for pitch scenarios. | 3-5 days |
| **C5** | **`/brand-analyze` skill** | The core analysis skill. Reads extraction output + brand guide PDF (multimodal) + screenshots + copy samples. Synthesizes into `.brand/` directory files. Auto-generates `.impeccable.md` from overview. Infers voice from copy samples with confidence levels (HIGH/MEDIUM/LOW). Supports `--mode pitch` (minimum tier only) and `--mode comprehensive` (full analysis + existing codebase integration). Flags contradictions between sources. This is the most complex custom component. | 5-8 days |
| **C6** | **`/brand-score` skill** | Completeness scoring across all brand package dimensions. Modeled on Layout.design's 0-100 approach. Reports which tier the package is at. | 2-3 days |
| **C7** | **`/brand-audit` skill** | Evaluates agent output against brand-specific criteria: token compliance, component usage, composition patterns, voice consistency. Produces a brand adherence score. | 3-5 days |
| **C8** | **`/brand-refresh` skill** | Re-runs analysis against updated client assets. Produces diff against existing brand package. Human reviews changes before committing. | 2-3 days |
| **C9** | **Practitioner documentation** | Setup guide (MCP installation, CLI usage), daily workflow guide (how to use the toolkit), brand onboarding guide (how to run the Brand Factory), troubleshooting | 3-5 days |
| **C10** | **MCP setup verification script** | A script that checks which MCPs are configured, which are missing, and prints the exact install commands for the practitioner's agent tool. Run via `vml-brand doctor`. | 1-2 days |

**Total custom development: ~30-45 days of effort.**

**What we don't build:** Design system skills (saved ~8-12 days by adopting Design System Ops), UX research skills (curated from community), all MCPs (third-party), all extraction tooling (third-party).

**Future custom development (Phase 4+):** XD Manager Pack skills (`/thrive-review`, `/scope`, and others TBD). These are separate workstreams with existing work started in other threads.

---

## Build Plan

### Phase 1: Foundation (Weeks 1-3)

| # | Task | Deliverable | Effort |
|---|------|------------|--------|
| 1 | Define `.brand/` schema | **C1** — Schema specification | 3-5 days |
| 2 | Build `vml-brand init` CLI | **C2** — CLI scaffold (init command only first) | 3-5 days |
| 3 | Write instruction file templates | **C3** — CLAUDE.md, AGENTS.md, .cursorrules, copilot-instructions.md | 1-2 days |
| 4 | Write MCP setup guide + doctor script | **C9** (partial) + **C10** | 2-3 days |
| 5 | Test with one real client | Hand-author `.brand/` for existing client. Validate Impeccable + routing + MCPs produce on-brand output. | 3-5 days |

### Phase 2: Brand Factory (Weeks 4-7)

| # | Task | Deliverable | Effort |
|---|------|------------|--------|
| 6 | Build `/brand-extract` | **C4** | 3-5 days |
| 7 | Build `/brand-analyze` | **C5** — the core analysis skill | 5-8 days |
| 8 | Build `/brand-score` | **C6** | 2-3 days |
| 9 | Build `/brand-audit` | **C7** | 3-5 days |
| 10 | Build `vml-brand update` | **C2** (update command) | 2-3 days |
| 11 | Test end-to-end on 2-3 clients | Full onboarding → production → validate | 5-8 days |

### Phase 3: Distribution & Extensions (Weeks 8-10)

| # | Task | Deliverable | Effort |
|---|------|------------|--------|
| 12 | Build `/brand-refresh` | **C8** | 2-3 days |
| 13 | Set up public GitHub repo | Repo structure, README, releases, npm package publishing | 1-2 days |
| 14 | Write practitioner docs | **C9** — setup, workflow, onboarding, troubleshooting guides | 3-5 days |
| 15 | Package DS Pack | Bundle Design System Ops (21 skills) + Figma community skills + installation guide as optional extension | 1-2 days |
| 16 | Package Designer Skills Pack | Test integration, document the optional extension, verify no conflicts with Impeccable | 1-2 days |
| 17 | Claude.ai Project templates | Pre-configured Projects with brand knowledge for non-Code users | 1-2 days |

### Phase 4+ (Future)

**XD Manager Pack:**
- `/thrive-review` — employee performance reviews via Thrive platform (work started in separate thread)
- `/scope` — project scoping skill (work started in separate thread)
- Additional manager/ops skills TBD (resource planning, capacity, team health)

**DS Consulting (Scenario D):**
- `/ds-scope` — Design system consulting deliverable generator. Reads DS Pack audit outputs (triage, token-audit, component-audit, system-health, naming-audit, drift-detection) and produces: executive summary (system maturity, key risks, competitive position), gap analysis (what's missing, broken, outdated), remediation phases with effort estimates, and a scope document for the consulting engagement. Existing DS scoping work will be ported into this skill.

**Infrastructure improvements:**
- Multi-agent orchestration — Claude Code's native subagent capability enables parallel extraction, parallel analysis, and parallel audit within skills. Not a Phase 1 concern, but a future optimization for reducing Brand Factory wall-clock time.
- MCP server for brand intelligence (serve `.brand/` via MCP for very large brand systems)
- Visual regression integration (Applitools/Percy)
- Voice/tone automated scoring
- Brand package version diffing
- Web UI for non-technical brand package editing
- Design-code parity automation (Figma Console MCP parity checker integrated into CI)

---

## Update & Maintenance

### How Each Component Updates

| Component | Update Mechanism | Cadence |
|-----------|-----------------|---------|
| **Impeccable skills** | `vml-brand update --core` re-downloads latest and re-deploys to all tool directories | Quarterly or on major release |
| **Design System Ops** | `git pull` from murphytrueman/design-system-ops or re-download plugin file | Track releases; update when new skills ship |
| **UX/engineering skills** | Same as core — bundled with core update | Same |
| **Brand Factory skills** | `/plugin marketplace update vml/brand-factory` or `npm update -g @vml/brand-toolkit` | As we ship improvements |
| **MCPs (npm-based)** | Auto-update via `@latest` tag in npx commands | Automatic on each invocation |
| **MCPs (cloud-hosted)** | Automatic (Vercel MCP, etc.) | No action needed |
| **specs CLI** | `npm update -g @directededges/specs-cli` | Quarterly — test new version first |
| **Layout CLI** | `npm update -g @uselayout/cli` | As-available (early access) |
| **Brand packages** | Manual + skill-assisted: `/brand-refresh` with new assets | When client's brand evolves |
| **CLAUDE.md / instruction files** | `vml-brand update` merges template changes, preserves customizations | With core updates |

### What `vml-brand update` Does

```bash
vml-brand update

1. Downloads latest Core Toolkit skills from registry
2. Re-deploys to .claude/, .cursor/, .agents/, .gemini/, .codex/
3. Preserves .brand/ contents (never overwrites client data)
4. Merges CLAUDE.md template updates (flags conflicts for manual resolution)
5. Reports what changed (diff summary)
```

---

## Open Decisions

| # | Question | Recommendation |
|---|----------|----------------|
| 1 | **specs CLI: free vs. PRO?** | Start free. PRO adds token resolution + subcomponent references. Evaluate after first 2-3 client onboardings. Contact Nathan Curtis for agency pricing. |
| 2 | **How prescriptive is the `.brand/` schema?** | Tiered: minimum (overview + tokens + voice), standard (+ components + composition), comprehensive (+ specs + workflows). `/brand-score` reports which tier. |
| 3 | **Should we publish the toolkit publicly?** | Yes — recommended. Skills are markdown files on top of public tools. The competitive advantage is the Brand Factory methodology and client-specific brand packages (never public), not the skill files. Public removes the org-seat bottleneck for 95 practitioners. |
| 4 | **GitHub org repo or personal repo?** | Start with a team-owned personal GitHub repo (e.g., under your account or a shared "vml-xd" account). Move to org repo if/when seats become available. The toolkit works identically either way. |
| 5 | **Storybook: required or optional?** | Optional per-project. Include MCP config in `vml-brand init` only if project has Storybook dependency. |
| 6 | **Default deployment platform?** | Netlify (free tier allows commercial use). Vercel for Next.js projects where performance matters. Support both — practitioner picks per project. |
| 7 | **MCP server for brand intelligence?** | Not yet. File-based loading works until brand packages exceed useful context window size. Build MCP when we hit that limit. |
| 8 | **Practitioners without Claude Code?** | Cursor/VS Code get full skill + MCP support. Claude.ai Projects with brand knowledge is the fallback for non-editor users. |

---

## Testing & Agency Scenarios

See `docs/testing-and-scenarios.md` for the complete testing strategy and agency scenario definitions:

- **Testing:** Five-layer validation strategy (routing → Impeccable integration → MCP stack → Brand Factory → E2E)
- **Scenario A:** New client onboarding (standard mode)
- **Scenario B:** Pitch / no direct access (pitch mode)
- **Scenario C:** Existing client / established relationship (comprehensive mode)
- **Scenario D:** Design system consulting / assessment (DS Pack + extraction pipeline → consulting deliverable)
