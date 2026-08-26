---
name: OverKill Hill dossier publishing
description: Deployment constraint for changes to the public Skillz dossier in the separate OverKill Hill repository.
---

When changing `projects/skillz/index.html` in the OverKill Hill repository,
run its site validator and confirm the resulting Pages workflow deploys before
treating a public-surface change as live.

**Why:** GitHub Pages deploys only after the validation job passes. Its voice
lint rejects new warnings beyond the reviewed baseline, so otherwise-valid
content can leave the hosted dossier serving an older static fallback.

**How to apply:** Use `python3 scripts/validate-site.py` from a checkout of
the OverKill Hill repository after dossier edits, then inspect the associated
Site Validation and Deploy validated site to GitHub Pages jobs and refetch the
hosted page.