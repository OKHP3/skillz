---
family: murderbird
display_name: MurderBird
skill_count: 2
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-09-27T14:03:29Z
---

# murderbird

**Status: early specific tooling.** Editorial red-team and thesis-building
capabilities assigned to the MurderBird agent persona. Newly authored; not yet
exercised against a live agent session.

MurderBird is the OverKill Hill P³ sentinel: "the part of the forge that
watches the output and asks whether the system actually held." This family
packages that job as portable methods. It finds what doesn't hold in an
argument, then helps rebuild the argument so it does.

## Family boundary

In scope:

- Stress-testing long-form arguments, articles, essays, position papers, and
  manifesto-grade writing before publication.
- Turning research packets and rough ideas into a defensible thesis,
  structure, hooks, and ending, ready for a separate voice pass.
- Editorial judgment: separating real damage from honest rough edges.

Out of scope:

- Security, adversary, or agentic-threat red teaming. Use the `red-teaming/`
  family.
- Final brand-voice prose. Hand off to `okhp3-linkedin-voice` or the owner's
  voice profile.
- Publishing, posting, scheduling, or any social platform API.
- Critiquing people rather than arguments.

## Persona separation

These skills are voice-neutral method contracts. Tone comes from whichever
agent loads them. On an OpenClaw deployment, the MurderBird soul
(`infusing-a-soul/souls/murderbird/`) supplies the voice; the skills supply
the procedure and output contract. Do not bake persona catchphrases into
required output.

## Naming convention

```text
okhp3-murderbird-[object]-[action]
```

## Shared package contract

Every package must:

- Produce drafts and findings only. Never publish.
- Classify consequential claims using `okhp3-evidence-standard` tiers when
  evidence matters.
- Never invent statistics, quotes, sources, anecdotes, or client stories.
  Unverified content is marked `[VERIFY: ...]`.
- Exclude employer and private context by default.
- Follow OKHP3 writing rules: no em dashes, preserved standalone lines, hard
  endings without softening reader questions.

## Relationships

| Upstream | Downstream |
|---|---|
| `okhp3-openclaw-research-packet`, `okhp3-source-backed-research` | `okhp3-linkedin-voice`, `okhp3-linkedin-post` |
| `okhp3-linkedin-angles` (angle selection) | `okhp3-glee-fully-wwgd-review` (reception check) |

Typical article pipeline: research packet, then `okhp3-murderbird-thesis-forge`,
then a draft, then `okhp3-murderbird-argument-audit`, then the voice pass,
then the WWGD check, then the owner publishes.

## Maturity and validation

Both packages are draftable candidates with `not-run` evals. Run each once
against a real draft before relying on it.

<!-- FAMILY_SUMMARY_START -->
Editorial red-team and thesis-building skills for the MurderBird agent: find what doesn't hold in an argument, then rebuild it so it does.
<!-- FAMILY_SUMMARY_END -->

## Skills (2)

<!-- FAMILY_INVENTORY_START -->
*2 skills &nbsp;·&nbsp; inventory last updated: **September 27, 2026 at 14:03 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-murderbird-argument-audit](okhp3-murderbird-argument-audit/SKILL.md) | Stress-test a draft article, post, essay, or position piece before publication and return a verdi... | 0.1.0 |
| [okhp3-murderbird-thesis-forge](okhp3-murderbird-thesis-forge/SKILL.md) | Turn a research packet, rough idea, or brain-dump into a defensible one-sentence thesis, load-bea... | 0.1.0 |
<!-- FAMILY_INVENTORY_END -->
