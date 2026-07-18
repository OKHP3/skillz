---
name: Cataloger sync rule
description: Two copies of the cataloger script and SKILL.md must stay in sync on every change
---

## The rule

There are two copies of the okhp3-skill-cataloger that must always stay in sync:

1. `.agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py` — canonical
2. `universal/okhp3-skill-cataloger/scripts/gen-skills-readme.py` — distribution copy

Similarly, both SKILL.md files must be bumped to the same version on every change:

1. `.agents/skills/okhp3-skill-cataloger/SKILL.md`
2. `universal/okhp3-skill-cataloger/SKILL.md`

**Why:** The `.agents/skills/` copy is the local/Replit-specific skill that this agent uses. The `universal/okhp3-skill-cataloger/` copy is the distribution skill that ships to other repos. Both must be identical or the distributed skill diverges from the working version.

**How to apply:** After every edit to the canonical script, copy it: `cp .agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py universal/okhp3-skill-cataloger/scripts/gen-skills-readme.py`. Edit both SKILL.md files together.

## Current version: 1.4.0

v1.4.0 features: bio absorption from README.md (first creation AND existing FAMILY.md with empty bio), auto-deletes README.md after absorption, auto-generates Families table in root README.md between FAMILIES_TABLE_START/END markers. `docs/` is in FULL_SKIP.
