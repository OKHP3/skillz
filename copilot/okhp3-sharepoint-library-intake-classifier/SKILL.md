---
name: okhp3-sharepoint-library-intake-classifier
description: >
  Classify selected SharePoint library files against an approved taxonomy and
  return confidence, exceptions, and a reviewable metadata draft. Use when new
  files need consistent filing guidance. Do not use to invent categories or silently move files.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Taxonomy-led classification drafts for selected SharePoint library files."
  out_of_scope: "Invented categories, automatic filing, external classification, or unapproved writes."
---

# okhp3-sharepoint-library-intake-classifier

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Return a file-by-file classification draft that maps only to the supplied
taxonomy, makes confidence and exceptions visible, and leaves every move or
metadata update for human review.

## Scope

Use for selected library files with an approved taxonomy and required metadata.
This skill recommends classifications; it does not create folders, move files,
or apply metadata by default.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Selected library files and accessible metadata |
| Portable core | Taxonomy matching, confidence explanation, exception routing, and review output |
| Host adapter | Reads file content and metadata only when native capability and user permission are available |
| Mutation | Show each proposed classification and require explicit confirmation before any supported change |
| Evidence | Analytical design only; no tenant discovery or classification run has occurred |

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

1. Confirm the target library, selected files, approved taxonomy, required
   metadata, and whether the user wants a draft only.
2. Read only accessible file names, metadata, and content needed for the
   supplied classification rules. Record unreadable content as a limitation.
3. Map each file to a supplied category only when the evidence supports it.
   Use `NEEDS INPUT` for missing facts and `EXCEPTION` for no valid category.
4. Return this review table:

   | File | Evidence used | Proposed category | Confidence | Exception or missing fact | Proposed metadata |
   |---|---|---|---|---|---|

5. Before handoff, verify every proposed category is in the supplied taxonomy
   and every low-confidence result has a reason.
6. For a requested change, show exact file, folder, and metadata actions; seek
   explicit confirmation and recheck host support and permission first.

## Safe outcomes

- `NEEDS INPUT`: the target library, taxonomy, required metadata, or selected
  files are missing.
- `NOT SUPPORTED`: the current SharePoint Copilot surface cannot inspect the
  required content or perform the proposed action.
- `INSUFFICIENT PERMISSION`: the user cannot access the selected files or make
  a confirmed change.

## Boundaries

- Do not invent a taxonomy category, retention label, or business owner.
- Do not move, rename, delete, or relabel files without review and confirmation.
- Do not use external classifiers, custom code, or hidden tools.

## Validation

Read `evals/evals.json` for analytical normal, exception, and mutation-boundary
cases. Version 1.0.0 has no live host evidence.

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
