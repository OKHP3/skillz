#!/usr/bin/env node
/**
 * okhp3-celestial-data — check-date.cjs
 * CLI utility: applies all four celestial functions to any date.
 *
 * Usage:
 *   node .agents/skills/okhp3-celestial-data/scripts/check-date.cjs
 *   node .agents/skills/okhp3-celestial-data/scripts/check-date.cjs 2026-07-20
 *   node .agents/skills/okhp3-celestial-data/scripts/check-date.cjs 2027-10-31
 *
 * No dependencies — standard Node.js only.
 * Exit 0 = success.  Exit 1 = invalid date argument.
 */

'use strict';

// ── Julian Date conversion ──────────────────────────────────────────────────
function toJulianDate(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return 367 * y
    - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4)
    + Math.floor(275 * m / 9)
    + d + 1721013.5;
}

// ── Moon Phase ──────────────────────────────────────────────────────────────
const KNOWN_NEW_MOON = 2451550.1;
const SYNODIC_MONTH  = 29.53058867;

const MOON_PHASES = [
  { name: 'New Moon',        emoji: '🌑', min: 0,      max: 0.0625 },
  { name: 'Waxing Crescent', emoji: '🌒', min: 0.0625, max: 0.25   },
  { name: 'First Quarter',   emoji: '🌓', min: 0.25,   max: 0.375  },
  { name: 'Waxing Gibbous',  emoji: '🌔', min: 0.375,  max: 0.5    },
  { name: 'Full Moon',       emoji: '🌕', min: 0.5,    max: 0.625  },
  { name: 'Waning Gibbous',  emoji: '🌖', min: 0.625,  max: 0.75   },
  { name: 'Last Quarter',    emoji: '🌗', min: 0.75,   max: 0.875  },
  { name: 'Waning Crescent', emoji: '🌘', min: 0.875,  max: 1.0    },
];

function getMoonPhase(date) {
  const jd    = toJulianDate(date);
  const raw   = ((jd - KNOWN_NEW_MOON) % SYNODIC_MONTH) / SYNODIC_MONTH;
  const phase = ((raw % 1) + 1) % 1;
  const cur   = MOON_PHASES.find(p => phase >= p.min && phase < p.max) || MOON_PHASES[0];
  const illumination   = phase <= 0.5 ? phase * 2 : (1 - phase) * 2;
  const daysUntilNext  = Math.ceil((cur.max - phase) * SYNODIC_MONTH);
  return { name: cur.name, emoji: cur.emoji, illumination, daysUntilNext };
}

// ── Astrological Season ─────────────────────────────────────────────────────
const ASTRO_SEASONS = [
  { sign: 'Capricorn',   emoji: '♑', element: 'Earth', dates: 'Dec 22 – Jan 19', startMD: 1222, endMD: 119  },
  { sign: 'Aquarius',    emoji: '♒', element: 'Air',   dates: 'Jan 20 – Feb 18', startMD: 120,  endMD: 218  },
  { sign: 'Pisces',      emoji: '♓', element: 'Water', dates: 'Feb 19 – Mar 20', startMD: 219,  endMD: 320  },
  { sign: 'Aries',       emoji: '♈', element: 'Fire',  dates: 'Mar 21 – Apr 19', startMD: 321,  endMD: 419  },
  { sign: 'Taurus',      emoji: '♉', element: 'Earth', dates: 'Apr 20 – May 20', startMD: 420,  endMD: 520  },
  { sign: 'Gemini',      emoji: '♊', element: 'Air',   dates: 'May 21 – Jun 20', startMD: 521,  endMD: 620  },
  { sign: 'Cancer',      emoji: '♋', element: 'Water', dates: 'Jun 21 – Jul 22', startMD: 621,  endMD: 722  },
  { sign: 'Leo',         emoji: '♌', element: 'Fire',  dates: 'Jul 23 – Aug 22', startMD: 723,  endMD: 822  },
  { sign: 'Virgo',       emoji: '♍', element: 'Earth', dates: 'Aug 23 – Sep 22', startMD: 823,  endMD: 922  },
  { sign: 'Libra',       emoji: '♎', element: 'Air',   dates: 'Sep 23 – Oct 22', startMD: 923,  endMD: 1022 },
  { sign: 'Scorpio',     emoji: '♏', element: 'Water', dates: 'Oct 23 – Nov 21', startMD: 1023, endMD: 1121 },
  { sign: 'Sagittarius', emoji: '♐', element: 'Fire',  dates: 'Nov 22 – Dec 21', startMD: 1122, endMD: 1221 },
];

function getAstroSeason(date) {
  const md    = (date.getMonth() + 1) * 100 + date.getDate();
  const found = ASTRO_SEASONS.find(s =>
    s.startMD > s.endMD ? md >= s.startMD || md <= s.endMD : md >= s.startMD && md <= s.endMD
  );
  return found || ASTRO_SEASONS[0];
}

// ── Mercury Retrograde ──────────────────────────────────────────────────────
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
  { start: '2029-01-07', end: '2029-01-27' },
  { start: '2029-05-01', end: '2029-05-25' },
  { start: '2029-09-02', end: '2029-09-25' },
  { start: '2029-12-22', end: '2030-01-11' },
  { start: '2030-04-13', end: '2030-05-06' },
  { start: '2030-08-16', end: '2030-09-08' },
  { start: '2030-12-06', end: '2030-12-25' },
  { start: '2031-03-26', end: '2031-04-18' },
  { start: '2031-07-29', end: '2031-08-22' },
  { start: '2031-11-19', end: '2031-12-09' },
];

function getMercuryStatus(date) {
  const iso    = date.toISOString().split('T')[0];
  const period = MERCURY_RETROGRADE.find(r => iso >= r.start && iso <= r.end);
  return { retrograde: !!period, endDate: period ? period.end : null };
}

function findNextRetrograde(date) {
  const iso = date.toISOString().split('T')[0];
  return MERCURY_RETROGRADE.find(r => r.start > iso) || null;
}

// ── Main ────────────────────────────────────────────────────────────────────
const arg  = process.argv[2];
let   date;

if (arg) {
  const parsed = new Date(arg + 'T12:00:00Z');
  if (isNaN(parsed.getTime())) {
    console.error(`✗ Invalid date: "${arg}"\n  Expected format: YYYY-MM-DD (e.g. 2026-07-20)`);
    process.exit(1);
  }
  date = parsed;
} else {
  date = new Date();
}

const iso    = date.toISOString().split('T')[0];
const moon   = getMoonPhase(date);
const season = getAstroSeason(date);
const merc   = getMercuryStatus(date);
const next   = findNextRetrograde(date);

console.log('');
console.log(`  Celestial status for ${iso}`);
console.log('  ─────────────────────────────────────────');
console.log(`  ${moon.emoji}  Moon:    ${moon.name}`);
console.log(`         Illumination: ${Math.round(moon.illumination * 100)}%  ·  Days until next phase: ${moon.daysUntilNext}`);
console.log('');
console.log(`  ${season.emoji}  Season:  ${season.sign} (${season.element})`);
console.log(`         ${season.dates}`);
console.log('');

if (merc.retrograde) {
  console.log(`  ☿  Mercury: RETROGRADE — ends ${merc.endDate}`);
} else {
  const nextStr = next ? `Next: ${next.start} – ${next.end}` : 'No further periods in data (update array)';
  console.log(`  ☿  Mercury: Not retrograde  ·  ${nextStr}`);
}
console.log('');
