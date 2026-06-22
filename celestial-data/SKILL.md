---
name: celestial-data
description: >
  Provides moon phase, astrological season, and planetary retrograde status using
  pure client-side JavaScript calculations — no external API, no network calls, works
  offline. Use when building apps that need lunar phase data, current zodiac/sun sign
  season, Mercury retrograde detection, or upcoming full moon / new moon dates. Also
  useful when a user asks about the current moon phase, astrological period, or
  planetary status without wanting to set up a third-party API.
license: MIT
metadata:
  author: Jamie Hill (OKHP3 / OverKill Hill P³)
  version: "1.0"
  origin: Kieran's LifeTrkr (https://github.com/OKHP3/kierans-lifetrkr)
  published-via: OKHP3/skillz
---

# celestial-data

Calculate moon phase, astrological season, and planetary retrograde status entirely
client-side using Julian date mathematics. No API key. No network dependency. Works
offline. Accurate to within 1–2 hours for practical display purposes.

## When to use this skill

- Building an app that shows the current moon phase
- Displaying the current astrological/sun sign season
- Showing Mercury retrograde status with start/end dates
- Generating upcoming full moon or new moon dates for a calendar
- Any context where a user wants celestial data without a paid API

## Core implementation

Copy `celestial.ts` from `references/celestial.ts` into your project's `src/lib/` folder.
It exports four functions and uses no external dependencies.

### getMoonPhase(date?)

Returns the current moon phase.

```typescript
import { getMoonPhase } from './lib/celestial';

const phase = getMoonPhase(); // defaults to today
// Returns: { name, emoji, illumination, daysUntilNext }

console.log(phase.name);         // "Waxing Gibbous"
console.log(phase.emoji);        // "🌔"
console.log(phase.illumination); // 0.72 (72% lit)
console.log(phase.daysUntilNext); // 3 (days until Full Moon)
```

The 8 possible phase names:
New Moon · Waxing Crescent · First Quarter · Waxing Gibbous ·
Full Moon · Waning Gibbous · Last Quarter · Waning Crescent

### getAstroSeason(date?)

Returns the current astrological / sun sign season.

```typescript
import { getAstroSeason } from './lib/celestial';

const season = getAstroSeason();
// Returns: { sign, emoji, element, dates }

console.log(season.sign);    // "Cancer"
console.log(season.emoji);   // "♋"
console.log(season.element); // "Water"
console.log(season.dates);   // "Jun 21 – Jul 22"
```

### getMercuryStatus(date?)

Returns Mercury retrograde status and the end date if currently retrograde.
Retrograde dates are hardcoded through 2028 (published dates, no calculation needed).

```typescript
import { getMercuryStatus } from './lib/celestial';

const mercury = getMercuryStatus();
// Returns: { retrograde: boolean, endDate: string | null }

if (mercury.retrograde) {
  console.log(`Retrograde until ${mercury.endDate}`); // "2026-04-07"
}
```

### getNextLunarEvents(count?)

Returns the next N new moons and full moons as dated events. Default count: 3 of each.

```typescript
import { getNextLunarEvents } from './lib/celestial';

const events = getNextLunarEvents(3);
// Returns: Array of { type: 'New Moon' | 'Full Moon', date: Date, emoji: string }

events.forEach(e => {
  console.log(`${e.emoji} ${e.type}: ${e.date.toLocaleDateString()}`);
});
// 🌑 New Moon: 6/25/2026
// 🌕 Full Moon: 7/10/2026
// ...
```

## Integration patterns

### Display moon phase in a React component

```tsx
import { getMoonPhase, getAstroSeason } from '../lib/celestial';

export function CelestialBadge() {
  const moon = getMoonPhase();
  const season = getAstroSeason();

  return (
    <div className="flex gap-2 text-sm">
      <span>{moon.emoji} {moon.name}</span>
      <span>·</span>
      <span>{season.emoji} {season.sign} season</span>
    </div>
  );
}
```

### Add moon dots to a calendar grid

```typescript
// For each date cell in a calendar:
const phase = getMoonPhase(cellDate);
const isLunarEvent = phase.daysUntilNext <= 1 &&
  (phase.name === 'Full Moon' || phase.name === 'New Moon');
```

### Show Mercury retrograde banner conditionally

```tsx
const mercury = getMercuryStatus();
{mercury.retrograde && (
  <Banner>
    ☿ Mercury retrograde — ends {mercury.endDate}
  </Banner>
)}
```

## How the math works (summary)

Moon phase uses Julian Date calculation anchored to a known New Moon
(January 6, 2000 = Julian Date 2451550.1) and the synodic month (29.53058867 days).
The phase fraction (0.0–1.0) maps to one of 8 named phases.

Astrological season uses hardcoded month/day ranges for each of the 12 signs.
No ephemeris needed — sun sign dates are stable within ±1 day per year.

Mercury retrograde dates are hardcoded from published ephemeris data through 2028.
No calculation needed — these are fixed calendar dates.

## Accuracy

Sufficient for display purposes. Not suitable for precise astronomical work.
Moon phase accurate to within ~1–2 hours. Astrological season accurate to ±1 day.
Mercury retrograde dates are exact (published, not calculated).

## Files

- `references/celestial.ts` — Full TypeScript implementation, copy into your project

## Edge cases

- Dates in early January may return Capricorn correctly (spans Dec–Jan year boundary)
- `getMoonPhase` with no argument uses `new Date()` — always call fresh for real-time display
- `getNextLunarEvents` may return events within the same day if called near a phase boundary

## Mercury retrograde dates (hardcoded through 2028)

| Start | End |
|---|---|
| 2026-03-15 | 2026-04-07 |
| 2026-07-17 | 2026-08-11 |
| 2026-11-11 | 2026-12-01 |
| 2027-03-03 | 2027-03-25 |
| 2027-07-03 | 2027-07-28 |
| 2027-10-27 | 2027-11-16 |
| 2028-02-15 | 2028-03-09 |
| 2028-06-16 | 2028-07-11 |
| 2028-10-09 | 2028-10-30 |

Update this list by consulting any standard astronomical ephemeris.
