# Computus Algorithms and Christian Holiday Generation
## okhp3-tradition-observance-calendar

All Christian holidays are computed client-side from two Easter anchors.
No external API. No network call. No cost. Fully deterministic.

---

## Why algorithm, not API

No free, official, ecumenical Christian holidays REST API exists. Easter
and all moveable feasts are mathematically determined — the Computus
algorithm has been stable for centuries. Fixed feasts (Christmas, Epiphany)
are trivially hardcoded. Computing is more reliable than any external
dependency and runs synchronously with no latency.

---

## Western Easter (Gregorian Computus)

Uses the Anonymous Gregorian algorithm (Oudin/Jones).

```typescript
function computeWesternEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 1-based
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}
```

**Validation:** 2026 → April 5 | 2027 → March 28

---

## Orthodox Easter (Julian Computus + Gregorian offset)

Computes the Julian calendar Easter date, then adds 13 days to convert
to the Gregorian calendar. The 13-day offset is valid for the 20th and
21st centuries.

```typescript
function computeOrthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 1-based Julian month
  const day = ((d + e + 114) % 31) + 1;
  const julianDate = new Date(year, month - 1, day);
  // Add 13 days: Julian → Gregorian (20th/21st century offset)
  julianDate.setDate(julianDate.getDate() + 13);
  return julianDate;
}
```

**Validation:** 2026 → April 12 | 2027 → May 2

---

## Moveable feast offsets from Western Easter

| Holiday | Offset (days) | Denomination |
|---|---|---|
| Ash Wednesday | -46 | All |
| Palm Sunday | -7 | All |
| Maundy Thursday | -3 | All |
| Good Friday | -2 | All |
| Holy Saturday | -1 | All |
| Easter Sunday | 0 | All |
| Easter Monday | +1 | Catholic |
| Ascension Thursday | +39 | All |
| Pentecost | +49 | All |
| Trinity Sunday | +56 | Protestant |
| Corpus Christi | +60 | Catholic |

---

## Fixed feasts

| Holiday | Date | Denomination |
|---|---|---|
| Epiphany | January 6 | All |
| Candlemas | February 2 | Catholic |
| All Saints Day | November 1 | Catholic |
| Immaculate Conception | December 8 | Catholic |
| Christmas Eve | December 24 | All |
| Christmas | December 25 | All |

---

## Computed variable dates

### Advent (First Sunday)
Four Sundays before Christmas. Sunday on or before December 25, minus 21 days.

```typescript
function computeAdventSunday(year: number): Date {
  const christmas = new Date(year, 11, 25); // Dec 25
  const dow = christmas.getDay();            // 0 = Sunday
  const lastAdvent = new Date(christmas);
  lastAdvent.setDate(25 - dow);              // Sunday on or before Christmas
  const firstAdvent = new Date(lastAdvent);
  firstAdvent.setDate(lastAdvent.getDate() - 21); // 3 weeks earlier
  return firstAdvent;
}
```

### Reformation Sunday (Mainline Protestant)
Last Sunday of October (closest to October 31).

```typescript
function computeReformationSunday(year: number): Date {
  const oct31 = new Date(year, 9, 31); // October 31
  const dow = oct31.getDay();
  const result = new Date(oct31);
  result.setDate(31 - dow);           // Sunday on or before Oct 31
  return result;
}
```

---

## Orthodox fixed dates

| Holiday | Date | Note |
|---|---|---|
| Orthodox Christmas | January 7 | Julian Dec 25 + 13 days |
| Theophany | January 19 | Julian Jan 6 + 13 days |

---

## Full generation function

