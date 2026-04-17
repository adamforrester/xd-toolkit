---
description: Set up a new XD Toolkit project with brand extraction. Use when someone wants to start a new client project, set up brand context, or onboard a new client. Triggers on "new project", "set up a project", "onboard a client", "start a project for [client]", "create a project".
argument-hint: "[client name]"
---

# New Project Setup

You are guiding an XD practitioner through setting up a new client project with brand extraction. Be conversational and clear. Never assume they know what a CLI, MCP, or token file is.

## Phase 1: Project Details

Ask these questions one at a time. Don't dump them all at once.

1. **Client name** — If the practitioner provided a client name as an argument, use it. Otherwise ask: "What client is this for?"

2. **Project type** — "Are you building a coded prototype, or designing in Figma only?"
   - Coded prototype: full scaffold with skills, code workflows, deploy config
   - Figma only: minimal scaffold, just brand context for Figma work

3. **Mode** — "How much access do you have to this client's brand assets?"
   - "I have their style guides, Figma files, the works" → standard
   - "I only have their public website — this is a pitch" → pitch
   - "Full access plus years of working with them" → comprehensive

4. **Website URL** — "What's their website URL?"

5. **Figma files** — "Do you have Figma file URLs to share, or should I read from whatever you have open in Figma?"
   - If URLs: accept multiple, one at a time
   - If Figma MCP: note that files need to be open in Figma desktop
   - If neither: skip

6. **Social profiles** — "Do they have social media accounts I should look at for voice and tone? (X/Twitter, Instagram, LinkedIn, Facebook)"
   - Accept URLs or skip

## Phase 2: Scaffold

Use the xd-toolkit CLI to scaffold the project:

```bash
npx xd-toolkit init --client "[name]" --mode [mode] [--figma-only]
```

Or if the CLI isn't globally installed, find it in the repo:
```bash
node [path-to-repo]/packages/cli/bin/xd-toolkit.js init --client "[name]" --mode [mode] [--figma-only] --non-interactive
```

If the CLI isn't available at all, scaffold manually:
- Create .brand/ directory with empty files per the schema
- Create CLAUDE.md from template
- Create .impeccable.md
- Create .brandrc.yaml with the collected URLs
- Copy skills to .claude/skills/ if available

Report what was created.

## Phase 3: Asset Collection

Ask: "Now let's gather your brand assets. What do you have?"

Present as a checklist:
- Brand guide or style guide (PDF, usually)
- Design token files (JSON, YAML, or CSS — these are extremely helpful if you have them)
- Voice and tone guidelines
- Any other brand documents

For each file type:
- Tell them to drag the file into this chat or provide the file path
- When they provide a file, confirm you received it: "Got it — [filename]. I'll read this during extraction."
- Copy files to an assets/ directory in the project
- Update .brandrc.yaml with file paths

If they don't have anything: "No problem — I'll work with the website and any Figma files. The results will have lower confidence in some areas, which I'll flag."

## Phase 4: Brand Extraction

Tell the practitioner: "I have everything I need. I'm going to analyze your brand assets now. This takes a few minutes."

Then execute these steps:

### 4a. Read uploaded documents
- Read any PDFs multimodally — extract brand identity, personality, colors, typography, voice guidelines
- Parse any token JSON/YAML files — extract exact color values, spacing scales, font stacks, border radii

### 4b. Website extraction (Playwright)
- Navigate to 3-5 pages on the client website
- Extract copy samples: headlines, CTAs, body copy, nav labels, microcopy, error messages
- Note visual patterns: color usage, typography, spacing, layout, composition

### 4c. Social media extraction (Playwright, if URLs provided)
- Visit each social profile
- Extract recent post copy, bio, engagement style
- Note voice differences between channels

### 4d. Figma extraction (Figma MCPs, if available)
- Get design context from provided URLs or open files
- Extract: colors, typography, spacing, border radius, shadows, component inventory, variable collections

### 4e. Generate .brand/ files

Using the schema specs in schema/brand/ as the format guide, generate each file:

