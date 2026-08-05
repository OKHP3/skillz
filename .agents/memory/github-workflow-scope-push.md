---
name: GitHub workflow-scope push rejection
description: Any push touching .github/workflows/*.yml is rejected by GitHub because Replit's connected OAuth app lacks the `workflow` scope; recurring pattern with a known workaround.
---

## The problem

Pushing a commit that modifies any file under `.github/workflows/` fails with:

```
! [remote rejected] main -> main (refusing to allow an OAuth App to create or
  update workflow `.github/workflows/<file>.yml` without `workflow` scope)
```

This happens via plain shell `git push`, the Git pane's "Sync Changes", and the
`gitPush` CodeExecution callback alike — it is a GitHub-side rejection based on
the OAuth token's granted scopes, not a client-side or credential-freshness
issue. Reconnecting the GitHub account in Replit account settings has not
reliably resolved it (observed at least twice on the same project).

**Why:** Replit's GitHub OAuth App integration does not request the `workflow`
scope by default, and there is no in-workspace way to add it.

## Workaround that works

1. Make all the intended workflow-file changes and other commits normally.
2. Before pushing, add one more commit that reverts *only* the workflow
   file(s) back to `origin`'s current content (`git show origin/main:<path> >
   <path>`), leaving every other change intact.
3. Push — this succeeds because the workflow file is now byte-identical to
   what's already on GitHub, so GitHub sees no workflow-file change.
4. Hand the user the final intended workflow YAML content and ask them to
   paste it into GitHub's web editor themselves (a human editing directly in
   the GitHub UI is not subject to the OAuth App's scope restriction).

## How to apply

Any time a task involves editing a file under `.github/workflows/`, expect
this to happen at push time. Don't spend more than one or two retries on
`gitPush`/shell push before concluding it's this issue — check the error text
for "workflow scope" specifically (distinct from generic `PUSH_REJECTED` /
"Invalid username or token" auth failures, which are a different, often
transient, credential issue — see also: shell `git push` can have a stale
token even when the `gitPush` callback's token is fresh, so prefer retrying
via `gitPush` over shell first for plain non-workflow pushes).
