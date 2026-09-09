# Janitor Decision Rubric

Use this reference after the inventory exists. It is a decision aid, not a
source of authorization.

## Branch and worktree findings

| Finding | Required evidence | Default disposition |
| --- | --- | --- |
| Dirty or untracked worktree | `git status --short --untracked-files=all` | Protect and ask the owner; do not stash or reset |
| Detached or conflicted state | current branch and conflict markers/status | Protect and ask the owner |
| Branch has commits not in `origin/main` | `git log origin/main..branch` and branch SHA | Protect unless owner names a destination |
| Open PR or requested review | PR number, base/head SHA, review state | Active; inspect current checks and review |
| Running or failing current checks | workflow/run ID and current conclusion | Active or external-failure |
| Deployment branch or automation reference | branch name plus current deployment/workflow use | Protect |
| Local branch fully merged, remote absent, no PR/deployment use | merge-base, remote heads, PR and deployment checks | Safe local cleanup; use `git branch -d` only |
| Anything with conflicting evidence | all relevant IDs and timestamps | `needs-owner-decision` |

Old age, agent naming, Copilot naming, similar repository names, or an empty
working tree are never sufficient evidence for deletion.

## File comparison

For the current worktree, report separately:

1. uncommitted and untracked paths from `git status`;
2. content variance from `git diff origin/main`;
3. committed branch variance from `git log origin/main..HEAD` and
   `git diff origin/main...HEAD`;
4. any local-only commit that is not reachable from a remote branch or merged
   pull request.

Never describe a local file as safely preserved merely because it exists. State
whether it is committed, reachable from a named ref, copied to another clone,
or only present in the worktree.

## Notification decisions

| Disposition | Minimum evidence | Done eligibility |
| --- | --- | --- |
| `fixed` | underlying PR, issue, review, or run is currently resolved | Yes, with exact authorized thread ID |
| `superseded` | replacement item is identified and current | Yes, with exact authorized thread ID |
| `still-active` | current action, review, check, or owner response remains | No |
| `external-failure` | external service or owner is identified and current | Usually no; ask owner if uncertain |
| `needs-owner-decision` | missing, conflicting, or history-changing evidence | No |

The GitHub notifications API's thread-done operation changes notification
state. It does not close the referenced issue or PR, merge code, or unsubscribe
from future activity.

## Mutation record

Before a mutation, capture:

- exact repository and remote;
- exact branch, PR number, or notification thread ID;
- old commit SHA or notification state;
- proposed action and reason;
- current-session authorization and scope;
- verification command or API result;
- recovery or preservation reference.

If any field is missing, stop and return `needs-owner-decision`.
