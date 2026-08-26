---
name: Forge monorepo migration
description: Lessons from porting Skillz Forge into the pnpm monorepo at artifacts/forge/
---

## REPO_ROOT fix in build-catalog.js
When the script is at artifacts/forge/scripts/, REPO_ROOT must be join(__dirname,'..','..','..', '.migration-backup') — three levels up to workspace root, then into .migration-backup/ where the FAMILY.md files actually live.

**Why:** Skills (with FAMILY.md) are all inside .migration-backup/ after migration. Using workspace root as REPO_ROOT finds no families because artifacts/ and lib/ have no FAMILY.md.

**How to apply:** Any time build-catalog.js is invoked from the new location, the .migration-backup path is the skill source root.

## ALLOW_SHALLOW_CATALOG_BUILD=1 in predev/prebuild
The Replit git clone is shallow (git rev-parse --is-shallow-repository returns true). build-catalog.js calls ensureFullHistory() which exits the process unless this env var is set.

**Why:** Without it, pnpm run dev exits at predev before vite ever starts.

**How to apply:** Always prefix node scripts/build-catalog.js with ALLOW_SHALLOW_CATALOG_BUILD=1 in package.json scripts.

## Vite config: no tailwindcss plugin for forge
The react-vite scaffold includes @tailwindcss/vite and tailwindcss imports in vite.config.ts. Forge uses its own CSS variables (not Tailwind) so those imports must be removed or vite fails to start.

## Forge uses react-router-dom + HashRouter, not wouter
Not in the pnpm-workspace.yaml catalog — must be added explicitly in package.json devDependencies at the desired semver range.
