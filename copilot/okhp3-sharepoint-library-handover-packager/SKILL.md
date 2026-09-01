---
name: okhp3-sharepoint-library-handover-packager
description: >
  Prepare a reviewable handover inventory from selected SharePoint library
  files, with coverage gaps, ownership questions, and a proposed package
  manifest. Use when project documents need a controlled handover draft before
  copies, folders, permissions, or links are created or changed.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only project-document handover inventories and proposed manifests."
  out_of_scope: "Copying, moving, sharing, permission changes, or release approval."
---

# okhp3-sharepoint-library-handover-packager

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Scope

Prepare a source-grounded handover draft from a selected SharePoint project
library. The result inventories candidate files, maps them to an owner-supplied
handover checklist, flags gaps and access questions, and never creates a copy
or changes sharing on its own.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | A named project library, selected files, and an owner-supplied handover checklist |
| Portable core | Inventory, checklist mapping, gap analysis, manifest drafting, and review gate |
| Host adapter | Reads accessible library files and metadata through supported native capability |
| Mutation | Read-only. Copy, move, rename, share, or permission changes require a separately reviewed exact action set and explicit confirmation. |
| Evidence | Analytical package design only. No live packaging or sharing result has run. |

## Procedure

1. Confirm the target library, selected files or scope, handover recipient,
   checklist, expected ownership, and retention or access boundary.
2. Inventory only accessible in-scope files. Record filename, available version
   or date, stated owner, purpose, and access limitation without inferring a
   missing document from a project name.
3. Map each checklist requirement to `PRESENT`, `PARTIAL`, `MISSING`,
   `NEEDS OWNER REVIEW`, or `INSUFFICIENT PERMISSION`.
4. Return this proposed manifest:

   | Checklist item | Candidate file | Evidence | Coverage | Owner question | Proposed handover action |
   |---|---|---|---|---|---|

5. Validate that every `PRESENT` or `PARTIAL` determination names supporting
   evidence, and that every missing item is separated from inaccessible content.
6. If the user asks to package, copy, move, share, or change permissions, show
   the exact source, destination, recipients, and overwrite or recovery risk.
   Require explicit confirmation immediately before any supported operation and
   recheck current-user permissions.

## Safe outcomes

- `NEEDS INPUT`: the library, recipient, checklist, or ownership boundary is
  missing.
- `NOT SUPPORTED`: the host cannot inspect the required files or perform the
  requested confirmed operation.
- `INSUFFICIENT PERMISSION`: the user cannot access a candidate file or lacks
  permission for a confirmed sharing or file operation.

## Boundaries

- Do not copy, rename, move, delete, share, or change permissions by default.
- Do not assume that a file is current, approved, or safe to distribute from
  its name alone.
- Do not bypass sensitivity labels, retention, or file and site permissions.
- Do not create external links, emails, or notifications.

## Validation

Use `evals/evals.json` to validate a complete draft, an incomplete checklist,
and the copy-and-share confirmation boundary. No live packaging evidence exists
for version 1.0.0.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
