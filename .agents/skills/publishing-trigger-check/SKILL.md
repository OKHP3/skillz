---
name: publishing-trigger-check
description: Verify GitHub Pages publishing remains family-agnostic and fail-closed.
---

# Publishing trigger check

## Use when

Run after changing `.migration-backup/.github/workflows/deploy-pages.yml` or
family/skill folder conventions. It reuses the repository's existing
`verify-deploy-trigger.mjs`.

## Callable command

```bash
node .agents/skills/publishing-trigger-check/run.mjs
```

The check requires the workflow to contain a family-independent
`**/FAMILY.md` or `**/SKILL.md` glob, rejects hardcoded current family names,
and exits non-zero when the workflow is absent or unsafe. It never pushes,
publishes, force-pushes, or handles tokens.