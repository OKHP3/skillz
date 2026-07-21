---
name: okhp3-mermaid-governance
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
description: Governance profile management for Mermaid diagram projects. Use when the user wants to establish a visual and behavioral standard for a diagram project ("set up our diagram style guide", "create a governance profile for this project", "what palette and rules should we use for all our diagrams"), when they want to check whether an existing diagram conforms to a declared profile ("does this diagram follow our standard?", "check this against the governance profile", "is this still on-brand?"), or when they want to audit multiple diagrams for cross-project coherence ("audit all my BPMN diagrams", "are these 12 diagrams consistent?", "which diagrams have drifted from our style?"). Also triggers when the user references a GOVERNANCE.md file, mentions profile drift, asks about cross-diagram consistency, or says a diagram "doesn't match the others." Load okhp3-mermaid-core first. For applying a specific palette to a single new diagram without a declared project standard, use okhp3-mermaid-theme-builder directly instead.
---

# okhp3-mermaid-governance

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Cross-diagram standard management for Mermaid diagram projects. A governance profile is not a theme — a theme controls colors, a governance profile controls behavior. It declares the complete visual and behavioral contract for a diagram project and checks that diagrams produced over time honor it.

Full concept, design rationale, and competitive position: `mermaid/README.md`.

---

## Three Operating Modes

Determine which mode applies before proceeding.

**Declare** — No GOVERNANCE.md exists yet (or the user wants to establish one). Set up the standard from scratch. Output: a `GOVERNANCE.md` file.

**Check** — A GOVERNANCE.md exists and the user has a single diagram to verify. Output: a conformance report (pass / partial / fail per element) with specific remediation steps.

**Audit** — A GOVERNANCE.md exists and the user has multiple diagrams to assess. Output: a cross-diagram coherence summary with a prioritized remediation list.

If the user has not indicated mode, ask one question: "Do you have an existing GOVERNANCE.md for this project, or are we setting one up from scratch?"

---

## Mode 1: Declare a Governance Profile

### Step 1 — Select palette

Ask the user which of the seven OKHP3 palettes best fits the project's context and audience. If unsure, use the selection guide below. For the full `%%{init}%%` values, load `okhp3-mermaid-theme-builder` — palette application is its responsibility, not this skill's.

| Palette | Best for |
|---|---|
| `overkill-hill` | Technical, architecture, AI tooling, executive decks |
| `askjamie` | Support flows, helpdesk, user guidance, friendly AI |
| `glee-fully` | Personal productivity, family-facing, consumer-facing |
| `ocean-depth` | Technical docs, clean professional diagrams |
| `forest-sage` | Process flows, calm/approachable content |
| `slate-ember` | Architecture, high-contrast, dark-mode primary |
| `violet-mist` | Product, UX, creative flows |

### Step 2 — Declare renderer target(s)

Which renderer(s) must this project's diagrams work in? Renderer constraints propagate to every diagram produced under this profile. Common choices:

- **Mermaid Live + CLI** — full feature support; safe default for internal projects
- **GitHub** — full init/themeVars support; no custom fonts (CSP); no Hand-Drawn look
- **Notion** — partial themeVars only; pinned to Mermaid 10.x; no Neo/Hand-Drawn
- **Confluence** — high risk; partial init; validate every diagram before publishing

Multiple targets are allowed but note the lowest common denominator applies. See `okhp3-mermaid-theme-builder/references/renderer-profiles.md` for full constraints.

### Step 3 — Build the semantic class library

A governance profile's semantic class library maps `classDef` names to roles, not colors. The colors come from the palette; the roles define meaning.

For each diagram type in scope, define the class names and their semantic meaning. Common starting library for process/BPMN work:

| Class name | Semantic role |
|---|---|
| `process` | A work step — human or automated task |
| `decision` | A gateway — branching or merging logic |
| `external` | A system, actor, or entity outside the swim lane boundary |
| `dataStore` | A persistent store — database, file, registry |
| `event` | A trigger or terminal event (start, end, timer, message) |
| `annotation` | Supplementary context that is not part of the process flow |

Confirm the class library with the user before proceeding. Unused classes in scope are fine — undefined classes assigned to nodes are a conformance violation.

### Step 4 — Declare the output contract

Four fields:

**Audience tiers in scope.** Which tiers (Executive / Analyst / Technical) are diagrams in this project expected to serve? Different tiers have different density limits — see `okhp3-mermaid-core/references/audience-profiles.md`.

**Diagram types excluded.** List any Mermaid diagram types that are out of scope for this project (with rationale). Example: "No pie charts — insufficient structural argument capability."

**Provenance status.** Public or Private. Public means diagrams may be shared in external artifacts, blog posts, or public repos. Private means diagrams contain proprietary process detail and must not appear in public-facing content. Mixed projects should default to Private.

**Registry.** Confirm the project uses a `DIAGRAMS.md` registry (per `okhp3-mermaid-core/references/naming-conventions.md`). If not yet created, note this as a setup action.

### Step 5 — Produce GOVERNANCE.md

Use the template in `references/profile-template.md`. Fill in all fields from Steps 1–4. The resulting file should be committed at the project root (or alongside the diagram files if they live in a subdirectory).

---

## Mode 2: Check a Single Diagram

