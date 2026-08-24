# Skillz Forge

[![Deploy Skillz Forge to GitHub Pages](https://github.com/OKHP3/skillz/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/OKHP3/skillz/actions/workflows/deploy-pages.yml)
[![Publish health check](https://github.com/OKHP3/skillz/actions/workflows/publish-health-check.yml/badge.svg)](https://github.com/OKHP3/skillz/actions/workflows/publish-health-check.yml)

Skillz Forge is a catalog and review platform for the Skillz ecosystem. It
verifies that skill catalog data, accessibility affordances, and release
gates stay trustworthy as the underlying skills repository (`.migration-backup/`
and the wider Skillz project) evolves.

## Artifacts in this monorepo

| Artifact | Directory | Purpose |
|---|---|---|
| Skillz Forge | `artifacts/forge` | Public-facing catalog browser and review surface for skills. |
| Skillz Forge Review Desk | `artifacts/forge-review-desk` | Standalone review workspace for auditing skill submissions. |
| API Server | `artifacts/api-server` | Shared backend API used by the Forge artifacts. |
| Canvas / Mockup Sandbox | `artifacts/mockup-sandbox` | Component preview sandbox for design iteration. |

## Validation & release gates

Reusable validators live under `.agents/skills/` and are wired into
`.github/workflows/release-validation.yml` on pushes and pull requests:

- `catalog-integrity` — rebuilds and checks catalog truth/provenance without credentials.
- `production-build-verification` — builds the standalone Forge artifact and confirms its static output exists.
- `publishing-trigger-check` — verifies GitHub Pages publishing stays family-agnostic and fails closed.
- `static-route-validation` — checks Forge route declarations and hash-anchor targets.
- `validation-smoke` — exercises validator failure boundaries with dependency-free fixtures, including CI report-contract checks.
- `publish-health-check` — confirms the live GitHub Pages site matches the last successful deploy, on a schedule and after every deploy.

See `.agents/skills/README.md` for the full list and how to run each validator locally.

## Publishing status

`.github/workflows/deploy-pages.yml` builds and publishes Skillz Forge to
GitHub Pages on pushes to `main` that touch its watched paths.
`.github/workflows/publish-health-check.yml` independently re-checks, every
30 minutes and right after each deploy run, that the live site is actually
reachable and matches the commit the last successful deploy run built -- a
failure opens a tracking issue labeled `publish-health` (auto-closed once
healthy again) so a silent publish failure doesn't go unnoticed between
pushes. If the `PUBLISH_HEALTH_WEBHOOK_URL` repository secret is configured,
the workflow also sends one Slack/Discord-compatible notification when an
incident opens and one when it recovers; repeated checks do not spam the
webhook. Without the secret, issue tracking continues normally.

## Development

This is a pnpm workspace. Each artifact runs as its own workflow/service; see
`.replit`/`artifact.toml` for the managed dev commands, or run an artifact
directly, e.g.:

```bash
pnpm --filter @workspace/forge run dev
```

## Known gaps

- The Review Desk artifact does not yet have automated tests or CI coverage.
