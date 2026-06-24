---
family: mermaid
skill_count: 9
generated_by: okhp3-skill-cataloger v1.4.0
generated_at: 2026-06-24T04:12:36Z
---

# mermaid

Nine skills. One foundation, four domain skills, one publish layer, one update skill, one repair skill, one governance layer.

`okhp3-mermaid-core` loads first on every Mermaid task. It owns audience declaration, type selection, the OKHP3 design system, naming/registry, and the three validation gates. The domain skills (`bpmn`, `architecture`, `data`) are vocabulary and pattern libraries that core routes into. `publish` handles render and MCP output. `update` applies changes to existing diagrams while preserving style. `repair` fixes broken syntax with minimum intervention. `governance` declares and enforces the visual and behavioral standard across a diagram project.

See repo-root `AGENTS.md` for trigger conditions.

---

## Design Position

The OKHP3 Mermaid family occupies a space no community skill touches: **enterprise process intelligence delivered as precision diagramming infrastructure.**

Positioning statement: **Process Clarity as a Professional Discipline.**

Not "make diagrams." Not "visualize architecture." Define, document, and communicate business processes with the rigor of a structured methodology and the aesthetics of intentional visual design.

---

## Guiding Principles

**P1 — Precision over breadth.**
This family does fewer things better, not more things tolerably. It covers BPMN-informed process modeling. It does not try to be a universal diagram generator.

**P2 — Sovereignty first.**
No diagram source leaves the local environment without explicit user authorization. No Kroki. No public API fallbacks without a consent prompt. Diagram content may be proprietary.

**P3 — Audience-first output.**
Every diagram begins with an audience declaration. Executive output is not the same as analyst output. The skill enforces this distinction, not the user.

**P4 — Coherent families over orphaned files.**
Diagrams are not files. They are members of a family. Every output establishes its relationship to the broader diagram set it belongs to.

**P5 — MCP-aware by default.**
The Mermaid Chart MCP is the publish layer. The skill pipeline produces source. The MCP integration publishes it. Two distinct phases — both first-class.

**P6 — Semantic validation, not just syntax validation.**
The validation loop checks correctness of representation, not just parseability of syntax. A diagram that renders but lies is a failure.

---

## Why Not Community Skills

Reviewed against the four most prominent community Mermaid skills (mgranberry, WH-2099, softaworks, Agents365). Seven cross-cutting gaps appear in every skill reviewed:

**1. BPMN is completely absent.**
Not one community skill addresses BPMN semantics. Swim lanes, event types, gateway types, task types, subprocesses — none of this vocabulary exists in any community skill payload reviewed. The entire enterprise process modeling discipline is unserved. `okhp3-mermaid-bpmn` fills this.

**2. No multi-diagram coherence model.**
Every community skill assumes one diagram at a time. None address naming conventions across a diagram family, cross-references between diagrams, or version alignment. `okhp3-mermaid-governance` and the `DIAGRAMS.md` registry pattern fill this.

**3. No audience-adaptive output.**
The diagram produced for a VP is the same one produced for a developer. No community skill has an audience selection step. This is a workflow failure, not just a quality failure. `okhp3-mermaid-core`'s audience declaration fills this.

**4. No MCP integration layer.**
The Mermaid Chart MCP exists and can save diagrams and generate shareable links. Not one community skill is aware of this. The render pipeline terminates at a local PNG. `okhp3-mermaid-publish` fills this.

**5. The validation loop is syntax-only.**
Community skills check: "Does this parse?" None check: "Does this correctly represent what the user described?" Syntax-valid output that misrepresents the process is a failure Gate 1 cannot catch. `okhp3-mermaid-core`'s three-gate validation fills this.

**6. No governance or naming convention system.**
No community skill provides a file naming convention, a diagram registry pattern, or guidance on organizing a growing library of diagrams. Every output is an orphaned file. `okhp3-mermaid-governance` and `okhp3-mermaid-core/references/naming-conventions.md` fill this.

**7. All are developer-centric in assumption and vocabulary.**
Community skills were authored by developers for developers diagramming software systems. Enterprise process work — HR onboarding, procurement flows, approval chains, governance workflows — is systematically outside the design envelope of every skill reviewed.

---

## Competitive Position

| Capability | mgranberry | WH-2099 | softaworks | Agents365 | OKHP3 |
|---|---|---|---|---|---|
| Design methodology | Yes (dev-centric) | No | No | No | **Yes (process-centric)** |
| BPMN semantics | No | No | No | No | **Yes** |
| Swim lanes | No | No | No | No | **Yes** |
| Audience adaptation | No | No | No | No | **Yes** |
| Multi-diagram coherence | No | No | No | No | **Yes** |
| Governance profile system | No | No | No | No | **Yes** |
| MCP integration | No | No | No | No | **Yes** |
| Semantic validation | No | No | No | No | **Yes** |
| Naming conventions | No | No | No | No | **Yes** |
| Diagram registry | No | No | No | No | **Yes** |
| Privacy-safe rendering | Partial | Yes | Yes | No (Kroki) | **Yes** |
| Multi-format output | No | No | No | Yes | **Yes** |
| Docs auto-sync | No | Yes | No | No | Planned |
| Plugin-ready | No | No | No | Yes | Planned |

