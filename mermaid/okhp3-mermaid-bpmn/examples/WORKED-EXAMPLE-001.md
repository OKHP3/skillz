# Worked Example 001 — Skill Promotion Review Process (BPMN)

**Date:** 2026-08-06
**Skill version:** 0.2.0
**Completed by:** Replit Agent (`okhp3-mermaid-core` + `okhp3-mermaid-bpmn` workflow)
**Diagram file:** `references/process-examples/skill-promotion-review-analyst-v1.mmd`

---

## Task

Diagram the `OKHP3/skillz` repository's own skill-promotion review process — the sequence
by which an Author drafts a skill, a Reviewer checks it against the `docs/PUBLISHING.md`
maturity gate, and (on approval) a Cataloger regenerates the Forge catalog — as a
cross-lane BPMN-flavored process with an explicit gateway and feedback loop.

This is a genuine operational process for this repository: it is the review loop this
skill family's own promotion work goes through, and it gives contributors a reference
for how the maturity gate is applied in practice, distinct from `okhp3-mermaid-core`'s
existing worked example (the five-level maturity *lifecycle*, not the per-skill
*review* handoff modeled here).

---

## Workflow execution

### Step 0 — Loaded `okhp3-mermaid-core` first

Per the family contract, `okhp3-mermaid-core` was loaded first for audience declaration,
type selection, and design-system theming before applying BPMN-specific vocabulary.

### Step 1 — Audience Declaration (core)

**Declared audience:** Analyst

Rationale: the diagram needs to show lane ownership (who does what), the gateway
condition, and the feedback loop — more detail than an Executive summary, but without
implementation internals a Technical audience would expect. Per
`references/audience-profiles.md`, Analyst requires 10–20 nodes with labeled branches.

### Step 2 — Type Selection (core)

