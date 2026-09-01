---
name: okhp3-sharepoint-list-duplicate-record-review
description: >
  Identify and explain likely duplicate SharePoint List records using supplied
  matching rules. Use when a list owner needs a review queue of duplicate
  candidates without merging, deleting, or overwriting records. Do not use to
  treat similar titles as confirmed duplicates.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only duplicate-candidate analysis for SharePoint List items."
  out_of_scope: "Automatic merge, deletion, canonical-record selection, or unapproved writes."
---

# okhp3-sharepoint-list-duplicate-record-review

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Scope

Create a review queue of duplicate candidates from one List using an
owner-supplied key or matching rule. Similarity is evidence for review, never
authority to merge or delete.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Portable core | Rule-led matching, evidence display, and owner decision queue |
| Host adapter | Reads only accessible List fields and items |
| Mutation | Read-only. Any merge or cleanup is a separate confirmed operation. |
| Evidence | Analytical design only. No live duplicate run has occurred. |

## Procedure

1. Confirm the List, candidate scope, matching keys, authoritative duplicate
   rule, and record owner.
2. Compare only fields permitted by the rule. State unavailable fields and do
   not substitute an unapproved proxy.
3. Return:

   | Candidate pair or group | Matching fields | Conflicting fields | Rule | Confidence note | Owner decision needed |
   |---|---|---|---|---|---|

4. Label every result `DUPLICATE_CANDIDATE`. Only an exact owner-supplied key
   may support a stronger finding, and still does not authorize cleanup.
5. Validate each candidate against shown field values and the supplied rule.

## Safe outcomes

- `NEEDS INPUT`: List, candidate scope, matching rule, or owner is missing.
- `NOT SUPPORTED`: needed matching fields are unavailable to the host.
- `INSUFFICIENT PERMISSION`: inaccessible items prevent the requested review.

## Boundaries

- Do not merge, delete, overwrite, or choose a canonical record.
- Do not claim completeness beyond accessible items and stated scope.
- Do not infer identity from a person name, email, or similar label.

## Validation

Use `evals/evals.json` to validate exact-rule matching, ambiguous similarity,
and cleanup refusal. This package has no live host evidence.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
