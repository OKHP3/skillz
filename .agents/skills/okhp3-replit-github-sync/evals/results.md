# Evaluation results

Date: 2026-09-09
Skill version: `1.0.0`
Case: `saved-local-work-survives-safe-sync`

## Method and provenance

The exact case prompt from `evals/evals.json` was run once as a fresh
response-only `delegation-subagent` evaluation with the complete target skill
context:

- `.agents/skills/okhp3-replit-github-sync/SKILL.md`
- `.agents/skills/okhp3-replit-github-sync/references/connector-contract.md`

The evaluator was instructed to return only a user-facing answer, not inspect
or edit the repository, and not claim that commands were executed. The model
used by the runner is not exposed. This is `live` evidence for the captured
response and runner configuration; it is not host telemetry or proof that Git
commands ran.

## Grading

| Expectation | Result | Captured evidence |
|---|---|---|
| 1. Isolated fixture and pre-sync refs | **PASS** | The response uses a disposable repository and local bare remote, creates two local commits and a stash, then records the exact `refs/stash` object ID and every local-only commit SHA before fetch or merge. |
| 2. Safe sync path from measured relationship | **FAIL** | The response fetches without pruning and describes an ordinary merge, but it clones the target checkout after the remote-only commit. The actual described state is two commits ahead and zero behind, not the claimed two-sided divergence, so the merge-path selection is not supported by the fixture. |
| 3. Post-sync preservation proof | **PASS** | The response compares `stash_before` and `stash_after` by exact object ID and checks every captured local commit with `git merge-base --is-ancestor`. |
| 4. Final relationship and refusal boundary | **PASS** | The response checks `HEAD...origin/main` for `0 0`, compares `HEAD` and `origin/main` exactly, and explicitly refuses reset, stash deletion, history rewriting, and force-push. |

**Summary: 3/4 passed (0.75).**

## Weak boundary recorded

The live response exposes a fixture-ordering weakness. It creates the
remote-only commit in `remote-work` and pushes it before cloning the target
`checkout`. As a result, the target checkout starts from the already-advanced
remote and then adds its two local commits. The response later claims that both
sides advanced, but its own setup does not create that relationship.

This is a meaningful failure for the synchronization-path expectation, not a
failure of the stash or local-commit preservation checks. The response should
clone the target checkout from the shared base before the independent
remote-only commit is pushed, then create the local commits and stash, fetch,
measure the actual divergence, and choose the explicit merge path.

## Captured response

The live response proposed:

1. A disposable repository with a local bare `origin`.
2. A shared base, an independent remote commit, two local-only commits, and an
   existing stash.
3. Pre-sync capture with `git rev-parse --verify refs/stash` and
   `git rev-list --reverse origin/main..HEAD`.
4. `git fetch origin` without pruning, followed by ahead/behind and log checks.
5. An explicit normal merge for the claimed two-sided divergence.
6. Post-sync checks that compare the stash object ID, verify each local commit
   is an ancestor of `HEAD`, and compare `HEAD` with `origin/main`.
7. Explicit refusal of reset, stash deletion, history rewriting, and
   force-push.

The full response is represented by the evidence above and the corresponding
`live_result` entry in `evals/evals.json`.

## Decision

Record the case as a partial live pass. The evaluation expectations and safety
contract remain unchanged. The captured response demonstrates strong
preservation and convergence checks but does not fully validate the intended
two-sided synchronization fixture.
