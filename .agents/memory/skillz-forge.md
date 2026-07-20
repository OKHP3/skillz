---
name: Skillz Forge app
description: React+Vite SPA for the OKHP3/skillz repository — Phase 1 complete, lives in forge/
---

## What was built

Skillz Forge is a Phase 1 MVP SPA at `forge/` — the public discovery, search, and installation surface for the OKHP3/skillz repository.

## Key architecture facts

- **Catalog generation**: `forge/scripts/build-catalog.js` — walks repo root, finds all SKILL.md files at depth ≤ 3, parses YAML frontmatter + body, outputs `forge/src/data/catalog.json`. Run with `node forge/scripts/build-catalog.js` from repo root.
- **Framework**: React 19 + Vite 8, TypeScript, React Router v7. No component library — fully custom CSS from design tokens.
- **Search**: Fuse.js client-side index over 56 skills. Search runs entirely in-browser.
- **Port**: Runs on port 5000 (workflow: `cd forge && pnpm dev`).
- **Build**: `cd forge && pnpm build` — production build to `forge/dist/`.

## Design system

Tokens in `forge/src/index.css`. Canonical OKHP3 palette: espresso `#2a2320` (bg), teal `#1c3a34` (structural), ochre/copper `#c46a2c` (action), amber `#e6a03c` (hover), paper `#f6f2ee` (inspection panels only). Typography: Alfa Slab One (display H1/H2), DM Sans (body/UI), JetBrains Mono (slugs/paths/code).

**Card surface rule (critical):** Skill cards, family cards, stack cards, and contribute cards must use `--color-bg-secondary` (dark), NOT `--color-surface` (cream). Cream (`--color-surface`/paper) is reserved ONLY for skill detail inspection panels (single skill dossier). Using cream for list cards produces Anthropic-style white-panel look.

**Skill card title rule:** Skill names (slugs) render in mono font at body size. If a `displayName` exists and differs from the slug, show displayName in DM Sans as the primary label with the slug in mono below. Never use Alfa Slab One for slug identifiers.

**Color context rule:** Use `--color-text-dark` / `--color-text-muted-dark` on dark surfaces. Use `--color-text-light` / `--color-text-muted-light` only inside cream/paper panels (detail-article).

## Routes

`/` `/explore` `/skills/:family/:skillName` `/stacks` `/stacks/:stackId` `/faq` `/contribute` `/activity`

## HashRouter (required for GitHub Pages)

The app uses `HashRouter` (not `BrowserRouter`). All share URLs must be `https://okhp3.github.io/skillz/#/...`. The `buildShareUrl(hashPath)` helper in `clipboard.ts` generates these correctly. Never use `window.location.origin + pathname` for share URLs — this generates broken links on GitHub Pages.

## Analytics

GA4 Measurement ID: `G-VJ1BKXS27H`. Initialized in `index.html` with `send_page_view: false`. Route-aware tracking via `AnalyticsTracker` in `App.tsx`. Never send raw search text — only `query_length_bucket` and `result_count_bucket` aggregates. All helpers in `src/utils/analytics.ts`.

## Why: adding React locally to forge/

React and react-dom must be in `forge/package.json` directly — if installed globally via installLanguagePackages(), pnpm hoisting creates multiple React copies and BrowserRouter throws invalid hook call. Always install into forge/ explicitly.

## Stacks and FAQ

Static data in `forge/src/data/stacks.ts` (5 curated stacks) and `forge/src/data/faq.ts` (4 groups, 20 questions). Edit these files to add/update stacks and FAQ content.

## GitHub URLs

The catalog uses `OKHP3/skillz` as the repo slug. If the repo is renamed, update `GITHUB_BASE` and `RAW_BASE` in `forge/scripts/build-catalog.js` and `repoUrl()` in `forge/src/utils/github.ts`.
