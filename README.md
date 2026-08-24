# Skillz Forge

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

See `.agents/skills/README.md` for the full list and how to run each validator locally.

## Development

This is a pnpm workspace. Each artifact runs as its own workflow/service; see
`.replit`/`artifact.toml` for the managed dev commands, or run an artifact
directly, e.g.:

```bash
pnpm --filter @workspace/forge run dev
```

## Known gaps

- Automatic GitHub Pages publishing on push to `main` is not currently wired
  up in the live `.github/workflows/` directory (tracked as a project task).
- The Review Desk artifact does not yet have automated tests or CI coverage.
