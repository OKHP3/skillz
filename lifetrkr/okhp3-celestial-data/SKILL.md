---
name: okhp3-celestial-data
description: "OverKill Hill P³ offline celestial data engine. Use when implementing or reviewing moon-phase, zodiac-season, Mercury-retrograde, or upcoming lunar-event features in JavaScript or TypeScript. Also activate when a UI needs display-grade night-sky data without a network request. Preserve the repo's exact functions and return shapes, use the bundled deterministic implementation, and validate date data with the supplied scripts."
license: MIT
compatibility: "JavaScript or TypeScript with standard Date support; Node.js is required only for the bundled validation scripts. The calculation engine needs no network, package, or API access."
metadata:
  author: "Jamie Hill (OverKill Hill P³)"
  version: "1.3.0"
  category: "wellness-astrology"
  origin: "okhp3/skillz"
  homepage: "https://overkillhill.com"
  author-github: "https://github.com/OKHP3"
  implementation: "references/celestial.ts"
  scripts: "scripts/check-date.cjs; scripts/validate-mercury-dates.cjs"
  scope: "Moon phase, zodiac season, Mercury retrograde status, and upcoming New/Full Moon display data"
  boundaries: "Display-grade local calculations only; no external astrology service, natal chart, eclipse timing, or ephemeris beyond the bundled 2026-2031 data"
---

# okhp3-celestial-data

Use the skill as a small, deterministic display-data layer. It is intentionally
offline and dependency-free: do not replace the calculations with a network
request, an npm package, or observatory-grade claims.

## Scope

| In scope | Out of scope |
| --- | --- |
| `getMoonPhase`, `getAstroSeason`, `getMercuryStatus`, `getNextLunarEvents` | Observatory-grade precision; target display accuracy is about ±12 hours for lunar phase |
| TypeScript contracts and local UI integration | Planetary positions beyond Mercury retrograde |
| Bundled 2026–2031 Mercury date table | Eclipses, solstices, equinox timestamps, natal charts, or ephemeris beyond 2031 |
| Deterministic CLI checks and date-table validation | Server-side or API-backed celestial data |

## Workflow

### 1. Plan

1. Identify the required output and select the smallest public function set.
2. Inspect the destination types and existing imports before changing a caller.
3. Preserve these APIs and shapes:

   - `getMoonPhase(date?: Date)` → `{ name, emoji, illumination, daysUntilNext }`, with `illumination` as a `0.0–1.0` fraction.
   - `getAstroSeason(date?: Date)` → `{ sign, emoji, element, dates }`, with a zodiac symbol rather than a generic star.
   - `getMercuryStatus(date?: Date)` → `{ retrograde: boolean, endDate: string | null }`.
   - `getNextLunarEvents(count = 3)` → up to `count * 2` `{ type, date, emoji }` entries, alternating New Moon and Full Moon discoveries.

4. Decide whether the caller needs a local calendar date or an ISO date. The
   engine uses local month/day parts for moon and season display, while Mercury
   status compares `date.toISOString().split('T')[0]` against ISO date strings.

### 2. Validate

1. Read `references/celestial.ts` only when implementing, porting, or debugging
   the calculation. Copy the needed functions; do not recreate lookup tables
   from memory.
2. Run a fixed-date smoke check before and after changes:

   ```text
   node .agents/skills/okhp3-celestial-data/scripts/check-date.cjs 2026-06-26
   ```

   Confirm the output contains all three domains and that 2026-06-26 is not
   inside a Mercury window; the next bundled window begins 2026-07-17.
3. After any Mercury table edit, run:

   ```text
   node .agents/skills/okhp3-celestial-data/scripts/validate-mercury-dates.cjs
   ```

   Require exit code 0. Treat warnings about gaps as review signals, not proof
   that the ephemeris is correct.
4. Check deterministic behavior with the same explicit `Date` twice. Verify
   that no implementation path calls `fetch`, reads a secret, or adds a
   dependency. Report the actual validation commands and results.

### 3. Execute

1. Import the public functions from the app's existing `src/lib/celestial.ts`
   when working in Kieran's LifeTrkr; do not add a second celestial module.
2. When building from scratch, use `references/celestial.ts` as the source of
   truth and adapt only import paths and local type names.
3. Keep the calculation engine separate from rendering. Convert
   `illumination * 100` to a percentage at the UI boundary, and render
   `endDate: null` as “not currently retrograde.”
4. Keep the bundled `scripts/` files as executable validation tools. Use a
   fixed ISO date for reproducible bug reports instead of relying only on the
   current clock.

## Correctness notes and gotchas

- Moon phase uses Julian Date math with the `367 * y` conversion pattern, a
  known 2000 new-moon reference, and the average synodic month. It is suitable
  for display and wellness UX, not scientific observation.
- Astrological seasons use an `ASTRO_SEASONS` lookup keyed by `startMD` and
  `endMD` (`month * 100 + day`). Capricorn wraps across December and January.
- Mercury periods are a hardcoded 2026–2031 display ephemeris. The
  `2029-12-22` to `2030-01-11` entry intentionally crosses a year boundary;
  ISO lexicographic comparison handles it.
- Do not use a generic `⭐` for a zodiac emoji, rename `daysUntilNext`, change
  illumination to an integer percentage, or silently change date semantics.
- `getNextLunarEvents` advances from the current day and is therefore clock
  dependent. Use the other functions with explicit dates for deterministic
  tests; do not promise exact event timestamps.
- Treat ephemeris data as maintained content. Cite the source used for a future
  table update and run the validator; do not invent dates.

## Security and boundaries

All calculations run locally with no API key, network call, telemetry, or user
data. If a request asks for an astrology API, server endpoint, or sensitive
birth-chart service, state that it is outside this skill's boundary and do not
silently expand the implementation.

## Bundled resources

- `references/celestial.ts` — complete TypeScript implementation and contracts.
  Read it on demand for code, porting, or debugging.
- `scripts/check-date.cjs` — deterministic CLI inspection for a supplied date.
- `scripts/validate-mercury-dates.cjs` — ordering, overlap, ISO-format, and gap
  checks for the Mercury table.

## Output contract

Return the selected API, the files changed, the validation commands and results,
the accuracy boundary, and any unresolved ephemeris or timezone concern. Do not
claim astronomical precision or live-source verification when none was done.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
