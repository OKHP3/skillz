---
name: okhp3-sharepoint-library-metadata-review
description: >
  Review SharePoint document-library metadata for completeness, controlled-value
  conformance, and inconsistent records. Use when a library owner needs a
  traceable exception report and proposed fixes before any metadata update.
  Do not use to silently edit files, fields, or library settings.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only completeness and consistency review of document-library metadata."
  out_of_scope: "Automatic repair, taxonomy invention, library configuration, or external enrichment."
---

# okhp3-sharepoint-library-metadata-review

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Scope

Inspect an accessible SharePoint document library against the supplied metadata
schema and quality rules. Produce a prioritized, item-level exception report
and a separate proposed-change set without altering metadata.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | A document library, its exposed schema, and items accessible to the current user |
| Portable core | Schema comparison, exception classification, prioritization, and remediation draft |
| Host adapter | Reads metadata only through current supported native SharePoint capabilities |
| Mutation | Read-only review. A metadata update requires exact target-value review and explicit confirmation. |
| Evidence | Analytical package design only. No live library metadata review has run. |

## Procedure

1. Confirm the library, review population, authoritative fields, required
   values, controlled vocabularies, and any governance owner.
2. Read the available schema and items. State the fields and files excluded by
   capability or permission limits.
3. Check only supplied or schema-derived rules. Classify an exception as
   `MISSING_REQUIRED_VALUE`, `INVALID_CONTROLLED_VALUE`,
   `INCONSISTENT_FORMAT`, `STALE_METADATA`, `DUPLICATE_CANDIDATE`, or
   `NEEDS RULE`.
4. Never infer metadata just because a filename or file body appears similar.
   Offer a suggestion only when the source supports it and mark it proposed.
5. Return this report:

   | Priority | File | Field or rule | Observed value | Finding | Evidence | Proposed owner action |
   |---|---|---|---|---|---|---|

6. Validate that each finding is tied to an observed field or supplied rule.
   Keep unverified interpretations outside the proposed-change set.
7. If remediation is requested, enumerate every file and field value, ask for
   explicit confirmation, then verify host support and current-user permission
   before a supported update.

## Priority defaults

| Priority | Meaning |
|---|---|
| `P1` | A required metadata or classification gap prevents safe use or retrieval. |
| `P2` | A controlled-value, duplicate, or lifecycle finding needs owner review. |
| `P3` | A presentation or consistency issue can wait without changing meaning. |

## Safe outcomes

- `NEEDS INPUT`: list of required fields, library identity, or quality rules is
  missing.
- `NOT SUPPORTED`: the host cannot inspect the needed metadata or perform the
  requested confirmed operation.
- `INSUFFICIENT PERMISSION`: the user lacks access to the library or update
  permission for a confirmed change.

## Boundaries

- Do not alter library columns, views, folders, retention, labels, or file
  content.
- Do not claim an exhaustive result beyond the inspected accessible items.
- Do not bypass item-level, library, or site permissions.

## Validation

Use `evals/evals.json` to validate analytical normal, missing-rule, and repair
request boundaries. No live runtime or tenant evidence exists for version 1.0.0.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
