---
name: GitHub workflow permission
description: Constraint when committing GitHub Actions workflow files through the connected GitHub authorization.
---

The GitHub connection can have repository read/write access without being
allowed to create or update `.github/workflows/*`; workflow-file writes may be
rejected even when ordinary repository API reads and branch creation work.

**Why:** GitHub treats workflow-file changes as a separate authorization
boundary, so a healthy `repo` OAuth scope is not proof that workflow commits
are permitted.

**How to apply:** Before migrating a repository to source-controlled Actions,
verify the connection or repository owner has workflow-file write permission.
If absent, leave deployment settings unchanged and preserve the prepared
change for an authorized reviewed retry.