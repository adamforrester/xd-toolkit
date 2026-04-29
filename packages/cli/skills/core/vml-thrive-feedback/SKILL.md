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

## Workflow: Manager Evaluations (Manager Feedback Summary)

Manager evaluations are different from peer feedback. As a manager, you are a **skilled synthesizer** — triangulating three sources:
1. **Your own manager observations** — behaviors, actions, direct performance data, business outcomes
2. **The team member's self-reflection** — their Purpose, Proposition, Priorities (received no later than April 1)
3. **Peer/upward feedback** — colleague feedback themes, patterns, and examples (received no later than April 1)

The output is a **Manager Feedback Summary** that goes to the VML People Team for review before being shared with the team member. Individual peer feedback is never shared — only this synthesized summary.

### Manager Feedback Summary Questions
Three required sections plus an overall evaluation rating:
1. **MANAGER FEEDBACK SUMMARY | STRENGTHS:** Over the last 12 months, what were your team member's 1-3 strengths that contributed most to the success of VML? (provide examples)
2. **MANAGER FEEDBACK SUMMARY | OPPORTUNITIES:** Over the last 12 months, what were your team member's 1-2 development opportunities to amplify their impact at VML? (provide examples)
3. **MANAGER FEEDBACK SUMMARY | VML VALUES:** Over the last 12 months, how has your team member demonstrated one or more of the VML values — Heart, Brains, and/or Courage? (provide examples)
4. **OVERALL EVALUATION:** "Overall, how would you evaluate your team member's performance?" (4-point scale: Evolving/Emerging, Effective, Exceptional, Exemplary)

### Step 1: Gather Inputs
Ask the user if peer feedback exists for this person. If yes, ask them to paste it in — this is the primary external signal to synthesize alongside manager observations.