```typescript
function generateChristianHolidays(year: number): ObservanceEvent[] {
  const W = computeWesternEaster(year);
  const O = computeOrthodoxEaster(year);
  const off = (base: Date, days: number) => {
    const d = new Date(base); d.setDate(d.getDate() + days); return d;
  };
  const fix = (m: number, d: number) => new Date(year, m - 1, d);

  const defs = [
    // Fixed — All
    { rawName:'Epiphany',              emoji:'✝️', den:'all',        date: fix(1,6) },
    { rawName:'Christmas Eve',         emoji:'✝️', den:'all',        date: fix(12,24) },
    { rawName:'Christmas',             emoji:'✝️', den:'all',        date: fix(12,25) },
    // Fixed — Catholic
    { rawName:'Candlemas',             emoji:'✝️', den:'catholic',   date: fix(2,2) },
    { rawName:'All Saints Day',        emoji:'✝️', den:'catholic',   date: fix(11,1) },
    { rawName:'Immaculate Conception', emoji:'✝️', den:'catholic',   date: fix(12,8) },
    // Computed
    { rawName:'Advent (First Sunday)', emoji:'✝️', den:'all',        date: computeAdventSunday(year) },
    { rawName:'Reformation Sunday',    emoji:'✝️', den:'protestant', date: computeReformationSunday(year) },
    // Easter-derived — Western
    { rawName:'Ash Wednesday',         emoji:'✝️', den:'all',        date: off(W,-46) },
    { rawName:'Palm Sunday',           emoji:'✝️', den:'all',        date: off(W,-7) },
    { rawName:'Maundy Thursday',       emoji:'✝️', den:'all',        date: off(W,-3) },
    { rawName:'Good Friday',           emoji:'✝️', den:'all',        date: off(W,-2) },
    { rawName:'Holy Saturday',         emoji:'✝️', den:'all',        date: off(W,-1) },
    { rawName:'Easter Sunday',         emoji:'✝️', den:'all',        date: W },
    { rawName:'Easter Monday',         emoji:'✝️', den:'catholic',   date: off(W,1) },
    { rawName:'Ascension Thursday',    emoji:'✝️', den:'all',        date: off(W,39) },
    { rawName:'Pentecost',             emoji:'✝️', den:'all',        date: off(W,49) },
    { rawName:'Trinity Sunday',        emoji:'✝️', den:'protestant', date: off(W,56) },
    { rawName:'Corpus Christi',        emoji:'✝️', den:'catholic',   date: off(W,60) },
    // Orthodox
    { rawName:'Orthodox Christmas',    emoji:'☦️', den:'orthodox',   date: new Date(year,0,7) },
    { rawName:'Theophany',             emoji:'☦️', den:'orthodox',   date: new Date(year,0,19) },
    { rawName:'Orthodox Palm Sunday',  emoji:'☦️', den:'orthodox',   date: off(O,-7) },
    { rawName:'Orthodox Good Friday',  emoji:'☦️', den:'orthodox',   date: off(O,-2) },
    { rawName:'Orthodox Easter',       emoji:'☦️', den:'orthodox',   date: O },
    { rawName:'Orthodox Pentecost',    emoji:'☦️', den:'orthodox',   date: off(O,49) },
  ];

  return defs.map(def => ({
    id: `christianity-${def.rawName.toLowerCase().replace(/\s+/g,'-')}-${def.date.toISOString().split('T')[0]}`,
    title: `${def.emoji} ${def.rawName}`,
    rawName: def.rawName,
    emoji: def.emoji,
    tradition: 'christianity' as const,
    denomination: def.den as Denomination,
    startDate: def.date,
    endDate: def.date,
    isMultiDay: false,
    wikiArticle: WIKIPEDIA_ARTICLE_MAP[def.rawName],
    source: 'algorithm' as const,
  }));
}
```

---

## Validation reference

| Holiday | 2026 | 2027 |
|---|---|---|
| Western Easter | April 5 | March 28 |
| Ash Wednesday | February 18 | February 10 |
| Good Friday | April 3 | March 26 |
| Ascension | May 14 | May 6 |
| Pentecost | May 24 | May 16 |
| Orthodox Easter | April 12 | May 2 |
| Orthodox Christmas | January 7 | January 7 |
| Theophany | January 19 | January 19 |
