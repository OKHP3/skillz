---
name: okhp3-mermaid-core
description: OverKill Hill P³ foundation for every Mermaid diagram task. Use when the user asks for Mermaid syntax, flowcharts, process maps, architecture sketches, relationship diagrams, or visualizing a workflow or structure. Load this skill before a domain skill to choose the audience and diagram type, apply the repository design system, name and register the artifact, and run syntax, semantic, and audience-fit gates. Route BPMN, architecture, and data-model work to their companion skills, then use the publish skill for rendering or sharing.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-mermaid-core

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Foundation for the Mermaid family. Every Mermaid task starts here, even if it ends in a domain skill.

## 1. Audience Declaration (do this first)

Before generating anything, determine the audience. If not stated, ask one question: Executive, Analyst, or Technical? See `references/audience-profiles.md` for what each implies (node count, detail level, vocabulary).

A diagram produced for the wrong audience is a design failure independent of syntax correctness.

## 2. Type Selection

Consult `references/type-selection-matrix.md`. Treat its support and disposition entries as repository guidance, not as a substitute for checking the target Mermaid renderer or current Mermaid release when a type is beta, experimental, or version-sensitive.

If the matrix routes to a domain skill (bpmn / architecture / data), load that skill's SKILL.md now for the type-specific syntax and patterns. Core handles selection and theming; domain skills handle vocabulary.

## 3. Design System

Apply OKHP3 theming per `references/design-system.md`. Every `classDef` sets `fill`, `stroke`, AND `color` — no exceptions, this is the single most common cause of dark/light-mode failures in community skills reviewed.

## 4. Naming & Registry

File naming and the `DIAGRAMS.md` registry pattern are defined in `references/naming-conventions.md`. Every diagram produced gets a registry entry. Orphaned files are a defect.

## 5. Validation — Three Gates (mandatory)

**Gate 1 — Syntax.** Render via `okhp3-mermaid-publish`'s render pipeline (mmdc). If unavailable, flag manual Mermaid Live validation explicitly.

**Gate 2 — Semantic.** Re-read the rendered output against the original request. Are all named entities present? Do arrow directions match the described causality (A causes B, not the reverse)? Do gateway/branch conditions account for everything stated? Syntax-valid output that misrepresents the process is a failure Gate 1 cannot catch.

**Gate 3 — Audience Fit.** Check against the declared profile from Step 1 (`references/audience-profiles.md`). An Executive diagram with 18 nodes and full attribute labels fails this gate even if Gates 1 and 2 pass.

All three gates pass before output is delivered.

## 6. Output & Publish

Hand off to `okhp3-mermaid-publish` for rendering and (if available) Mermaid Chart MCP publishing. Never delete a rendered artifact — the output is the deliverable, not a temporary file.

## Excluded types (do not use, with rationale)

Pie charts, XY charts, and Git graphs. See `references/type-selection-matrix.md` for the full disposition table and reasoning per type.

## Output contract

Before delivery, report the declared audience, selected diagram type, validation status for each gate, output path or fenced block, and any renderer or semantic caveat. If a gate cannot be run locally, label it `not_run` and give the exact manual validation needed.

## References

- `references/audience-profiles.md` - audience tiers and detail limits.
- `references/type-selection-matrix.md` - repository routing and exclusions.
- `references/design-system.md` - palette and class styling rules.
- `references/naming-conventions.md` - filenames and registry entries.
- `references/diagram-output-contract.md` - required output metadata.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
