# Reconciliation record

Return one run record in the authorized handoff. Save it separately only when
the user has authorized that storage destination. Keep sensitive locators
within approved audiences. Redact or omit any field beyond the recipient’s
permitted disclosure scope, including account, query, and record identifiers.
Public examples use synthetic data.

| Section | Minimum fields |
|---|---|
| Scope | Mode, review time, acting account, explicit source scope, lower bound, exclusive upper bound, time zone, and authorized destinations and operations |
| Coverage | Per-source account and folder, query or supplied excerpt, time bounds, pages or export completeness, checked-at time, result count, and terminal, partial, blocked, or unsearched state |
| Source event | Stable source key, source type, effective event time, observed time, direction or state, and safe locator |
| Follow-up | Existing row ID, required action, position or case key when applicable, candidate evidence keys, supported claim, decision, and next check and owner |
| Delta | Destination ID and row or event key, old and proposed value, guards, action taken, readback, and verification status |
| Checkpoint | Last verified contiguous boundary per source, account, folder or calendar, and query scope, plus any pending dependent write |

An email key combines source and mailbox with the returned stable message ID.
If the connector exposes only mutable IDs, use its supported immutable ID or a
verified stable crosswalk. A calendar occurrence uses account and calendar
scope, a stable event or series ID, and the original recurrence start. Keep the
current scheduled time separately when it moves. Outbound calendar responses
can be separate mail events linked to one occurrence. For other channels, use
account, source, and a stable object ID or direct permalink. If an identity
cannot be stabilized, keep the proposed event out of automatic inserts.

Match an existing position by the authoritative employer and requisition, or
an exact platform and posting ID where appropriate. A recruiter-only lead
without a verified crosswalk can retain its own case key. A shared title,
employer, or recruiter alone does not join cases. Store independent source
events and candidate decisions separately, even when represented in one
destination. An authorized existing case need not have a known requisition
for review if its own identity is clear.

## Worked example

Three synthetic follow-ups in one mailbox export cover a completed outbound
action, a pending external result, and an unrelated same-subject email.

| Existing row | Required action | Evidence | Decision |
|---|---|---|---|
| F-101 | Send the requested portfolio to the recruiter for opening R-7 | Sent item S-1 matches the account, contact, thread, opening, and attachment name | Record transmission of the named attachment. Add its exact source key to F-101. Mark the action complete only if authorized and the criterion is transmission. |
| F-102 | Confirm the recruiter received the portfolio for R-7 | S-1 establishes sending. The supplied inbox has no matching acknowledgment. | Keep awaiting response. Record the checked inbox scope. Check later for an exact acknowledgment. |
| F-103 | Reply about interview availability for opening R-8 | S-2 has the same subject as the request but goes to a different recipient about R-9. | Leave open. Record the rejected match and check the exact thread or another authorized channel. |

A scheduled calendar occurrence for R-7 may be accepted even when the
meeting's actual attendance is unknown. A later direct recap can establish
attendance. Store these as separate claims.

If S-1 was already linked to F-101, the next run should propose no duplicate
note or row. If the prior mutation timed out and readback is blocked, record
the uncertain attempt and keep its dependent checkpoint pending.
