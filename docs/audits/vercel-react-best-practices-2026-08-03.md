# vercel-react-best-practices audit — Skillz Forge (`forge/`)

**Date**: 2026-08-03
**Scope**: `forge/src/**` (React 18 + Vite SPA, ~1,800 lines across pages/components)
**Method**: Targeted grep + `vite build` chunk inspection against the skill's rule categories. Not every one of the 70 rules was checked individually; this is a proportionate pass focused on the categories most relevant to a small catalog SPA (bundle size, rendering, re-renders).

## Findings

### Already following the guidelines (no action needed)
- `bundle-dynamic-imports` — every route is already code-split with `lazy()`: `forge/src/App.tsx:9-17` (`Home`, `Explore`, `SkillDetail`, `Stacks`, `StackDetail`, `Compare`, `FAQ`, `Contribute`, `Activity`).
- `client-event-listeners` — the `prefers-color-scheme` media-query listener in `forge/src/contexts/ThemeContext.tsx:36-40` is added and removed correctly inside a `useEffect` cleanup.
- `client-localstorage-schema` — both localStorage call sites (`forge/src/contexts/ThemeContext.tsx:30,53` and `forge/src/utils/clipboard.ts:119,139`) are wrapped in `try/catch` and use a single versioned key each.
- `rerender-functional-setstate`-adjacent — `Explore.tsx:59` already wraps its filter updater in `useCallback`.

### Findings worth fixing

1. **`bundle-*` (bundle size) — `catalog.json` ships as a ~931 kB JS chunk to every page that needs it**
   `forge/src/data/catalog.json` (974 KB on disk, including full `bodyText` for all 113 skills) is imported as a static ES module in 7 pages (`Home.tsx`, `Explore.tsx`, `SkillDetail.tsx`, `Stacks.tsx`, `StackDetail.tsx`, `Compare.tsx`, `Activity.tsx`). Vite correctly dedupes it into one shared chunk (`dist/assets/catalog-*.js`, 931 kB / 256.74 kB gzip), which is exactly the chunk the production build warns about (`Some chunks are larger than 500 kB after minification`). Because it's a static JS import rather than a `fetch()` of a JSON asset, the browser must download and parse the whole thing as JavaScript before the first catalog-driven page can render, and it can't be served with independent HTTP caching from the app code.
   **Fix direction**: serve `catalog.json` as a static asset and `fetch()` it at runtime (optionally trimming `bodyText` from the list view and fetching full skill detail body text lazily per-skill), so it is cached and transferred as JSON instead of bundled JS, and isn't blocking on first paint of pages that only need a subset of fields.

2. **Dead code shipping in the entry bundle — unused Vite-scaffold counter**
   `forge/src/main.ts` (a leftover `setupCounter`/`#counter` demo from the Vite template) is not referenced anywhere; the real entry point is `forge/src/main.tsx` (`forge/index.html:95`). `main.ts` and its sibling scaffold assets are dead code — not itself a named rule violation, but the same "each byte should be intentional" spirit as the bundle-size rules.
   **Fix direction**: delete `forge/src/main.ts` (confirm nothing imports it first — checked, nothing does).

## Rules not checked in this pass
Server/RSC rules (`server-*`), async-waterfall rules (`async-*`), and most `js-*` micro-optimizations were not evaluated — this app has no server components or heavy nested-fetch chains, and no obvious hot loops were spotted during this read. A deeper pass would re-check these if the app grows a server layer.

## Next check
Re-run `pnpm run build` after implementing finding #1 and confirm the 500 kB chunk warning is gone or substantially reduced.
