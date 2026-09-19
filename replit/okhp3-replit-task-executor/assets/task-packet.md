# External task packet

Keep one packet per selected task. Unknown values remain explicitly unknown.
Store private plans in the agreed private location. This packet is a record,
not a distributed lock or permission grant.

## Intake

- Project/repository identity and verified origin:
- Replit project URL and task ID/link:
- Title, parent, and dependency IDs:
- Board state and observation time:
- Plan and acceptance criteria:
- Relevant paths and overlapping tasks/PRs:
- Intended outcome: assess / implement / PR / integrate / deploy:
- Existing user authority and any pending decision:
- Time/token/spending limits, if supplied:

## Ownership and baseline

- Shared coordination record or owner-coordinated handoff:
- External executor and session:
- Replit writer/queue/apply state and evidence it will not race:
- Other writers and allowed paths:
- Baseline commit and refreshed origin/base:
- Checkout/worktree and feature branch:
- Dirty files, stashes, local-only commits, preserved output:
- Claim observation time and next review point:
- Hosting target and known non-Git state:

## Execution checkpoint

- Changed files and commits:
- Acceptance criteria completed / remaining:
- Validation commands, outcomes, and tested commit:
- Exact blocked operation, if any:
- Attempts and new evidence since the last failure:
- Ownership status:
- One next safe action:
- Actual time/token/cost telemetry, or unavailable:

## Closeout

| Surface | Status | Evidence / next action |
|---|---|---|
| Local implementation | not-run | |
| GitHub PR/integration | not-run | |
| Replit source synchronization | not-run | |
| Replit connector authentication | not-run | |
| Board disposition and dependencies | not-run | |
| CI | not-run | |
| Deployment | not-run | |
| Live behavior | not-run | |

- Criteria-to-evidence mapping:
- PR head, merge SHA, and canonical base:
- Expected-head merge condition or verified serialized handoff:
- Complete publication scope and authority, including other project artifacts:
- Actual board disposition; receipt location if board update is pending:
- Ownership released, retained, or transferred, and observed confirmation:
- Recovery point and preserved work:
- Remaining limitations:
