---
name: Skillz Forge app
description: React+Vite SPA for the OKHP3/skillz repository — Phase 1 complete, lives in forge/
---

## What was built

Skillz Forge is the public discovery, search, and installation SPA at `forge/` for the OKHP3/skillz repository.

## Key architecture facts

- **Catalog generation**: `forge/scripts/build-catalog.js` — walks repo root, finds all SKILL.md files at depth ≤ 3, parses YAML frontmatter + body, outputs `forge/src/data/catalog.json`. Run with `node forge/scripts/build-catalog.js` from repo root. Per-skill `lastModified` and `commitSha` are extracted via `git log -n 1 --format="%aI %H"` for each file. See "displayName derivation" section below.
- **Framework**: React 19 + Vite 8, TypeScript, React Router v7. No component library — fully custom CSS from design tokens.
- **Search**: Fuse.js client-side index (`forge/src/utils/search.ts`). Indexes: name, displayName, description, triggers, inputs, outputs, family, category, topics, tools, runtimes, companions, boundaries, examples. Search runs entirely in-browser with URL-persisted filters (q, family, maturity, sort).
- **Port**: Runs on port 5000 (workflow: `cd forge && pnpm dev`).
- **Build**: `cd forge && pnpm build` — production build to `forge/dist/`.

## Design system

Tokens in `forge/src/index.css`. Canonical OverKill Hill P³™ palette: espresso `#2a2320` (bg), teal `#1c3a34` (structural), orange `#c46a2c` (action/copper), amber `#e6a03c` (highlight), paper `#f6f2ee` (inspection panels). Typography: **Alfa Slab One** (display headings) + **DM Sans** (body/UI) + **JetBrains Mono** (code/paths). Do NOT use Playfair Display or Inter — those are stale references.

## Dark vs. light surface color tokens

Two surface types exist:
- **Dark**: `--color-bg` (espresso, near-black) and `--color-bg-secondary` — use `--color-text-muted-dark`, `--color-border-dark`
- **Cream/light**: `.detail-article` panel (`--color-surface` = paper) — use `--color-text-muted-light`, `--color-border-light`

Mixing tokens across surface types makes text invisible. This has bitten us before.

## Routes

`/` `/explore` `/skills/:family/:skillName` `/stacks` `/stacks/:stackId` `/compare` `/faq` `/contribute` `/activity`

## HashRouter (required for GitHub Pages)

The app uses `HashRouter` (not `BrowserRouter`). All share URLs must be `https://okhp3.github.io/skillz/#/...`. The `buildShareUrl(hashPath)` helper in `clipboard.ts` generates these correctly. Never use `window.location.origin + pathname` for share URLs — this generates broken links on GitHub Pages.

## Analytics

GA4 Measurement ID: `G-VJ1BKXS27H`. Initialized in `index.html` with `send_page_view: false`. Route-aware tracking via `AnalyticsTracker` in `App.tsx`. Never send raw search text — only `query_length_bucket` and `result_count_bucket` aggregates.

## Why: adding React locally to forge/

React and react-dom must be in `forge/package.json` directly — if installed globally via installLanguagePackages(), pnpm hoisting creates multiple React copies and throws invalid hook call. Always install into forge/ explicitly.

## Stacks and FAQ

Static data in `forge/src/data/stacks.ts` (5 curated stacks) and `forge/src/data/faq.ts`. Edit these files to add/update stacks and FAQ content.

## GitHub URLs

The catalog uses `OKHP3/skillz` as the repo slug. If the repo is renamed, update `GITHUB_BASE` and `RAW_BASE` in `forge/scripts/build-catalog.js` and `repoUrl()` in `forge/src/utils/github.ts`.

## displayName derivation (build-catalog.js)

1. Extract H1 heading from SKILL.md body (`/^#\s+(.+)$/m`)
2. If H1 exists AND H1 (lowercased) ≠ skill name slug (lowercased) → use H1 as displayName
3. Otherwise → title-case the slug (strip `okhp3-` prefix, split on `-`) with BRAND_MAP for: ChatGPT, GPT, AI, LLM, SEO, M365, OKHP3, API, BPMN, SOP, CSV, LinkedIn, GitHub, TikTok

Many SKILL.md files use the skill slug as their H1 — the equality check detects this and falls through to the title-cased slug.

## SkillDetail page fields (as of 2026-07-22)

Displays: displayName (h1), slug (secondary mono), family, maturity (with tooltip), version, license, path, install URL, description, triggers, avoid, inputs/outputs (side-by-side grid), boundaries, tools chips, runtimes chips, maturity explanation, examples, companions (linked), related skills (filtered to exclude companions), provenance panel (author, origin, path, lastModified, commitSha), contribute section.

## Catalog skill fields

All 67 skills have: name, displayName, family, skillDir, path, description, version, license, category, origin, author, homepage, maturity, status, tags, topics, triggers, avoid, companions, examples, inputs, outputs, tools, runtimes, boundaries, rawUrl, githubUrl, lastModified (ISO 8601, from per-file git log), commitSha (per-file short SHA).
