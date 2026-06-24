# Governance Profile Concept

A governance profile is a reusable bundle that controls how diagrams are generated, styled, updated, and repaired within a defined context.

It is not a theme. A theme controls colors. A governance profile controls behavior.

---

## What a Governance Profile Contains

| Component | What it defines |
|---|---|
| Palette tokens | Named color values (`--primary`, `--accent`, `--neutral`, `--warning`) mapped to semantic roles, not arbitrary values |
| Semantic classes | `classDef` bundles tied to meaning (process step, decision point, external system, data store) — not tied to appearance alone |
| Renderer targets | Which output formats the profile is validated against (Mermaid Live, mmdc PNG, mmdc SVG, Mermaid Chart MCP) |
| Prompt/output rules | What the agent must and must not produce when this profile is active (see also: `diagram-output-contract.md`) |
| Update behavior | How to apply changes to an existing diagram while preserving the profile's style (see: `okhp3-mermaid-update`) |
| Repair behavior | How to fix syntax without touching style — minimum intervention, preserve classDef and init config (see: `okhp3-mermaid-repair`) |
| Provenance status | Public or private. Determines whether the profile can be referenced in shared artifacts |

---

## Why This Matters

Community Mermaid skills produce diagrams with arbitrary styles that drift between sessions.

A governance profile makes style a first-class contract:

- The same semantic class (approval gateway) always gets the same visual treatment
- Updates to existing diagrams preserve the original profile instead of resetting to defaults
- Repair operations target only syntax, leaving the style layer untouched
- Multiple diagrams produced across a project are visually coherent without per-diagram style negotiation

---

## Relationship to Mermaid Theme Builder

Mermaid Theme Builder (OKHP3/mermaid-theme-builder) is the governance profile source for the OKHP³ Visual Language Stack.

It publishes four palettes (Ocean Depth, Forest Sage, Slate Ember, Violet Mist) as `classDef` recipes.

`okhp3-mermaid-core` pulls these recipes as its design system. The governance profile pattern is the abstraction above a specific palette — it defines what a palette must contain and how it must behave when applied.

---

## Governance Profile as a Skill

The governance profile concept has been promoted to a full skill: `okhp3-mermaid-governance` at `mermaid/okhp3-mermaid-governance/SKILL.md`.

The skill operates in three modes:

- **Declare** — sets up a GOVERNANCE.md for a diagram project (palette, renderer targets, semantic class library, output contract)
- **Check** — conformance-checks a single diagram against a declared profile (8-item checklist, per-element pass/partial/fail)
- **Audit** — cross-diagram coherence check across a set of diagrams with a prioritized remediation list

The update and repair operations referenced in earlier versions of this document remain in:
- `mermaid/okhp3-mermaid-update/SKILL.md` — style-preserving content changes
- `mermaid/okhp3-mermaid-repair/SKILL.md` — minimum syntax repair

Both skills already preserve governance profile elements (init block, classDef, class assignments). The governance skill defines what those elements should contain and checks that they remain correct over time.

---

## Public / Private Provenance

The concept of a governance profile is public.

Any specific profile developed for an employer or private client is private. Do not include palette hex values, semantic class names, or diagram examples from private contexts in any skill or public-facing document.

See `SECURITY.md`.
