---
name: vml-thrive-feedback
description: Generates VML Thrive peer feedback and manager evaluations through guided interactive questioning. Use this skill whenever the user mentions Thrive reviews, peer feedback, colleague evaluations, manager reviews, direct report evaluations, writing feedback for coworkers, performance reviews at VML, or needs to complete Thrive self-assessments. Also trigger when the user references Perception (Strengths, Opportunities, VML Values), Proposition, Purpose, or Priorities in a VML performance context. This skill handles both peer feedback (3 questions) and manager evaluations, and can process multiple people in sequence.
---

# VML Thrive Feedback Generator

This skill helps VML employees efficiently complete Thrive performance cycle responses — peer feedback, self-assessments, and manager evaluations — through structured interactive questioning followed by concise, evidence-based draft responses.

## Feedback Types

### Peer Feedback (Perception)
Three required sections per colleague:
1. **PERCEPTION | STRENGTHS:** Over the last 12 months, what were your colleague's 1-3 strengths that contributed most to the success of VML? (provide examples)
2. **PERCEPTION | OPPORTUNITIES:** Over the last 12 months, what were your colleague's 1-2 development opportunities to amplify their impact at VML? (provide examples)
3. **PERCEPTION | VML VALUES:** Over the last 12 months, how has your colleague demonstrated one or more of the VML values — Heart, Brains, and/or Courage? (provide examples)

### Self-Assessment (Proposition + Purpose + Priorities)
Eight sections:
1. PROPOSITION | STRENGTHS (1-3 strengths with examples)
2. PROPOSITION | OPPORTUNITIES (1-2 development areas with examples)
3. PROPOSITION | VML VALUES (Heart, Brains, Courage — with examples)
4. PURPOSE | INSPIRATION (career-wide impact aspiration)
5. PURPOSE | AMBITION (1-3 year goals at VML)
6. PRIORITIES | WORK (1-3 work priorities, WHAT + BY WHEN format)
7. PRIORITIES | LEARNING (1 skill to build/strengthen)
8. PRIORITIES | WELLBEING (optional — 1 wellbeing priority)

### Manager Evaluations
Same structure as peer feedback (Strengths, Opportunities, Values) plus calibration rating assignment. See Calibration Framework below.

---

## Workflow: Peer Feedback

### Step 1: Collect the List
Ask the user for the full list of people they need to review. Process one person at a time.

### Step 2: Interactive Questioning (Per Person)
Use the `ask_user_input` tool for speed. Run two rounds of questions per person:

**Round 1 — Context:**
- Role/discipline (options: XD - UI Design, XD - UX Design, XD - Copy, Delivery / PM, Research, Development / Engineering, Experience Strategy, Other)
- Working relationship proximity (Direct report / daily, Same team / weekly, Cross-functional / project-based, Occasional / limited)
- Top-of-mind impact descriptors (multi-select: Strong craft / quality of work, Leadership / mentorship, Collaboration / team player, Strategic thinking, Reliability / execution, Great attitude / energy, Still learning / growing)

**Round 2 — Specifics:**
- Accounts worked on (multi-select from known VML accounts + Other)
- Role-specific characterization question (tailor based on discipline):
  - Designers: craft quality characterization or leadership style
  - Developers: design-to-dev partnership style
  - Strategists: how they set direction
  - Researchers: growth trajectory stage
  - Delivery/PM: project management style
- #1 growth area (tailor options to discipline and seniority)

### Step 3: Draft Feedback
Write concise, evidence-based responses for all three sections. Follow these rules:

**Writing Rules:**
- Lead with the strongest, most specific observation
- Use account names and concrete examples — never generic praise
- Keep each section to 1 short paragraph (3-5 sentences)
- Match the Behavior → Impact → Suggestion framework from the Thrive guide
- For Opportunities: frame as growth, not weakness. Use "the next step is..." or "the biggest opportunity is..." framing
- For VML Values: pick the 1-2 values that genuinely fit. Don't force all three. Bold the value name.
- Vary the value assignments across the full list of people — don't default to Heart for everyone collaborative or Brains for everyone smart
- Tone: direct, specific, no fluff. Write like a peer who respects the person, not an HR template.