---

## Governance Model

A governance profile is not a theme. A theme controls colors. A governance profile controls behavior.

It is a reusable bundle that declares the complete visual and behavioral contract for a diagram project:

| Component | What it defines |
|---|---|
| Palette | Named palette from the OKHP3 system, applied via `%%{init}%%` |
| Renderer targets | Which output formats the profile is validated against |
| Semantic class library | `classDef` names mapped to roles (process step, decision point, external system, data store) — not to colors alone |
| Output contract | Audience tiers in scope, excluded diagram types, provenance status (public/private) |
| Update behavior | How to apply changes while preserving the profile (see `okhp3-mermaid-update`) |
| Repair behavior | How to fix syntax with minimum intervention, style layer untouched (see `okhp3-mermaid-repair`) |

A governance profile makes style a first-class contract: the same semantic class always gets the same visual treatment; updates preserve the original profile; repair operations target only syntax; multiple diagrams produced across a project are visually coherent without per-diagram style negotiation.

The `%%{init}%%` values and classDef recipes come from [Mermaid Theme Builder](https://github.com/OKHP3/mermaid-theme-builder) — the visual-governance layer in the OKHP³ Visual Language Stack. The governance profile pattern is the abstraction above a specific palette: it defines what a palette must contain and how it must behave when applied across a project.

The skill that implements this: `okhp3-mermaid-governance` — declare a project standard, check conformance of individual diagrams, audit a set for drift.

---

## Diagram Output Contract

All skills in this family follow the shared output rules in `okhp3-mermaid-core/references/diagram-output-contract.md`:

- One Mermaid block per response
- No stray prose inside the fenced block
- Stable short IDs; quoted labels with spaces or special characters
- No semicolons; no `end` as a node ID
- No HTML unless the renderer explicitly supports it
- No invented classDef names
- Every classDef sets `fill`, `stroke`, AND `color`
- Preserve existing style on update; repair minimally
- Never delete rendered output

---

## Skill Map

| Skill | Role | Loads after |
|---|---|---|
| `okhp3-mermaid-core` | Foundation — always first | (entry point) |
| `okhp3-mermaid-bpmn` | BPMN process vocabulary | core |
| `okhp3-mermaid-architecture` | C4, solution arch, infra | core |
| `okhp3-mermaid-data` | ERD, class diagrams, schema | core |
| `okhp3-mermaid-publish` | Render, MCP publish, output formats | core |
| `okhp3-mermaid-update` | Style-preserving content changes to existing diagrams | core |
| `okhp3-mermaid-repair` | Minimum syntax repair on broken diagrams | core |
| `okhp3-mermaid-theme-builder` | Palette application, renderer profiling, `%%{init}%%` generation | core |
| `okhp3-mermaid-governance` | Declare a project diagram standard (GOVERNANCE.md), check conformance, audit cross-diagram coherence | core |

<!-- FAMILY_SUMMARY_START -->
Nine skills. One foundation, four domain skills, one publish layer, one update skill, one repair skill, one governance layer.
<!-- FAMILY_SUMMARY_END -->

## Skills (9)

<!-- FAMILY_INVENTORY_START -->
*9 skills &nbsp;·&nbsp; inventory last updated: **June 24, 2026 at 04:12 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-mermaid-architecture](okhp3-mermaid-architecture/SKILL.md) | System and solution architecture diagrams in Mermaid for technical audiences — C4 model (Context/... | — |
| [okhp3-mermaid-bpmn](okhp3-mermaid-bpmn/SKILL.md) | BPMN-informed business process modeling in Mermaid. Use whenever the user wants to diagram a busi... | — |
| [okhp3-mermaid-core](okhp3-mermaid-core/SKILL.md) | Foundation skill for ALL Mermaid diagram work. Load this first for any task involving Mermaid syn... | — |
| [okhp3-mermaid-data](okhp3-mermaid-data/SKILL.md) | Data model and relationship diagrams in Mermaid — entity-relationship (ER) diagrams, class diagra... | — |
| [okhp3-mermaid-governance](okhp3-mermaid-governance/SKILL.md) | Governance profile management for Mermaid diagram projects. Use when the user wants to establish ... | — |
| [okhp3-mermaid-publish](okhp3-mermaid-publish/SKILL.md) | Rendering, exporting, and publishing finished Mermaid diagrams. Use after a diagram has passed ok... | — |
| [okhp3-mermaid-repair](okhp3-mermaid-repair/SKILL.md) | Syntax repair for broken Mermaid diagrams. Use when a .mmd file or fenced Mermaid block fails to ... | — |
| [okhp3-mermaid-theme-builder](okhp3-mermaid-theme-builder/SKILL.md) | Apply reusable color palettes and visual governance to Mermaid diagram code. Use this skill when ... | — |
| [okhp3-mermaid-update](okhp3-mermaid-update/SKILL.md) | Style-preserving update of an existing Mermaid diagram. Use when the user provides an existing .m... | — |
<!-- FAMILY_INVENTORY_END -->
