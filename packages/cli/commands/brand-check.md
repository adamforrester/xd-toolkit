---
description: Check brand package completeness and health. Use when someone asks about brand status, completeness, or wants to know what's missing.
argument-hint: ""
---

Run xd-toolkit score on the current project and present results conversationally. If the CLI is available:

```bash
npx xd-toolkit score --json
```

Or find it in the repo:
```bash
node [path-to-repo]/packages/cli/bin/xd-toolkit.js score --json
```

If the CLI isn't available, manually check:
1. Read .brandrc.yaml for tier and mode
2. Check which .brand/ files exist and have content beyond the placeholder
3. Score each file: empty/placeholder = 0%, partial = 50%, complete = 100%
4. Calculate overall completeness

Present results conversationally:

"Your [client] brand package is [X]% complete at the [tier] tier.

What's solid:
- [list HIGH confidence files with brief note on what they contain]

What needs attention:
- [list missing or LOW confidence files with specific gaps]

Want me to work on filling any of these gaps?"

If gaps are found, offer specific actions:
- Missing voice.md: "I can analyze the website copy and social profiles to generate this"
- Empty token files: "Do you have a Figma file I can pull variables from?"
- Low confidence files: "I can improve these if you share [specific asset type]"
