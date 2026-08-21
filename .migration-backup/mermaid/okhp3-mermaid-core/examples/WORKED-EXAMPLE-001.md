# Worked Example 001 — Skill Maturity Lifecycle Flowchart

**Date:** 2026-08-05  
**Skill version:** 0.2.0  
**Completed by:** Replit Agent (okhp3-mermaid-core workflow)  
**Diagram file:** `skill-maturity-lifecycle-analyst-v1.mmd`

---

## Task

Produce an analyst-audience flowchart documenting the `OKHP3/skillz` skill maturity lifecycle: the five maturity gates (skeleton → draftable → usable → validated → published), their promotion criteria, and the feedback loops that apply when a gate is not yet met.

This is a genuine operational need for the `OKHP3/skillz` repository — the maturity model drives promotion decisions recorded in `docs/CHANGELOG.md` and `docs/PUBLISHING.md`, and a diagram gives new contributors and reviewing agents an at-a-glance reference that prose tables cannot.

---

## Workflow execution (per okhp3-mermaid-core)

### Step 1 — Audience Declaration

**Declared audience:** Analyst

Rationale: the primary consumers of this diagram are contributors and agents who need to trace the full lifecycle with gate conditions, not executives seeing a summary, and not engineers needing implementation internals. Analyst profile allows 10–20 nodes, gateway labels, and role-oriented vocabulary.

### Step 2 — Type Selection

**Selected type:** `flowchart TD` (top-down flowchart)

The maturity lifecycle is a directed acyclic progression with feedback loops at each gate — a flowchart maps this directly. No domain skill route needed (no BPMN swim lanes, no C4 architecture, no ER data model). Core handles this type.

Consulted: `references/type-selection-matrix.md` — flowchart is core-handled; no domain skill routing required.

### Step 3 — Design System

Applied OKHP3 theming via `classDef`. Three semantic roles:

| Role | Hex fill | Stroke | Color (text) | Applied to |
|---|---|---|---|---|
| `maturity` | `#5b21b6` | `#ddd6fe` | `#fff` | Skel, Draft, Use, Valid, Pub |
| `gate` | `#1e3a5f` | `#93c5fd` | `#e0f2fe` | C, D, E, F |
| `action` | `#064e3b` | `#6ee7b7` | `#d1fae5` | Imp, Run, Ev, Rel |
| `start` | `#374151` | `#9ca3af` | `#f9fafb` | Start |

Every `classDef` sets `fill`, `stroke`, AND `color` — per the design system's non-negotiable rule.

Palette selected: Violet Mist (purple anchor) for maturity states, Ocean Depth (dark blue) for decision gates, Forest Sage (dark green) for action/fix steps, neutral Slate for the entry node.

### Step 4 — Naming & Registry

**Filename:** `skill-maturity-lifecycle-analyst-v1.mmd`

Pattern: `[domain]-[process]-[view]-[audience]-v[version].mmd`

- domain: `skill`
- process: `maturity-lifecycle`
- view: (omitted — single-view diagram)
- audience: `analyst`
- version: `v1`

**Registry entry** (for the consuming project's `DIAGRAMS.md`):

| ID | Filename | Audience | Family | Related | Status | MC Link | Updated |
|---|---|---|---|---|---|---|---|
| SKILLZ-001 | skill-maturity-lifecycle-analyst-v1.mmd | analyst | core | — | validated | — | 2026-08-05 |

### Step 5 — Validation (Three Gates)

**Gate 1 — Syntax**

Validated with `mmdc` (mermaid-cli v11.16.0):

```
npx @mermaid-js/mermaid-cli -i skill-maturity-lifecycle-analyst-v1.mmd -o skill-maturity-lifecycle-analyst-v1.svg
```

Exit code: **0** (clean render, no parse errors).

**Gate 2 — Semantic**

Re-read rendered output against request:
- All five maturity levels present: ✅
- All four decision gates present with correct promotion criteria: ✅  
- Feedback loops correct: each gate's "No" path loops back through a fix step before re-checking the same gate: ✅
- Arrow directions: advancement flows downward; feedback loops return upward: ✅
- No entities fabricated or omitted: ✅

**Gate 3 — Audience Fit**

Node count: 14 nodes (within analyst 10–20 limit): ✅  
Detail level: gateway labels, condition labels on all branches: ✅  
Vocabulary: maturity model terminology, role-appropriate (not executive summary, not implementation detail): ✅

**All three gates passed.**

---

## Output

See `skill-maturity-lifecycle-analyst-v1.mmd` in this directory.

---

## Known limitations / follow-on work

- The OKHP3 design-system palette hex values are documented in the design-system reference as a TODO — the values used here (`#5b21b6`, `#1e3a5f`, `#064e3b`, `#374151`) are hand-picked from the named palettes but are not sourced from `mermaid-theme-builder/lib/`. A Phase 1 task in the design-system reference should extract and canonicalize them.
- This diagram does not yet have a `okhp3-mermaid-publish` render step because a Mermaid Chart MCP share link requires a live Mermaid Chart account — flagged explicitly per the execution contract.
- A companion `exec` audience version (5–7 nodes, no gate detail) would be a natural next output for the same topic.
