# Validation matrix

| Change type | Minimum evidence | Strong evidence | Common false positive |
|---|---|---|---|
| Documentation or metadata | Parser and focused contract check | Clean CI | File exists but catalog is stale |
| Dependency update | Install, typecheck, tests | Clean PR checks and deployment | Lockfile changed without runtime proof |
| GitHub workflow | Syntax and event review | Replacement run creates jobs and passes | Startup failure has no job to inspect |
| GitHub Pages | Build and artifact inspection | Post-merge deployment and public-route check | Build passed but live site is stale |
| Branch cleanup | Containment, PR, deployment, and worktree checks | Remote state rechecked immediately before deletion | Old branch mistaken for abandoned work |
| Notification completion | Underlying item verified and exact API result | Re-audit shows no replacement failure | Marked read instead of resolved |

Record evidence status as `live`, `analytical`, `historical`, or `not-run`.
Passing structural checks does not establish task-quality or production
readiness.
