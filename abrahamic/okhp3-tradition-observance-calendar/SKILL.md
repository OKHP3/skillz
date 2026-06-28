---
name: okhp3-tradition-observance-calendar
description: >
  Fetch, compute, and format religious observance calendars for the three
  in-scope Abrahamic traditions of the Abrahamic Reference Engine: Judaism,
  Christianity, and Islam. Use this skill whenever an agent needs to retrieve
  religious holiday data, generate iCalendar (.ics) output, look up holiday
  descriptions for cross-tradition audiences, or produce a unified observance
  event list. Covers Hebcal API (Jewish), AlAdhan API (Islamic), TypeScript
  Computus algorithm (Christian -- Western and Orthodox), Wikipedia summary
  fetching for event descriptions, .ics file generation, emoji assignments,
  holiday filter lists, and session caching strategy. All data sources are
  free, public, and require no API key. Zero cost. MIT license. Also activate
  when a user asks to "add holidays to my calendar app", "download religious
  observances as .ics", "show Jewish/Islamic/Christian holidays for a year",
  or compute Easter dates -- including when they ask for "all three faiths"
  or any single tradition's observance list.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: interfaith-reference
  origin: okhp3/abrahamic-reference-engine
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  app-url: https://okhp3.github.io/abrahamic-reference-engine
compatibility: >
  TypeScript (browser or Node). Fetch API required. No API keys or accounts.
  Optional: sessionStorage for browser caching. Optional: FullCalendar.io for
  calendar UI rendering.
---

