---
name: okhp3-sharepoint-library-accessibility-review
description: >
  Review selected SharePoint library documents for supplied accessibility and
  structure checks, then return an evidence-led remediation draft. Use when
  document visitors need more usable content. Do not use to certify accessibility or alter files automatically.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: copilot
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Read-only accessibility and document-structure review drafts for selected library files."
  out_of_scope: "Accessibility certification, automatic remediation, or replacement of specialist review."
---

# okhp3-sharepoint-library-accessibility-review

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Outcome

Return a reviewable, evidence-led accessibility and structure report that
identifies visible document gaps without claiming formal conformance.

## Scope

Use for selected accessible files and supplied review checks such as headings,
titles, attachment descriptions, or document structure. It supports triage,
not a legal or technical accessibility certification.

## Host contract

| Item | Contract |
|---|---|
| Target host | Copilot in SharePoint, preview support status |
| Native surface | Selected readable documents and accessible metadata |
| Portable core | Checklist application, evidence capture, gap prioritization, and remediation draft |
| Host adapter | Reads only the structures exposed through native capability and existing permission |
| Mutation | Read-only by default; corrections require review, explicit confirmation, and a supported action |
| Evidence | Analytical design only; no live accessibility audit has occurred |

## Procedure

1. Confirm selected files, intended audience, supplied checks, and the reviewer
   responsible for remediation decisions.
2. Inspect only supported, readable structures and record inaccessible formats
   as `NOT INSPECTED` rather than a conformance failure.
3. Classify findings as `STRUCTURE_GAP`, `METADATA_GAP`, `ATTACHMENT_GAP`,
   `NEEDS SPECIALIST REVIEW`, or `NOT INSPECTED`.
4. Return this report:

   | File | Check | Observed evidence | Finding | Visitor impact | Proposed remediation owner |
   |---|---|---|---|---|---|

5. Validate that each finding cites an observed check result and does not claim
   certification or full-document coverage beyond the inspected surface.
6. For requested corrections, show the proposed file changes and require
   explicit confirmation and current capability and permission checks.

## Safe outcomes

- `NEEDS INPUT`: selected files, review checks, audience, or reviewer are missing.
- `NOT SUPPORTED`: the host cannot inspect required structures or attachments.
- `INSUFFICIENT PERMISSION`: the user cannot read the selected files.

## Boundaries

- Do not certify accessibility, legal compliance, or assistive-technology behavior.
- Do not change document content, attachments, labels, or publishing state.
- Do not use custom code or external scanning tools.

## Validation

Read `evals/evals.json` for analytical normal, unsupported-format, and
automatic-remediation boundary cases. No live host evidence exists for version 1.0.0.

## References

- [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
