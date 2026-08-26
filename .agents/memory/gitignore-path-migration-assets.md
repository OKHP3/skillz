---
name: Gitignore path-migration asset loss
description: A monorepo path migration (forge/ -> artifacts/forge/) left stale .gitignore path-scoped exceptions, silently dropping tracked assets.
---

# Gitignore path-migration asset loss

`.gitignore` had a blanket `*.png`/`*.svg` ignore with narrow path-scoped
exceptions (`!forge/src/assets/*.png`, `!forge/public/assets/*.png`, etc.)
written for the pre-monorepo `forge/` layout. When the app moved to
`artifacts/forge/`, nobody added matching `!artifacts/forge/...` exceptions,
so every favicon, app icon, social-preview image, and the Home hero PNG
fallback silently became ignored. They still existed in each contributor's
local working tree (so local builds and even local git history looked fine),
but a fresh CI checkout had none of them — the CI build failed on a missing
Vite import, and would have deployed with broken favicons/OG images if the
import hadn't failed loudly.

**Why:** Path-scoped `.gitignore` exceptions do not get migrated automatically
when directories move; nothing fails until a from-scratch checkout (CI, a
fresh clone) is missing files that only ever existed as untracked local state.

**How to apply:** After any directory rename/move in a repo with path-scoped
`.gitignore` exceptions, grep `.gitignore` for the old path prefix and add
equivalent entries for the new path. To verify assets aren't silently
gitignored, run `git status --ignored=matching --short` and check for
source-tree files (not build output/scratch dirs) that shouldn't be ignored.
