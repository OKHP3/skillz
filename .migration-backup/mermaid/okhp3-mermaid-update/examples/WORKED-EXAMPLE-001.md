# Worked Example 001 — Adding a Stakeholder-Notification Step (Style-Preserving Update)

**Date:** 2026-08-06
**Skill version:** 0.2.0
**Completed by:** Replit Agent (`okhp3-mermaid-core` + `okhp3-mermaid-update` workflow)
**Source diagram:** `mermaid/okhp3-mermaid-bpmn/references/process-examples/skill-promotion-review-analyst-v1.mmd`
**Output diagram (this directory):** `skill-promotion-review-analyst-v2.mmd`

---

## Task

The BPMN skill-promotion review diagram (`skill-promotion-review-analyst-v1`) was produced
and validated in `okhp3-mermaid-bpmn`'s worked example. A follow-on request arrived:

> "After the Cataloger verifies the manifest (C2), add a task where the Author
> announces the promotion — something like 'Announce on OverKill Hill changelog'.
> Keep everything else identical."

This is a pure content addition to a working diagram. No style changes, no structural
redesign — exactly the scenario `okhp3-mermaid-update` is built for.

---

## Workflow execution (per `okhp3-mermaid-update`)

### Step 0 — Loaded `okhp3-mermaid-core` first

Per the family contract, `okhp3-mermaid-core` was consulted for audience/type context
before applying the update. The existing diagram is analyst-audience, `flowchart TD`
with `subgraph` swim lanes — that context carries into this pass unchanged.

### Step 1 — Receive and parse the existing diagram

Protected regions identified from `skill-promotion-review-analyst-v1.mmd`:

| Protected region | Content |
|---|---|
| `%%{init}%%` block | None present in source (theme defaults used) |
| `classDef` declarations | `startevent`, `endevent`, `usertask`, `sendtask`, `servicetask`, `gateway` — 6 total |
| `class <id> <name>` assignments | None explicit; all assignments are inline via `:::` syntax |
| Diagram type declaration | `flowchart TD` |
| Existing node IDs | `Start`, `A1`–`A3`, `R1`–`R2`, `GW1`, `C1`–`C2`, `EndPub`, `EndRej` |

All 6 `classDef` declarations present. No `%%{init}%%` block. No malformed regions.
Safe to proceed.

### Step 2 — Understand the change intent

**Stated change:** Add one new task after C2 ("Verify manifest maturity counts"), where
the Author announces the promotion to the OverKill Hill changelog, before the
"Promoted to usable" end event.

**Plain-language restatement:**
- What is being added: one new user task node (Author lane), one new edge (C2 → new node),
  the existing C2 → EndPub edge replaced by new node → EndPub.
- Which nodes/edges are affected: C2 (outgoing edge changes), EndPub (incoming edge changes).
  The new node is added to the Author subgraph.
- Effect on diagram type, direction, swim lanes: none. `flowchart TD` and the three
  subgraph lanes (`Author`, `Reviewer`, `Cataloger`) are unchanged.

No ambiguity. Proceeding.

### Step 3 — Apply the minimum diff

ID convention review: existing Author nodes use `A1`, `A2`, `A3`. The new node
follows the same pattern: `A4`. Class assignment: the new task is a human announcement
step — same `usertask` class as `A1`, `A2`.

**Changes made (minimum diff):**

```diff
-    A3["Send worked example for review"]:::sendtask
+    A3["Send worked example for review"]:::sendtask
+    A4["Announce on OverKill Hill changelog"]:::usertask
```

```diff
-    GW1 -- "yes" --> C1 --> C2 --> EndPub
+    GW1 -- "yes" --> C1 --> C2 --> A4 --> EndPub
```

**What was not changed:**
- `classDef` declarations: identical to v1 (verified by line-by-line comparison)
- `%%{init}%%` block: absent in v1, absent in v2
- All existing node IDs: unchanged
- R1, R2, GW1, EndRej, A1–A3, C1–C2: unchanged in label, shape, class, and position
- Reject path (`GW1 -- "no" --> R2 --> EndRej -.-> A1`): unchanged

