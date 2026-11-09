# LinkedIn DM reconciliation: candidate and release review

Decision: `approve-with-limits`, version 1.0.1, for supervised source
distribution. Contract maturity: `draftable`. Evidence: analytical.

## Why these are skill candidates

| Candidate | Repeatable knowledge and outcome | Decision |
|---|---|---|
| Bidirectional notification/DM reconciliation | Incoming email omits outbound platform replies. An event/request ledger, coverage boundaries and identity crosswalks produce an evidence-grounded next-action brief. | Publish `social-posting/okhp3-linkedin-dm-reconcile` as the portable core and mirror it into Resume Representative. |
| Recruiter and application milestone reconciliation | A sent résumé, permission to forward, client presentation and employer application need separate evidence. | Reuse AskJamie `okhp3-application-status-reconciliation`; do not create a second tracker. |
| Evidence-qualified career addendum | A targeted question can require more depth than a résumé provides, without overstating evaluation as production ownership. | Existing Skillz PR 221 owns the addendum candidate. Keep that work separate instead of duplicating it. |
| General thread completion and archive | Context coverage, preservation, implementation and archival are distinct gates. | Reuse context-extraction, handoff and validation contracts. The demonstrated DM workflow does not justify blanket archival, merge or deletion authority. |

These candidates have repeatable inputs, non-obvious decision rules, observable
outputs and failure boundaries. The new package captures the missing method;
it does not embed the source thread's people, companies or private messages.

## Equilibrium review

Three separated roles reviewed the frozen seven-file 1.0.0 candidate:
evidence rejected unsupported next-response ownership, outcome approved the
bounded method with limits, and safety rejected public-neutrality and metadata
typing conflicts. The findings materially disagreed, so the protocol routed
to a negotiator. A disruptor was not invoked ceremonially.

The corrected 1.0.1:

- Assigns owed actions only from an open request or explicit commitment.
  A fulfilled request alone creates no new contact obligation.
- Keeps inferred client dependencies separate from promises and deadlines.
- Grounds the worked example's estimate in its actual synthetic input.
- Uses string-valued metadata and neutral attribution for this new original
  work; existing repository license notices remain unchanged.
- Retains explicit access, privacy, untrusted-input and denied-operation stops.

Evidence and safety reviewers verified their targeted corrections against
refrozen hashes. A separated negotiator independently verified the logical
distinction and destination equality, then approved supervised source
distribution with limits. The public-neutral [review receipt](../../social-posting/okhp3-linkedin-dm-reconcile/evals/review-1.0.1.json)
records the bounded decision. Shared model family and sources limit reviewer
independence; this is not a live quality benchmark.

## Evaluation and integration

The package contains 16 synthetic author-visible development cases and 20
discovery-query expectations. The cases cover delayed notification, blocked
outbound access, multiple people/roles/requests, promises versus attachments,
onward-submission uncertainty, coarse timestamps, stale captures, ambiguous
duplicates, edits, wrong accounts, injected instructions, scope expansion,
denied access and fulfilled requests without promised follow-up.

Strict structure, YAML-aware metadata, relative references, privacy-neutral
fixtures and complete mirror equality are verified separately from outcome
claims. See the [complete inventory and synchronization record](linkedin-dm-sync.json).
The mirror belongs under AskJamie
`capabilities/resume-representative/skills/okhp3-linkedin-dm-reconcile`.
Neither core copy has a host adapter or scheduler.

The adjacent `okhp3-linkedin-inbox-triage` classifies inbox replies and proposes
drafts. This core establishes the current conversation/request facts before
triage or drafting. It can also run on supplied captures without inbox access.

No matched live benchmark, measured discovery precision/recall, external
unseen holdout, live LinkedIn/mail acceptance or unattended-monitoring result
has been completed. Source publication and structural checks do not imply
those outcomes or the repository's `published` maturity label.

## Source and review provenance

The current user request authorized skill extraction, equilibrium review and
publication. The thread retrospective supplied the abstract source-asymmetry
failure. Only the method was retained publicly. Review policy came from
`universal/okhp3-equilibrium-review` 1.0.1 and authoring policy from
`universal/okhp3-skill-foundry` 3.1.1, inspected 2026-11-09.

Repository comparison began at Skillz
`1038229118c00a86ff67010c6d68ae84975a5cf2` and AskJamie
`3ee8596f5f810347ae936b3dc9297f40c2b8b9c1`. Before copying, isolated task
branches fast-forwarded to the clean bases recorded in the sync manifest,
preserving newly integrated adjacent skills. No other worker's branch or
historical capability source was modified.
