# Exact-thread closeout

Use this profile for a request to finish or archive a named work thread. The
handoff can be prepared from a supplied export and authorized evidence.
Execution of the underlying work and any archive action belong to separate
authorized workflows.

## 1. Confirm the subject and coverage

Record the host or placement, project, native thread ID and title, and observed
history, attachments and prior receipts. Get the identity from a supported host
view or an exact owner-supplied locator that establishes the target in that
placement. A title, related conversation, plausible predecessor, project link,
or bare ID with ambiguous placement does not establish identity. Mark unresolved
identity as a blocker for exact-thread completion. Continue independent scoped
checks when possible.

Keep a bounded receipt separate from original-source preservation. Record
material gaps in history, attachments and access. A summary or digest alone
cannot establish that all originals were recovered. Use the relevant source
capture workflow when lossless or file-level coverage is required.

## 2. Reconcile obligations at the revision that matters

Create one row for each in-scope obligation with its source, acceptance
criterion, evidence locator, observed time and revision or artifact identity,
owner, status and next action.

| Status | Apply when |
| --- | --- |
| `verified` | The relevant artifact or outcome was checked at the accepted version and destination. |
| `retired` | The currently authorized human explicitly removed this exact obligation. Retain the decision and any incomplete tests. |
| `open` | A named action, test, review or owner handoff remains. |
| `blocked` | Required access, permission, source, or capability is unavailable. |
| `unverified` | Available evidence is stale, indirect, conflicting or lacks required readback. |

Verify each required surface separately. A repository merge, cached remote
ref, or source checksum can support a source claim. Host installation,
runtime behavior, private file custody and deployment each require their own
evidence if in scope. Verify custody of each required payload at the required destination by
observing exact bytes or a matching digest of the stored payload. When
recoverability is required, restore that copy or an exact verified readback.
A successful local restore, a pointer, or a transfer acknowledgement cannot
establish custody or recovery of a separately required remote copy. When a
live observation supersedes the receipt, keep the earlier checkpoint and add
a dated correction. Re-read material state before closure. If the evidence
changed, reopen the affected rows and recheck the decision.

Preserve pending work and its ownership. Coordinate handoffs and record a
receiving owner and durable location. A worker's note or stale timestamp gives
no authority to take over, publish, prune, retire an obligation, or archive.

## 3. Save and verify the receipt

Reuse the authorized destination and existing receipt for the same verified
subject. If identity is unresolved, label a private continuation as
provisional and use an established workstream key without equating it to a
native thread ID. Preserve prior evidence and use an expected-version or
conditional write when available. Otherwise require a single writer and
read the current receipt before writing. Stop on any conflict or if writer
coordination cannot be established. Keep private sources and secrets in their approved private location.

Read back the current receipt from the intended destination. Match the
identity, revision or content, latest decision and unresolved obligations.
Record a mismatch or unavailable readback as a blocker for archival.
Use two checks where the owner requires them. First verify the result and
artifacts. Then independently challenge scope, evidence, privacy and remaining
holds, or perform a separately labeled adversarial review when independence
is unavailable.

## 4. Keep archival separate

If the owner asks only for finalization, report work status `complete` or
`blocked` and receipt verification. Omit archive disposition and take no
archive action.

Archive eligibility requires exact thread identity, every in-scope obligation
verified or explicitly retired, the required checks complete, receipt readback,
and no pending work or active owner still relying on the thread. Carry the
current human authorization separately. If eligibility is uncertain, preserve
the receipt and the next action. Never use deletion as a substitute.

| Result | Evidence required |
| --- | --- |
| `blocked-not-ready-to-archive` | An eligibility gate is open or unverified. Record the blocker and stop before any archive action. |
| `complete-archive-pending` | Eligibility is verified but the exact archive operation is unauthorized, unavailable, or confirmed to have failed. Record the missing authority or supported manual step. |
| `archive-requested-unverified` | The separately authorized exact-target archive was requested or may have been accepted, and its outcome cannot be observed. Check status before any retry. |
| `archived-verified` | A fresh supported observation proves the same exact thread is archived. Record the action and readback evidence in the durable receipt. |

Hand any archive action to an authorized host workflow with the exact target
and verified gates. Require a supported action bound to the exact host or
placement and native thread ID. If only a title or ambiguous target is exposed,
stop and report `complete-archive-pending`. An acknowledgement, navigation away,
disappearance from a list, or archived status of a sibling is insufficient.
Recheck identity and required gates immediately before the action. If the host
has no conditional concurrency guard, require one execution owner and stop
if another operator may act.
Keep execution status and receipt status separate if the final receipt update
cannot be verified.
