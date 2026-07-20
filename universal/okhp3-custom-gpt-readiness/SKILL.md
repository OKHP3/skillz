---
name: okhp3-custom-gpt-readiness
description: >
  OverKill Hill P³ Custom GPT readiness intake and evidence assessment.
  Use when an idea, incomplete concept, prompt collection, knowledge pack, or
  partially built Custom GPT needs to be assessed before instruction writing.
  Also activate when the user asks what information is still needed to create a
  Custom GPT, whether existing material is adequate, or whether a GPT is the
  right product surface. This is the required upstream companion to
  okhp3-custom-gpt-builder for new or incomplete GPT work.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Assessing Custom GPT opportunity, scope, evidence, and readiness
    - Inventorying supplied prompts, knowledge, examples, and evaluation evidence
    - Identifying high-impact information gaps and collecting a build brief
    - Producing a handoff package for Custom GPT Builder
  out_of_scope:
    - Writing final Custom GPT instructions or configuring the GPT Builder
    - Creating a FoundRy child repository or publishing a GPT
    - Converting an existing GPT into an Agent Skill package
---

# okhp3-custom-gpt-readiness

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Use this skill before building a new Custom GPT or rescuing a partly formed one.
It turns a promising but uneven body of material into a defensible decision: build
now, gather specific evidence first, use a simpler surface, or archive the idea.

---

## Scope

| In scope | Out of scope |
|---|---|
| Clarify the user, outcome, scope, risks, and reason a GPT should exist | Drafting the final instruction stack |
| Inventory supplied material and determine what it can support | Configuring platform tools, Actions, Apps, or sharing settings |
| Identify missing evidence and ask only high-value follow-up questions | Migrating a GPT into a full Agent Skill package |
| Create a build handoff for `okhp3-custom-gpt-builder` | Creating repositories or changing external systems |

---

## Operating principles

1. **Do not start with an instruction block.** First establish whether the idea
   is a repeatable job that needs a Custom GPT rather than a prompt, an Agent
   Skill, a document, or no product surface at all.
2. **Work from supplied evidence before asking questions.** Inventory existing
   prompts, documents, knowledge files, examples, evaluations, and previous GPT
   artifacts. Do not ask for information already present.
3. **Make gaps actionable.** A useful gap says what is missing, why it matters,
   what a good answer looks like, and who can provide it.
4. **Protect source boundaries.** Do not move private, client, employer, or
   personally identifying material into a public-ready handoff. Label it
   `private-only`, `needs-redaction`, or `public-safe` instead.
5. **Prefer a no-build decision to a generic GPT.** A vague assistant for
   everyone is not a successful outcome.

---

## Workflow

### 1. Establish the candidate and product-surface decision

Capture the following before treating the idea as a GPT candidate:

| Field | Required decision |
|---|---|
| Candidate name | Working name, not a marketing claim |
| Primary user | Specific person, role, or audience |
| Job to be done | The recurring outcome the user needs |
| Repeatability | Why a one-off prompt is insufficient |
| Primary outputs | Three concrete outputs or decisions |
| Non-goals | At least five things the candidate must not do |
| Risk boundary | Privacy, safety, client, licensing, and advice constraints |
| Success evidence | Observable acceptance criteria |

Then issue one of these surface recommendations:

- `build-custom-gpt`: a stable, repeatable conversational workflow benefits from
  a GPT configuration and curated knowledge.
- `use-one-off-prompt`: the request is narrow, infrequent, or lacks a stable
  workflow.
- `plan-agent-skill`: the work depends on reusable local scripts, structured
  assets, or cross-runtime execution.
- `archive-or-research`: the user value, source rights, or workflow is still
  too uncertain to build responsibly.

State the reasoning. Do not treat the recommendation as a platform fact.

### 2. Inventory the available material

Create an evidence inventory using the schema in
`references/readiness-dossier-schema.md`. Classify each item by both role and
handling boundary:

| Role | Examples |
|---|---|
| `source-intent` | idea note, conversation, product brief |
| `domain-knowledge` | original research, public references, approved knowledge files |
| `behavior` | prompts, instruction fragments, conversation starters, output templates |
| `evidence` | worked examples, feedback, known failure modes, evaluations |
| `identity` | approved voice, visual, naming, or governance guidance |

For every item, record its origin, current state, usability, and one of
`public-safe`, `private-only`, `needs-redaction`, `rights-unclear`, or
`not-applicable`.

### 3. Score readiness and find the smallest blocking gaps

Assess these eight dimensions as `ready`, `partial`, or `missing`:

1. User and job clarity
2. Repeatable workflow
3. Scoped outputs and non-goals
4. Reliable domain knowledge
5. Source rights and privacy boundary
6. Conversation examples and failure modes
7. Evaluation and acceptance evidence
8. Ownership, maintenance, and visibility decision

`ready-to-build` requires no `missing` decision in dimensions 1 through 5 and
at least `partial` evidence in dimensions 6 through 8. Do not create a numeric
score that hides a critical gap.

### 4. Ask targeted follow-up only when it changes the decision

Ask at most three questions per round. Each question must resolve a named
readiness gap. Prefer this form:

> To confirm **[decision]**, I need **[specific fact or example]** because
> **[impact on scope, safety, or quality]**. A sufficient answer is **[shape]**.

If the user cannot supply an answer, record it as an explicit assumption or
recommend a no-build or research decision. Never silently invent business rules,
authority, personal details, source rights, or a target audience.

### 5. Produce the readiness handoff

Return all five artifacts below. Keep illustrative examples synthetic or
public-safe.

1. **Custom GPT Concept Dossier:** candidate, user, job, outcomes, non-goals,
   risks, and surface recommendation.
2. **Evidence Inventory:** what exists, quality, handling boundary, and intended
   use.
3. **Readiness Assessment:** the eight dimensions, blockers, assumptions, and
   verdict.
4. **Gap Brief:** ordered questions or collection tasks that would unblock work.
5. **Builder Handoff:** confirmed fields for `okhp3-custom-gpt-builder` Step 0.

Use exactly one verdict:

| Verdict | Meaning | Next action |
|---|---|---|
| `ready-to-build` | The critical build brief is evidenced | Load `okhp3-custom-gpt-builder` |
| `ready-with-assumptions` | Non-critical uncertainty is explicit | Confirm assumptions, then load builder |
| `needs-discovery` | Specific material is missing | Complete the Gap Brief first |
| `not-a-custom-gpt` | Another surface better fits the job | State the recommended surface |
| `do-not-proceed` | Safety, rights, or privacy cannot be resolved | Preserve the reason and stop |

---

## Handoff and composition

| Situation | Next skill |
|---|---|
| New candidate is `ready-to-build` | `okhp3-custom-gpt-builder` |
| Candidate needs a governed child repository | `okhp3-foundry-repo-creator` |
| Existing GPT needs conversion planning | `okhp3-custom-gpt-skill-conversion-planner` |
| Conversion plan is approved | `okhp3-skill-foundry` |
| Existing conversations need capturing first | `okhp3-notion-capture-router` |

Do not replace these downstream skills. This skill establishes their evidence
base and decision boundary.

---

## References

- `references/readiness-dossier-schema.md` -- required fields and output schemas.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
