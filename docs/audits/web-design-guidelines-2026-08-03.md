# web-design-guidelines audit — Skillz Forge

**Date**: 2026-08-03
**Guidelines fetched from**: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md (fetched fresh this run, per the skill's contract)
**Files reviewed**: `forge/src/pages/Home.tsx`, `forge/src/pages/Explore.tsx`, `forge/src/components/ui/ThemeToggle.tsx`, `forge/src/index.css`

## forge/src/index.css

- `forge/src/index.css:653` - `transition: all var(--transition);` → anti-pattern, list properties explicitly instead of `all`.
- `forge/src/index.css:684-687` - `.input-text:focus { outline: none; ... }` uses `:focus` not `:focus-visible`, so the replacement ring (`border-color` only, no ring/shadow) shows on mouse click too, not just keyboard focus. Prefer `:focus-visible` and a visible `focus-visible:ring`-style treatment.
- ✓ pass - `@media (prefers-reduced-motion: reduce)` block exists (`index.css:456`).
- ✓ pass - `focus-visible` is used elsewhere (4 occurrences) for other interactive elements.

## forge/src/pages/Home.tsx

- `forge/src/pages/Home.tsx:76-78` - placeholder text `"e.g. document a messy business process..."` uses literal `...` instead of the `…` ellipsis character.
- `forge/src/pages/Home.tsx:96-101` - decorative `<img>` (MurderBird mascot) correctly uses `alt=""` and `aria-hidden="true"`, but has no explicit `width`/`height`, so it can contribute to layout shift while loading.
- ✓ pass - the search `<input>` has an associated `<label>` via `htmlFor`/`id` (`home-search`).

## forge/src/pages/Explore.tsx

- ✓ pass - `explore-meta` result count region uses `aria-live="polite" aria-atomic="true"` (`Explore.tsx:208`) for the async result-count update.
- Not verified in this pass: whether filters (family/maturity/evidence) are reflected in the URL query string for deep-linking, per the "URL reflects state" rule — worth a follow-up check since Explore already reads an initial `?q=` param.

## forge/src/components/ui/ThemeToggle.tsx

- ✓ pass - icon-only buttons have `aria-label={label}` (line 53) and the group has `role="group" aria-label="Color theme"` (line 48).

## Not checked in this pass
Forms beyond the home search input, dark-mode `color-scheme`/`<meta name="theme-color">` wiring, i18n/`Intl.*` usage (app is English-only today so likely not applicable), and touch/safe-area rules (no full-bleed or modal/drawer surfaces exist yet in this app).
