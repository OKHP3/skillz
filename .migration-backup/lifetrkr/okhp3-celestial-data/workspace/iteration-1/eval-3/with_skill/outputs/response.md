To display the current astrological season, its element, and a star emoji in your meditation app using a zero-dependency, client-side approach, you can use the **Celestial Engine Skill** from `okhp3-celestial-data`.

### Core Function
The specific function for this requirement is `getAstroSeason(date?)`.

### Implementation Details
The calculation uses a simple date-based lookup (Month and Day) to determine the zodiac sign and its associated element.

#### Function Signature:
```typescript
type AstroSeason = {
  sign: ZodiacSign;         // 'Aries' | 'Taurus' | ... | 'Pisces'
  emoji: string;            // '♈' | '♉' | ... | '♓'
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  dates: string;            // display string e.g. "Jun 21 – Jul 22"
};

function getAstroSeason(date: Date = new Date()): AstroSeason;
```

### Complete Code Snippet
Copy this implementation into your project (e.g., `src/lib/celestial.ts`):

```typescript
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
```

### Usage Example
To display the data in your app along with a star emoji:

```typescript
const season = getAstroSeason();
console.log(`${season.emoji} ${season.sign} season (${season.element}) ✨`);
// Example Output: ♋ Cancer season (Water) ✨
```

### Key Technical Notes:
- **Zero Dependencies:** The logic uses standard JavaScript `Date` objects and simple arithmetic.
- **Client-Side:** No API endpoints or network requests are required; all calculations are local.
- **Accuracy:** Astrological season boundaries are accurate to within ±1 day.
