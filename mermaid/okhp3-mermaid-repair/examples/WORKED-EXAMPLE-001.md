# Worked Example 001 — Repairing a Reserved-Keyword Node ID

**Date:** 2026-08-06
**Skill version:** 0.2.0
**Completed by:** Replit Agent (`okhp3-mermaid-core` + `okhp3-mermaid-repair` workflow)
**Broken source:** inline (see "Broken diagram" section below)
**Repaired output (this directory):** `skill-promotion-review-analyst-v1-repaired.mmd`

---

## Task

While adapting the validated `skill-promotion-review-analyst-v1.mmd` diagram for a
different repository, an editor renamed the two end-event nodes from `EndPub`/`EndRej`
to `end`/`endRej` in a quick find-replace pass. The diagram immediately failed to parse:

```
Error: Parse error on line 5:
...GW1 -- "yes" --> C1 --> C2 --> end
-----------------------^
Expecting 'NEWLINE', 'EOF', 'SEMI', 'end', got 'NEWLINE'
```

The error report was provided alongside the broken `.mmd` source. This is a pure
parse failure — no intentional content change was requested. Route: `okhp3-mermaid-repair`.

---

## Broken diagram

The full source as received (broken):

```mermaid
flowchart TD
    Start(["Skill drafted"]):::startevent

    subgraph Author["Author"]
        direction TB
        A1["Draft SKILL.md and references"]:::usertask
        A2["Produce worked example"]:::usertask
        A3["Send worked example for review"]:::sendtask
    end

    subgraph Reviewer["Reviewer"]
        direction TB
        R1["Check worked example against PUBLISHING.md gate"]:::usertask
        GW1{"Meets Usable gate?"}:::gateway
        R2["Record rejection reason"]:::usertask
    end

    subgraph Cataloger["Cataloger"]
        direction TB
        C1[["Regenerate catalog.json and manifest"]]:::servicetask
        C2[["Verify manifest maturity counts"]]:::servicetask
    end

    end(("Promoted to usable")):::endevent
    endRej(("Returned to author")):::endevent

    Start --> A1 --> A2 --> A3 --> R1 --> GW1
    GW1 -- "yes" --> C1 --> C2 --> end
    GW1 -- "no" --> R2 --> endRej
    endRej -.-> A1

    classDef startevent fill:#374151,stroke:#9ca3af,stroke-width:2px,color:#f9fafb
    classDef endevent fill:#374151,stroke:#9ca3af,stroke-width:3px,color:#f9fafb
    classDef usertask fill:#5b21b6,stroke:#ddd6fe,stroke-width:2px,color:#fff
    classDef sendtask fill:#5b21b6,stroke:#c4b5fd,stroke-width:2px,stroke-dasharray:3 2,color:#fff
    classDef servicetask fill:#064e3b,stroke:#6ee7b7,stroke-width:2px,color:#d1fae5
    classDef gateway fill:#1e3a5f,stroke:#93c5fd,stroke-width:2px,color:#e0f2fe
```

---

## Workflow execution (per `okhp3-mermaid-repair`)

### Step 0 — Loaded `okhp3-mermaid-core` first

Per the family contract, `okhp3-mermaid-core` was consulted for context. The diagram
type (`flowchart TD`), audience (analyst), and design system are unchanged — this is
a syntax-only repair pass.

### Step 1 — Receive the broken diagram

Full `.mmd` source and the `mmdc` error message received together:

```
Error: Parse error on line 5:
...GW1 -- "yes" --> C1 --> C2 --> end
-----------------------^
Expecting 'NEWLINE', 'EOF', 'SEMI', 'end', got 'NEWLINE'
```

The error line references `end` in an edge definition. The parser sees `end` as the
`end` keyword that closes a `subgraph` block, not as a node ID — so it fails at
unexpected position.

### Step 2 — Diagnose the failure

**Failure mode:** Reserved keyword used as node ID.

`end` is a Mermaid flowchart reserved keyword — it closes a `subgraph` block. Using
it as a node identifier is a parse error regardless of where in the file it appears.
The secondary rename (`EndRej` → `endRej`) is syntactically valid on its own (Mermaid
node IDs are case-sensitive and `endRej` is not reserved), but applying the same fix
to it as well restores the original naming convention consistently.

**Affected lines (broken source):**

| Line | Content | Issue |
|---|---|---|
| Node declaration | `end(("Promoted to usable")):::endevent` | `end` is a reserved keyword |
| Edge definition | `GW1 -- "yes" --> C1 --> C2 --> end` | same — `end` cannot appear as an edge target |
| Node declaration | `endRej(("Returned to author")):::endevent` | valid syntax but violates naming convention |
| Edge definition | `GW1 -- "no" --> R2 --> endRej` | valid syntax, renamed for consistency |
| Feedback edge | `endRej -.-> A1` | valid syntax, renamed for consistency |

