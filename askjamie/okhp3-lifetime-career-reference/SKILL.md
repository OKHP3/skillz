---
name: okhp3-lifetime-career-reference
description: >
  Compile a private lifetime career reference or super master from an existing
  career claim ledger. Use for a detailed career biography, evidence bibliography,
  experience registers and lessons learned. Source ingestion and claim resolution
  remain upstream; job-specific resumes are separate.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: 0.2.0
  maturity: draftable
  category: career-operations
  origin: okhp3/askjamie-foundry
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "A source-linked lifetime reference and coverage manifest derived from an existing private career canon."
  out_of_scope: "A second source or claim ledger, unverified qualifications, public disclosure and application submission."
---

# okhp3-lifetime-career-reference

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

## Scope

Produce a comprehensive private career reference as a derived view over the
existing career canon. Preserve its claim IDs, source pointers, statuses,
restrictions and date semantics. Do not create another authoritative ledger.

Use the existing source-intake workflow for collecting new originals and the
career-evidence-canon workflow for resolving facts or corrections when those
capabilities are available. The portable core can consume supplied records with
equivalent fields; it does not require either sibling skill to be installed.
Without sufficient records, return a provisional outline and specific upstream
gaps instead of inventing a library or career history.

## Inputs and view contract

Identify the represented person, existing canon edition, selected records,
intended audience, desired formats and as-of date. Distinguish a retrospective
life history from what was knowable at a historical cutoff. Do not borrow the
requester's facts for a different subject or scan unrelated sources.

Read [the lifetime-view contract](references/lifetime-view.md) to select records,
structure the reference and record coverage. This package owns presentation,
selection and navigation, not source ingestion or a competing status vocabulary.

## Procedure

1. **Reuse the canon.** Inspect selected claim/source records and prior lifetime
   editions. Retain their evidence status, effective dates and recorded dates.
   Recheck only accessible cited passages needed for this view. Mark unavailable
   regions as coverage gaps. A folder listing, cloud placeholder or generated
   summary does not prove the underlying source was read. Never bypass denial.
2. **Plan the lifetime view.** Include owner-requested early work and college
   context, later roles, projects, capabilities, education, credentials, learning,
   stories and reflections where records support them. Keep private personal
   context in separately labeled optional sections. Length follows useful source
   coverage; a detailed reference is not constrained to application-resume length
   and must not be padded to reach an arbitrary page count.
3. **Write with traceability.** Link factual passages to existing claim IDs and
   bibliography entries. Preserve partial dates, concurrent work, legal versus
   functional titles and actual personal contribution. Carry conflicts and
   qualification gaps visibly. Do not turn a source assertion into independent
   verification, a target role into a past job, a learning activity into a
   completed course, or a credential listing into a current certification.
4. **Separate reflection from fact.** Attribute owner recollections, lessons and
   interpretations. New source material or corrections discovered here become
   proposed upstream canon updates with their provenance; do not silently change
   the ledger from this workflow. AI prose and coach feedback are editorial
   suggestions, not corroboration. Keep unsupported metrics out of fact prose.
5. **Build navigable registers.** Provide the requested chronology, project and
   capability indexes, education/learning register, reusable story/claim index,
   open questions and source bibliography. Distinguish record counts from
   distinct jobs, titles, current credentials and completed training. State the
   denominator and coverage of every reported count. The reference can be used
   to select material for role masters; it is not itself a resume to submit.
6. **Validate the view.** Check every factual passage against its cited claim
   and restrictions, dates against the selected temporal view, references against
   selected source records and counts against actual included entries. Compare
   requested formats for text parity. Use available document tooling for genuine
   DOCX output and inspect rendered pages when rendering exists. If a format or
   check is unavailable, state produced versus not-run without fabricating it.

## Save and handoff

The lifetime reference is private by default. Before an authorized save, verify
exact destination identity, effective audience and whether creating or updating.
An owner's cloud folder can have anonymous/inherited sharing. Unknown or broader
sharing blocks that save; keep a draft only in an already authorized private
workspace or conversation and identify the placement gap. Do not change sharing.

Use create-if-absent for new files. Updating a derived view requires authority
for the exact existing item, a current version check and preservation of its
prior edition. If the host cannot prevent collision or stale updates, stop the
write and return the draft. After an uncertain save, inspect the exact target
before retrying; unavailable readback leaves the outcome unverified and blocks
blind retry. A successful save needs readback. Preserve original source bytes.

Use stable source IDs and ordinary token-free links/locators. Never copy signed
download URLs, activation tokens, meeting passcodes or other bearer credentials
into the reference, bibliography or receipts, even when private. If no safe
locator exists, point to the original system without copying the secret.

Return the lifetime reference, view manifest, selected coverage, unresolved
questions and any proposed upstream corrections. Keep local content, cloud
availability, byte equality and synchronization as separate observations.
Sharing a short resume never includes this lifetime reference by implication.
Stop when the requested view is complete or its gaps are explicitly bounded.

See author-visible [development cases](evals/evals.json) and
[discovery cases](evals/discovery.json). This source package makes no measured
uplift, universal host or independently verified qualification claim.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
