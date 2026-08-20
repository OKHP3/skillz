# Notification and branch decision rubric

## Notification disposition

| Evidence | Disposition | Completion rule |
|---|---|---|
| Underlying item and replacement validation pass | `fixed` | Exact thread may be completed |
| New item replaces it and replacement is verified | `superseded` | Exact old thread may be completed |
| Review, check, issue, or PR still requires work | `still-active` | Do not complete |
| Native worker is working or result lacks verification | `delegated-but-unverified` | Do not complete |
| Provider or owner outside repository must act | `external-failure` | Name owner; do not complete unless explicitly resolved |
| Evidence, scope, or authority is ambiguous | `needs-owner-decision` | Ask one precise question |

## Branch protection

Protect any current, dirty, unique, deployment-owned, open-PR, conflicted,
detached, or ambiguous branch. A prune recommendation requires all of:

1. The branch is not current.
2. Its commits are contained in the selected base.
3. No open PR, deployment, workflow, or documented automation uses it.
4. No unique user work is present.
5. The exact local or remote deletion target is authorized.

Use `git branch -d` for an authorized local deletion. Never force-delete or use
a broad remote-prune operation as a substitute for inspection.
