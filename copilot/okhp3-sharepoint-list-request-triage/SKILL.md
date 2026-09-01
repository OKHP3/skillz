---
name: okhp3-sharepoint-list-request-triage
description: >
  Triage SharePoint List requests into a transparent review queue using
  supplied routing rules. Use when request items need completeness checks,
  category suggestions, priority flags, or owner-ready next steps. Do not use
  to assign people, change status, or route requests without explicit rules and confirmation.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Rule-led review and proposed routing for SharePoint List request items."
  out_of_scope: "Invented routing, automatic assignments, notifications, or unapproved writes."
---

# okhp3-sharepoint-list-request-triage

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Turn selected SharePoint List request items into an auditable triage draft:
what is known, which explicit rule applied, what is missing, and what a human
should confirm before any assignment or status update.

## Scope

Use only for selected request-list items with supplied routing rules. It
produces a transparent triage draft and does not assign people, notify anyone,
or update records by default.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | A request List, selected items, and routing fields available to the current user |
| Portable core | Evidence extraction, rule application, exception routing, and review output |
| Host adapter | Reads list data only through supported native capabilities and existing permission |
| Mutation | Draft first. Show exact category, priority, owner, or status changes and obtain explicit confirmation before a supported update. |
| Evidence | Analytical package design only. No live routing or notification run has occurred. |

## Procedure

1. Confirm the target list, selected request items, its intake fields, routing
   rules, priorities, service targets, and who can approve the result.
2. Read the available schema and items. If a necessary field is unavailable,
   report that gap rather than assuming an internal name or value.
3. For each item, check minimum completeness before classification. Use
   `NEEDS INPUT` for missing facts, `NEEDS RULE` for an uncovered situation,
   and `ESCALATE` when the supplied rules require a human decision.
4. Apply only the provided rule set. Keep the rule identifier, observed facts,
   and proposed next state together so the triage can be reviewed.
5. Return this draft:

   | Item | Facts used | Rule | Proposed category | Proposed priority | Proposed next step | Status |
   |---|---|---|---|---|---|---|

6. Do not assign a person, send a notification, change a status, or create a
   follow-up item until the user reviews the full proposed change set and gives
   explicit confirmation. Recheck host support and permissions at that point.

## Safe outcomes

- `NEEDS INPUT`: intake facts, list selection, or required routing fields are
  absent.
- `NOT SUPPORTED`: the current SharePoint Copilot surface cannot read the
  request data or perform the proposed operation.
- `INSUFFICIENT PERMISSION`: the current user cannot access the list or make a
  confirmed update.

## Boundaries

- Do not make eligibility, legal, employment, security, or entitlement
  decisions unless the user supplies an approved rule and owner.
- Do not infer an assignee from a name, title, historical record, or workload.
- Do not connect to mail, Teams, ticketing, or any external system.
- Do not claim a notification was sent or a workflow was triggered.

## Validation

Read `evals/evals.json` for analytical normal, missing-rule, and update-boundary
cases. No version 1.0.0 run has validated host discovery or execution.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
