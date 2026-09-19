# AskJamie

**Status: early specific tooling.** AskJamie now has brand-specific GPT readiness and builder forks; downstream lens and helpdesk capability conversion remains a future expansion.

One of the three OKHP3 sub-brands. AskJamie is the calm, architected AI helpdesk and interpretive intelligence layer between strategy and execution. The current packages prepare Custom GPT origins for governed, repo-backed migration.

## Current packages

- `okhp3-askjamie-gpt-readiness/` assesses whether an AskJamie lens or Custom GPT is ready for build.
- `okhp3-askjamie-gpt-builder/` builds and audits the resulting Custom GPT experience.

## Design direction

AskJamie favors plain-language explanations, visible walkthroughs, decision trees, diagrams when useful, tradeoffs, calm pacing, and a clear next step. Use https://askjamie.bot as the current public positioning reference.

The GPT builder and readiness packages are migration scaffolding, not proof that a resulting GPT or Agent Skill is canon-ready. Complete source, privacy, eval, and authority checks before promotion.

## Shared workflows and AskJamie profiles

The seven former AskJamie workflow copies were consolidated on 2026-09-19.
Use the shared skill with its bundled AskJamie profile only for a confirmed
AskJamie target. Each profile ships inside its shared package, so standalone
installation preserves the brand guidance without maintaining a second workflow.

| Task | Shared skill | Optional profile |
|---|---|---|
| General thread extraction | [okhp3-thread-context-extraction](../context-extraction/okhp3-thread-context-extraction/SKILL.md) | [AskJamie profile](../context-extraction/okhp3-thread-context-extraction/references/brand-profiles/askjamie.md) |
| ChatGPT extraction | [okhp3-thread-extract-chatgpt](../context-extraction/okhp3-thread-extract-chatgpt/SKILL.md) | [AskJamie profile](../context-extraction/okhp3-thread-extract-chatgpt/references/brand-profiles/askjamie.md) |
| Claude extraction | [okhp3-thread-extract-claude](../context-extraction/okhp3-thread-extract-claude/SKILL.md) | [AskJamie profile](../context-extraction/okhp3-thread-extract-claude/references/brand-profiles/askjamie.md) |
| ChatGPT project migration | [okhp3-chatgpt-project-migration](../context-extraction/okhp3-chatgpt-project-migration/SKILL.md) | [AskJamie profile](../context-extraction/okhp3-chatgpt-project-migration/references/brand-profiles/askjamie.md) |
| Repository organization | [okhp3-repository-organizer](../universal/okhp3-repository-organizer/SKILL.md) | [AskJamie profile](../universal/okhp3-repository-organizer/references/brand-profiles/askjamie.md) |
| Repository creation | [okhp3-repository-creator](../universal/okhp3-repository-creator/SKILL.md) | [AskJamie profile](../universal/okhp3-repository-creator/references/brand-profiles/askjamie.md) |
| Style registration and application | [okhp3-brand-style-registry](../universal/okhp3-brand-style-registry/SKILL.md) | [AskJamie profile](../universal/okhp3-brand-style-registry/references/brand-profiles/askjamie.md) |

The brand-specific GPT readiness and builder packages remain active because
they add distinct domain gates and evaluation cases. The brand styling package
also remains active with its approved profile and accessibility requirements.

See the [archived originals and recovery record](../docs/archive/skill-redundancy-2026-09-19/brands/README.md).
The README-only old locations are compatibility pointers, not additional skills.
