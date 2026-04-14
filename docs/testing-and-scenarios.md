# Testing Strategy & Agency Scenarios

## Part 1: Testing Strategy

Each component of the toolkit is tested independently, in dependency order. You don't move to the next layer until the current one proves out.

### Layer 1: Brand Routing (Test first — everything depends on this)

**What you're testing:** Does the CLAUDE.md template cause agents to load the right `.brand/` files for the right tasks?

**Method:**
1. Hand-author a `.brand/` directory for a known client (use the Wendy's example from the schema). Fill out overview.md, voice.md, tokens/colors.md, tokens/typography.md, one component file (button.md), and composition/page-types.md. Skip the rest — this tests tier tolerance too.
2. Drop the rendered CLAUDE.md + `.brand/` directory + `.impeccable.md` into a scratch project.
3. Run these five prompts and observe which files the agent loads:

| # | Prompt | Expected file loaded | Pass if |
|---|--------|---------------------|---------|
| 1 | "Build a hero section for the homepage" | composition/page-types.md, tokens/colors.md, tokens/typography.md | Agent references page layout patterns AND uses token values from the brand files |
| 2 | "Write error messages for a failed payment" | voice.md | Agent uses the brand's voice (e.g., Wendy's: irreverent, not corporate) |
| 3 | "Style a button component" | components/button.md, tokens/colors.md, tokens/surfaces.md | Agent checks for component guidance AND uses brand tokens |
| 4 | "Build a settings page for notification preferences" | composition/page-types.md, composition/anti-patterns.md | Agent checks layout patterns; mentions CTA rule (rule 6) |
| 5 | "Create a card grid showing menu items" | tokens/spacing.md, composition/page-types.md | Agent uses spacing scale, not magic numbers |

**What to watch for:**
- Agent ignores `.brand/` files entirely → routing rules aren't triggering. Reword the rules.
- Agent loads everything on every prompt → rules are too broad. Make triggers more specific.
- Agent loads the right file but ignores its content → content format issue. The file may be too long, too vague, or structured in a way the agent doesn't parse well.
- Agent stops because a file doesn't exist → tier tolerance failed. The "proceed and flag" instruction isn't working.

**How to log results:** Create a `tests/routing-results.md` in the repo. For each prompt, record: which files the agent loaded (check the tool use / file read output), whether the output reflected the brand, and what went wrong if anything. This becomes your regression test set.

**Improvement signal:** If 4/5 prompts produce on-brand output with correct file loading, routing works. If 2/5 or fewer, the template needs reworking before anything else.

---

### Layer 2: Design Quality (Impeccable integration)

**What you're testing:** Does Impeccable's quality system pick up brand context from the auto-generated `.impeccable.md`?

**Method:**
1. With the same test project from Layer 1, install Impeccable skills into `.claude/skills/`.
2. Run `/shape` — does the discovery interview skip the brand context questions (because `.impeccable.md` already provides them)?
3. Run `/critique` on a generated page — does the LLM design review reference the brand's personality? (E.g., "This layout feels too corporate for Wendy's irreverent brand personality.")
4. Run `/impeccable craft` with a feature request — does it generate output that reflects the brand?

**What to watch for:**
- `/shape` asks for brand personality even though `.impeccable.md` exists → Impeccable isn't finding the file. Check file location and format.
- `/critique` gives generic feedback with no brand awareness → `.impeccable.md` content isn't rich enough. Add more from overview.md.
- `/impeccable craft` produces generic "AI slop" that doesn't feel like the brand → the Visual Direction and Design Principles aren't translating into Impeccable's design decisions. The `.impeccable.md` template may need restructuring.

**Improvement signal:** When `/critique` mentions brand-specific concerns (not just generic Nielsen heuristics), integration works.

---

### Layer 3: MCP Stack (Test per-server)

**What you're testing:** Do the MCPs actually help in practice, and do agents use them at the right moments?

**Method:** Test each MCP individually with a targeted prompt:

| MCP | Test prompt | Pass if |
|-----|------------|---------|
| Figma Official | "Get the design context from [Figma URL]" | Returns structured design data |
| Figma Console | "Show me the design system health score for [Figma file]" | Returns scored dashboard |
| Playwright | "Open localhost:3000 and verify the hero section renders" | Browser opens, navigates, reports result |
| A11y Scanner | "Run an accessibility audit on localhost:3000" | Returns WCAG findings with severity |
| GitHub | "Create a new repo called test-project and push this code" | Repo created, code pushed |
| Netlify | "Deploy this project to Netlify" | Site deployed, returns URL |
| Context7 | "What's the current API for Next.js app router layouts?" | Returns current docs, not stale training data |
| Storybook | (only if project has Storybook) "What components are available?" | Returns component list from Storybook |
| Vercel | "Deploy this to Vercel" | Site deployed, returns URL |
| Firecrawl (optional) | "Scrape the copy from [URL] and extract headlines, CTAs, and body text" | Returns structured copy samples (skip if not installed — Playwright handles this) |

