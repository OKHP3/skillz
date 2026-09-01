---
name: okhp3-sharepoint-library-document-quality-gate
description: >
  Check selected SharePoint library documents against supplied minimum quality
  rules for naming, sections, dates, ownership, and template markers. Use when
  a library needs a reviewable publication-quality report. Do not use to certify or edit documents automatically.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only minimum-quality reviews for selected SharePoint library documents."
  out_of_scope: "Automatic certification, revision, publication, or external validation."
---

# okhp3-sharepoint-library-document-quality-gate

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Produce a traceable quality-gate report showing whether each selected document
meets supplied minimum rules and which owner decision is needed for every gap.

## Scope

Use for read-only review of selected files and explicit document standards. It
does not infer mandatory sections or approve publication.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Selected documents and accessible library metadata |
| Portable core | Rule checks, evidence capture, gap classification, and owner-ready reporting |
| Host adapter | Reads available document content only through native capability and existing permission |
| Mutation | Read-only; corrections are a separately reviewed and confirmed action |
| Evidence | Analytical design only; no live quality-gate run has occurred |

## Procedure

1. Confirm selected documents, their intended audience, and the authoritative
   quality rules: naming, required sections, dates, owner, template, or version.
2. Inspect only readable content and metadata. State which checks could not be
   performed rather than treating an inaccessible field as a failure.
3. Classify each rule as `PASS`, `GAP`, `NEEDS STANDARD`, or `NOT INSPECTED`.
4. Return this report:

   | Document | Rule | Observed evidence | Result | Impact | Proposed owner action |
   |---|---|---|---|---|---|

5. Validate that every `PASS` has observed evidence and every `GAP` names the
   supplied standard it misses.
6. If a revision is requested, prepare a proposed change list only; do not edit
   or publish until explicit confirmation and a supported host action exist.

## Safe outcomes

- `NEEDS INPUT`: the quality standard, target documents, or intended audience
  is absent.
- `NOT SUPPORTED`: the host cannot inspect required file content or metadata.
- `INSUFFICIENT PERMISSION`: the user cannot read the selected documents.

## Boundaries

- Do not claim a document is compliant beyond the supplied rules and inspected evidence.
- Do not create templates, alter documents, publish content, or change approvals.
- Do not use external systems or custom code.

## Validation

Read `evals/evals.json` for analytical normal, missing-standard, and
revision-boundary cases. No live host result exists for version 1.0.0.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
