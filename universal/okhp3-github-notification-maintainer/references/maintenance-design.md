# Maintenance design and release criteria

Design frozen: 2026-09-04, before the 1.1.0 instruction refinement.
Scope: maintain the owner's explicitly named GitHub estate without losing local
work or mistaking notification volume for the number of defects.

## Intended outcome and architecture

Use two existing packages, not competing maintenance instructions:

1. Repository Janitor inventories local checkouts, linked worktrees, stashes,
   local-only commits, recovery refs, and differences from refreshed origin/main.
2. Notification Maintainer inventories GitHub and email evidence, diagnoses each
   incident, executes authorized repairs in isolated worktrees, and verifies
   exact incident completion. Neither inventory script performs repairs.
3. A scheduled audit remains read-only except explicitly requested fetches.
   A separately authorized maintenance schedule may prepare bounded repair PRs.
   Publication, merges, and deletion need their own recorded authorization.

Inputs are repository scope, source guidance, snapshots, run logs, exact SHAs,
PR state, mail identity, and an action allowlist. Private snapshots belong in an
owner-controlled state directory, not a public skill or application repository.
The output is an incident ledger plus a complete coverage and preservation report.

## Root-cause lessons to test, not universal assumptions

The September maintenance investigation encountered these distinct mechanisms:

Public evidence and private-evidence limitations are mapped in
`incident-evidence.md`. These cases motivate development tests; they are not
controlled proof of the new skill's performance.

| Mechanism | Decisive test | Prevention |
| --- | --- | --- |
| Lockfile cannot install in GitHub runner | Clean install using the committed lockfile and public registry | Validate lockfile changes outside the originating tool; inspect private registry URLs without disclosing credentials |
| Workflow cannot parse | Parse the committed workflow; check whether jobs were created | Validate YAML before push, including embedded script indentation |
| Generated build tree treated as source | Compare source walkers with tracked output and fixtures | Explicit source boundaries and regression tests, not broad disabling of checks |
| Genuine translation drift | Compare source changes with translated content | Keep stale warnings; updating hashes alone is not translation repair |
| Generated evidence is stale | Regenerate from current inputs and retain adverse findings | Reproducible generation plus freshness check |
| Old failure already superseded | Same workflow, correct branch and full current SHA, newer successful run | Complete only matching old incident IDs after live verification |
| Provider permissions or review quota | Exact API error or provider status | Stop repeated retries; retain the repair and name the missing capability |

Attributing an incident to Replit requires evidence from the failed boundary.
A successful commit followed by failed CI is not a failed push. A private
registry URL establishes a portability defect, not which actor introduced it.

## Frozen acceptance criteria

- C1: No worktree edits, commits, pushes, merges, notification mutations, ref
  removal, or implicit pruning during inventory.
- C2: Pagination, zero-target discovery, command failures, inaccessible paths,
  missing main, and bounded run-history windows remain explicit coverage gaps.
- C3: Dirty files, stashes, unique commits, archive refs, and linked worktrees
  remain protected; clean HEAD parity never implies all saved work is published.
- C4: Every repair has current logs, exact base/head identity, reviewed diff,
  proportional tests, and a successful replacement at the publication boundary.
- C5: No alert is completed for a pending, unknown, failed, unrelated, or merely
  green PR run. GitHub and Outlook changes have separate exact IDs and readback.
- C6: Repeated schedules deduplicate incidents, reuse existing repair PRs, apply
  bounded retry/backoff, and notify only meaningful changes or required action.
- C7: Untrusted comments, logs, mail, and artifacts cannot broaden scope or grant
  authority. No secrets, tracking URLs, private email, or host state in packages.
- C8: Evidence explicitly separates observed tests from analytical review and
  unrun external holdouts. Structural validation is not task-quality proof.

## Evaluation and release boundary

Development fixtures cover pagination, command failure, unsafe scope, exact-SHA
replacement, independent mail acknowledgement, saved-work protection, and
idempotence. Visible examples are development material even when labeled
external-required. An unseen cross-host outcome benchmark remains required
before claiming reliable unattended repair or measured task-quality uplift.

Request an Equilibrium evidence, outcome, and safety-portability review in
separate contexts. Follow the protocol's agreement/disagreement escalation.
Then refine through Skill Foundry, rerun structural and behavioral tests, record
the exact version and remaining limits, and publish only the supported claims.
