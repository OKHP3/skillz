# okhp3-artifact-validation report — `docs/adr/0001-family-requires-family-md.md`

**Artifact under review**: `docs/adr/0001-family-requires-family-md.md`
(+ its index entry in `docs/adr/README.md`)
**Date**: 2026-08-03

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Required ADR sections present (Context, Decision Drivers, Considered Options, Decision, Consequences) | PASS | All five present in the file as written. |
| 2 | Status and date fields present and well-formed | PASS | `Status: Accepted`, `Date: 2026-08-03`. |
| 3 | Claimed code location (`forge/scripts/build-catalog.js`, `findSkillFiles`, `FAMILY_DISPLAY_NAMES`) actually exists | WARN | `findSkillFiles` confirmed present (`build-catalog.js:325`). `FAMILY_DISPLAY_NAMES` **no longer exists** -- a concurrent task-agent merge (project tasks #34-#37) replaced the hardcoded display-name map referenced in this ADR's "Related Decisions" section with a `FAMILY.md`-frontmatter-driven `readFamilyDisplayName()` function before this validation ran. The ADR's core decision (FAMILY.md gates family membership) is still accurate and current; only the incidental cross-reference to the old map name is now stale. |
| 4 | Claimed family list (15 families, each with `FAMILY.md`) is currently true | PASS | Re-checked mechanically this session: all 15 named family directories have `FAMILY.md`. `node forge/scripts/build-catalog.js` reports "113 skills across 15 families" after rebuild. |
| 5 | The described `findSkillFiles` behavior (skip unless `FAMILY.md` present at depth 0) matches the current source | PASS | `build-catalog.js:339-345` implements exactly this check today. |
| 6 | No orphaned cross-references (ADR index in `docs/adr/README.md` lists this ADR) | PASS | `docs/adr/README.md` table includes ADR-0001 with matching title/status/date. |
| 7 | `pnpm dev` / `tsc --noEmit` still clean after the referenced code area was touched this session | PASS | `npx tsc --noEmit` clean; `Start application` workflow running without new errors. |

## Verdict

**PASS with one WARN.** The ADR's decision and rationale remain accurate. The
WARN is a documentation staleness issue, not a logic error: the "Related
Decisions" section names `FAMILY_DISPLAY_NAMES`, a symbol a concurrent merge
has since replaced with `readFamilyDisplayName()` (a strictly better,
self-maintaining implementation of the same follow-up this ADR anticipated).

## Recommended fix

Update the "Related Decisions" paragraph in ADR-0001 to reference
`readFamilyDisplayName()` instead of `FAMILY_DISPLAY_NAMES`, or add a short
"Update, 2026-08-03" note recording that the map was superseded. Not applied
automatically by this validation pass -- flagging for the ADR's own edit
history rather than silently rewriting a decision record after the fact.
