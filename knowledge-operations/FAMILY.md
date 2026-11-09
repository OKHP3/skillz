---
family: knowledge-operations
display_name: Knowledge Operations
skill_count: 11
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-11-09T15:46:27Z
---

# knowledge-operations

The knowledge-operations family governs the portable lifecycle of loose
information and exploratory work: preserve it, classify it, research it when
needed, validate it, decide whether it is ready, and prepare it for
owner-approved formalization.

## Scope

In scope:

- provenance-preserving capture of one raw item;
- recorded triage and lifecycle disposition;
- bounded follow-up and activity reconciliation;
- evidence classification and source-backed research;
- renewal of sourced research files and evidence-grounded voice profiles;
- read-only artifact validation and explicit unknowns;
- reconciliation of bounded record locations, preserved versions, and affected references;
- readiness decisions for exploratory efforts;
- owner-approved promotion packets.

Out of scope:

- platform-specific source scraping or account access;
- repository synchronization, branch cleanup, or generic filesystem
  organization;
- AI-agent creation or platform configuration;
- generic note-taking or personal productivity management;
- autonomous deletion, publication, external movement, or project creation;
- treating a score, citation, or prior assertion as authority by itself.

## Composition

```text
raw item
→ capture with provenance
→ triage and disposition
→ research or validate
→ graduation decision
→ owner-approved promotion packet
```

The family is destination-neutral. It composes with source-specific extraction
skills upstream, repository or knowledge-base skills downstream, and
domain-specific validation skills where the artifact requires them.

## Responsibilities and ecosystem fit

| Skill | Owns | Hands off when |
|---|---|---|
| `okhp3-activity-reconciliation` | Follow-up decisions, activity deltas, and verified coverage | Application disposition or platform-specific operations are needed |
| `okhp3-capture-intake` | One raw item, source preservation, receipt | A disposition decision is needed |
| `okhp3-triage-and-file` | Item disposition and approved lifecycle updates | Readiness assessment is needed |
| `okhp3-evidence-standard` | Claim tiers and evidence locators | New source retrieval or domain adjudication is needed |
| `okhp3-source-backed-research` | Source acquisition, freshness, support, recommendations | An artifact must be reviewed or acted upon |
| `okhp3-artifact-validation` | Proportionate checks and truthful check statuses | Independent adjudication or domain validation is needed |
| `okhp3-record-location-reconciliation` | Scoped location audit, guarded relocation, and reference verification | A broad migration or an application-status decision is needed |
| `okhp3-graduation-gate` | Exhaustive evidence-based readiness verdict | A formalization packet is needed |
| `okhp3-project-promotion` | Draft or cleared packet for owner review | Approved destination implementation begins |
| `okhp3-research-file-renewal` | Source-to-revision crosswalk and cited research update | Host-specific retrieval evaluation or approved publication is needed |
| `okhp3-voice-profile-renewal` | Authorship-aware voice, tone and glossary baseline or update | A platform-specific draft or approved release is needed |

These contracts remain separately invocable. Capture preserves before
interpretation; triage decides disposition. Evidence classification does not
retrieve sources; research does. Artifact validation records checks;
Equilibrium Review adds separate reviewers and adjudication. Graduation makes
the readiness decision; promotion assembles the resulting packet.

The cross-project capability router
[`okhp3-skill-discovery`](../universal/okhp3-skill-discovery/SKILL.md) belongs
in `universal/`. The continuation contract
[`okhp3-session-handoff`](../context-extraction/okhp3-session-handoff/SKILL.md)
belongs in `context-extraction/`: it preserves current work state, revision,
and resume actions without requiring a supplied conversation.

`process-capture/` owns business-process documentation and recurring-task
capture. `agent-foundry/` owns AI-agent design and lifecycle. `notion/`
owns destination-specific connector work. Repository organization and Git
maintenance remain with the repository skills in `universal/`. No new
repository-management family or family rename is justified by these contracts.

Community packages preserve upstream provenance. Authored `okhp3-` packages
may overlap and evolve independently; overlap does not authorize rewriting,
retiring, or absorbing a community package. Family placement is about the job,
not authorship, host compatibility, or an assertion of maturity.

## Evidence and portability

Activity reconciliation works from supplied evidence or authorized sources.
Use the destination tool for platform operations and a dedicated application
workflow for employer disposition.

These contracts use runtime-supplied destinations, host inventories, owners,
and project paths. Named companions have explicit unavailable-skill fallbacks.
Examples and evaluation fixtures are synthetic. Packaged evaluations are
development cases exposed during authoring; a protected release holdout is
external-required. Evidence status remains separate from maturity, and each
benchmark states its exact version, execution limits, and observations.

Credible additions would cover information retention with
explicit input, output, and ownership boundaries. Add a package only after a
recurring job and a distinct output justify it.

<!-- FAMILY_SUMMARY_START -->
Portable lifecycle skills for capturing, classifying, researching, reconciling, validating, and promoting information or exploratory work with provenance and owner approval.
<!-- FAMILY_SUMMARY_END -->

## Skills (11)

<!-- FAMILY_INVENTORY_START -->
*11 skills &nbsp;·&nbsp; inventory last updated: **November 9, 2026 at 15:46 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-activity-reconciliation](okhp3-activity-reconciliation/SKILL.md) | Reconcile open follow-ups or refresh an activity log from Sent Items, inbox, calendar, and suppli... | 0.1.0 |
| [okhp3-artifact-validation](okhp3-artifact-validation/SKILL.md) | Validate a project change, draft, research packet, skill, promotion package, or handoff before it... | 0.2.0 |
| [okhp3-capture-intake](okhp3-capture-intake/SKILL.md) | Preserve one raw idea, file, link, transcript, or request in a project inbox with provenance and ... | 0.2.1 |
| [okhp3-evidence-standard](okhp3-evidence-standard/SKILL.md) | Classify consequential claims as confirmed, inferred, proposal, or unknown and keep those tiers v... | 0.2.0 |
| [okhp3-graduation-gate](okhp3-graduation-gate/SKILL.md) | Decide whether an active exploratory effort is ready to become formal, should remain active, shou... | 0.2.0 |
| [okhp3-project-promotion](okhp3-project-promotion/SKILL.md) | Prepare an exploratory effort that cleared the graduation gate for owner-approved formalization. ... | 0.2.0 |
| [okhp3-record-location-reconciliation](okhp3-record-location-reconciliation/SKILL.md) | Reconcile misplaced record folders, file versions, and references across a local library, synced ... | 0.1.0 |
| [okhp3-research-file-renewal](okhp3-research-file-renewal/SKILL.md) | Revise or renew a sourced long-form research and retrieval knowledge file while preserving its or... | 1.0.0 |
| [okhp3-source-backed-research](okhp3-source-backed-research/SKILL.md) | Produce research notes, comparisons, or recommendations with traceable sources, retrieval dates, ... | 0.2.0 |
| [okhp3-triage-and-file](okhp3-triage-and-file/SKILL.md) | Review one or more project inbox items and assign a recorded lifecycle disposition. Use for inbox... | 0.2.0 |
| [okhp3-voice-profile-renewal](okhp3-voice-profile-renewal/SKILL.md) | Create or renew an evidence-grounded voice, tone, and glossary knowledge file from an authorized ... | 1.0.0 |
<!-- FAMILY_INVENTORY_END -->
