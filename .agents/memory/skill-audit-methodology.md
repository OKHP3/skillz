---
name: Auditing whether an Agent Skill has real usage evidence
description: How to tell a skill's own shipped example/template/fixture apart from genuine output when asked "has this skill actually been run"
---

When asked to confirm a skill under `.agents/skills/` has produced real
output (not just been installed), don't trust a first-pass explorer report
at face value — spot-check each claimed file path by hand.

**Why:** An initial audit misclassified several skills in both directions:
files inside a skill's own `assets/`/`examples/`/`fixtures/` directory (still
containing template placeholders like `"<portable-skill-name>"` or
`"evidence_status": "not-run"`) were reported as real usage, while a genuine
artifact (a repo-specific GitHub Actions workflow file) was reported as "no
evidence" just because the explorer didn't recognize it as belonging to that
skill.

**How to apply:** For each claimed file, check (a) it sits outside the
producing skill's own package directory, (b) it doesn't contain unfilled
template placeholders, and (c) grep/`git log` confirms it's genuinely tied to
this repo's content rather than a demo. Only then classify it CONFIRMED.