# okhp3-tradition-observance-calendar

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3) · [OKHP3/skillz](https://github.com/OKHP3/skillz)

Fetch, compute, and format religious observance calendars for the Abrahamic Reference Engine.

Covers **Judaism** (Hebcal API), **Christianity** (Computus algorithm -- Western and Orthodox), and **Islam** (AlAdhan API). All sources are free and anonymous. No API key. No cost. Zero runtime dependencies beyond `fetch`.

---

## Bundled reference files

Read these on demand -- only the file(s) you actually need for the current task:

| File | When to read |
|------|-------------|
| `references/api-reference.md` | Full API schemas and field details for Hebcal and AlAdhan; use when you need the complete response shape or want to understand all available query parameters |
| `references/computus.md` | Computus algorithm derivation, edge cases, century correction, and multi-century validation dates; use when troubleshooting Easter date accuracy |
| `references/holiday-data.md` | Extended `WIKIPEDIA_ARTICLE_MAP` entries and supplementary AlAdhan display name notes; use when adding a holiday not covered by the map in this file |
| `references/ics-spec.md` | ICS format specification, RFC 5545 line-folding rules, calendar client compatibility notes, and VTIMEZONE considerations |

The SKILL.md sections below are sufficient for most implementation tasks. Reach for the reference files when you need depth beyond what is documented here.

---

## 1. Scope Rules

A holiday is in scope if and only if it meets **both** criteria:

1. **Abrahamic lineage** -- traces its roots to the Abrahamic covenant
2. **US population threshold** -- practiced by a tradition representing ≥1% of the US population per Pew Research Center

| Tradition | US Share | In Scope |
|---|---|---|
| Christianity | ~63% | Yes -- five denominational lenses |
| Judaism | ~2% | Yes |
| Islam | ~1% | Yes |
| Hinduism | ~1% | **No** (not Abrahamic) |
| Buddhism | ~1% | **No** (not Abrahamic) |
| Baha'i | ~0.1% | **No** (Abrahamic but below threshold) |

Source: Pew Research Center -- https://www.pewresearch.org/religion/religious-landscape-study/

---

## 2. Unified Event Type

All holiday sources normalize to this shared interface:

```typescript
interface ObservanceEvent {
  id: string;           // "{tradition}-{rawName}-{year}-{startDateISO}"
  title: string;        // emoji-prefixed: "✡️ Rosh Hashanah"
  rawName: string;      // without emoji: "Rosh Hashanah"
  emoji: string;        // "✡️" | "✝️" | "☦️" | "☪️"
  tradition: 'judaism' | 'christianity' | 'islam';
  denomination: 'all' | 'catholic' | 'orthodox' | 'protestant' | 'evangelical' | 'restorationist';
  startDate: Date;
  endDate: Date;        // equals startDate for single-day events
  isMultiDay: boolean;
  hebrewName?: string;  // Jewish holidays only
  hijriDate?: string;   // Islamic holidays only, e.g., "1 Muharram 1448 AH"
  sourceUrl?: string;   // Hebcal permalink or Wikipedia URL
  source: 'hebcal' | 'aladhan' | 'algorithm';
  wikiArticle?: string; // Wikipedia article title for description fetch (Section 5)
}
```

---

## 3. Emoji Registry

```typescript
export const TRADITION_EMOJI = {
  judaism:               '✡️',   // U+2721 U+FE0F  Star of David
  christianity_western:  '✝️',   // U+271D U+FE0F  Latin Cross
  christianity_orthodox: '☦️',   // U+2626 U+FE0F  Orthodox Cross
  islam:                 '☪️',   // U+262A U+FE0F  Star and Crescent
} as const;
```

Use `✝️` for Catholic, Mainline Protestant, Evangelical, and Restorationist events.
Use `☦️` for Orthodox-specific events and dates.

---

## 4. Jewish Holidays -- Hebcal REST API

**No API key. CC BY 4.0. Free.**

### 4.1 Endpoint

```
GET https://www.hebcal.com/hebcal?v=1&cfg=json&year={year}&maj=on&min=off&nx=off&mf=off&ss=on&mod=on&i=off&lg=s&m=50
```

Parameters that matter:
- `maj=on` -- major holidays (required)
- `ss=on` -- special Shabbatot
- `mod=on` -- modern Israeli holidays (Yom HaShoah, Yom HaAtzmaut)
- `i=off` -- Diaspora rules (not Israeli rules -- ARE targets US audience)
- `min=off` -- minor holidays off by default (expose as optional filter)

### 4.2 Fetch pattern

```typescript
async function fetchJewishHolidays(year: number): Promise<ObservanceEvent[]> {
  const cacheKey = `are_hebcal_${year}`;
  const cached = sessionStorage?.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${year}&maj=on&min=off&nx=off&mf=off&ss=on&mod=on&i=off&lg=s&m=50`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Hebcal fetch failed: ${res.status}`);
  const data = await res.json();

  const items: HebcalItem[] = (data.items || []).filter(
    (item: HebcalItem) => item.category === 'holiday'
  );

  const events = normalizeHebcalItems(items, year);
  sessionStorage?.setItem(cacheKey, JSON.stringify(events));
  return events;
}
```

### 4.3 Response item shape

```json
{
  "title": "Rosh Hashana 5787",
  "date": "2026-09-20",
  "hdate": "1 Tishrei 5787",
  "category": "holiday",
  "subcat": "major",
  "hebrew": "ראש השנה",
  "link": "https://www.hebcal.com/holidays/rosh-hashana-5787",
  "memo": "Jewish New Year"
}
```

### 4.4 Normalization rules

- Strip Hebrew year suffix from title for display: `"Rosh Hashana 5787"` → `"Rosh Hashana"`
- Detect multi-day events by grouping items with matching normalized base name across consecutive dates
- Set `endDate` to the last consecutive day with the same name; `isMultiDay = true` when span > 1
- Populate `hebrewName` from `hebrew` field
- Populate `sourceUrl` from `link` field
- Populate `wikiArticle` from `WIKIPEDIA_ARTICLE_MAP[normalizedName]` (see Section 5)
- Set `emoji = '✡️'`, `tradition = 'judaism'`, `denomination = 'all'`

### 4.5 Attribution

Display in UI: `"Calendar data via Hebcal.com (CC BY 4.0)"`
Link: https://www.hebcal.com

---

## 5. Islamic Holidays -- AlAdhan REST API

**No API key. Free. GPL-3.0.**

### 5.1 Strategy

AlAdhan embeds holiday data in each day of the Gregorian-to-Hijri calendar response. Fetch all 12 months in parallel; collect days where `date.hijri.holidays` is non-empty.

### 5.2 Endpoint (per month)

```
GET https://api.aladhan.com/v1/gToHCalendar/{month}/{year}
```

### 5.3 Fetch pattern

> **WARNING -- use Promise.allSettled, NOT Promise.all.**
> AlAdhan occasionally drops individual month requests.
> Promise.all fails fast and discards all 11 other successful months.
> Promise.allSettled continues and collects partial results gracefully.
> This is a hard requirement, not a suggestion.

```typescript
async function fetchIslamicHolidays(year: number): Promise<ObservanceEvent[]> {
  const cacheKey = `are_aladhan_${year}`;
  const cached = sessionStorage?.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const responses = await Promise.allSettled(
    months.map(m =>
      fetch(`https://api.aladhan.com/v1/gToHCalendar/${m}/${year}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
    )
  );

  const allDays: AladhanDay[] = responses.flatMap(result =>
    result.status === 'fulfilled' ? result.value.data || [] : []
  );

  const events = normalizeAladhanDays(allDays, year);
  sessionStorage?.setItem(cacheKey, JSON.stringify(events));
  return events;
}
```

### 5.4 Response day shape (relevant fields)

```json
{
  "gregorian": {
    "date": "20-03-2026",
    "year": "2026",
    "month": { "en": "March" },
    "day": "20"
  },
  "hijri": {
    "date": "01-09-1447",
    "year": "1447",
    "month": { "en": "Ramaḍān", "number": 9 },
    "day": "01",
    "holidays": ["Start of Ramadan"]
  }
}
```

### 5.5 Allowed holiday filter (US mainstream Sunni/general Islamic)

Only include days where at least one entry in `holidays[]` matches this allowed set:

```typescript
const ALADHAN_ALLOWED: Set<string> = new Set([
  "Arafat (Haj) Day",
  "Eid-ul-Adha",
  "Islamic New Year",
  "Ashura",
  "Mawlid al-Nabi",
  "Al Isra' Wal Mi'raj",
  "Start of Ramadan",
  "Laylat al Qadr",
  "Eid ul Fitr",
]);
```

Discard any holiday string not in this set. Discard days where `holidays` is empty.

### 5.6 Display name normalization

```typescript
const ALADHAN_DISPLAY_NAMES: Record<string, string> = {
  "Arafat (Haj) Day":    "Day of Arafah",
  "Eid-ul-Adha":         "Eid al-Adha",
  "Islamic New Year":    "Islamic New Year (Muharram 1)",
  "Ashura":              "Ashura",
  "Mawlid al-Nabi":      "Mawlid al-Nabi (Prophet's Birthday)",
  "Al Isra' Wal Mi'raj": "Isra and Mi'raj (Night Journey)",
  "Start of Ramadan":    "First Day of Ramadan",
  "Laylat al Qadr":      "Laylat al-Qadr (Night of Power)",
  "Eid ul Fitr":         "Eid al-Fitr",
};
```

### 5.7 Multi-day detection

Eid al-Adha and Eid al-Fitr may appear across 2–3 consecutive days. Group consecutive days with the same normalized display name into a single event. Set `endDate` to the last day; `isMultiDay = true`.

### 5.8 Moon sighting caveat

Always display alongside Islamic events:
> *"Islamic dates are calculated using the Umm al-Qura method. Actual observance may vary by one day based on local moon sighting."*

### 5.9 Attribution

Display in UI: `"Islamic calendar data via AlAdhan.com"`
Link: https://aladhan.com

---

## 6. Christian Holidays -- TypeScript Algorithm

No external API. Fully client-side. Zero dependencies.

### 6.1 Western Easter (Gregorian Computus)

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
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}
```