**What to watch for:**
- Agent doesn't attempt to use an MCP when it should → the CLAUDE.md rules may need a hint (e.g., "Use the accessibility scanner MCP to verify rule 7")
- MCP connection fails → auth configuration issue. Document the fix in troubleshooting.
- Agent over-uses MCPs (e.g., screenshots on every action) → this is the Playwright proliferation problem. May need a skill hint about when to use vs. not.

**Improvement signal:** When the E2E flow (build → verify in browser → audit a11y → deploy) works without manual MCP invocation.

---

### Layer 4: Brand Factory (Test when C4-C8 are built)

**What you're testing:** Does the analysis pipeline produce a usable `.brand/` directory from real client assets?

**Method:**
1. Pick three clients with different input quality:
   - **Rich:** Client with Figma files, style guide, live site
   - **Medium:** Client with a brand guide PDF and a live site, no Figma
   - **Thin:** Client with only a public website (the pitch scenario)
2. Run `/brand-extract` + `/brand-analyze` for each.
3. Compare auto-generated `.brand/` files against what a knowledgeable designer would write by hand.
4. Score each file on a 1-5 scale:
   - 1: Wrong or misleading
   - 2: Technically correct but too vague to be useful
   - 3: Usable with significant manual editing
   - 4: Good with minor corrections
   - 5: Ready to use as-is

**Target scores by tier:**
- Rich client: average 3.5+ across all files
- Medium client: average 3.0+ for minimum-tier files, 2.5+ for standard-tier
- Thin client: average 2.5+ for minimum-tier files only

**Improvement signal:** Track scores over time as you refine `/brand-analyze`. Each iteration should improve average scores by 0.3-0.5 points until you plateau around 3.5-4.0.

---

### Layer 5: End-to-End (Integration test)

**What you're testing:** Does the complete pipeline produce output that a designer would approve?

