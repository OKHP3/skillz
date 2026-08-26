---
name: Forge shallow-checkout provenance gate
description: Why the Skillz Forge catalog build only fails closed on a shallow git checkout in CI, not in local/Replit dev.
---

Skillz Forge derives each skill's `createdAt`/`lastModified`/`commitSha` from
per-path `git log` history in `artifacts/forge/scripts/build-catalog.js`. A shallow
checkout (GitHub Actions' default `fetch-depth: 1`) returns no history for
almost every path, which previously got silently masked by falling back to
the top-level deploy commit — every skill on the live site showed today's
date as its "creation" date.

The build now calls `ensureFullHistory()`, but it only exits non-zero when
`GITHUB_ACTIONS`/`CI` env vars are set. A Replit workspace git clone reports
`git rev-parse --is-shallow-repository` as `true` while still carrying a
large, genuinely useful commit window (hundreds of commits) — it is a
different, more benign kind of "shallow" than CI's single-commit checkout.
Failing closed in local dev too would block every `pnpm dev`/`pnpm build`
for no safety benefit, since local dev never publishes to the public site.

**Why:** the harm (fabricated public-facing dates) only exists at the
production deploy boundary; blocking local dev on the same shallow-ness
signal would be a false positive with real cost and no benefit.

**How to apply:** any future "fail closed on bad data" gate in this build
pipeline should default to warn-only outside CI and hard-fail only when
`GITHUB_ACTIONS`/`CI` is set, unless the bad state is also harmful in local
dev. Mirror this pattern rather than reinventing it.
