# okhp3-repository-janitor report — this checkout, 2026-08-03

**Scope note**: this environment has exactly one local checkout and one real
GitHub remote (`origin` → `https://github.com/OKHP3/skillz.git`), not the
multi-machine/multi-clone estate this skill is primarily designed for. This
report applies the skill's reconciliation and branch-lifecycle steps to that
single checkout.

## Reconciliation vs `origin/main`

- `git fetch origin main` → up to date.
- Working tree: clean before this session's uncommitted work (this session's
  file additions are new, untracked work product, not drift from origin).
- `git log HEAD..origin/main` → 0 commits (nothing on origin main missing locally).
- `git log origin/main..HEAD` (before this session's local file writes) → 0 commits.
- **Conclusion**: local `main` and `origin/main` were byte-identical at
  commit `5c051231a2787900c0f0bebde231c568063598c5` before this session's file
  writes. No divergence, no forgotten local commits to recover.

## Remote branch inventory

- `git ls-remote --heads origin` → **only `main` exists on the GitHub remote.**
  No stale feature/dependabot/copilot branches to review or prune on GitHub.
- `gh pr list` could not be run (`gh auth login` not configured in this
  environment) -- if there are open pull requests on GitHub they were not
  checked from here. Recommend running `gh pr list --repo OKHP3/skillz` from
  an authenticated environment to confirm none are stuck open.

## Local branch inventory

- Local `main` matches `origin/main` exactly (see above).
- A local `replit-agent` branch exists, **69 commits ahead of `origin/main`**,
  0 behind. This is very likely a Replit-platform-managed staging branch tied
  to this workspace's agent sessions, not a developer feature branch.
- Roughly 20+ local `subrepl-*` branches exist. These are Replit-internal
  workspace/checkpoint infrastructure branches, not conventional dev branches.

## Classification and recommendation

| Branch pattern | Classification | Recommendation |
| --- | --- | --- |
| `main` | primary, in sync with origin | no action |
| `replit-agent` | platform-managed, out of skill scope | **Do not merge or delete without explicit owner authorization.** This branch's 69-commit lead over `origin/main` is Replit's own agent-session mechanism, not a git-hygiene concern this skill should resolve. Flagging for awareness only. |
| `subrepl-*` (~20+) | platform-managed, out of skill scope | **Do not merge or delete.** These are Replit checkpoint/session branches, not orphaned feature work; treating them as generic "stale branches to prune" would be incorrect and could interfere with Replit's own checkpoint/rollback system. |

## What this report intentionally does not do

Per the skill's safety contract (preserve uncommitted/unreachable work, never
delete without explicit authorization), this report **only classifies and
recommends** -- no branch was merged, deleted, or force-pushed. The
`replit-agent` and `subrepl-*` branches are called out explicitly rather than
silently ignored, so the owner can decide whether their normal git-hygiene
process should touch them at all (this report's recommendation is: it should
not, because they aren't developer-created).

## Next check

If genuine multi-clone/multi-machine drift becomes relevant (e.g. this
project is cloned to a second machine), re-run this skill's full workflow
there -- the single-checkout result above does not need to be repeated for
this same checkout unless new commits land.