If no peer feedback exists (e.g., it wasn't requested or none was submitted), the evaluation relies entirely on manager observations and the team member's self-reflection.

### Step 2: Interactive Questioning
Use `ask_user_input` to gather manager perspective. Run two rounds:

**Round 1 — Context & Trajectory:**
- Which accounts has this person worked on under your management?
- Performance trajectory (Improving, Steady, Plateaued, Inconsistent, Mixed, Declining)
- Initial calibration rating lean (Evolving/Emerging, Low Effective, Mid Effective, High Effective, Exceptional, Exemplary)

**Round 2 — Manager-Specific Context (tailor based on Round 1):**
- If there are performance concerns: Have you had direct conversations about them? (Formally, Partially, Not directly)
- If the user selects a high rating: Probe for evidence of impact beyond the role per calibration criteria
- Any additional context the peer feedback doesn't capture (manager-only observations, patterns, concerns)

### Step 3: Challenge Rating Alignment
**This is critical.** Before drafting, check whether the selected rating aligns with the evidence:
- If the user selects Exceptional but describes "steady, consistent" performance → flag the tension. Exceptional requires impact *beyond* role expectations, not just strong execution. Ask if they want to adjust.
- If the user selects Low Effective but all evidence is positive → flag that Low Effective implies drag on quality/pace.
- If trajectory is "declining" but rating is Mid Effective → flag the mismatch.

Use the calibration framework (below) to ground the conversation. Present the relevant criteria and let the manager decide — don't override, but do push back when evidence and rating don't match.

### Step 4: Synthesize and Draft
Write the three feedback sections plus a calibration recommendation. Follow these rules:

**Synthesis Rules:**
- Weave together peer themes + manager observations into a cohesive narrative — don't just list what each reviewer said
- Anonymize peer feedback (never attribute quotes to specific reviewers by name)
- When peer feedback is consistent across reviewers, note the pattern ("consistently described by colleagues as...")
- When peer feedback conflicts with manager observations, use your judgment to present the most accurate picture
- Acknowledge improvement trajectories — if someone is getting better at something, say so, even while flagging it as a continued growth area
- Focus on **observable behaviors and impact**, not personality, personal circumstances, or assumptions about intent
- Never reference medical conditions, neurodivergence, disabilities, or remote work arrangements in written feedback — keep it to behaviors and outcomes

**Writing Rules (same as peer feedback, plus):**
- Strengths section should be the most substantial — this is the narrative of their contribution
- Opportunities section should be honest and specific. Frame with "the next step is..." or "the biggest opportunity is..." Use Behavior → Impact → Suggestion structure.
- When someone has already made progress on a growth area, acknowledge that progress before pushing further ("has already made meaningful progress here — the next step is...")
- VML Values section: pick 1-2 values with concrete examples. Can reference peer observations anonymously.
- Calibration line at the end: state the rating, the core rationale, and what the path forward looks like

**Sensitive Situations:**
- Personal health, neurodivergence, family circumstances → never put in written feedback. Address in the private Thrive Conversation if relevant.
- Availability/responsiveness issues → frame as observable behaviors ("responsiveness to client Slack messages," "communicating availability proactively") not as character or lifestyle commentary
- When a person is a rare specialist / hard to replace → acknowledge their value but don't let it inflate the rating beyond what the evidence supports

### Step 5: Review and Iterate
Present the draft. Common adjustments for manager feedback:
- Softening or sharpening the Opportunity section
- Adjusting calibration rating after seeing it in context
- Adding specific examples the manager forgot to mention
- Ensuring the tone is appropriate for something the team member will read (via HR)

---

## Calibration Framework

The 4-point scale in Thrive is: **Evolving/Emerging → Effective → Exceptional → Exemplary.**

Within the Effective band, teams track **Low / Mid / High Effective** in calibration discussions. This internal differentiation is not visible in the Thrive tool itself — the manager selects "Effective" — but it must be discussed and tracked in calibration so that not everyone in Effective looks the same.

### Evaluation Approach
1. **FIRST — Evaluate WHAT was achieved:** Assess impact delivered for clients, colleagues, and business. This is the primary evaluation factor.
2. **NEXT — Evaluate HOW it was achieved:** Integrate VML values to complete the picture. Strong values with high impact enable top ratings; consistent value gaps will lower ratings even when results are strong.
3. **THEN — Select the appropriate evaluation from the scale.**

### Rating Definitions

**Evolving/Emerging (below expectations only):**
- Repeatable gaps in core skills, independence, quality, or delivery reliability
- Work requires rework or places additional load on others
- Performance does not meet expectations for the role
- NOT for people who are new to level but performing as expected
- New at level = Effective with a growth path. Not meeting expectations = Evolving/Emerging.

**Effective (primary distribution — most people will be here):**
- Low Effective: Meets expectations but requires more direction than expected at level, shows inconsistency in independence or ownership, or occasionally creates drag on quality or pace
- Mid Effective: Reliable, consistent performer who delivers with appropriate autonomy and no major performance risks
- High Effective: Strong performer approaching Exceptional, demonstrating early signs of expanded scope, influence, or leadership, and consistently improving outcomes beyond their own work

**Exceptional (exceeds expectations consistently):**
- Scaling impact beyond role expectations (improves team outcomes, quality, or direction — not just their own work)
- Expanding scope without being asked (identifies and acts on opportunities beyond defined scope)
- Sustained high performance under difficult conditions (delivers strong outcomes consistently in ambiguity, pressure, or complexity)
- NOT for a single standout project
- NOT for effort alone
- NOT for strong execution without broader impact

**Exemplary (outlier — zero is acceptable):**
- Redefines how work is done, not just executes it well
- Creates impact beyond their team that is adopted or scaled
- Establishes new standards, capabilities, or ways of working
- It is acceptable to have zero Exemplary ratings. There is no expectation to fill this category.

### Self-Check Questions Before Finalizing
- **Evolving/Emerging:** Am I over-emphasizing a recent failure? Am I disfavoring someone due to an unconventional background, personality, or working style?
- **Effective:** Am I defaulting to this to avoid tough conversations? Was their performance consistently meeting expectations or only occasionally?
- **Exceptional:** Is this due to one big moment or a recent success, or can it be attributed to performance consistently exceeding expectations? Am I favoring similarity?
- **Exemplary:** Have I compared against all evidence? Are their contributions consistently an industry best practice or can they be considered an organizational role model?

---

## The Thrive Conversation (Post-Evaluation)

After HR reviews manager evaluations (target: May 18), schedule a **Thrive Career & Feedback Conversation** with each direct report before May 30. The conversation covers the feedback summary, career purpose, and 2026 priorities.

### Conversation Structure (60 min)
| Phase | Duration | Approach |
|---|---|---|
| Set the Stage | 5 min | Frame as a two-way dialogue focused on career growth |
| Invite Self-Reflection | 10 min | "What were your key takeaways from your self-reflection?" Listen actively. |
| Integrate Peer Feedback | 10 min | Share anonymized feedback themes. Ask "How does this resonate?" |
| Deliver Summary & Evaluation | 10 min | State evaluation clearly, link to specific examples and criteria. Focus on behaviors/impact, not personality. |
| Listen & Discuss | 10 min | "What are your thoughts and questions?" Apply H.E.A.R.T.: Highlight facts, Explore perspective, Ask for their take, Remain humble, Test assumptions. |
| Plan Next Steps | 10 min | "How does this further your Purpose & inform your Priorities?" |

### Key Principles
- Effective conversations are **employee-led** — managers should talk only about 30% of the time
- Focus on **asking questions and active listening**
- Always focus on **behaviors and impact**, not personality
- Don't feel pressured to change evaluations on the spot — review new evidence if compelling

### Handling Pushback
- "My evaluation is too low" → Acknowledge their contributions, then walk through the criteria for Effective vs. Exceptional. Ask for specific examples of consistently exceeding expectations with broader impact.
- "I disagree with this opportunity area" → Acknowledge their perspective, reference specific anonymized examples from peers or your observation. The goal isn't to diminish skills but to identify where stronger demonstration would increase impact.

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
```
**MANAGER FEEDBACK SUMMARY | STRENGTHS**
[paragraph — synthesize peer themes + manager observations]

**MANAGER FEEDBACK SUMMARY | OPPORTUNITIES**
[paragraph — Behavior → Impact → Suggestion structure]

**MANAGER FEEDBACK SUMMARY | VML VALUES**
[paragraph — 1-2 values with concrete examples]

**Calibration: [Rating]** — [2-3 sentence rationale + path forward]
```

---

## Confidentiality Notes
- **Peer feedback** is confidential — individual input is never shared with the colleague. Only the Manager Feedback Summary is shared.
- **Manager Feedback Summary** goes to VML People Team for review before being shared with the team member.
- Self-assessments and manager evaluations follow VML's standard Thrive privacy guidelines.
- Never reference personal health, medical conditions, or accommodations in written feedback.

## Batch Processing
When processing multiple people, keep momentum. After each person's draft, ask "Good? Tweak, or next person?" to maintain pace. Save all drafts so they can be compiled at the end if needed.