- overview.md — from brand guide + website analysis
- voice.md — from copy samples + voice docs + social analysis. Include register map per channel. Include do/don't reference.
- tokens/colors.md — from token files > Figma variables > website extraction (priority order). Include USAGE RULES not just values.
- tokens/typography.md — same priority order
- tokens/spacing.md — same priority order
- tokens/surfaces.md — border radius, shadows, elevation
- tokens/motion.md — from brand guide or Figma
- components/*.md — from Figma component inventory if available
- composition/page-types.md — from website layout analysis
- composition/anti-patterns.md — inferred from brand personality

Mark every inference with confidence level:
- HIGH: directly stated in brand guide or token file
- MEDIUM: observed in multiple sources consistently
- LOW: inferred from single source or limited evidence

Cite the source for each finding: "From brand guide p.12" or "Observed on homepage and about page" or "From design-tokens.json"

### 4f. Generate .impeccable.md

Extract from overview.md: personality traits, audience, visual direction, design principles, use cases (infer from website if not explicit).

## Phase 4b: Conflict Resolution

After extraction, compare findings across all sources. When multiple sources disagree on the same design element, resolve using the process below.

### Source Authority Hierarchy

When sources disagree, prefer the higher-authority source (highest first):

1. **Figma variables/tokens** — the live design system, actively maintained
2. **Figma component library** — what's built and used in production designs
3. **Design token JSON files** — exported from the system, may lag behind Figma
4. **Brand guide PDF** — often outdated in agency contexts, reflects intent more than current state
5. **Live website** — may have legacy implementations or tech-debt compromises
6. **Social media** — reflects marketing voice, not the design system

### Digital Adaptations (NOT Conflicts)

Before flagging a difference as a conflict, check whether it represents an intentional context-specific adaptation. Common intentional splits:

- **Display vs. body fonts** — Brand guides often specify a brand font for all uses. Design systems correctly substitute a screen-optimized font (Inter, Roboto, SF Pro, etc.) for body/UI text. If the brand guide says "Brand Font" and the Figma DS uses a different font specifically for body/UI text, this is NOT a conflict. Document it as a digital adaptation in tokens/typography.md:

  > Display: [Brand Font] (per brand guidelines)
  > Body/UI: [Digital Font] (digital optimization — brand font used in print and display contexts, [Digital Font] used for body text on screens for readability)

- **Print vs. digital colors** — Pantone/CMYK values in the brand guide vs. hex/RGB in the design system. These are format translations, not conflicts.

- **Print vs. digital spacing** — Different density needs between print and screen. The design system's spacing scale governs digital work.

The general rule: a difference is a conflict only when the **same usage context** has different values across sources (e.g., Figma says Inter for body AND the brand guide says DM Sans specifically for digital body text). Different contexts having different values is expected.

### Conflict Classification

**Critical conflicts** — ALWAYS stop and ask the practitioner. Never silently resolve these:
- Primary/secondary brand colors (different hex values for "primary blue")
- Primary fonts (conflicting typeface families for the same usage context)
- CTA styles (different button treatments across sources)
- Logo usage rules (contradictory guidance)

**Minor conflicts** — Apply the hierarchy silently, note in CHANGELOG.md, mention in the review summary:
- Shadow values (e.g., slightly different elevation shadows)
- Specific spacing values (e.g., 16px vs. 20px card padding)
- Border-radius differences (e.g., 4px vs. 6px)
- Secondary/tertiary color variations

### Resolution Process

For each critical conflict detected, present it conversationally:

"I found a conflict on **[element]**:
- **Figma variables:** [value] 
- **Brand guide (p.XX):** [value]
- **Website:** [value]

My recommendation: use **[value]** from **[source]** because [reason based on hierarchy].

What would you like to do?
1. Accept my recommendation
2. Override with a different value
3. Flag this for client resolution"

### Recording Resolutions

**Resolved conflicts** — Append to `.brand/CHANGELOG.md`:
```
## [date] — Initial brand extraction

### Conflicts resolved
- **[element]**: Used [value] from [source]. [Rationale]. 
  Other sources: [source] said [value], [source] said [value].
  Resolution: [accepted recommendation / practitioner override / etc.]
```

**Unresolved conflicts** (flagged for client) — Write to `.brand/conflicts.md`:
```
# Unresolved Brand Conflicts

These items need client input before the brand package is complete.

## [element]
- **Source A ([name]):** [value]
- **Source B ([name]):** [value]  
- **Context:** [why this matters, what's affected]
- **Recommendation:** [suggested resolution]
- **Status:** Awaiting client input
```

After all conflicts are resolved or flagged, proceed to Phase 5.

## Phase 5: Review

Present a summary of what was generated:

"Here's what I found for [client]:

**Brand personality:** [traits]
**Primary colors:** [list with hex values and usage]
**Typography:** [font families]
**Voice:** [2-sentence summary]
**Confidence:** [X files HIGH, Y files MEDIUM, Z files LOW]
**Conflicts:** [N resolved, M flagged for client] (if any)
**Digital adaptations:** [list any intentional splits documented, e.g., 'body font uses Inter instead of brand font for screen readability']

Files I'd recommend you review:
- voice.md — [reason, e.g., 'only had website copy, no official voice guide']
- tokens/motion.md — [reason, e.g., 'no motion specs found, generated defaults']
- conflicts.md — [if any unresolved conflicts exist: 'N items need client input']

Want to review any specific file, or should we continue to building?"

## Error Handling

- If Playwright can't access the website (blocked, CAPTCHA): tell the practitioner, ask them to screenshot 5-10 pages and share screenshots. Read screenshots multimodally.
- If Figma MCP can't connect: ask for Figma file URLs instead, or ask them to screenshot key frames
- If no assets provided at all: generate minimum-tier .brand/ from website only, mark everything MEDIUM or LOW confidence
- If in pitch mode: add disclaimer headers to all files, only generate minimum-tier files
