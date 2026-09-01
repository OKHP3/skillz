---
name: okhp3-sharepoint-list-meeting-actions
description: >
  Turn supplied meeting notes into a reviewable SharePoint List action draft.
  Use when decisions, owners, due dates, and follow-up actions need consistent
  fields and duplicate checks before list items are created or updated. Do not
  use to infer commitments, assign people, or write action records without confirmation.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Drafting SharePoint List meeting-action records from supplied notes."
  out_of_scope: "Recording inferred commitments, automatic notifications, or unapproved list writes."
---

# okhp3-sharepoint-list-meeting-actions

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Create a reviewable action-register draft from supplied meeting notes and a
named SharePoint List schema. Each proposed item preserves the supporting note,
separates confirmed commitments from ambiguity, and prevents an accidental
write or notification.

## Scope

Use only for a supplied meeting record and a named SharePoint action List. It
produces a reviewable action-log draft and excludes creating notifications,
reminders, or unreviewed list items.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Supplied meeting notes plus an accessible action List and its schema |
| Portable core | Commitment extraction, field mapping, ambiguity handling, and duplicate checks |
| Host adapter | Reads a SharePoint action List only when native capability and permission are available |
| Mutation | No list item is created or changed until the user confirms the complete proposed item set. |
| Evidence | Analytical package design only. No live List creation, update, or notification test has run. |

## Procedure

1. Confirm the meeting-notes source, target action List, required fields,
   date convention, duplicate key, and which participant can confirm owners
   and commitments.
2. Extract only explicit commitments, decisions, risks, and due dates. Quote or
   paraphrase the supporting note in a `Source evidence` field.
3. For missing owner, due date, or action wording, retain the candidate item
   with `NEEDS INPUT`. Do not infer a person from attendance or a due date from
   meeting cadence.
4. When available, read existing List items only to flag a potential duplicate.
   Never overwrite a record based on title similarity alone.
5. Return this draft:

   | Action | Owner | Due date | Status | Source evidence | Duplicate signal | Review state |
   |---|---|---|---|---|---|---|

6. Show the complete list of proposed new or changed items. Create or update
   them only after explicit confirmation and only when the host supports the
   action for the current user's permissions.
7. Do not send emails, Teams messages, reminders, or other external follow-up.
   Those are separate user-approved actions outside this skill.
8. Before handoff, validate that every candidate action has source evidence and
   that every missing owner, date, or wording remains visible as `NEEDS INPUT`.

## Safe outcomes

- `NEEDS INPUT`: notes, list identity, a required commitment field, or a
  confirmation owner is missing.
- `NOT SUPPORTED`: the host cannot read the needed List schema or perform the
  requested create or update operation.
- `INSUFFICIENT PERMISSION`: the current user cannot access or update the List.

## Boundaries

- Do not represent discussion, suggestion, or dissent as a commitment.
- Do not assign accountability or deadlines without explicit source evidence.
- Do not create hidden workflow items, notifications, or custom code.
- Do not claim that an action was saved until a supported confirmed write
  reports success.

## Validation

Read `evals/evals.json` for analytical normal, ambiguous-commitment, and
write-boundary cases. Version 1.0.0 has no live host evidence.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
