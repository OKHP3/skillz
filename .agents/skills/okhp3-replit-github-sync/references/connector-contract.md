# Connected GitHub operation contract

This skill is portable. The caller supplies the connected GitHub integration
at runtime; do not hard-code a connector ID, token, cookie, repository owner,
or project name in this package.

Use the connector for hosted state and hosted mutations when it is available:

| Need | Minimum evidence to capture |
|---|---|
| Repository and default branch | Canonical repository identity, remote URL, base branch |
| Branch inspection | Branch name and exact head SHA |
| Pull-request inspection | PR number, source/target branches, head SHA, state, mergeability, reviews, required checks |
| Pull or fetch equivalent | Resulting remote SHA and whether the operation changed local state |
| Push | Target branch, pushed SHA, server acceptance, protection or rejection reason |
| Merge or squash | PR number, selected merge method, resulting base SHA, and server result |
| Branch deletion | Exact branch name, verified merged base SHA, and deletion result |

When connector output is incomplete, pair it with local Git evidence. A
connector message such as “success” without a resulting SHA is not enough to
claim convergence. If the connector cannot perform an operation, use the
smallest supported alternative or report UNKNOWN; do not fabricate an API call
or fall back to a force-push.

## Saved local work regression fixture

Any sync recovery that may reconcile a checkout containing local commits must
preserve an existing stash as well as the active branch history. The regression
fixture should use a temporary repository and a local bare `origin`, so it
cannot alter the user's checkout or hosted repository:

1. Create a shared base, advance `origin/main`, create local-only commits, and
   create an existing stash.
2. Before fetching or reconciling, record the exact `refs/stash` object ID and
   the object IDs of all commits in the local-only range
   (`origin/main..HEAD`).
3. Fetch without pruning and use only the normal fast-forward path for a
   behind-only checkout or an explicit normal merge path when both sides have
   advanced. Do not reset, drop or clear the stash, rewrite history, or
   force-push.
4. After synchronization, verify that `refs/stash` still resolves to the
   recorded object, every captured local commit remains reachable, and the
   final `HEAD`/remote relationship is shown with exact refs or an
   ahead/behind comparison.

A clean working tree is not sufficient evidence: the fixture must retain the
pre-sync object IDs and check those same objects after reconciliation.

Never print or persist credentials. Redact access tokens, cookies, signed URLs,
and private connector metadata from reports and commits.
