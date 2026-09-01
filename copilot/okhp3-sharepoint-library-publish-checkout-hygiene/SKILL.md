---
name: okhp3-sharepoint-library-publish-checkout-hygiene
description: >
  Review a SharePoint library for unpublished, stale, or checked-out files and
  return a remediation report with evidence. Use when visitors cannot reliably
  find usable content. Do not use to publish, check in, discard, or alter files automatically.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only publish and checkout hygiene reports for SharePoint libraries."
  out_of_scope: "Automatic check-in, publication, version disposal, or ownership changes."
---

# okhp3-sharepoint-library-publish-checkout-hygiene

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Return a transparent remediation report for content that appears unavailable,
stale, or checked out, without changing file state or inferring the right owner.

## Scope

Use for a named library and an agreed inspection scope. It reports observed
availability signals and proposed owner actions; it does not publish or check
in content.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Accessible library files and publication or checkout indicators when exposed |
| Portable core | Signal inventory, exception prioritization, and remediation reporting |
| Host adapter | Reads only native capability and current-user-permitted metadata |
| Mutation | Always draft first; explicit confirmation, capability, and permission required for a supported state change |
| Evidence | Analytical design only; no live hygiene run has occurred |

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

1. Confirm the target library, inspection scope, freshness rule, and who owns
   publication or checkout decisions.
2. Inspect available metadata and label observations as `UNPUBLISHED_SIGNAL`,
   `CHECKED_OUT_SIGNAL`, `STALE_CANDIDATE`, `NOT_INSPECTED`, or `NEEDS RULE`.
3. Do not treat a modified date alone as proof that a file is stale or available.
4. Return this report:

   | File | Observed signal | Evidence | Impact on visitors | Proposed owner action | Review state |
   |---|---|---|---|---|---|

5. Validate that each signal distinguishes observed facts from proposed action.
6. If a supported change is requested, show the exact file and action and wait
   for explicit confirmation after rechecking permission.

## Safe outcomes

- `NEEDS INPUT`: library identity, freshness rule, or accountable owner is missing.
- `NOT SUPPORTED`: the host does not expose the needed publication or checkout state.
- `INSUFFICIENT PERMISSION`: the user cannot inspect or change the requested file state.

## Boundaries

- Do not publish, check in, discard checkout, restore versions, or delete files.
- Do not infer an owner from an old editor or historical file activity.
- Do not run custom code or connect to external systems.

## Validation

Read `evals/evals.json` for analytical signal, rule-gap, and state-change
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
