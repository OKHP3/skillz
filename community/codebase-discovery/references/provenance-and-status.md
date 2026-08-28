# Provenance & status model

How claims are tracked from "found in code" to "accepted onboarding knowledge" — and how the
exceptions are flagged so a reader knows what not to trust yet.

---

## The rule: exception-only flagging

**Accepted knowledge is unmarked.** Do not stamp settled facts as "confirmed" — that just adds
noise to every line. A reader should be able to assume that unflagged statements are accepted
current-state knowledge, and that **any flag means "attention needed here."**

Only these flags appear, and only where they apply:

| Flag | Meaning | Where it lives |
|---|---|---|
| `[unverified]` | Derived from code but not yet validated by a person | inline + assumptions register |
| `[assumption]` | Inferred, not directly evidenced; record why + impact if wrong | inline + assumptions register |
| `[outdated]` | An existing doc/claim the code shows is no longer true | assumptions register + doc-drift summary |
| `[contradicted]` | Two sources disagree, unresolved | assumptions register |

There is intentionally **no `confirmed` flag.** In `code-only` mode, expect many
`[unverified]` / `[assumption]` flags because nothing has been validated by a human yet.

---

## Lifecycle of a claim

```
Phase 0: harvested from existing docs        → [unverified]
Phase 1: checked against code
            matches code                      → accepted (unmarked) + evidence recorded
            code says otherwise               → [outdated] (+ code-derived suggestion)
            sources disagree                  → [contradicted]
            can't tell from code              → [unverified], carried to interview
Phase 2: stakeholder confirms/corrects        → accepted (unmarked), source = stakeholder
            stakeholder can't confirm          → stays [assumption]/[unverified]
Phase 4: any accepted claim without evidence   → demoted back to [assumption] or removed
```

Accepted knowledge always has a backing entry in the traceability index — either a code
location or a named stakeholder (or both).

---

## Traceability index

`docs/_discovery/traceability-index.md` maps each substantive claim to its evidence. This
keeps citations **out of** the onboarding prose (which stays lean) while preserving the audit
trail. Reference it by claim ID from a doc only when a reader is likely to want the proof.

Recommended row: `claim-id | claim (short) | source (path:line / stakeholder) | confidence`.

---

## Assumptions register

`docs/_discovery/assumptions-register.md` is the single list of everything still needing
attention: every `[assumption]`, `[unverified]`, `[outdated]`, `[contradicted]` item, with why
it matters and the impact if wrong. It drives the interview and the doc-drift summary, and it
is the first thing to resolve before relying on the docs for a change.

---

## Confidence

Where useful, annotate High/Med/Low alongside a flag — especially on `[assumption]` items —
so the highest-impact, lowest-confidence items get validated first.
