# Private case record

Use only the fields needed by the current review. Store this filled record in
the established private destination, never in the public skill package.

## Identity and coverage

- `case_key`: acting account, conversation identity, opportunity/request key.
- `identity_basis`: exact identifiers or provisional match and unresolved gaps.
- `reviewed_at`: observation clock and timezone, or explicitly unknown.
- `source_coverage`: source/account/thread, requested window, checked window,
  pagination state, capture date, and checked/partial/blocked/unavailable status.
- `unchecked_intervals`: gaps that remain to be backfilled per source.

Do not advance a LinkedIn coverage cutoff because a mail search succeeded.
Discover late evidence with a source change/arrival cursor where available,
but order its meaning by effective event time. Without reliable change
tracking, recheck the agreed scope and qualify freshness. Preserve the previous
as-of observation; do not present it as current when access is unavailable.

## Event ledger

For each event record `event_key`, `case_key`, direction, author, source type,
private locator, displayed time, normalized time only when established, observed
time, substantive content or safe summary, and artifact indicator. Prefer a
stable platform message ID. Otherwise label a composite identity provisional;
repeated identical text and timestamps are not proof of one event.

Record `notification_of` only when its link to a DM is unambiguous. Retain the
reason for each crosswalk. Notification duplicates are evidence observations,
not additional incoming requests. Preserve edit indicators and conflicts.

## Request ledger

One item per substantive request:

| Field | Meaning |
|---|---|
| `request_key` | Stable item within the case |
| `request_event` | What created or changed the obligation |
| `state` | addressed, partly-addressed, open, withdrawn, unverified |
| `response_events` | Evidence for fulfillment or the remaining gap |
| `next_action` / `owner` / `owner_basis` | Evidenced request or commitment and owner; label an inferred dependency separately, or use nobody/unknown |
| `deadline` / `basis` | Explicit date/time with timezone evidence, or unset |
| `transmission` | offered, draft, attempted, sent, unverified, or not applicable |
| `onward_submission` | separately confirmed, unknown, or not applicable |

A reply can satisfy one item while leaving another open. "I will send it"
retains an open file request. An actual sent addendum may address a clarification
without proving an employer application. A contact who explicitly promised to return with client feedback owns that
commitment. Waiting on a client alone establishes a dependency, not a promised
contact action. Once a request is fulfilled, do not invent a new obligation for
the other party. An estimated return remains an estimate.

## Restart and reporting

Resume existing case keys and recover unchecked intervals after access returns.
Recheck current state before using an older next-action decision. Preserve the
old observation as history and report the new delta once. A material edit,
withdrawal, new question, or later message can reopen an addressed request.

Return concise per-case prose rather than dumping the full ledger. Distinguish
verified event facts, attributed reports, inference and unknowns. Do not expose
private locators or excerpts to a broader reporting destination.
