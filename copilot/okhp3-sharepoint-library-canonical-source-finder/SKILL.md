---
name: okhp3-sharepoint-library-canonical-source-finder
description: >
  Find likely canonical SharePoint library documents among selected related
  files and report stale or duplicate candidates with evidence. Use when users
  encounter conflicting final versions. Do not use to delete, archive, or declare a definitive source without owner review.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Evidence-led canonical-source candidates for SharePoint library files."
  out_of_scope: "Automatic archival, deletion, relocation, or ownership decisions."
---

# okhp3-sharepoint-library-canonical-source-finder

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Return an evidence-led comparison of selected related files, identifying likely
canonical candidates and ambiguity without treating similarity as authorization
to remove or replace content.

## Scope

Use only for a supplied document set and supplied canonical-source signals such
as owner, approved location, status, or effective date. It recommends review;
it does not decide records disposition.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Selected library files, accessible metadata, and version indicators |
| Portable core | Evidence comparison, ambiguity detection, and canonical-candidate reporting |
| Host adapter | Reads only content and metadata available to the current user |
| Mutation | No moves, deletes, or archival changes; separate confirmed action required |
| Evidence | Analytical design only; no live library reconciliation has occurred |

## Activation evidence preflight

1. Confirm the named Library and the selected files or inspection scope required
   by this task.
2. In a real SharePoint test, confirm either explicit invocation of this skill
   or the SharePoint skill indicator card. The presence of this package alone
   is not evidence that the host discovered or loaded it.
3. If the host cannot load the skill or expose the required Library context,
   return `NOT SUPPORTED`, identify the missing capability, and do not claim
   that the review or draft was completed.
4. Keep the result analytical until a test records the site, user role, input
   scope, and observed host behavior.

## Procedure

1. Confirm the subject, selected file set, and authoritative canonical signals.
2. Compare accessible titles, locations, owner fields, approval or version
   markers, dates, and supplied content indicators.
3. Mark a result `LIKELY_CANONICAL`, `DUPLICATE_CANDIDATE`, `STALE_CANDIDATE`,
   or `NEEDS OWNER DECISION`; never call a candidate definitive without rules.
4. Return this table:

   | File | Signals observed | Candidate status | Conflicts | Confidence | Required owner decision |
   |---|---|---|---|---|---|

5. Verify that each status cites observed signals and that uncertainty remains
   visible when records disagree.
6. If cleanup is requested, provide an exact proposed action set and obtain
   explicit confirmation plus capability and permission checks first.

## Safe outcomes

- `NEEDS INPUT`: no selected set or authoritative canonical signals are supplied.
- `NOT SUPPORTED`: the host cannot inspect the needed metadata or content.
- `INSUFFICIENT PERMISSION`: the user cannot read the relevant files.

## Boundaries

- Do not infer approval from a filename, recency, or folder alone.
- Do not delete, archive, move, or overwrite files.
- Do not inspect external repositories or run custom code.

## Validation

Read `evals/evals.json` for analytical comparison, ambiguity, and cleanup-
boundary cases. No live host evidence exists for version 1.1.0.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## v1.1 maturation record

The analytical [learning ledger](benchmarks/learning-ledger-2026-09-01.json)
preserves the frozen v1.0 input, official-source constraint, review limits, and
the concrete activation-evidence revision. It is not a live tenant test.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
