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

## Companion-site release audit

From a network-enabled environment, run:

```bash
node .agents/skills/publishing-trigger-check/audit-sites.mjs --strict
```

This independently probes OverKill Hill, Glee-fully Tools, and AskJamie for
home/about/legal/sitemap responses, canonical and OG metadata, OG image
reachability, sitemap samples, CNAME alignment, workflow deploy handoff, and
repository-vs-live freshness. Add `--json` for archival automation output.

`--strict` blocks when a repository has no proven deploy step; this currently
identifies a site as blocked only when neither a repository deploy step nor a
successful GitHub-managed Pages run can be proven. If GitHub manages the
deployment outside repository YAML, the runner reports that limitation
explicitly rather than silently treating validation as publishing. It does not
infer or change DNS, repository settings, or deployment ownership.