**Method:**
1. Start from zero: `xd-brand init --client "TestClient"`
2. Run the Brand Factory on real assets
3. Human reviews and enriches the brand package (time this — it's your onboarding cost metric)
4. Build three representative deliverables:
   - A marketing landing page
   - A transactional flow (checkout, registration, or settings)
   - A set of error messages and microcopy
5. Have a designer who knows the brand review the output blind (don't tell them it's AI-generated)
6. Record: review time, number of corrections needed, severity of corrections, overall "would you ship this?" verdict

**Improvement signal:** Fewer corrections per iteration. Target: designer makes <10 corrections on a landing page, and none are "this doesn't feel like the brand at all."

---

## Part 2: Agency Scenarios

The toolkit must handle four distinct starting conditions that agencies encounter.

### Scenario A: New Client Onboarding

**Situation:** Client is coming to the agency. They have brand assets — style guides, possibly a design system, live products — but these are usually messy, incomplete, or outdated. That's often why they're coming to an agency.

**What they provide (variable):**
- Brand style guide PDF (almost always)
- Live website(s) (almost always)
- Figma files (sometimes — may be in their org, may need access granted)
- Design token files (rarely)
- Existing codebase access (sometimes)
- Verbal briefing on brand direction (always — but unstructured)

**Toolkit workflow:**
```
1. xd-brand init --client "ClientName" --mode standard

2. Gather assets:
   - Get brand guide PDF
   - Get live URL(s)
   - Request Figma file access (may take days)
   - Schedule brand intake interview with client stakeholders

3. /brand-extract
   - Playwright MCP → scrape copy samples for voice extraction
   - Layout CLI → tokens from live site (immediate)
   - specs CLI → component anatomy from Figma (when access granted)
   - Figma MCP → variables (when access granted)

4. /brand-analyze
   - Reads brand guide PDF (multimodal)
   - Reads extraction output including copy samples
   - Screenshots live site for composition analysis
   - Synthesizes into .brand/ directory
   - Infers voice.md from copy samples with confidence levels
   
5. Human enrichment (the critical step):
   - Designer reviews generated files against their understanding of the client
   - Corrects errors (the brand guide says X but the live site does Y — which is right?)
   - Adds institutional knowledge from the intake interview
   - Fills gaps the analysis couldn't infer

6. /brand-score → verify completeness before starting work

7. Commit .brand/ to repo → team starts producing work
```

**Key challenge:** The client's assets often contradict each other. The style guide says one thing, the live site does another, and the stakeholder says something different. The Brand Factory analysis will surface these conflicts — the human enrichment step is where they get resolved. The `/brand-analyze` skill should flag contradictions explicitly rather than silently picking one.

**Testing this scenario:** Use a real new client onboarding. Time the entire process. Measure brand package quality. The target is 4-8 hours from "received assets" to "brand package committed," down from what would otherwise be weeks of manual documentation.

---

### Scenario B: Pitch / No Direct Access

**Situation:** The agency is pitching a prospective client. No access to internal brand assets, Figma files, or style guides. You have only what's publicly visible — their website, their app (if public), their social media, and your designer's instincts. You need a prototype that feels on-brand enough to win the pitch.

**What you have:**
- Public website URL(s)
- Public app (App Store / Play Store)
- Social media presence
- Maybe a publicly available brand guidelines PDF (some brands publish these)
- Designer's visual intuition from studying the brand

**What you don't have:**
- Internal style guides
- Figma files
- Design tokens
- Component library
- Access to anyone at the client

**Toolkit workflow:**
```
1. xd-brand init --client "ProspectName" --mode pitch

   The --mode pitch flag tells the CLI:
   - Only generate minimum-tier files (overview, voice, tokens, .impeccable.md)
   - Add a disclaimer header to every .brand/ file: 
     "⚠️ PITCH MODE — derived from public sources only. 
      Not validated against internal brand standards."
   - Skip workflows/ and specs/ directories

2. /brand-extract --public-only
   - Layout CLI → tokens from public website (colors, typography, spacing, radii)
   - Playwright MCP → scrape copy samples for voice extraction
   - Screenshots of key pages for composition analysis
   - No Figma extraction, no specs CLI (no access)

3. /brand-analyze --mode pitch
   - Reads extraction output
   - Analyzes screenshots for composition patterns
   - Infers brand personality from visual language + copy tone
   - Infers voice from scraped copy samples
   - Generates overview.md, voice.md, tokens/*.md
   - Marks every inference with confidence: HIGH (directly observed) / 
     MEDIUM (inferred from limited samples) / LOW (guessed from single instance)

4. Designer review (faster than full onboarding):
   - Focus on overview.md personality and voice.md tone — 
     these are the hardest to extract automatically
   - Adjust token values if the extraction missed anything
   - Add competitive context (the designer knows the landscape)

5. Build the prototype using the pitch-mode brand package
   - Impeccable uses .impeccable.md as normal
   - Routing works identically — files that don't exist get skipped
   - Output won't be perfect but will feel directionally right

6. If pitch is won → upgrade to Scenario A:
   xd-brand upgrade --tier standard
   - Preserves existing .brand/ files
   - Adds empty scaffolds for standard-tier files
   - Removes pitch-mode disclaimers
   - Client provides real assets → re-run analysis to enrich
```

**Key challenge:** Confidence calibration. The agent needs to know that pitch-mode brand data is lower confidence than full onboarding data. This isn't just a disclaimer — it should affect how aggressively the agent enforces brand rules. In pitch mode, the agent should be more flexible about deviating from extracted tokens if the designer overrides. In full mode, deviations should trigger warnings.

**Testing this scenario:** Pick a brand you DON'T work with. Run the pitch-mode workflow using only their public website. Have a designer who knows that brand evaluate whether the output "feels right." This is the hardest test — if it works for a cold-start brand, the toolkit is genuinely useful.

---

### Scenario C: Existing Client / Established Relationship

**Situation:** Long-standing client relationship. The agency may have built or maintained the design system. Deep institutional knowledge exists in the team's heads but may not be documented. The brand package should capture this knowledge so it survives team turnover.

**What you have:**
- Full access to everything: Figma files, codebase, style guides, tokens
- Institutional knowledge from years of working with the brand
- Existing code and component libraries (may or may not be well-documented)
- Direct access to client stakeholders for clarification

**What's different from Scenario A:**
- The design system may already be mature — the toolkit should enhance it, not replace it
- There may be existing AGENTS.md, CLAUDE.md, or .cursorrules files already in the codebase
- The team has opinions about "what the brand feels like" that go beyond any document
- The existing system may have technical debt that the brand package should acknowledge

**Toolkit workflow:**
```
1. xd-brand init --client "ClientName" --mode comprehensive

2. /brand-extract
   - Full extraction: specs CLI, Layout CLI, Figma MCP, Playwright MCP
   - Also scan existing codebase for: existing AGENTS.md/CLAUDE.md, 
     token files, component documentation, Storybook stories

3. /brand-analyze --mode comprehensive
   - Full analysis with all sources
   - Additionally: reads existing instruction files and incorporates 
     rules that are already documented
   - Detects conflicts between existing documentation and extracted reality

4. Knowledge capture sessions:
   - Interview 2-3 senior team members who've worked on the brand
   - Focus on: "What do you know about this brand that isn't written down?"
   - Capture composition patterns, anti-patterns, voice nuances, 
     and design judgment calls
   - Document in .brand/composition/ and .brand/voice.md

5. DS Pack integration (if maintaining the design system):
   - Install Design System Ops skills
   - Run /triage → get system maturity assessment
   - Run /token-audit → DTCG alignment, naming consistency
   - Run /component-audit → coverage gaps, AI-readiness
   - Feed findings into .brand/components/ files

6. Integration with existing tooling:
   - If existing CLAUDE.md exists, merge brand routing rules 
     (don't replace — augment)
   - If existing Storybook exists, configure Storybook MCP
   - If existing CI/CD exists, add token compliance linting

7. /brand-score → should achieve comprehensive tier (80%+)
```

**Key challenge:** Not disrupting working workflows. An existing client project has momentum. The brand package should slot in alongside existing tooling, not require a rebuild. The `--mode comprehensive` analysis should detect and preserve existing instruction files rather than overwriting them.

**Testing this scenario:** Use your most established client relationship. Run the comprehensive workflow. The test is: does the brand package capture knowledge that currently only lives in people's heads? Have a new team member (or someone unfamiliar with the brand) use the brand package to produce work, and compare quality against what an experienced team member produces.

---

### Scenario D: Design System Consulting / Assessment

**Situation:** A client or prospect engages the agency specifically to assess the health and maturity of their existing design system. This isn't a production build — it's a consulting engagement that produces an assessment report and scope document, not a `.brand/` package.

**What you have:**
- Access to the client's Figma files, codebase, and token system
- Possibly their Storybook instance
- The DS Pack extension (Design System Ops 21 skills)

**What you're producing:**
- An executive-ready assessment report (system health, gaps, risks)
- A prioritized remediation plan with effort estimates
- A scope document for the engagement

**Toolkit workflow:**
```
1. /brand-extract (same extraction pipeline, different consumer)
   - specs CLI → component anatomy from Figma
   - Figma MCP → variables, component inventory
   - Layout CLI → tokens from live implementation
   - Scan codebase for token files, component code, existing documentation

2. DS Pack audit skills (the core of Scenario D):
   - /triage → "where do I start?" maturity scan, prioritized run plan
   - /token-audit → DTCG alignment, naming violations, tier leakage,
     Style Dictionary v4 readiness
   - /component-audit → usage signals, duplication, coverage gaps,
     AI-readiness scoring
   - /system-health → 7-dimension health score (tokens, components,
     documentation, adoption, governance, AI readiness, platform maturity)
   - /naming-audit → naming convention consistency
   - /drift-detection → where teams diverged and why

3. /ds-scope (Phase 4+ custom skill — not built yet)
   - Reads all DS Pack audit outputs
   - Produces:
     - Executive summary (system maturity, key risks, competitive position)
     - Gap analysis (what's missing, what's broken, what's outdated)
     - Remediation phases with effort estimates
     - Scope document for the consulting engagement
   - Expected inputs: DS Pack audit JSON outputs
   - Expected outputs: Markdown report + scope document

4. Human refinement:
   - Senior DS practitioner reviews automated findings
   - Adds strategic recommendations (build vs. buy, phasing, team structure)
   - Adjusts effort estimates based on team knowledge
   - Shapes the narrative for the specific client audience
```

**Key difference from other scenarios:** The output is a consulting deliverable, not a `.brand/` package. The extraction pipeline is shared, but the downstream consumer is the DS Pack audit skills and the (future) `/ds-scope` skill, not `/brand-analyze`.

**Testing this scenario:** Run the audit skills against a known design system where you can verify the findings. Compare automated assessment against what a senior DS practitioner would write by hand. The automated version should surface the same issues — the human value-add is strategic framing and prioritization.

---

## Scenario Summary

| | Scenario A: New Client | Scenario B: Pitch | Scenario C: Existing Client | Scenario D: DS Consulting |
|---|---|---|---|---|
| **Assets available** | Style guide + live site + maybe Figma | Public website only | Everything | Figma + codebase + tokens |
| **Tier target** | Standard | Minimum | Comprehensive | N/A (report, not .brand/) |
| **CLI mode** | `--mode standard` | `--mode pitch` | `--mode comprehensive` | N/A (uses extraction + DS Pack) |
| **Extraction sources** | PDF + URL + Figma (when granted) | URL only | PDF + URL + Figma + codebase | Figma + codebase + URL |
| **Human effort** | 4-8 hours | 1-2 hours | 8-16 hours (includes knowledge capture) | 4-8 hours (assessment + refinement) |
| **Confidence level** | Medium-High | Low-Medium | High | High (data-driven) |
| **DS Pack needed?** | Unlikely | No | Likely | Required |
| **Key risk** | Asset contradictions | Wrong inferences | Disrupting existing workflows | Incomplete access to system |
| **Upgrade path** | → Comprehensive over time | → Scenario A if pitch wins | Already at max | → Scenario A/C if engagement continues |
| **Output** | .brand/ package | .brand/ package (minimum) | .brand/ package (comprehensive) | Assessment report + scope doc |
