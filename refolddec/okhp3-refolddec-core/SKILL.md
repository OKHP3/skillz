---
name: okhp3-refolddec-core
description: Core ReFolDec transformation skill. Use when the task is explicitly about transforming an artifact from one representation type to another — folding an idea or process into a compact form, unfolding an artifact into its primitives, or refolding across representation types (diagram to documentation, documentation to SKILL.md, SKILL.md to procedure). Also use when semantic loss across a transformation needs to be tracked or compared. This is not a general writing or diagramming skill — it is a representation-change skill. Load domain skills (okhp3-mermaid-core, okhp3-process-capture) alongside this skill when the transformation target is a diagram or a skill skeleton.
---

# OKHP3 ReFolDec Core

Transformation-aware execution for fold, unfold, and refold operations across representation types.

## 1. Identify the Transformation

Before executing, name the operation clearly:

**Fold** — the source is a complex artifact; the target is a more abstract or compact form.
Examples: process narrative → SKILL.md, set of observations → taxonomy, long document → diagram.

**Unfold** — the source is a compact or abstract artifact; the target exposes its constituent parts.
Examples: SKILL.md → step-by-step procedure, diagram → process narrative, taxonomy → flat item list.

**Refold** — the source and target are in different representation types; semantic content is preserved across the change.
Examples: diagram → documentation, documentation → SKILL.md, SKILL.md → structured prompt, process → diagram.

State the transformation type explicitly before proceeding. "I am refolding [source type] into [target type]."

## 2. Inventory the Source

Before transforming, inventory what the source artifact contains:

- **Entities** — what things are named or described
- **Relationships** — how those things connect, depend on, or act on each other
- **Conditions** — decision points, exceptions, and branching logic
- **Constraints** — rules, limits, and boundaries that must be preserved
- **Audience-specific content** — material that is calibrated for a specific reader and must be recalibrated for the target form

This inventory is the fidelity baseline. Semantic loss is measured against it.

## 3. Track Semantic Loss

Every transformation loses something. Name the losses before committing.

For each inventory item, assess: does the target representation support this? If not, it is a loss.

**Low-loss transformations:** The target representation can hold all inventory items with no change in meaning.

**Medium-loss transformations:** The target omits some inventory items by design (e.g., a 6-node Executive diagram cannot hold 15-step exception logic). State what was dropped and why.

**High-loss transformations:** The target representation fundamentally cannot hold key semantic content (e.g., refolding a richly conditioned BPMN diagram into a plain paragraph). Flag before proceeding — the user may prefer a different target form.

Do not proceed through a high-loss transformation without flagging it.

## 4. Execute the Transformation

Apply the appropriate domain skill for the target form:

- **Target is a diagram** → load `okhp3-mermaid-core`, route to the appropriate domain skill (bpmn, architecture, data)
- **Target is a SKILL.md skeleton** → follow `okhp3-process-capture` skeleton production steps
- **Target is documentation (prose, structured markdown)** → apply the target's audience and format conventions; no external skill required

The transformation produces a complete artifact in the target form. It is not a bridge document, a "here's what I'd do," or a hybrid.

## 5. Produce the Loss Note

If the transformation was medium- or high-loss, produce a brief loss note after the artifact:

> **Semantic loss note:** [What was present in the source that is not present in the target. Why. What to do if the dropped content is needed.]

This is not an apology or a caveat. It is a handoff artifact. The user knows what was preserved and what was not.

## 6. Cross-Representation Compare (optional)

When the user needs to evaluate two representations of the same content — e.g., "does this diagram fully represent this process?" or "how much was lost when we converted this to a skill?" — execute a structured compare:

1. Inventory the source (Step 2 above)
2. Inventory the target
3. For each inventory item in the source: present in target (full / partial / absent)
4. For each inventory item in the target: has a source equivalent (yes / no — flagging anything the target added that wasn't in the source)
5. Summarize: net semantic loss, net semantic gain, fidelity score (high / medium / low)

## What this skill does not do

- Does not author diagrams from scratch — route to `okhp3-mermaid-core`
- Does not author SKILL.md files from scratch — route to `okhp3-process-capture`
- Does not edit existing diagrams for content changes — route to `okhp3-mermaid-update`
- Does not repair broken syntax — route to `okhp3-mermaid-repair`
- Does not produce generalist summaries or rewrites — the transformation must be named and the source/target types must be distinct
