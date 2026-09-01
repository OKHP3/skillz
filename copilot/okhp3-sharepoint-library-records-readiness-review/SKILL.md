---
name: okhp3-sharepoint-library-records-readiness-review
description: >
  Review selected SharePoint library files against supplied records-readiness
  criteria and return a source-linked human review queue. Use when retention or
  record treatment needs a visible decision point. Do not use to apply labels or make retention decisions automatically.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Readiness review drafts for supplied records criteria and selected library files."
  out_of_scope: "Retention policy interpretation, label application, disposition, or unapproved changes."
---

# okhp3-sharepoint-library-records-readiness-review

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Create a source-linked review queue for files that may need records attention,
preserving the criteria and uncertainty for a responsible human decision.

## Scope

Use only when the user supplies the relevant readiness criteria and review
owner. It identifies candidates; it does not decide retention, legal hold, or
records classification.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Selected files and accessible metadata |
| Portable core | Criteria matching, evidence capture, exception routing, and review queue |
| Host adapter | Reads content and metadata only when native capability and permission permit |
| Mutation | No labels, retention settings, or moves without a separately confirmed supported action |
| Evidence | Analytical design only; no live records review has occurred |

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

1. Confirm the selected files, supplied readiness criteria, review owner, and
   whether legal or records counsel must decide exceptions.
2. Inspect accessible metadata and source evidence relevant to the supplied
   criteria; mark unavailable evidence rather than guessing.
3. Classify each file as `REVIEW_CANDIDATE`, `NEEDS INPUT`, `OUT_OF_SCOPE`, or
   `NOT_INSPECTED`. Do not infer a retention period.
4. Return this queue:

   | File | Criterion | Observed evidence | Candidate status | Uncertainty | Required reviewer action |
   |---|---|---|---|---|---|

5. Validate that every candidate cites a supplied criterion and observed fact.
6. If label or file-state action is requested, show exact proposals and require
   explicit confirmation plus supported host capability and permission.

## Safe outcomes

- `NEEDS INPUT`: readiness criteria, selected files, or review owner are absent.
- `NOT SUPPORTED`: the host cannot read the needed content or metadata.
- `INSUFFICIENT PERMISSION`: the user cannot access the files or confirmed action.

## Boundaries

- Do not interpret retention schedules, legal holds, or regulatory obligations.
- Do not apply labels, declare a record, delete, or move content.
- Do not use external repositories, tools, or custom code.

## Validation

Read `evals/evals.json` for analytical candidate, criteria-gap, and label-
change boundary cases. Version 1.0.0 has no live host evidence.

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
