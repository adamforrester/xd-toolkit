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

## Layer 2: Impeccable Integration — Partial Pass

| Test | What Happened | Verdict |
|------|--------------|---------|
| `/shape` discovery | Structured interview ran, brand system acknowledged but brief was generic | Partial pass — skill works, brand injection into briefs needs strengthening |
| Build from brief | Output is distinctly Wendy's — voice, color, composition all on-brand | Strong pass — brand context flows through build phase |

**Key finding:** The `/shape` skill's brief was brand-light, but the implementation was brand-rich. This means the routing + tokens + `.impeccable.md` are doing their job during the build phase even when the planning phase doesn't explicitly inject brand personality. The system works as a whole — planning captures scope, building applies brand.

**No changes needed:** The `.impeccable.md` use-cases field (added earlier from Impeccable's Context Gathering Protocol) would help `/shape` produce more brand-specific briefs, but the end-to-end result is on-brand.

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
| Firecrawl | Brand Factory | Optional |

---

## Next: Layer 4 (Brand Factory) and Layer 5 (E2E)

Layer 4 testing requires C4-C8 to be built. Layer 5 requires the full pipeline.
