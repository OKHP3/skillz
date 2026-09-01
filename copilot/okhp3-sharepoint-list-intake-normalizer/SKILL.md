---
name: okhp3-sharepoint-list-intake-normalizer
description: >
  Normalize SharePoint List intake items into a reviewable, schema-aligned
  draft. Use when new list items need required-field checks, controlled-value
  mapping, duplicate flags, or consistent descriptions before they are saved.
  Do not use to invent missing facts or silently update list items.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Draft normalization and review of SharePoint List intake items."
  out_of_scope: "Unconfirmed writes, external lookups, custom code, or fabricated values."
---

# okhp3-sharepoint-list-intake-normalizer

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Produce a row-by-row intake normalization draft that preserves source values,
maps only against supplied list schema and controlled vocabularies, and makes
every missing fact or proposed update visible before any list write.

## Scope

Use only for selected SharePoint List intake items and supplied list rules. It
produces a reviewable normalization draft; it does not perform data stewardship
or apply item changes by default.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | A named SharePoint List and optionally selected intake items |
| Portable core | Field mapping, completeness checks, duplicate signals, and a review table |
| Host adapter | Read list schema and items only when that capability is available to the current user |
| Mutation | Never write by default. Require an item-by-item proposed-change review and explicit confirmation immediately before a supported write. |
| Evidence | Analytical package design only. No SharePoint tenant or discovery test has run. |

Copilot in SharePoint can interact with list content only through the native
capabilities available on the current site. It cannot execute custom code or
connect to external systems. Respect existing permissions.

## Procedure

1. Confirm the target list, the items or intake source to review, and whether
   the user wants a draft only or to request a supported update after review.
2. Read the actual list schema when available. Capture display names, internal
   names if shown, required fields, allowed values, and duplicate keys. Do not
   guess a field from a similar list.
3. For each item, preserve the original value, then classify each field as:
   `UNCHANGED`, `NORMALIZED`, `NEEDS INPUT`, `NOT SUPPORTED`, or
   `INSUFFICIENT PERMISSION`.
4. Normalize only deterministic formatting and mappings that are explicitly
   supplied by the schema or user rules. Keep unmapped text unchanged and flag
   it instead of inventing a controlled value.
5. Check required fields, obvious duplicate keys, and conflicting values. A
   duplicate signal is a review finding, not permission to merge or delete.
6. Return the draft using this table:

   | Item | Field | Source value | Proposed value | Status | Reason | Write requested |
   |---|---|---|---|---|---|---|

7. If the user asks to apply changes, show the exact item and field updates,
   ask for explicit confirmation, then verify that the host exposes a supported
   write action and that the current user has permission. If either check fails,
   return the applicable safe outcome without attempting a write.

## Safe outcomes

- `NEEDS INPUT`: list identity, source items, required mapping rules, or a
  required value is missing.
- `NOT SUPPORTED`: the current SharePoint Copilot surface cannot read the
  needed schema or perform the requested operation.
- `INSUFFICIENT PERMISSION`: the current user cannot read the list or lacks
  permission for a confirmed update.

## Boundaries

- Do not create lists, columns, views, rules, or external integrations.
- Do not replace a data steward's duplicate-resolution decision.
- Do not silently write, delete, merge, assign ownership, or change status.
- Do not treat `SHAREPOINT.md` or a community tool name as a guaranteed native
  capability.

## Validation

Read `evals/evals.json` for the analytical normal-path, missing-input, and
mutation-boundary cases. A structural validation pass does not prove that this
preview host discovers or runs the skill.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
