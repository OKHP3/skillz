---
name: Post-deploy staleness detection
description: Pattern for telling "the deploy never shipped this commit" apart from "the deployed app has a real regression" in post-deploy checks.
---

When a post-deploy browser check against a live URL fails to find an
expected UI element, the failure can mean two very different things: the app
has a real regression, or the deployed artifact simply predates the commit
that introduced the feature. Confusing the two wastes debugging time on a
"regression" that a redeploy would fix.

**Why:** Skillz Forge's GitHub Pages artifact was found to be several
commits behind local HEAD (checked via each catalog.json's `sourceCommit`
field) because the live repository's `.github/workflows/` had no
deploy-pages.yml at all -- the only copy lived in a non-executed backup
path. A naive keyboard-recovery browser check against the live site reported
a generic "element not found" failure that looked like an app bug but was
actually a dead deploy pipeline.

**How to apply:** Before running behavioral assertions against a published
site, fetch its generated manifest/catalog and compare a provenance field
(commit SHA, build timestamp) against the commit the check expects to be
live. Report a mismatch as a distinct deployment-stage failure (different
exit code/prefix) before ever running the UI assertions, so operators see
"stale artifact" instead of a misleading "feature regressed" signal.
