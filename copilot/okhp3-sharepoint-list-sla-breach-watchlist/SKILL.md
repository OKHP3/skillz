---
name: okhp3-sharepoint-list-sla-breach-watchlist
description: >
  Produce a SharePoint List SLA exception watchlist from supplied status,
  due-date, and service-target rules. Use when a team needs a current,
  evidence-led view of imminent or breached work. Do not use to invent SLA
  rules, alter service dates, send alerts, or change records.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only SLA exception watchlists from SharePoint List data."
  out_of_scope: "SLA policy decisions, alerts, automatic updates, or external workflow actions."
---

# okhp3-sharepoint-list-sla-breach-watchlist

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Scope

Produce a current exception watchlist from a named List using a supplied clock,
time zone, status mapping, due-date rule, and service-target definition.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Portable core | Rule-led status classification, timing calculation, and exception report |
| Host adapter | Reads accessible List data through current native capability |
| Mutation | Read-only. It never changes dates, status, ownership, or alerts. |
| Evidence | Analytical design only. No live scheduled or current-time run has occurred. |

## Procedure

1. Confirm List, review clock and time zone, applicable statuses, target rule,
   due-date field, and exception owner.
2. Inspect accessible items and calculate only from the supplied rule and clock.
   If a date or time zone is unavailable, use `NEEDS INPUT`.
3. Return:

   | Item | Current status | Due date | Rule | Exception state | Time remaining or overdue | Owner | Next review |
   |---|---|---|---|---|---|---|---|

4. Classify as `ON_TRACK`, `AT_RISK`, `BREACHED`, `EXCLUDED_BY_RULE`, or
   `NEEDS INPUT`. Validate each classification against shown inputs.

## Safe outcomes

- `NEEDS INPUT`: clock, time zone, status mapping, SLA rule, or due date is missing.
- `NOT SUPPORTED`: the host cannot read necessary List fields.
- `INSUFFICIENT PERMISSION`: the user cannot access required items.

## Boundaries

- Do not invent a service target or assume business-hour calendars.
- Do not send alerts, change status, or create follow-up tasks.
- Do not claim continuous monitoring or future notification.

## Validation

Use `evals/evals.json` to validate normal classification, missing-time handling,
and no-alert behavior. No live host or scheduler evidence exists.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
