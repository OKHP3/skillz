---
name: okhp3-sharepoint-library-taxonomy-drift-report
description: >
  Compare a SharePoint library's accessible tags, folders, and views with a
  supplied information architecture and report drift. Use when ad hoc uploads
  make a library harder to navigate. Do not use to rename, move, or retag files automatically.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only taxonomy-drift reporting for named SharePoint libraries."
  out_of_scope: "Automatic reorganization, taxonomy invention, or unapproved metadata changes."
---

# okhp3-sharepoint-library-taxonomy-drift-report

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Produce a traceable report comparing observed library organization to supplied
information architecture, with drift findings and owner-reviewable remediation.

## Scope

Use only for a named library and a declared taxonomy, folder, metadata, or view
standard. It reports divergence; it does not redesign the information
architecture or change content.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Accessible library metadata, folders, and views when exposed |
| Portable core | Standard comparison, drift classification, and remediation reporting |
| Host adapter | Reads only native capability and current-user-permitted information |
| Mutation | No reorganization or metadata update without an exact confirmed supported action |
| Evidence | Analytical design only; no live taxonomy comparison has occurred |

## Procedure

1. Confirm the target library, declared information architecture, scope, and
   accountable owner for taxonomy decisions.
2. Inspect accessible tags, folders, content types, and views only when the
   host exposes them. Record unavailable surfaces as `NOT INSPECTED`.
3. Classify findings as `MISSING_TAXONOMY_VALUE`, `UNAPPROVED_VALUE`,
   `FOLDER_DRIFT`, `VIEW_DRIFT`, `NEEDS STANDARD`, or `NOT INSPECTED`.
4. Return this report:

   | Surface | Expected standard | Observed state | Drift finding | Visitor impact | Proposed owner action |
   |---|---|---|---|---|---|

5. Validate that every finding compares an observed state with a supplied
   standard, not a preference inferred by the skill.
6. For requested corrections, show the exact move, metadata, or view change
   and require explicit confirmation plus supported capability and permission.

## Safe outcomes

- `NEEDS INPUT`: target library, information architecture, scope, or owner is missing.
- `NOT SUPPORTED`: the host cannot inspect the needed surface or perform a requested action.
- `INSUFFICIENT PERMISSION`: the user cannot access the library or change its organization.

## Boundaries

- Do not invent taxonomy values, design a new architecture, or infer policy.
- Do not alter folders, tags, views, content types, or files by default.
- Do not use external systems or custom code.

## Validation

Read `evals/evals.json` for analytical comparison, missing-standard, and
reorganization-boundary cases. Version 1.0.0 has no live host evidence.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
