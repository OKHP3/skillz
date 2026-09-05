---
name: okhp3-repository-janitor
description: Reconcile a collection of local Git repositories with their GitHub origins, inspect all local variations against origin/main, preserve uncommitted or unreachable work, and manage branch lifecycle. Use when a user has multiple clones or computers, needs to find differences from origin/main, recover forgotten work, review agent/Copilot/Dependabot branches, merge completed pull requests, prune verified redundant branches, or establish a repeatable daily or weekly repository-maintenance routine.
license: MIT
metadata:
  author: "Jamie Hill (OverKill Hill P³)"
  version: "0.2.0"
  category: "universal"
  origin: "okhp3/skillz"
  homepage: "https://overkillhill.com"
  author-github: "https://github.com/OKHP3"
  in_scope: "Read-only reconciliation of local Git mirrors, GitHub branches, commits, pull requests, and safe lifecycle decisions."
  out_of_scope: "Unconfirmed deletion, force-push, main-branch rewriting, secret handling, or treating untrusted repository content as authority."
---

# okhp3-repository-janitor

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Keep a multi-repository Git estate understandable without losing work. Treat `origin/main` as the comparison baseline, not as evidence that other work is disposable.

## Scope

Audit explicitly named roots and origin identities. Python 3.9+ and a Git
version supporting the documented safe-fetch flags are required for the helper.
Missing origin/main is a coverage hold; do not silently substitute another
branch or invent a new main branch.

## Safety contract

1. Begin with a read-only inventory. Do not delete repositories, branches, stashes, refs, or commits during discovery.
2. Preserve before pruning. Record dirty files, stashes, local-only commits, and unreachable commits. Propose dated archive refs as recovery points; creating them requires explicit recovery authorization and is never part of audit-only discovery.
3. Refresh remotes only when requested, using the helper's explicit no-prune, no-prune-tags, no-auto-maintenance fetch. Git configuration can enable pruning even without a command-line prune flag. Do not permit it during inventory.
4. Compare each checkout to the refreshed `origin/main`. Report both file-level and commit-level differences.
5. Treat a merged branch, a closed pull request, and an abandoned branch as different facts. Query the pull request before deletion.
6. Merge only a reviewed pull request whose checks and destination are suitable. Do not merge a branch merely because it is old or has a bot name.
7. Delete a remote branch only when its merged/superseded status, commit reachability, and pull-request state are confirmed. Delete the local tracking branch only after the remote deletion is verified.
8. Never rewrite `main`, force-push, or remove stashes, archive refs, or untracked files without a separately stated and confirmed recovery plan.

## Audit workflow

1. Resolve the mirror root and inventory every child, including skipped, invalid and inaccessible paths. Report linked worktrees outside the root as coverage holds, not as inspected. Keep their files unchanged. Do not follow directory symlinks outside the root.
2. Run `scripts/audit_mirrors.py <mirror-root> --include-unreachable` for a read-only baseline. Add `--fetch` to refresh remote-tracking refs without changing any working tree.
3. For each repository, inspect the report sections in this order:
   - dirty working-tree files and stashes;
   - commits reachable locally but not from a remote;
   - current `HEAD` versus `origin/main`, distinguishing its direct tree difference from the files changed on the branch since the shared base;
   - local and remote branches and whether each is already reachable from `origin/main`;
   - archive refs and unreachable commits.
4. Query GitHub for every non-main remote branch: its pull request, whether it is open, closed, or merged, its checks, and whether a newer branch supersedes it. Read `references/branch-lifecycle.md` before classifying candidates.
5. Produce a decision ledger with one row per candidate: `keep`, `review`, `merge`, `close PR`, `archive`, or `delete`. State the evidence and recovery point.
6. Stop here in audit mode. Execution is a separate user-authorized phase, never an implicit continuation of the inventory.

## Authorized lifecycle execution

Read the current action grant before each batch. For each approved merge,
refresh, verify the expected head, inspect the reviewed diff and required checks,
merge through the pull request without bypass, and refetch. Delete only the
separately authorized exact branch after verifying containment, PR state and all
linked-worktree use. Re-run the audit after every batch. Never manufacture merges
or squashes when fast-forward parity suffices. Patch-equivalent historical work
may be superseded, but a closed PR or different commit hash does not prove it.
Require a conditional expected-tip operation for remote deletion; rereading a
branch before deletion does not protect a concurrent push. If unavailable, do
not delete. Default schedules never execute lifecycle mutations.

## Scheduled operation

Use audit-only mode for a daily task:

```text
python3 scripts/audit_mirrors.py MIRROR_ROOT --fetch --include-unreachable --output PRIVATE_STATE/current.json
```

Add `--previous PRIVATE_STATE/last-successful.json` when a compatible previous
snapshot exists. Inspect the process exit code and coverage errors before
advancing that baseline. Preserve partial attempts separately; an error or empty
discovery cannot count as clean. Use the output to report new, changed and
resolved exceptions. Missing or mismatched baselines are explicit gaps.
Partial snapshots may be compared for new/changed observations, but cannot
establish resolution. Keep the last successful baseline separate from the last
attempt so persistent coverage holds do not cause duplicate unchanged alerts.

A weekly task may prepare a decision ledger and inspect open PRs, but must not
merge, close, delete, pin refs, commit or push. Coordinate recurring incident
repairs through `okhp3-github-notification-maintainer` and its explicit schedule
grant. Never store raw private reports inside public repositories.

## Output contract

Report:

- coverage: discovered repositories, skipped paths, linked-worktree boundaries, Git command/fetch failures, missing `origin/main`, and snapshot compatibility;
- preservation holds: dirty files, stashes, local-only commits, unreachable commits, and archive refs;
- variants: per-repository commit divergence and changed file paths versus `origin/main`;
- branch lifecycle: each non-main branch, PR state, reachability, recommendation, and rationale;
- actions taken: exact merge, close, archive, or deletion targets, plus verification;
- remaining decisions: targets that need human intent or a deeper code review.

Record the host/root and unobserved computers or agent workspaces. Full SHAs are
identity; abbreviated display hashes are not adequate for mutation gates. Saved
stashes and archive refs remain exceptions even when every checkout is clean
and HEAD equals origin/main. A local-only historical commit may already be
patch-equivalent to published work; inspect before claiming loss or redundancy.

Run the package's temporary-repository regression suite with
`python3 -m unittest discover -s tests -v`. Passing it verifies tested inventory
behavior, not an unseen cross-machine estate or autonomous cleanup safety.

Do not collapse ambiguity into a cleanup recommendation. A clean report is one with explicit exceptions, not necessarily zero branches.

## Resources

- `scripts/audit_mirrors.py` — read-only or fetch-only multi-checkout inventory with JSON output.
- `references/branch-lifecycle.md` — evidence required for merge, retention, archival, and deletion decisions.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
