# Proof brief contract

## Private claim ledger

Record the intended audience, surface, purpose, candidate revision, and any
relevant time window or retrieval time. Use the following row contract. A
reference is a supplied locator plus the smallest evidence excerpt or
description needed for review. Where disclosure is uncertain, keep the
diagnostic at category level.

| Field | Contents |
| --- | --- |
| Claim ID | Local neutral identifier, such as C01 |
| Proposed claim | One concrete proposition, split if it combines evidence layers |
| Evidence | Source reference and availability; exact revision and observation scope |
| Basis | Directly observed, source-reported, historical, planned, or unknown/conflicted |
| Layer | Source change, validation, deployment, live behavior, owner acceptance, or comparison |
| Disclosure | Allowed for this audience/surface, restricted, or unknown; with basis |
| Disposition | Include, qualify, or withhold; state why and name the next decisive check |

Direct observation means a recorded check of the named layer and revision.
Reading a test report is observation of the report; the test itself is
source-reported unless independently executed. Historical means a different
revision or window, regardless of whether the result was directly observed.
Where both apply, retain both qualifiers. An unavailable original cannot
support a claim that it was inspected; a separately available summary may
support a claim about what that summary says if disclosure allows.

## Comparisons

Before comparing with and without a change, establish the treatment revision,
what the baseline excluded, isolation from treatment outputs, identical case
set, scoring criteria and denominator, comparable execution conditions, and
sample count per arm. If these are not established, mark the comparison
inconclusive; even the same denominator does not establish the same cases or
rubric. Do not report a difference as improvement, regression, cost saving,
or causal effect. Separate unrelated deterministic guard checks from behavioral
scores.

For established matched observations, report both counts and the test scope,
including material grading, sample, or host limits. Equal observed scores
show no measured gain on that comparison; they do not show no value. Unequal
observed scores support the measured difference for that comparison only, not
general efficacy, causal improvement, future performance, or production
readiness. Do not describe author-visible development cases as an unseen holdout.

## Candidate fact packet

Use two clearly separated artifacts. The candidate contains only the following:

- A fixed label: **Candidate facts for drafting review**.
- Audience/surface scope in neutral terms, only where shareable.
- A short list of supported claim statements with their material qualifiers
  inline. Include a locator only if its destination is affirmatively shareable
  and the statement remains accurate with it.

No copied private evidence, restricted filenames, quoted withholding reasons,
unapproved identities, embedded links, or inherited metadata. A link needs
its own disclosure check; link appearance is not authorization. Do not assume
that anonymizing a restricted fact permits disclosure. No binary assets or
linked-page contents are cleared by a text-only review. Do not reproduce
withheld values in the diagnostic.

Keep evidence locators, decision history, and blocker reasons in the private
ledger. If the candidate is empty, keep the label and no claim text. Preserve
the exact reviewed wording as a candidate revision when the host supports it.
Downstream drafting and edits can introduce new claims, so recheck the changed
text and use the downstream approval process before any publication action.

## Worked example

A synthetic packet for a public progress update contains a build receipt for
revision B, an older live readback for revision A, a proposed rollout, and
one matched run per arm with identical scoring (8 of 10 in both). Only the
build receipt and comparison summary may be discussed externally.

- Ledger: include the bounded build check; withhold current deployment (the
  only live check is historical); keep the rollout planned; qualify the
  comparison by scope and its equal scores.
- Candidate: "The revision B build check passed. On the supplied ten-case
  comparison, both configurations met 8 of 10 checks in one run each. The
  comparison showed no measured gain on those cases."

No completion, live deployment, or acceptance is implied.
