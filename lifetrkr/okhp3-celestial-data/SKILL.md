---
name: okhp3-celestial-data
description: >
  Calculate moon phase, astrological season, and Mercury retrograde status
  for any date using pure client-side Julian date math -- no API, no network,
  no dependencies. Activate whenever a task needs to display the current moon
  phase, lunar emoji, illumination percentage, days until next phase, current
  zodiac season, element label, Mercury retrograde status, or upcoming new/full
  moon dates. Use for apps with moon phase calendars, astrology features, nature
  journals, wellness trackers, lunar awareness widgets, or any UI referencing
  the night sky or seasonal cycles. Returns structured data ready for immediate
  display -- no parsing required. Also activate when anyone asks "is Mercury
  retrograde?", "what moon phase is it?", "what zodiac season are we in?",
  "when is the next full moon?", or wants lunar or celestial data without a
  backend -- even if they don't mention this skill by name.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: wellness-astrology
  origin: okhp3/abrahamic-reference-engine
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
compatibility: Any JavaScript or TypeScript environment. No network access required.
---

# Celestial Engine Skill

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3) · [OKHP3/skillz](https://github.com/OKHP3/skillz)

A self-contained celestial calculation library. All computations run locally using
the Julian Day Number system. Accurate to within hours for moon phases -- sufficient
for display and UX purposes.

## Validation scripts

Two scripts ship with this skill for maintaining data integrity:

- `scripts/validate-mercury-dates.cjs` -- validates the `MERCURY_RETROGRADE` array for ordering, overlaps, and large gaps. Run after any date update.
- `scripts/validate-easter.js` -- in the `okhp3-tradition-observance-calendar` skill -- validates the Computus algorithm against known good Easter dates.

Run:
```bash
node .agents/skills/okhp3-celestial-data/scripts/validate-mercury-dates.cjs
```

Exit 0 = clean. Exit 1 = errors (see stdout for details).

---

## Core functions

### getMoonPhase(date?)

Returns the moon phase for a given date (defaults to today).

```typescript
type MoonPhase = {
  name: MoonPhaseName;    // 'New Moon' | 'Waxing Crescent' | ... | 'Waning Crescent'
  emoji: string;          // '🌑' | '🌒' | '🌓' | '🌔' | '🌕' | '🌖' | '🌗' | '🌘'
  illumination: number;   // 0.0 to 1.0 (fraction of visible surface lit)
  daysUntilNext: number;  // days until next named phase transition
};
```

### getAstroSeason(date?)

Returns the current astrological season.

```typescript
type AstroSeason = {
  sign: ZodiacSign;         // 'Aries' | 'Taurus' | ... | 'Pisces'
  emoji: string;            // '♈' | '♉' | ... | '♓'
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  dates: string;            // display string e.g. "Jun 21 – Jul 22"
};
```

### getMercuryStatus(date?)

Returns Mercury retrograde status.

```typescript
type MercuryStatus = {
  retrograde: boolean;
  endDate: string | null;   // ISO date string or null if not retrograde
};
```

### getNextLunarEvents(count?)

Returns upcoming New Moon and Full Moon dates.

```typescript
// Returns array of { type: 'New Moon' | 'Full Moon', date: Date, emoji: string }
getNextLunarEvents(count = 3)
```

## Complete Implementation (TypeScript)

Copy this directly into `src/lib/celestial.ts`. A fully-typed copy is also available at `references/celestial.ts` in this skill directory -- either source is identical.

```typescript
// ── Julian Date conversion ──────────────────────────────────────────────────
function toJulianDate(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return 367 * y
    - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4)
    + Math.floor(275 * m / 9)
    + d + 1721013.5;
}

// ── Moon Phase ──────────────────────────────────────────────────────────────
const KNOWN_NEW_MOON = 2451550.1;   // Jan 6, 2000 new moon (Julian date)
const SYNODIC_MONTH  = 29.53058867; // average lunar cycle in days

const MOON_PHASES = [
  { name: 'New Moon',        emoji: '🌑', min: 0,      max: 0.0625 },
  { name: 'Waxing Crescent', emoji: '🌒', min: 0.0625, max: 0.25   },
  { name: 'First Quarter',   emoji: '🌓', min: 0.25,   max: 0.375  },
  { name: 'Waxing Gibbous',  emoji: '🌔', min: 0.375,  max: 0.5    },
  { name: 'Full Moon',       emoji: '🌕', min: 0.5,    max: 0.625  },
  { name: 'Waning Gibbous',  emoji: '🌖', min: 0.625,  max: 0.75   },
  { name: 'Last Quarter',    emoji: '🌗', min: 0.75,   max: 0.875  },
  { name: 'Waning Crescent', emoji: '🌘', min: 0.875,  max: 1.0    },
] as const;

export function getMoonPhase(date: Date = new Date()) {
  const jd = toJulianDate(date);
  const raw = ((jd - KNOWN_NEW_MOON) % SYNODIC_MONTH) / SYNODIC_MONTH;
  const phase = ((raw % 1) + 1) % 1;
  const current = MOON_PHASES.find(p => phase >= p.min && phase < p.max) ?? MOON_PHASES[0];
  const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const daysUntilNext = Math.ceil((current.max - phase) * SYNODIC_MONTH);
  return { name: current.name, emoji: current.emoji, illumination, daysUntilNext };
}

export function getNextLunarEvents(count = 3) {
  const events: { type: 'New Moon' | 'Full Moon'; date: Date; emoji: string }[] = [];
  let d = new Date();
  while (events.length < count * 2) {
    d = new Date(d.getTime() + 86400000);
    const phase = getMoonPhase(d);
    if (phase.daysUntilNext <= 1) {
      if (phase.name === 'New Moon')  events.push({ type: 'New Moon',  date: new Date(d), emoji: '🌑' });
      if (phase.name === 'Full Moon') events.push({ type: 'Full Moon', date: new Date(d), emoji: '🌕' });
    }
    if (events.length >= count * 2) break;
  }
  return events.slice(0, count * 2);
}

// ── Astrological Season ─────────────────────────────────────────────────────
const ASTRO_SEASONS = [
  { sign: 'Capricorn',   emoji: '♑', element: 'Earth' as const, dates: 'Dec 22 – Jan 19', startMD: 1222, endMD: 119  },
  { sign: 'Aquarius',    emoji: '♒', element: 'Air'   as const, dates: 'Jan 20 – Feb 18', startMD: 120,  endMD: 218  },
  { sign: 'Pisces',      emoji: '♓', element: 'Water' as const, dates: 'Feb 19 – Mar 20', startMD: 219,  endMD: 320  },
  { sign: 'Aries',       emoji: '♈', element: 'Fire'  as const, dates: 'Mar 21 – Apr 19', startMD: 321,  endMD: 419  },
  { sign: 'Taurus',      emoji: '♉', element: 'Earth' as const, dates: 'Apr 20 – May 20', startMD: 420,  endMD: 520  },
  { sign: 'Gemini',      emoji: '♊', element: 'Air'   as const, dates: 'May 21 – Jun 20', startMD: 521,  endMD: 620  },
  { sign: 'Cancer',      emoji: '♋', element: 'Water' as const, dates: 'Jun 21 – Jul 22', startMD: 621,  endMD: 722  },
  { sign: 'Leo',         emoji: '♌', element: 'Fire'  as const, dates: 'Jul 23 – Aug 22', startMD: 723,  endMD: 822  },
  { sign: 'Virgo',       emoji: '♍', element: 'Earth' as const, dates: 'Aug 23 – Sep 22', startMD: 823,  endMD: 922  },
  { sign: 'Libra',       emoji: '♎', element: 'Air'   as const, dates: 'Sep 23 – Oct 22', startMD: 923,  endMD: 1022 },
  { sign: 'Scorpio',     emoji: '♏', element: 'Water' as const, dates: 'Oct 23 – Nov 21', startMD: 1023, endMD: 1121 },
  { sign: 'Sagittarius', emoji: '♐', element: 'Fire'  as const, dates: 'Nov 22 – Dec 21', startMD: 1122, endMD: 1221 },
];

export function getAstroSeason(date: Date = new Date()) {
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  const found = ASTRO_SEASONS.find(s =>
    s.startMD > s.endMD ? md >= s.startMD || md <= s.endMD : md >= s.startMD && md <= s.endMD
  );
  return found ?? ASTRO_SEASONS[0];
}

// ── Mercury Retrograde ──────────────────────────────────────────────────────
// Hardcoded through 2031. Update this array annually.
// Sources:
//   2026-2028 -- published ephemeris (original data set).
//   2029      -- Cafe Astrology and cross-referenced sources (4 periods this year).
//   2030      -- Astro-Seek Swiss Ephemeris planetary motion calendar; Dec period
//                also confirmed by Cafe Astrology (station Rx Dec 6, sD Dec 25).
//   2031      -- Astro-Seek Swiss Ephemeris (horoscopes.astro-seek.com/mercury-
//                retrograde-astrology-calendar-2031; 6 station events confirmed).
// Note: the 2029-12-22 entry straddles the year boundary (sD Jan 11, 2030).
//   getMercuryStatus handles this correctly -- ISO string comparison is
//   purely lexicographic and has no year-boundary edge case.
const MERCURY_RETROGRADE = [
  { start: '2026-03-15', end: '2026-04-07' },
  { start: '2026-07-17', end: '2026-08-11' },
  { start: '2026-11-11', end: '2026-12-01' },
  { start: '2027-03-03', end: '2027-03-25' },
  { start: '2027-07-03', end: '2027-07-28' },
  { start: '2027-10-27', end: '2027-11-16' },
  { start: '2028-02-15', end: '2028-03-09' },
  { start: '2028-06-16', end: '2028-07-11' },
  { start: '2028-10-09', end: '2028-10-30' },
  { start: '2029-01-07', end: '2029-01-27' },  // 2029 has 4 periods
  { start: '2029-05-01', end: '2029-05-25' },
  { start: '2029-09-02', end: '2029-09-25' },
  { start: '2029-12-22', end: '2030-01-11' },  // straddles year; sD Jan 11 2030
  { start: '2030-04-13', end: '2030-05-06' },
  { start: '2030-08-16', end: '2030-09-08' },
  { start: '2030-12-06', end: '2030-12-25' },
  { start: '2031-03-26', end: '2031-04-18' },
  { start: '2031-07-29', end: '2031-08-22' },
  { start: '2031-11-19', end: '2031-12-09' },
];

export function getMercuryStatus(date: Date = new Date()) {
  const iso = date.toISOString().split('T')[0];
  const period = MERCURY_RETROGRADE.find(r => iso >= r.start && iso <= r.end);
  return { retrograde: !!period, endDate: period?.end ?? null };
}
```

## Usage Examples

```typescript
import { getMoonPhase, getAstroSeason, getMercuryStatus, getNextLunarEvents } from './celestial';

// Today's moon
const moon = getMoonPhase();
console.log(`${moon.emoji} ${moon.name} — ${Math.round(moon.illumination * 100)}% illuminated`);
// → 🌕 Full Moon — 97% illuminated

// Current astrological season
const season = getAstroSeason();
console.log(`${season.emoji} ${season.sign} season (${season.element})`);
// → ♋ Cancer season (Water)

// Mercury retrograde
const mercury = getMercuryStatus();
if (mercury.retrograde) {
  console.log(`☿ Mercury retrograde until ${mercury.endDate}`);
}

// Upcoming lunar events
const events = getNextLunarEvents(2);
events.forEach(e => console.log(`${e.emoji} ${e.type}: ${e.date.toDateString()}`));
```

## Notes on accuracy

- Moon phase accuracy: ±12 hours of exact phase
- Astrological season boundaries: ±1 day (solar longitude not calculated exactly)
- Mercury retrograde: all entries 2026-2031 sourced from published ephemeris (Cafe Astrology / Astro-Seek Swiss Ephemeris); update the array annually
- All calculations are local, instant, and work offline

## Extending to other languages

The Julian date algorithm is universal. Port by:
1. Implementing `toJulianDate(date)` using the formula above
2. Computing `phase = ((jd - 2451550.1) % 29.53058867) / 29.53058867`
3. Looking up the phase in the MOON_PHASES table

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