**VML Values Definitions (for accurate assignment):**
- **Heart** — Our foundation of empathy and trust. Active listening, building trust/connection, prioritizing human oversight, connecting across functional/geographic boundaries.
- **Brains** — Our engine for innovation. Learning new trends, reframing problems for deeper insights, storytelling for clarity, experimenting with new tools/frameworks/AI.
- **Courage** — Our commitment to brave ideas. Voicing disagreements respectfully, advocating for innovative ideas backed by rationale, giving specific actionable feedback, leading discussions on learnings when things don't go as planned.

### Step 4: Review and Iterate
Present the draft and ask if it needs tweaks before moving to the next person. Common adjustments:
- Softening or sharpening the Opportunity section
- Swapping the VML Value
- Adding a specific example the user forgot to mention
- Adjusting tone (too formal, too casual)

Then move to the next person on the list.

---

## Workflow: Self-Assessment

### Step 1: Gather Context
Before drafting, search conversation history for the user's work over the past 12 months — projects, accounts, accomplishments, presentations, tools built, metrics achieved. The more specific evidence found, the stronger the output.

### Step 2: Draft All 8 Sections
Write all sections in one pass using the evidence gathered. Follow section-specific guidance:

- **Strengths:** Lead with the highest-impact, most differentiated contributions. Include metrics where available. 2-3 strengths, each a paragraph with specific examples.
- **Opportunities:** Be honest. Frame as growth areas, not weaknesses. Show self-awareness by acknowledging what's already being done to address them.
- **VML Values:** Pick the values that genuinely fit the person's year. Use specific examples, not generic claims.
- **Inspiration:** Career-wide aspiration. Should feel personal and authentic, not corporate. Use the "magazine cover" test from the Thrive guide.
- **Ambition:** 1-3 year timeframe. Be specific and quantifiable. Include role/career aspirations if appropriate.
- **Work Priorities:** Use WHAT + BY WHEN format per the Thrive guide. Each priority should be specific enough that success is measurable.
- **Learning:** Pick one skill. Include specific learning activities and timeline.
- **Wellbeing:** Optional. Keep it concrete and actionable, not aspirational platitudes.

### Step 3: Iterate Section by Section
The user will likely want to adjust tone, emphasis, or framing on specific sections. Be ready to rewrite individual sections without regenerating the whole document.

---

## Workflow: Manager Evaluations

Same questioning flow as peer feedback, plus:

### Additional Manager Questions
- Performance trajectory (improving, steady, declining)
- Calibration rating recommendation (Evolving/Emerging, Low Effective, Mid Effective, High Effective, Exceptional, Exemplary)
- Promotion readiness (not yet, approaching, ready)
- Any specific performance concerns or highlights to document

### Calibration Framework
Ratings must be evidence-based and grounded in observable behavior and impact.

**Effective (primary distribution):**
- Low Effective: Meets expectations but requires more direction than expected, shows inconsistency in independence or ownership
- Mid Effective: Reliable, consistent performer who delivers with appropriate autonomy
- High Effective: Strong performer approaching Exceptional, demonstrating early signs of expanded scope, influence, or leadership

**Evolving/Emerging (below expectations only):**
- Repeatable gaps in core skills, independence, quality, or delivery reliability
- Work requires rework or places additional load on others
- NOT for people who are new to level but performing as expected

**Exceptional (exceeds expectations consistently):**
- Scaling impact beyond role expectations
- Expanding scope without being asked
- Sustained high performance under difficult conditions
- NOT for a single standout project or effort alone

**Exemplary (outlier — zero is acceptable):**
- Redefines how work is done
- Creates impact beyond their team that is adopted or scaled
- Establishes new standards, capabilities, or ways of working

---

## Output Format

### For Peer Feedback
Present each person's feedback as a clean block with clear section headers, ready to copy-paste into the Thrive platform:

```
**PERCEPTION | STRENGTHS**
[paragraph]

**PERCEPTION | OPPORTUNITIES**
[paragraph]

**PERCEPTION | VML VALUES**
[paragraph]
```

### For Self-Assessment
Present as a markdown document with all 8 sections, each with the question as a header followed by the response.

### For Manager Evaluations
Same as peer feedback format, plus a calibration recommendation with supporting rationale.

---

## Confidentiality Note
Peer feedback is confidential — individual input is not shared with the colleague. Only a Manager Feedback Summary is shared. Self-assessments and manager evaluations follow VML's standard Thrive privacy guidelines.

## Batch Processing
When processing multiple people, keep momentum. After each person's draft, ask "Good? Tweak, or next person?" to maintain pace. Save all drafts so they can be compiled at the end if needed.
