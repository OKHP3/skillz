---
name: okhp3-custom-gpt-skill-conversion-planner
description: >
  OverKill Hill P³ Custom GPT to Agent Skill conversion planning and asset mapping.
  Use when an existing Custom GPT, Gemini Gem, Copilot agent, or reusable AI
  workflow needs to be assessed for conversion into an Agent Skill. Also
  activate when the user asks what is required to migrate a GPT, how GPT
  instructions and knowledge files map to SKILL.md packages, or whether a GPT
  is mature enough to convert. This is the required planning bridge before
  okhp3-skill-foundry authors a converted skill.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Assessing whether an existing AI configuration is ready for Agent Skill conversion
    - Mapping instructions, knowledge, tools, evaluations, and provenance into a skill package
    - Producing a conversion plan and a handoff for Skill Foundry
    - Identifying portability, privacy, rights, and missing-evidence blockers
  out_of_scope:
    - Writing the final converted SKILL.md or implementation scripts
    - Copying credentials, private knowledge, or platform-specific secrets into a skill package
    - Deleting, deprecating, or changing the original Custom GPT
---

# okhp3-custom-gpt-skill-conversion-planner

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Use this skill to decide whether an existing Custom GPT can become a durable,
portable Agent Skill and to specify what the conversion requires. It plans the
conversion. `okhp3-skill-foundry` authors, evaluates, and improves the resulting
skill only after this plan is accepted.

---

## Scope

| In scope | Out of scope |
|---|---|
| Decompose a GPT’s behavior, knowledge, tools, tests, and source material | Drafting the final SKILL.md or scripts |
| Distinguish portable logic from platform-only configuration | Copying credentials, OAuth settings, or private source material |
| Build an asset-allocation and migration plan | Retiring, publishing, or altering the original GPT |
| Produce Foundry-ready evaluation and repository handoffs | Claiming a platform feature is portable without verification |

---

## Conversion principles

1. **A GPT configuration is evidence, not the destination.** Preserve it as an
   origin artifact. Do not overwrite it while assessing conversion.
2. **Convert behavior, not platform decoration.** A skill needs repeatable
   decisions, inputs, outputs, tools, data, and validation. A GPT avatar,
   Builder toggle, or share setting is not portable behavior.
3. **Do not carry prompt-local memory forward.** Identify what continuity
   actually requires and represent it as explicit inputs, local state, or a
   documented handoff contract.
4. **Extract only safe assets.** Private knowledge, employer material,
   copyrighted source text, credentials, and client overlays are blockers until
   they are removed, replaced, or retained in a private package.
5. **Preserve semantic coverage.** Every high-value GPT task must be mapped to
   a future skill behavior, an intentional exclusion, or a documented platform
   dependency.

---

## Workflow

### 1. Establish the conversion object

Inventory the existing artifact without editing it:

- product name, version, owner, visibility, and intended users;
- instruction block and conversation starters;
- knowledge files and their origins;
- enabled tools, Actions, Apps, connectors, and external dependencies;
- examples, evaluation prompts, user feedback, and known failure modes;
- repository, FoundRy, and registry lineage when available.

If the GPT is only an idea or a partial prompt, stop and load
`okhp3-custom-gpt-readiness` first.

### 2. Assess conversion readiness

Classify these dimensions as `ready`, `partial`, `blocked`, or `not-needed`:

1. Stable job to be done
2. Observable inputs and outputs
3. Repeatable decision logic
4. Knowledge and source-rights boundary
5. Tool and integration portability
6. Evaluation evidence and failure modes
7. Ownership, versioning, and maintenance path
8. Public or private package visibility

Use the strongest applicable result:

| Verdict | Meaning |
|---|---|
| `ready-for-skill-foundry` | Evidence is adequate for full skill authoring and evaluation |
| `ready-for-private-conversion` | Useful conversion, but public distribution is not permitted |
| `needs-gpt-maturation` | The GPT needs clearer behavior, examples, or evaluation first |
| `needs-asset-remediation` | Rights, privacy, source quality, or portability prevent conversion |
| `retain-as-platform-workflow` | The value depends primarily on a platform-only surface |

### 3. Create the asset-allocation matrix

Map every source asset exactly once, using the categories in
`references/conversion-dossier-schema.md`:

| GPT source asset | Skill destination | Rule |
|---|---|---|
| Stable role and activation cues | `SKILL.md` description and scope | Keep concise and trigger-oriented |
| Repeatable workflow steps | `SKILL.md` orchestration | Keep executable steps, not lore |
| Domain facts and guidance | `references/` or `data/` | Preserve provenance and source rights |
| Deterministic transformation | `scripts/` | Parameterize and document inputs and outputs |
| Output layouts | `assets/templates/` | Keep templates separate from instructions |
| Good and bad task cases | `evals/` | Convert to evidence-anchored assertions |
| Platform-specific toggles or share settings | `platform-dependency` record | Do not pretend they are portable |
| Credentials and private secrets | `blocked` | Never migrate into a public package |

### 4. Account for semantic coverage and loss

Build a capability map for every declared GPT task:

- `preserved`: transferred to a named skill behavior;
- `reimplemented`: needs scripts, data assets, or a different integration;
- `platform-dependent`: retained outside the portable skill;
- `intentionally-excluded`: not part of the skill’s durable job;
- `blocked`: cannot transfer until a privacy, rights, or safety issue is resolved.

Do not describe a conversion as complete while a high-value task is unmapped.
Load `okhp3-refolddec-core` when semantic-loss tracking needs to be compared
across the GPT and future skill representation.

### 5. Produce the conversion handoff

Return these five artifacts:

1. **Conversion Dossier:** source GPT, user value, ownership, visibility, and
   readiness verdict.
2. **Asset Allocation Matrix:** source-to-package mapping with handling status.
3. **Capability Coverage Map:** every meaningful task and its conversion state.
4. **Remediation Plan:** ordered blockers, missing evidence, and decision owners.
5. **Skill Foundry Brief:** intent, scope boundary, package layout, three
   distinct evaluation cases, and the recommended versioning plan.

The first Foundry draft must be authored by `okhp3-skill-foundry`. If a
governed child repository is required before authoring, load
`okhp3-foundry-repo-creator` first.

---

## Handoff and composition

| Situation | Next skill |
|---|---|
| Candidate GPT or source material is incomplete | `okhp3-custom-gpt-readiness` |
| Conversion dossier is accepted | `okhp3-skill-foundry` |
| A governed repository is needed | `okhp3-foundry-repo-creator` |
| Conversion must track representation loss | `okhp3-refolddec-core` |
| Conversations and source materials need durable capture | `okhp3-notion-capture-router` |

---

## References

- `references/conversion-dossier-schema.md` -- conversion fields, allocation states, and coverage rules.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
