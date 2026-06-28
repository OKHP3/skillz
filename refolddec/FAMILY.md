---
family: refolddec
skill_count: 1
generated_by: okhp3-skill-cataloger v1.4.0
generated_at: 2026-06-28T15:47:52Z
---

# refolddec

Agent Skills for ReFolDec operations — recursive folding, unfolding, and refolding across representation types.

---

## What ReFolDec Names

ReFolDec is the transformation theory underlying the OKHP³ Visual Language Stack.

Three operations:

**Fold** — compress a complex artifact into a more abstract or compact form.
An idea becomes a diagram. A process narrative becomes a SKILL.md. A set of observations becomes a taxonomy.

**Unfold** — expand an abstract artifact into its constituent primitives.
A diagram becomes a process narrative. A SKILL.md becomes a step-by-step procedure. A taxonomy becomes a flat list of items.

**Refold** — re-express an artifact in a different representation type without losing semantic content.
A diagram becomes documentation. Documentation becomes a SKILL.md. A SKILL.md becomes a structured prompt. A process becomes a diagram.

The theory names the operations. `skillz` packages them as executable agent contracts.

---

## Relationship to the Rest of skillz

| Family | ReFolDec relationship |
|---|---|
| `mermaid/` | Executes fold and refold operations in the visual domain (process → diagram, diagram → embedded doc) |
| `process-capture/` | Executes fold operations in the process domain (recurring task → skill skeleton) |
| `refolddec/` | Native ReFolDec skills — transformation-aware, not domain-specific |

The `refolddec/` family handles transformations where the representation type is the subject, not just a means to an end.

---

## Semantic Loss Tracking

Any transformation loses something. Folding a 15-step process narrative into a 6-node diagram loses exception handling detail. Unfolding a SKILL.md into a procedure loses the triggering heuristics.

ReFolDec-aware skills track semantic loss explicitly:

- State what the source representation contains that the target does not
- Flag high-loss transformations before committing
- Produce a loss note when the transformation is lossy by design

---

## Lineage

The process-capture work that became `okhp3-process-capture` is a fold operation: recurring task → SKILL.md skeleton.

PathScrib-R and Flowpilot Scribbler (earlier process-capture agent lineage) executed fold operations informally before the SKILL.md format existed. They are the ancestry of both `process-capture/` and the ReFolDec framework. See `process-capture/README.md` for the lineage note.

---

## Skills in This Family

| Skill | Status | What it does |
|---|---|---|
| `okhp3-refolddec-core` | Skeleton (Level 1) | Core transformation logic: fold, unfold, refold, semantic loss tracking |

Deeper sub-skills (fold-to-diagram, unfold-to-primitives, refold-to-skill, cross-representation compare) are in `docs/BACKLOG.md` pending pattern confirmation.

---

## Status

This family is new. `okhp3-refolddec-core` is a Level 1 skeleton.

Promote individual operations to their own skills once the pattern for each has been observed and confirmed in recurring use — not before.

<!-- FAMILY_SUMMARY_START -->
Agent Skills for ReFolDec operations — recursive folding, unfolding, and refolding across representation types.
<!-- FAMILY_SUMMARY_END -->

## Skills (1)

<!-- FAMILY_INVENTORY_START -->
*1 skill &nbsp;·&nbsp; inventory last updated: **June 28, 2026 at 15:47 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-refolddec-core](okhp3-refolddec-core/SKILL.md) | Core ReFolDec transformation skill. Use when the task is explicitly about transforming an artifac... | — |
<!-- FAMILY_INVENTORY_END -->