**Validation:** 2026 → April 5 | 2027 → March 28

### 6.2 Orthodox Easter (Julian Computus + Gregorian offset)

```typescript
function computeOrthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const f = Math.floor((d + e + 114) / 31);
  const g = ((d + e + 114) % 31) + 1;
  // Julian result; add 13 days for 20th/21st century Gregorian conversion
  const result = new Date(year, f - 1, g + 13);
  return result;
}
```

**Validation:** 2026 → April 12 | 2027 → May 2

### 6.3 Holiday generation

```typescript
function generateChristianHolidays(year: number): ObservanceEvent[] {
  const w = computeWesternEaster(year);
  const o = computeOrthodoxEaster(year);
  const off = (base: Date, days: number) => {
    const d = new Date(base); d.setDate(d.getDate() + days); return d;
  };
  const fix = (m: number, d: number) => new Date(year, m - 1, d);

  // Compute First Sunday of Advent
  const christmas = fix(12, 25);
  const christmasDow = christmas.getDay();
  const advent1 = new Date(christmas);
  advent1.setDate(christmas.getDate() - christmasDow - 21);

  // Compute Reformation Sunday (last Sunday of October)
  const oct31 = fix(10, 31);
  const reformationSunday = new Date(oct31);
  reformationSunday.setDate(oct31.getDate() - oct31.getDay());

  return [
    // Fixed feasts -- all denominations
    { rawName: 'Epiphany',              emoji: '✝️', denomination: 'all',            startDate: fix(1,6),    endDate: fix(1,6),    source: 'algorithm' },
    { rawName: 'Christmas Eve',         emoji: '✝️', denomination: 'all',            startDate: fix(12,24),  endDate: fix(12,24),  source: 'algorithm' },
    { rawName: 'Christmas',             emoji: '✝️', denomination: 'all',            startDate: fix(12,25),  endDate: fix(12,25),  source: 'algorithm' },
    // Catholic-specific fixed feasts
    { rawName: 'Candlemas',             emoji: '✝️', denomination: 'catholic',       startDate: fix(2,2),    endDate: fix(2,2),    source: 'algorithm' },
    { rawName: 'All Saints Day',        emoji: '✝️', denomination: 'catholic',       startDate: fix(11,1),   endDate: fix(11,1),   source: 'algorithm' },
    { rawName: 'Immaculate Conception', emoji: '✝️', denomination: 'catholic',       startDate: fix(12,8),   endDate: fix(12,8),   source: 'algorithm' },
    // Advent
    { rawName: 'Advent (First Sunday)', emoji: '✝️', denomination: 'all',            startDate: advent1,     endDate: advent1,     source: 'algorithm' },
    // Easter-derived -- Western
    { rawName: 'Ash Wednesday',         emoji: '✝️', denomination: 'all',            startDate: off(w,-46),  endDate: off(w,-46),  source: 'algorithm' },
    { rawName: 'Palm Sunday',           emoji: '✝️', denomination: 'all',            startDate: off(w,-7),   endDate: off(w,-7),   source: 'algorithm' },
    { rawName: 'Maundy Thursday',       emoji: '✝️', denomination: 'all',            startDate: off(w,-3),   endDate: off(w,-3),   source: 'algorithm' },
    { rawName: 'Good Friday',           emoji: '✝️', denomination: 'all',            startDate: off(w,-2),   endDate: off(w,-2),   source: 'algorithm' },
    { rawName: 'Holy Saturday',         emoji: '✝️', denomination: 'all',            startDate: off(w,-1),   endDate: off(w,-1),   source: 'algorithm' },
    { rawName: 'Easter Sunday',         emoji: '✝️', denomination: 'all',            startDate: w,           endDate: w,           source: 'algorithm' },
    { rawName: 'Easter Monday',         emoji: '✝️', denomination: 'catholic',       startDate: off(w,1),    endDate: off(w,1),    source: 'algorithm' },
    { rawName: 'Ascension Thursday',    emoji: '✝️', denomination: 'all',            startDate: off(w,39),   endDate: off(w,39),   source: 'algorithm' },
    { rawName: 'Pentecost',             emoji: '✝️', denomination: 'all',            startDate: off(w,49),   endDate: off(w,49),   source: 'algorithm' },
    { rawName: 'Trinity Sunday',        emoji: '✝️', denomination: 'protestant',     startDate: off(w,56),   endDate: off(w,56),   source: 'algorithm' },
    { rawName: 'Corpus Christi',        emoji: '✝️', denomination: 'catholic',       startDate: off(w,60),   endDate: off(w,60),   source: 'algorithm' },
    // Protestant-specific
    { rawName: 'Reformation Sunday',    emoji: '✝️', denomination: 'protestant',     startDate: reformationSunday, endDate: reformationSunday, source: 'algorithm' },
    // Orthodox
    { rawName: 'Orthodox Christmas',    emoji: '☦️', denomination: 'orthodox',       startDate: fix(1,7),    endDate: fix(1,7),    source: 'algorithm' },
    { rawName: 'Theophany',             emoji: '☦️', denomination: 'orthodox',       startDate: fix(1,19),   endDate: fix(1,19),   source: 'algorithm' },
    { rawName: 'Orthodox Palm Sunday',  emoji: '☦️', denomination: 'orthodox',       startDate: off(o,-7),   endDate: off(o,-7),   source: 'algorithm' },
    { rawName: 'Orthodox Good Friday',  emoji: '☦️', denomination: 'orthodox',       startDate: off(o,-2),   endDate: off(o,-2),   source: 'algorithm' },
    { rawName: 'Orthodox Easter',       emoji: '☦️', denomination: 'orthodox',       startDate: o,           endDate: o,           source: 'algorithm' },
    { rawName: 'Orthodox Pentecost',    emoji: '☦️', denomination: 'orthodox',       startDate: off(o,49),   endDate: off(o,49),   source: 'algorithm' },
  ].map(h => ({
    ...h,
    id: `christianity-${h.rawName.replace(/\s+/g, '-').toLowerCase()}-${year}-${h.startDate.toISOString().split('T')[0]}`,
    title: `${h.emoji} ${h.rawName}`,
    tradition: 'christianity' as const,
    isMultiDay: false,
    wikiArticle: WIKIPEDIA_ARTICLE_MAP[h.rawName],
  }));
}
```

