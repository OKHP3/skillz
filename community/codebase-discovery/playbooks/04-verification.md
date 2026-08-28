# Phase 4 — Verification

**Role:** Code Reviewer (adversarial).
**Goal:** Hold the **generated** onboarding docs to a high bar — treat each claim as unproven
until it traces to code evidence or a named stakeholder; anything unsupported gets flagged,
not published as fact.

Run this as an **isolated pass** — a sub-agent where available — so the check is independent
of the work that produced the docs. On Claude Code, dispatch the **`codebase-doc-verifier`**
subagent; on other hosts use any generic sub-agent, or run the checks directly.

---

## Checks

1. **Traceability.** For each substantive claim in the `docs/` set, confirm there is an entry
   in `docs/_discovery/traceability-index.md` pointing to real code (`path:line` / symbol) or
   a named stakeholder. Spot-check the citations actually say what the doc claims.

2. **No unsupported facts.** Any statement with neither code evidence nor stakeholder
   confirmation must be demoted to `[assumption]` / `[unverified]` or removed. In particular,
   check that no business rule was invented.

3. **Exception flags are honest.** Ensure accepted (unmarked) statements really are settled,
   and that every known `[outdated]` / `[contradicted]` item is either resolved or clearly
   flagged in both the doc and the assumptions register.

4. **Onboarding-lean.** Flag bloat: content that fails the "does this make a new joiner
   productive?" test, duplicated content across files, or docs exceeding the length ceilings
   in output-conventions.

5. **Freshness & consistency.** Every doc has a `Last updated` date; the recon manifest
   reflects the files actually read; terminology matches the glossary across all docs.

6. **Drift captured.** The doc-drift summary lists every place existing docs
   (README/CLAUDE.md/AGENTS.md) contradicted the code, each with a corrected statement.

---

## Output

Produce a short verification report:

- Claims checked; count supported vs demoted/removed.
- Any invented or unsupported statements found and how they were handled.
- Open `[assumption]` / `[unverified]` / `[contradicted]` items and their impact.
- Bloat or duplication trimmed.
- Go / no-go for harness engineering / Spec Kit, with any caveats.

If material problems are found, return to synthesis (or the interview) rather than shipping
docs built on unresolved assumptions.

---

## Exit criteria

- Every published claim is supported or explicitly flagged.
- No invented business rules remain.
- Drift summary complete; assumptions register reconciled.
- Verification report written. Ready for the finish step (doc-drift + agent file).