**Selected type:** `flowchart TD` with `subgraph` lanes (Mermaid has no native BPMN pool/lane
type, so — per `okhp3-mermaid-core` routing to this skill — swim lanes are encoded as
`subgraph` blocks per `references/swimlane-layouts.md`'s "one subgraph per lane" rule).

### Step 3 — BPMN element selection (this skill)

| BPMN concept | Mermaid encoding | Applied to |
|---|---|---|
| Start event | Stadium node `(["..."])`, `startevent` class | "Skill drafted" |
| End event | Double-circle-style node `((...))`, `endevent` class | "Promoted to usable", "Returned to author" |
| User task | Rectangle `["..."]`, `usertask` class | "Draft SKILL.md and references", "Produce worked example", "Check worked example against PUBLISHING.md gate", "Record rejection reason" |
| Send task | Rectangle `["..."]`, dashed-stroke `sendtask` class | "Send worked example for review" — a message-sending handoff from Author to Reviewer |
| Service task | Subroutine shape `[["..."]]`, `servicetask` class | "Regenerate catalog.json and manifest", "Verify manifest maturity counts" — automated, non-human steps |
| Exclusive (XOR) gateway | Diamond `{"..."}`, `gateway` class | "Meets Usable gate?" — mutually exclusive yes/no outcome, matches `references/gateway-patterns.md`'s Exclusive definition |
| Swim lanes | `subgraph` per role | `Author`, `Reviewer`, `Cataloger` |
| Feedback loop | Dotted edge back into the origin lane | `Returned to author` -.-> `Draft SKILL.md and references` |

Distinct node **shapes** are used per element type (not color alone), per this skill's
"argue, not display" requirement in the SKILL.md body.

Process definition vs. instance (per this skill's guidance): this diagram models the
process **definition** — all possible paths (approve, reject-and-retry) — not one
specific historical run through it.

### Step 4 — Design System (core)

Applied `classDef` roles, each setting `fill`, `stroke`, AND `color` (no exceptions):

| Role | Fill | Stroke | Color | Applied to |
|---|---|---|---|---|
| `startevent`/`endevent` | `#374151` | `#9ca3af` | `#f9fafb` | Start/end nodes (neutral Slate) |
| `usertask` | `#5b21b6` | `#ddd6fe` | `#fff` | Human tasks (Violet Mist) |
| `sendtask` | `#5b21b6` | `#c4b5fd` (dashed) | `#fff` | Message-send handoff (Violet Mist, dashed stroke to distinguish from a plain user task) |
| `servicetask` | `#064e3b` | `#6ee7b7` | `#d1fae5` | Automated tasks (Forest Sage) |
| `gateway` | `#1e3a5f` | `#93c5fd` | `#e0f2fe` | Decision diamond (Ocean Depth) |

Reused the same hand-picked palette hex values as `okhp3-mermaid-core`'s
`WORKED-EXAMPLE-001.md` for cross-diagram visual consistency (see that file's Known
Limitations note — canonical hex extraction from `mermaid-theme-builder/lib/` is still
an open Phase 1 item tracked there, not resolved by this example).

### Step 5 — Naming & Registry (core)

**Filename:** `skill-promotion-review-analyst-v1.mmd`

Pattern: `[domain]-[process]-[view]-[audience]-v[version].mmd`
- domain: `skill`
- process: `promotion-review`
- view: (omitted — single-view diagram)
- audience: `analyst`
- version: `v1`

**Registry entry** (illustrative — this skills repo defines the pattern; a consuming
project maintains the actual `DIAGRAMS.md`):

| ID | Filename | Audience | Family | Related | Status | MC Link | Updated |
|---|---|---|---|---|---|---|---|
| SKILLZ-002 | skill-promotion-review-analyst-v1.mmd | analyst | bpmn | SKILLZ-001 | validated | — | 2026-08-06 |

Landed in `references/process-examples/` per this skill's own stated location for
Gate-1/2/3-validated worked examples (previously empty, a Phase 1 deliverable this
worked example partially discharges — see Known Limitations).

### Step 6 — Validation (Three Gates, core)

**Gate 1 — Syntax**

Rendered with `mmdc` (mermaid-cli v11.16.0) via `okhp3-mermaid-publish`'s render
pipeline (see `okhp3-mermaid-publish/examples/WORKED-EXAMPLE-001.md` for the full
render-side account, exact command, and output). Exit code **0** for both the `.svg`
and `.png` outputs — clean parse, no syntax errors.

**Gate 2 — Semantic**

Re-read the rendered SVG/PNG against the request:
- All three lanes (Author, Reviewer, Cataloger) present with correctly scoped tasks: ✅
- Gateway condition ("Meets Usable gate?") has exactly two mutually exclusive outgoing
  edges labeled `yes`/`no`, matching Exclusive (XOR) semantics: ✅
- Feedback loop returns to the Author lane's first task, not an arbitrary node: ✅
- Arrow directions match causality (draft → send → check → decide → act), no reversed
  edges: ✅
- No entities fabricated or omitted relative to the described process: ✅

**Gate 3 — Audience Fit**

Node count: 11 nodes — Start, `A1`–`A3`, `R1`–`R2`, `GW1`, `C1`–`C2`, `EndPub`,
`EndRej` (within Analyst's 10–20 range per `references/audience-profiles.md`): ✅
Detail level: gateway condition labeled, task ownership visible per lane: ✅
Vocabulary: role/task-oriented (Author/Reviewer/Cataloger), not executive-summary,
not code-level implementation detail: ✅

**All three gates passed.**

---

## Output

`references/process-examples/skill-promotion-review-analyst-v1.mmd` in this skill.
Rendered artifacts (`.svg`, `.png`) are preserved in
`../okhp3-mermaid-publish/examples/` — see that skill's worked example for the render
step itself.

---

## Known limitations / follow-on work

- This worked example populates `references/process-examples/` with one diagram, not
  the three named in that directory's `README.md` (approval-flow, onboarding,
  procurement). Those remain open Phase 1 items; this example demonstrates the skill
  is usable, it does not close out the full reference-library backlog.
- `references/gateway-patterns.md`, `references/bpmn-elements.md`, and
  `references/swimlane-layouts.md` are still Phase-1 TOC stubs (checklists, not filled
  guidance). This worked example was completable using the element definitions already
  present in `SKILL.md`'s own body (gateway types, event/task lists, subprocess
  definitions) plus the encoding decisions recorded in the Step 3 table above — but an
  agent without this worked example as a reference would need to make the same shape
  choices from scratch each time until those reference files are authored.
- Only the Exclusive (XOR) gateway type was exercised. Parallel, Inclusive, and
  Event-based gateways remain unvalidated in practice.
- No subprocess (collapsed/expanded/call activity) was needed for this process, so
  `references/subprocess-patterns.md` remains unexercised by this example.