No other failure modes present. The `classDef` declarations, `%%{init}%%` block
(absent), `subgraph` blocks, and all other node IDs are intact.

### Step 3 — Apply the minimum fix

**Fix:** rename `end` → `EndPub` and `endRej` → `EndRej` — restoring the original
names from `skill-promotion-review-analyst-v1.mmd` that the find-replace incorrectly
overwrote.

Judgment call: two possible fixes exist —
(a) restore the original IDs (`EndPub`, `EndRej`), or
(b) rename to new non-reserved IDs (`endNode`, `endRejNode`).

Option (a) is applied because the original names are known (this diagram has a
version-controlled v1 source), are not reserved, and restoring them produces zero
semantic drift from the pre-edit state. Option (b) would be the fallback if the
original names were unknown. This judgment call is noted per the skill's contract.

**Changes (minimum fix):**

```diff
-    end(("Promoted to usable")):::endevent
+    EndPub(("Promoted to usable")):::endevent
-    endRej(("Returned to author")):::endevent
+    EndRej(("Returned to author")):::endevent

-    GW1 -- "yes" --> C1 --> C2 --> end
+    GW1 -- "yes" --> C1 --> C2 --> EndPub
-    GW1 -- "no" --> R2 --> endRej
+    GW1 -- "no" --> R2 --> EndRej
-    endRej -.-> A1
+    EndRej -.-> A1
```

**What was not changed:**
- `classDef` declarations: all 6 present and identical to v1 ✅
- `%%{init}%%` block: absent — as in v1 ✅
- All other node IDs: `Start`, `A1`–`A3`, `R1`–`R2`, `GW1`, `C1`–`C2` — unchanged ✅
- Node labels: `"Promoted to usable"`, `"Returned to author"` — unchanged ✅
- Subgraph structure and direction: unchanged ✅
- Edge directions and labels: unchanged except the corrected target IDs ✅

### Step 4 — Re-run Gate 1

The repaired `.mmd` was rendered with `mmdc` (mermaid-cli v11.16.0) using the
`PUPPETEER_EXECUTABLE_PATH` workaround documented in
`okhp3-mermaid-publish/examples/WORKED-EXAMPLE-001.md`:

```
$ bash mermaid/okhp3-mermaid-publish/references/render-pipeline.sh \
    mermaid/okhp3-mermaid-repair/examples/skill-promotion-review-analyst-v1-repaired.mmd \
    mermaid/okhp3-mermaid-repair/examples/skill-promotion-review-analyst-v1-repaired.png
Rendering ... -> skill-promotion-review-analyst-v1-repaired.png ...
Generating single mermaid chart
OK: ... written.
```

Exit code: **0**. No syntax errors. Gate 1 passed.

Gates 2 (semantic) and 3 (audience fit) do not apply — this is a pure syntax repair.
Content has not changed; Gate 2 is inapplicable by definition. If in doubt about any
repair touching more than syntax, all three gates apply — not the case here.

### Step 5 — Document the repair

**Summary:**

| Item | Detail |
|---|---|
| Failure mode | Reserved keyword `end` used as a node ID |
| Affected lines | Node declaration `end((…))` and three edge definitions referencing `end`/`endRej` |
| Fix applied | Renamed `end` → `EndPub`, `endRej` → `EndRej` (restoring original v1 IDs) |
| Judgment call | Restored original names rather than inventing new ones (v1 source known) |
| classDef declarations | Intact — not changed |
| `%%{init}%%` block | Absent — not changed |
| Labels | Unchanged — `"Promoted to usable"`, `"Returned to author"` preserved |
| Structure | Unchanged — subgraphs, swim lanes, all other nodes preserved |

---

## Output

`skill-promotion-review-analyst-v1-repaired.mmd` in this directory. The repaired
diagram is semantically identical to `skill-promotion-review-analyst-v1.mmd` in
`mermaid/okhp3-mermaid-bpmn/references/process-examples/`. It is preserved here
rather than overwriting the v1 source, as the repair is a distinct artifact from the
validated original.

---

## Known limitations / follow-on work

- Gate 1 was run locally with the system chromium workaround (see the Publish skill's
  worked example). The render is valid; the workaround is an environment fact.
- This example exercises only the "reserved keyword as node ID" failure mode — the
  most common single-category parse error in practice. The other six failure modes
  documented in the SKILL.md (unquoted labels, semicolons, undefined classDef,
  mismatched subgraph/end pairs, HTML in labels, malformed `%%{init}%%` JSON) remain
  unexercised in a worked example.
- The secondary rename (`endRej` → `EndRej`) was not strictly required to fix the
  parse error, but was included for naming-convention consistency. This is documented
  explicitly as a judgment call per the skill's contract.
