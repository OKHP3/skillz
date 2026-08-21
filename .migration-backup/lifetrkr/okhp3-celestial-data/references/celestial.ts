import type { MoonPhase, MoonPhaseName, AstroSeason, ZodiacSign } from '../types'

// ─── Moon Phase (Julian day math — no external API) ──────────────────────────

function toJulianDate(date: Date): number {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return (
    367 * y
    - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4)
    + Math.floor(275 * m / 9)
    + d + 1721013.5
  )
}

const MOON_PHASES: { name: MoonPhaseName; emoji: string; min: number; max: number }[] = [
  { name: 'New Moon',        emoji: '🌑', min: 0,      max: 0.0625 },
  { name: 'Waxing Crescent', emoji: '🌒', min: 0.0625, max: 0.25   },
  { name: 'First Quarter',   emoji: '🌓', min: 0.25,   max: 0.375  },
  { name: 'Waxing Gibbous',  emoji: '🌔', min: 0.375,  max: 0.5    },
  { name: 'Full Moon',       emoji: '🌕', min: 0.5,    max: 0.625  },
  { name: 'Waning Gibbous',  emoji: '🌖', min: 0.625,  max: 0.75   },
  { name: 'Last Quarter',    emoji: '🌗', min: 0.75,   max: 0.875  },
  { name: 'Waning Crescent', emoji: '🌘', min: 0.875,  max: 1.0    },
]

const KNOWN_NEW_MOON = 2451550.1  // Jan 6, 2000
const SYNODIC_MONTH  = 29.53058867

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const jd = toJulianDate(date)
  const raw = ((jd - KNOWN_NEW_MOON) % SYNODIC_MONTH) / SYNODIC_MONTH
  const phase = ((raw % 1) + 1) % 1
  const current = MOON_PHASES.find(p => phase >= p.min && phase < p.max) ?? MOON_PHASES[0]
  const illumination = phase <= 0.5 ? phase * 2 : (1 - phase) * 2
  const daysUntilNext = Math.ceil((current.max - phase) * SYNODIC_MONTH)
  return {
    name: current.name,
    emoji: current.emoji,
    illumination,
    daysUntilNext,
  }
}

export function getNextLunarEvents(
  count: number = 3,
): { type: 'New Moon' | 'Full Moon'; date: Date; emoji: string }[] {
  const events: { type: 'New Moon' | 'Full Moon'; date: Date; emoji: string }[] = []
  const now = new Date()
  let d = new Date(now)
  while (events.length < count * 2) {
    d = new Date(d.getTime() + 86400000)
    const phase = getMoonPhase(d)
    if (phase.daysUntilNext <= 1) {
      if (phase.name === 'New Moon')
        events.push({ type: 'New Moon',  date: new Date(d), emoji: '🌑' })
      if (phase.name === 'Full Moon')
        events.push({ type: 'Full Moon', date: new Date(d), emoji: '🌕' })
    }
    if (events.length >= count * 2) break
  }
  return events.slice(0, count * 2)
}

// ─── Astrological Season ──────────────────────────────────────────────────────

const ASTRO_SEASONS: (AstroSeason & { startMD: number; endMD: number })[] = [
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
]

export function getAstroSeason(date: Date = new Date()): AstroSeason {
  const md = (date.getMonth() + 1) * 100 + date.getDate()
  const found = ASTRO_SEASONS.find(s => {
    if (s.startMD > s.endMD) return md >= s.startMD || md <= s.endMD
    return md >= s.startMD && md <= s.endMD
  })
  return found ?? ASTRO_SEASONS[0]
}

// ─── Mercury Retrograde (hardcoded 2026-2032) ─────────────────────────────────
// Sources:
//   2026-2028 -- published ephemeris (original data set).
//   2029-2031 -- verified against NASA JPL Horizons (geocentric apparent RA,
//                daily step 2029-01-01 to 2031-12-31, station dates identified
//                from sign changes in daily RA motion; queried 2026-08-04).
//                Entries within 1 day of prior projected values were kept;
//                5 date fields differing by 2 days were corrected:
//                2029-01 end, 2029-05 start, 2030-12 end, 2031-11 start+end.
//   2032      -- NASA JPL Horizons (geocentric apparent RA, daily step
//                2032-01-01 to 2032-12-31, station dates from sign changes
//                in daily RA motion; queried 2026-08-04).
//                3 retrograde periods: Mar, Jul, Nov.
// Update this array annually. Note: 2029-12-22 entry straddles the year boundary
//   (JPL SD 2030-01-12, kept as 2030-01-11 within 1-day tolerance) --
//   ISO string comparison handles this correctly.

export const MERCURY_RETROGRADE = [
  { start: '2026-03-15', end: '2026-04-07' },
  { start: '2026-07-17', end: '2026-08-11' },
  { start: '2026-11-11', end: '2026-12-01' },
  { start: '2027-03-03', end: '2027-03-25' },
  { start: '2027-07-03', end: '2027-07-28' },
  { start: '2027-10-27', end: '2027-11-16' },
  { start: '2028-02-15', end: '2028-03-09' },
  { start: '2028-06-16', end: '2028-07-11' },
  { start: '2028-10-09', end: '2028-10-30' },
  { start: '2029-01-07', end: '2029-01-29' }, // 2029 has 4 periods; end corrected +2d vs prior
  { start: '2029-05-03', end: '2029-05-25' }, // start corrected +2d vs prior
  { start: '2029-09-02', end: '2029-09-25' },
  { start: '2029-12-22', end: '2030-01-11' }, // straddles year; JPL SD 2030-01-12 (1d tol.)
  { start: '2030-04-13', end: '2030-05-06' },
  { start: '2030-08-16', end: '2030-09-08' },
  { start: '2030-12-06', end: '2030-12-27' }, // end corrected +2d vs prior
  { start: '2031-03-26', end: '2031-04-18' },
  { start: '2031-07-29', end: '2031-08-22' },
  { start: '2031-11-21', end: '2031-12-11' }, // start+end corrected +2d vs prior
  { start: '2032-03-08', end: '2032-03-30' }, // JPL Horizons station dates: SR 2032-03-08, SD 2032-03-30
  { start: '2032-07-10', end: '2032-08-04' }, // JPL Horizons station dates: SR 2032-07-10, SD 2032-08-04
  { start: '2032-11-04', end: '2032-11-23' }, // JPL Horizons station dates: SR 2032-11-04, SD 2032-11-23
]

export function getMercuryStatus(
  date: Date = new Date(),
): { retrograde: boolean; endDate: string | null } {
  const iso = date.toISOString().split('T')[0]

  // Warn when the queried date is within 60 days of the last covered date,
  // so callers notice before coverage silently runs out.
  const lastEnd = MERCURY_RETROGRADE[MERCURY_RETROGRADE.length - 1].end
  const msUntilLastEnd = new Date(lastEnd).getTime() - date.getTime()
  const daysUntilLastEnd = msUntilLastEnd / 86_400_000
  if (daysUntilLastEnd >= 0 && daysUntilLastEnd <= 60) {
    console.warn(
      `[getMercuryStatus] Mercury retrograde coverage expires in ` +
      `${Math.round(daysUntilLastEnd)} day(s) (last entry ends ${lastEnd}). ` +
      `Update MERCURY_RETROGRADE with the next year of ephemeris data.`
    )
  }

  const period = MERCURY_RETROGRADE.find(r => iso >= r.start && iso <= r.end)
  return { retrograde: !!period, endDate: period?.end ?? null }
}