The diff is 2 lines added, 1 line changed (edge routing). Reviewable in under 30 seconds.

Note: `A4` is placed in the `Author` subgraph block (not `Cataloger`), because the
"announce on changelog" act is owned by the Author role, not the automated Cataloger
pipeline. This is a semantic choice consistent with the existing swim-lane ownership model.

### Step 4 — Re-run all three validation gates

**Gate 1 — Syntax**

The updated `.mmd` was rendered with `mmdc` (mermaid-cli v11.16.0) using the same
render-pipeline and `PUPPETEER_EXECUTABLE_PATH` workaround documented in
`okhp3-mermaid-publish/examples/WORKED-EXAMPLE-001.md`. Exit code **0**. No syntax
errors. The output `.svg` was inspected visually.

```
$ bash mermaid/okhp3-mermaid-publish/references/render-pipeline.sh \
    mermaid/okhp3-mermaid-update/examples/skill-promotion-review-analyst-v2.mmd \
    mermaid/okhp3-mermaid-update/examples/skill-promotion-review-analyst-v2.png
Rendering ... -> skill-promotion-review-analyst-v2.png (first run may take ~30s)...
Generating single mermaid chart
OK: ... written.
```

Exit code: **0**. Gate 1 passed.

**Gate 2 — Semantic**

Re-read the rendered output against the stated change request:
- New node `A4` ("Announce on OverKill Hill changelog") appears in the Author lane ✅
- Edge routing: C2 → A4 → EndPub replaces C2 → EndPub ✅
- Reject path unchanged: `GW1 -- "no" --> R2 --> EndRej -.-> A1` still present ✅
- All original nodes present, none removed or relabeled ✅
- Arrow directions correct (C2 feeds A4, A4 feeds EndPub — causality preserved) ✅

Gate 2 passed.

**Gate 3 — Audience Fit**

Node count: 12 nodes (was 11). Still within Analyst range (10–20 per
`okhp3-mermaid-core/references/audience-profiles.md`): ✅
Detail level: unchanged — gateway condition labeled, lane ownership visible ✅
New node `A4` is role-appropriate (Author task, human action, `usertask` class): ✅

Gate 3 passed.

**All three gates passed.**

### Step 5 — Deliver and register

Output: `skill-promotion-review-analyst-v2.mmd` in this directory.

Registry update (per `okhp3-mermaid-core/references/naming-conventions.md`):

| ID | Filename | Audience | Family | Version | Change summary | Status | Updated |
|---|---|---|---|---|---|---|---|
| SKILLZ-002 | skill-promotion-review-analyst-v2.mmd | analyst | update | v2 | Added A4 "Announce on OverKill Hill changelog" Author task after catalog verification | validated | 2026-08-06 |

The v1 source at `mermaid/okhp3-mermaid-bpmn/references/process-examples/skill-promotion-review-analyst-v1.mmd`
is preserved unchanged — this skill does not modify the source, it produces a new
versioned output.

If this diagram were published via Mermaid Chart MCP, a re-publish would be required.
No MCP connector is configured in this environment; publish step is not exercised.

---

## Output

`skill-promotion-review-analyst-v2.mmd` in this directory.

---

## Known limitations / follow-on work

- Gate 1 was run locally with `mmdc` and the system chromium workaround (same
  environment gap as documented in `okhp3-mermaid-publish/examples/WORKED-EXAMPLE-001.md`).
  The render result is valid; the workaround is an environment fact, not a skill defect.
- The Mermaid Chart MCP publish path was not exercised (no connector configured).
  Per the skill's contract, noting that a re-publish is needed is sufficient — the
  actual publish step belongs to `okhp3-mermaid-publish`, initiated separately.
- This example exercises the most common update shape (add one node, reroute one edge).
  Multi-node additions, edge-label changes, and subgraph restructuring remain
  unexercised in a worked example, though the SKILL.md instructions cover them.
