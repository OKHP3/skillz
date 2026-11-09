---
family: askjamie
display_name: AskJamie
skill_count: 9
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-11-09T23:23:02Z
---

# askjamie

**Status: early specific tooling.** AskJamie now has brand-specific GPT readiness and builder forks; downstream lens and helpdesk capability conversion remains a future expansion.

One of the three OKHP3 sub-brands. AskJamie is the calm, architected AI helpdesk and interpretive intelligence layer between strategy and execution. The current packages prepare Custom GPT origins for governed, repo-backed migration.

## Current packages

- `okhp3-askjamie-gpt-readiness/` assesses whether an AskJamie lens or Custom GPT is ready for build.
- `okhp3-askjamie-gpt-builder/` builds and audits the resulting Custom GPT experience.
- `okhp3-askjamie-email-draft/` drafts owner-voice correspondence with the Represent, Frame, Investigate, and Protect lenses. Draft-only. First capability for the AskJamie OpenClaw agent persona.

- `okhp3-professional-headshot/` creates a realistic, recognizable career portrait from authorized photos, with reference roles and verified delivery.

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

## Career reference and coaching source candidates

Three portable 0.2.0 packages extend Resume Representative: lifetime career
reference, role master resumes and coaching engagement. The canonical packages
are maintained in [AskJamie FoundRy](https://github.com/OKHP3/askjamie-foundry/tree/main/capabilities/resume-representative/skills);
these are exact distribution mirrors. The lifetime view consumes the existing
canon instead of owning another source/claim ledger.

Their maturity is draftable and review evidence is analytical. No live model
benchmark, protected holdout or native-host acceptance is claimed. See the
[synchronization record](../docs/career-library-skills-sync-2026-11-09.json).

<!-- FAMILY_SUMMARY_START -->
One of the three OKHP3 sub-brands. AskJamie is the calm, architected AI helpdesk and interpretive intelligence layer between strategy and execution. The current packages prepare Custom GPT origins for governed, repo-backed migration.
<!-- FAMILY_SUMMARY_END -->

## Skills (9)

<!-- FAMILY_INVENTORY_START -->
*9 skills &nbsp;·&nbsp; inventory last updated: **November 9, 2026 at 23:23 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-askjamie-brand](okhp3-askjamie-brand/SKILL.md) | OverKill Hill P³ AskJamie SPA styling. Use when a user wants an AskJamie application, documentati... | 1.1.0 |
| [okhp3-askjamie-email-draft](okhp3-askjamie-email-draft/SKILL.md) | Draft an email or direct message the owner will send as themselves, using the AskJamie lens metho... | 0.1.0 |
| [okhp3-askjamie-gpt-builder](okhp3-askjamie-gpt-builder/SKILL.md) | >- | 1.0.0 |
| [okhp3-askjamie-gpt-readiness](okhp3-askjamie-gpt-readiness/SKILL.md) | >- | 1.0.0 |
| [okhp3-coaching-engagement](okhp3-coaching-engagement/SKILL.md) | Set up or refresh a private career-coaching engagement brief from provider correspondence, intake... | 0.2.0 |
| [okhp3-job-application-completion](okhp3-job-application-completion/SKILL.md) | Complete or resume job applications from approved career evidence, tailored materials and saved p... | 0.2.0 |
| [okhp3-lifetime-career-reference](okhp3-lifetime-career-reference/SKILL.md) | Compile a private lifetime career reference or super master from an existing career claim ledger.... | 0.2.0 |
| [okhp3-professional-headshot](okhp3-professional-headshot/SKILL.md) | Create or refine a realistic professional headshot from supplied or explicitly authorized recent ... | 0.1.0 |
| [okhp3-role-master-resumes](okhp3-role-master-resumes/SKILL.md) | Create reusable role-family master resumes from an existing career evidence library. Use for seve... | 0.2.0 |
<!-- FAMILY_INVENTORY_END -->