---

## 7. Event Description -- Wikipedia REST API

**No API key. Free. CC BY-SA 3.0. No external cost.**

### 7.1 Endpoint

```
GET https://en.wikipedia.org/api/rest_v1/page/summary/{article_title}
```

### 7.2 Fetch pattern

```typescript
async function getHolidayDescription(rawName: string): Promise<{
  extract: string;
  wikiUrl: string;
} | null> {
  const normalized = rawName.replace(/\s+\d{4}$/, '').trim(); // strip Hebcal year suffix
  const articleTitle = WIKIPEDIA_ARTICLE_MAP[normalized] || WIKIPEDIA_ARTICLE_MAP[rawName];
  if (!articleTitle) return null;

  const cacheKey = `are_wiki_${articleTitle}`;
  const cached = sessionStorage?.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${articleTitle}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = {
      extract: data.extract || '',
      wikiUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${articleTitle}`,
    };
    sessionStorage?.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}
```

Fetch only on user interaction (event click). Do not pre-fetch all events on load.

### 7.3 Wikipedia article map

```typescript
export const WIKIPEDIA_ARTICLE_MAP: Record<string, string> = {
  // Jewish
  'Rosh Hashanah':        'Rosh_Hashanah',
  'Rosh Hashana':         'Rosh_Hashanah',
  'Yom Kippur':           'Yom_Kippur',
  'Sukkot':               'Sukkot',
  'Shemini Atzeret':      'Shemini_Atzeret',
  'Simchat Torah':        'Simchat_Torah',
  'Hanukkah':             'Hanukkah',
  'Tu BiShvat':           'Tu_BiShvat',
  'Purim':                'Purim',
  'Passover':             'Passover',
  'Pesach':               'Passover',
  'Yom HaShoah':          'Yom_HaShoah',
  "Yom HaAtzmaut":        "Yom_Ha%27atzmaut",
  'Shavuot':              'Shavuot',
  "Tisha B'Av":           "Tisha_B'Av",
  'Lag BaOmer':           'Lag_BaOmer',
  // Christian (Western)
  'Epiphany':             'Epiphany_(holiday)',
  'Candlemas':            'Candlemas',
  'Ash Wednesday':        'Ash_Wednesday',
  'Palm Sunday':          'Palm_Sunday',
  'Maundy Thursday':      'Maundy_Thursday',
  'Good Friday':          'Good_Friday',
  'Holy Saturday':        'Holy_Saturday',
  'Easter Sunday':        'Easter',
  'Easter Monday':        'Easter_Monday',
  'Ascension Thursday':   'Feast_of_the_Ascension',
  'Pentecost':            'Pentecost',
  'Trinity Sunday':       'Trinity_Sunday',
  'Corpus Christi':       'Corpus_Christi_(feast)',
  'All Saints Day':       "All_Saints%27_Day",
  'Immaculate Conception':'Immaculate_Conception',
  'Christmas Eve':        'Christmas_Eve',
  'Christmas':            'Christmas',
  'Reformation Sunday':   'Reformation_Day',
  // Christian (Orthodox)
  'Orthodox Christmas':   'Christmas#Eastern_Christianity',
  'Theophany':            'Theophany',
  'Orthodox Easter':      'Easter#Eastern_Christianity',
  'Orthodox Palm Sunday': 'Palm_Sunday',
  'Orthodox Good Friday': 'Good_Friday',
  'Orthodox Pentecost':   'Pentecost',
  // Islamic
  'Islamic New Year (Muharram 1)':         'Islamic_New_Year',
  'Ashura':                                'Ashura',
  "Mawlid al-Nabi (Prophet's Birthday)":  'Mawlid',
  "Isra and Mi'raj (Night Journey)":       "Isra%27_and_Mi%27raj",
  'First Day of Ramadan':                  'Ramadan',
  'Laylat al-Qadr (Night of Power)':       'Laylat_al-Qadr',
  'Eid al-Fitr':                           'Eid_al-Fitr',
  'Day of Arafah':                         'Day_of_Arafah',
  'Eid al-Adha':                           'Eid_al-Adha',
};
```

### 7.4 Attribution

Always display in UI: `"Description via Wikipedia (CC BY-SA 3.0)"` with link to the Wikipedia article URL returned by the API.

---

## 8. iCalendar (.ics) Generation

Client-side only. No external service.

```typescript
function generateICS(events: ObservanceEvent[], calendarTitle: string): string {
  const formatDateOnly = (d: Date): string =>
    [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('');

  const nowStamp = (): string => {
    const d = new Date();
    return d.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
  };

  const escape = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');

  const vevents = events.map(e => {
    const endPlusOne = new Date(e.endDate);
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    const desc = e.tradition === 'islam'
      ? 'Actual observance may vary by one day based on local moon sighting. More info: https://okhp3.github.io/abrahamic-reference-engine'
      : 'More info: https://okhp3.github.io/abrahamic-reference-engine';
    return [
      'BEGIN:VEVENT',
      `UID:${escape(e.id)}@abrahamic-reference-engine.okhp3`,
      `SUMMARY:${escape(e.title)}`,
      `DTSTART;VALUE=DATE:${formatDateOnly(e.startDate)}`,
      `DTEND;VALUE=DATE:${formatDateOnly(endPlusOne)}`,
      `DESCRIPTION:${escape(desc)}`,
      e.sourceUrl ? `URL:${e.sourceUrl}` : null,
      `CATEGORIES:${e.tradition.toUpperCase()}`,
      `DTSTAMP:${nowStamp()}`,
      'END:VEVENT',
    ].filter(Boolean).join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OKHP3//Abrahamic Reference Engine//EN',
    `X-WR-CALNAME:${escape(calendarTitle)}`,
    'X-WR-CALDESC:Religious observances for Judaism\\, Christianity\\, and Islam. Source: Abrahamic Reference Engine by OverKill Hill P3.',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vevents,
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## 9. Session Caching Strategy

| Data | Cache key | When to populate | When to invalidate |
|---|---|---|---|
| Hebcal annual result | `are_hebcal_{year}` | On first tab open for that year | Session end |
| AlAdhan annual result | `are_aladhan_{year}` | On first tab open for that year | Session end |
| Christian holidays | In-memory (computed) | On tab open | Never (deterministic) |
| Wikipedia description | `are_wiki_{articleTitle}` | On first event click | Session end |

Use `sessionStorage` in browser contexts. In Node/agent contexts, use a simple in-memory `Map`.

---

## 10. Attribution Requirements

Always include the following when presenting output from this skill:

| Source | Attribution text |
|---|---|
| Hebcal | "Calendar data via Hebcal.com (CC BY 4.0)" |
| AlAdhan | "Islamic calendar data via AlAdhan.com" |
| Algorithm | "Christian holiday dates computed per ecclesiastical calendar" |
| Wikipedia | "Description via Wikipedia (CC BY-SA 3.0)" |

---

## 11. Validation Reference

| Holiday | Year | Correct Date |
|---|---|---|
| Western Easter | 2026 | April 5 |
| Western Easter | 2027 | March 28 |
| Orthodox Easter | 2026 | April 12 |
| Orthodox Easter | 2027 | May 2 |
| Ash Wednesday | 2026 | February 18 |
| Good Friday | 2026 | April 3 |
| Pentecost | 2026 | May 24 |
| Orthodox Christmas | any | January 7 |
| Theophany | any | January 19 |
| Rosh Hashanah | 2026 | September 20–21 |
| Yom Kippur | 2026 | September 29 |

---

## 12. Usage Examples

**Fetch all observances for 2026:**
```typescript
const [jewish, islamic] = await Promise.allSettled([
  fetchJewishHolidays(2026),
  fetchIslamicHolidays(2026),
]);
const christian = generateChristianHolidays(2026);

const allEvents: ObservanceEvent[] = [
  ...(jewish.status === 'fulfilled' ? jewish.value : []),
  ...(islamic.status === 'fulfilled' ? islamic.value : []),
  ...christian,
].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
```

**Get description for a holiday:**
```typescript
const description = await getHolidayDescription('Rosh Hashanah');
if (description) {
  console.log(description.extract);   // Wikipedia text
  console.log(description.wikiUrl);   // Attribution link
}
```

**Generate and download a full-year .ics:**
```typescript
const icsContent = generateICS(allEvents, 'ARE Observances 2026');
downloadICS(icsContent, 'ARE-Observances-2026.ics');
```

**Filter by tradition:**
```typescript
const jewishOnly = allEvents.filter(e => e.tradition === 'judaism');
const orthodoxOnly = allEvents.filter(e => e.denomination === 'orthodox');
```

---

## Validation script

A date-accuracy validation script ships with this skill:

```bash
node .agents/skills/okhp3-tradition-observance-calendar/scripts/validate-easter.js
```

Validates Western and Orthodox Easter computation against 11 known-correct dates each (US Naval Observatory / Ecumenical Patriarchate). Exit 0 = clean. Run after any change to the Computus algorithm.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
