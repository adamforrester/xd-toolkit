# Test Results

Test results from Layer 1-3 validation. Tested 2026-04-14.

---

## Layer 1: Brand Routing — 5/5 Passed

**Test fixture:** `tests/fixtures/wendys/` (minimum-tier Wendy's brand package)

| # | Prompt | Files Loaded | Brand-Aware Output | Verdict |
|---|--------|-------------|-------------------|---------|
| 1 | "Build a hero section for the homepage" | composition/page-types.md, tokens/colors.md, tokens/typography.md | Yes — followed landing page structure, used correct tokens | Pass |
| 2 | "Write error messages for a failed payment" | voice.md | Yes — irreverent Wendy's tone, not corporate | Pass |
| 3 | "Style a button component" | components/button.md, tokens/colors.md | Yes — used correct variants and brand tokens | Pass |
| 4 | "Build a settings page for notification preferences" | composition/page-types.md | Yes — referenced CTA rule (rule 6) | Pass |
| 5 | "Create a card grid showing menu items" | tokens/spacing.md, composition/page-types.md | Yes — used spacing scale, no magic numbers | Pass |

**Key finding:** Token files need **usage context rules**, not just values. The hero section test initially produced a full-bleed red background — correct color, wrong application. Adding "Application Context" section to colors.md (specifying red is for accents/CTAs, not section backgrounds) fixed the behavior.

**Action taken:** Split `tokens/colors.md` "Usage Rules" into "Application Context" (where colors go) and "Technical Constraints" (contrast ratios, restrictions). Documented as design principle in `schema/brand/README.md`.

**CLAUDE.md template:** No changes needed. Routing rules work correctly as-is.

---

## Layer 2: Impeccable Integration — Pass (by design)

| Test | What Happened | Verdict |
|------|--------------|---------|
| `/shape` discovery | Structured interview ran, brand system acknowledged but brief stayed scope-focused | Pass — separation of concerns is intentional |
| Build from brief | Output is distinctly Wendy's — voice, color, composition all on-brand | Strong pass — brand context flows through the build phase |

**Key finding:** The `/shape` skill's brief was scope-focused; the implementation was brand-rich. This is the intended division of labor — planning captures scope, building applies brand. The routing + tokens + `.impeccable.md` do their job at build time, so brand personality doesn't need to be redundantly injected during planning. The system works as a whole.

**No changes needed.** The earlier "partial pass" framing read this as a defect; it isn't. The `.impeccable.md` use-cases field (added previously from Impeccable's Context Gathering Protocol) is enough to make briefs slightly more brand-specific when the practitioner wants that, but the default separation is correct.

---

## Layer 3: MCP Stack — 6/6 Passed

| MCP | Test | Result | Notes |
|-----|------|--------|-------|
| Figma Official | Read design context | Pass | Returns structured design data |
| Figma Console | Design system audit | Pass | Complements Official — Console for local interaction, Official for deep context |
| Playwright | Browser verification + a11y audit | Pass | Found 3 violation categories, 34 rules passed. Better than dedicated A11y Scanner (1 category, 25 rules) |
| GitHub | Repo operations | Pass | gh CLI also works — both approaches valid |
| Netlify | Deployment | Pass | Requires one-time interactive browser auth |
| Context7 | Current framework docs | Pass | Returned current Next.js docs, not stale training data |

**Key findings:**

1. **Playwright replaces A11y Scanner.** Playwright + axe-core injection produces better accessibility audit results than the dedicated A11y Scanner MCP. Also avoids the Chrome session conflict that blocked the scanner from launching. **Action:** Removed A11y Scanner from the stack (8 core MCPs, down from 9).

2. **Voice extraction via Playwright works.** Playwright successfully scraped copy samples from wendys.com for voice analysis. Firecrawl is not required as default — downgraded to optional. **Action:** Firecrawl moved to optional enhancement. Reference example saved at `tests/fixtures/wendys-voice-extraction-example.md`.

3. **Figma Console + Official complement each other.** Console for local interaction (write, variables, audit), Official for deep context extraction (read, code generation). Both needed.

---

## MCP Stack (Post-Testing)

| MCP | Phase | Status |
|-----|-------|--------|
| Figma Official | Design | Core |
| Figma Console | Design | Core |
| Storybook | Design/Test | Core (project-scoped) |
| Playwright | Build/Test | Core |
| GitHub | Deploy | Core |
| Netlify | Deploy | Core |
| Vercel | Deploy | Core |
| Context7 | Context | Core |
| Firecrawl | Brand Skills | Optional |

---

## Layer 4 (Brand Skills) — partial pass

`/brand-extract` shipped at v1.0.0 (C4 covers C5/C8 inline). Validated against TruGreen end-to-end:

- **Stage 1 (Figma tokens)** — extracted via Figma Console MCP from Prism Foundations + AKQA Design Library. ✓
- **Stage 2 (Web tokens)** — Playwright sampled trugreen.com computed styles, reconciled against Figma. ✓
- **Stage 3 (Voice extraction)** — additive `## Observed Voice (live channels)` section appended to existing prescriptive voice.md. 11 prescriptive sections preserved. Surfaced casing divergence on live homepage. ✓
- **Stage 4 (Multimodal overview)** — read brand-guide PDF + reference screenshots; merged self-test block only, preserved validated atmosphere/positioning prose. ✓
- **Stage 5 (Conflict detection)** — surfaced 2 genuine conflicts (CTA casing, "Get started" wording), preserved 3 intentional adaptations from CHANGELOG; practitioner walkthrough captured resolutions. ✓
- **Stage 8 (`.impeccable.md` regen)** — fired automatically after Stage 5; condensed brand context written to project root. ✓
- **Stage 6 (DS repo scan)** — implementation-complete; not yet exercised on a real codebase (TruGreen DS package not yet available). Untested.

## Next: Layer 5 (full E2E prototype build)

**Unblocked** — C7 shipped in brand-skills v0.4.0 as `/brand-context:audit`. Execution still pending. The remaining test is a complete prototype build run-through: `/brand-extract` outputs in place, plus `design.md` and `.impeccable.md` at the project root → Impeccable consuming the brand context → building a representative page → `/brand-context:audit` to verify on-brand output. Stage 6 (DS repo scan) validation is parked separately and lives with the brand-skills agent.