Load the GOVERNANCE.md. If none is available, ask the user to share the declared standard or switch to Declare mode first.

Take the full `.mmd` source as input.

Run the conformance checklist in `references/conformance-checklist.md` against the diagram. For each item, grade: **Pass**, **Partial**, or **Fail**.

Produce a conformance report in this format:

```
## Conformance Report — [diagram filename or title]
**Profile:** [palette name] / [renderer target(s)]
**Date checked:** [today]

| Element | Status | Finding |
|---|---|---|
| init block — palette match | Pass / Partial / Fail | [specific finding] |
| init block — renderer safety | Pass / Partial / Fail | [specific finding] |
| classDef declarations | Pass / Partial / Fail | [specific finding] |
| class assignments — coverage | Pass / Partial / Fail | [specific finding] |
| class assignments — semantic accuracy | Pass / Partial / Fail | [specific finding] |
| audience fit | Pass / Partial / Fail | [specific finding] |
| provenance safety | Pass / Partial / Fail | [specific finding] |
| naming convention | Pass / Partial / Fail | [specific finding] |

**Overall:** [Compliant / Partially compliant (N items) / Non-compliant (N items)]

**Remediation steps:**
1. [Most impactful fix first]
2. ...
```

For Partial or Fail items, route remediation appropriately:
- Palette or `%%{init}%%` drift → `okhp3-mermaid-theme-builder` (Format E — extract and re-theme)
- classDef or class assignment issues → `okhp3-mermaid-update` (targeted update to style layer only)
- Semantic accuracy issues → `okhp3-mermaid-update` (content change)
- Syntax failures that block rendering → `okhp3-mermaid-repair` first, then re-check

---

## Mode 3: Audit a Set of Diagrams

Load the GOVERNANCE.md. Receive all `.mmd` sources (or file paths) in scope.

Run Mode 2 (Check) on each diagram individually. Then produce a cross-diagram coherence summary:

```
## Governance Audit — [project name or date]
**Profile:** [palette name] / [renderer target(s)]
**Diagrams audited:** N

### Compliance Summary

| Diagram | Overall | Critical issues |
|---|---|---|
| [filename] | Compliant | — |
| [filename] | Partial (2) | classDef drift, audience fit |
| [filename] | Non-compliant (4) | Wrong palette, missing classDef, ... |

### Cross-Diagram Coherence Findings

[Patterns that appear across multiple diagrams — e.g., "5 of 8 diagrams use inconsistent classDef names for decision nodes" or "3 diagrams were rendered before the palette was locked and still carry the old init block"]

### Priority Remediation List

1. [Diagram with most critical failures or most visible user-facing impact — fix first]
2. ...

### Diagrams with no action required
- [filename] — fully compliant
```

For large audits (10+ diagrams), group by severity (Critical / Partial / Clean) before listing individually.

---

## Integration with Other Skills

This skill is the standards layer. The other skills execute within the standard it defines.

| When you need to... | Route to... |
|---|---|
| Apply a palette to a diagram | `okhp3-mermaid-theme-builder` |
| Produce a new diagram | `okhp3-mermaid-core` + domain skill |
| Update diagram content | `okhp3-mermaid-update` |
| Fix broken syntax | `okhp3-mermaid-repair` |
| Publish / render output | `okhp3-mermaid-publish` |

`okhp3-mermaid-update` and `okhp3-mermaid-repair` both explicitly preserve governance profile elements (init block, classDef, class assignments). This skill defines what those elements should contain — the other skills ensure they are not damaged during operations.

---

## Provenance and Privacy

The governance profile structure is public OKHP3 IP.

Any specific profile developed for an employer or private client — palette hex overrides, custom semantic class names, employer-specific diagram examples — is private. Do not include private profile details in any public-facing artifact, committed skill, or shared diagram.

See `docs/SECURITY.md`.

---

## What This Skill Does Not Do

- Does not apply palette values or generate `%%{init}%%` blocks — that is `okhp3-mermaid-theme-builder`'s responsibility
- Does not generate diagram content — route to `okhp3-mermaid-core` and domain skills
- Does not repair syntax — route to `okhp3-mermaid-repair`
- Does not make content changes to diagrams — route to `okhp3-mermaid-update`
- Does not manage the DIAGRAMS.md registry directly — that is maintained per `okhp3-mermaid-core/references/naming-conventions.md`

---

## References

- `references/profile-template.md` — GOVERNANCE.md template (fill in during Declare mode)
- `references/conformance-checklist.md` — Detailed checklist for Check and Audit modes
- `mermaid/README.md` — Concept rationale, design position, guiding principles, and competitive position for the full Mermaid family
- `okhp3-mermaid-core/references/audience-profiles.md` — Audience tier definitions and density limits
- `okhp3-mermaid-core/references/naming-conventions.md` — File naming and DIAGRAMS.md registry schema
- `okhp3-mermaid-theme-builder/references/renderer-profiles.md` — Full renderer constraint matrix

## Output contract

Declare, check, and audit modes must return the profile path or proposed profile, the diagrams inspected, each failed rule with evidence, and a disposition of `pass`, `pass_with_exceptions`, or `needs_revision`. Never overwrite a profile or bulk-edit diagrams without explicit user authorization.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
