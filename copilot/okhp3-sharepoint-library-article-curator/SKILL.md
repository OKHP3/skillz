---
name: okhp3-sharepoint-library-article-curator
description: >
  Curate selected SharePoint document-library articles into a reviewable
  collection with titles, summaries, categories, and duplicate signals. Use
  when a knowledge library needs consistent article recommendations before any
  file or metadata change. Do not use to publish, move, rename, or alter files silently.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Reviewable curation drafts for selected SharePoint library articles."
  out_of_scope: "Unapproved file moves, publication, external research, or custom code."
---

# okhp3-sharepoint-library-article-curator

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Scope

Create a curation draft for selected or named articles in one SharePoint
document library. The draft identifies a candidate title, summary, category,
audience, related-content signal, and missing information without changing the
source files or library structure.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | A named document library and files accessible to the current user |
| Portable core | Article analysis, collection logic, duplicate signaling, and review table |
| Host adapter | Reads selected files and library context only when the native surface supports it |
| Mutation | Draft only. Any metadata update, rename, move, or publication requires an exact proposed-change review and explicit confirmation. |
| Evidence | Analytical package design only. No live SharePoint discovery or file-operation result has run. |

Copilot in SharePoint uses native capabilities available on the site. It cannot
execute custom code or connect to external systems, and it cannot expand the
current user's permissions.

## Procedure

1. Confirm the target library, selected files or review scope, intended
   audience, taxonomy, publication boundary, and whether the result is a draft
   or a request for a separately confirmed supported update.
2. Read the available file content and library metadata. Record files that are
   inaccessible, unreadable, or outside scope.
3. For each in-scope file, create only evidence-supported recommendations for
   title, summary, topic, audience, and related-content signal. Preserve the
   existing value when the source does not support a proposed replacement.
4. Treat title or subject similarity as `DUPLICATE_CANDIDATE`, never as a
   deletion, merge, or canonical-source decision.
5. Return this curation draft:

   | File | Current metadata | Proposed curation | Evidence | Status | Review needed |
   |---|---|---|---|---|---|

6. Validate that every proposed field has source evidence and every uncertain
   recommendation is marked `NEEDS INPUT`.
7. If asked to apply changes, list every target file and field, ask for
   explicit confirmation, then verify supported host capability and current-user
   permission before requesting a write.

## Safe outcomes

- `NEEDS INPUT`: the library, file selection, taxonomy, audience, or
  publication rule is missing.
- `NOT SUPPORTED`: the host cannot inspect the required file content or perform
  the requested confirmed action.
- `INSUFFICIENT PERMISSION`: the user cannot read a selected file or lacks
  permission for a confirmed update.

## Boundaries

- Do not claim an article is authoritative without an owner-supplied rule.
- Do not create folders, edit documents, alter labels, or publish content.
- Do not use a community `SHAREPOINT.md` convention as a guaranteed host tool.

## Validation

Use `evals/evals.json` to validate the analytical normal path, missing
taxonomy, and unconfirmed-mutation boundaries. A passing structural check does
not prove skill discovery or runtime behavior in this preview host.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
