# API Reference
## okhp3-tradition-observance-calendar

All three external APIs used in this skill are free, anonymous, and require
no authentication. All calls are made directly from the browser or agent.

---

## 1. Hebcal REST API — Jewish Holidays

**Attribution:** "Calendar data via Hebcal.com (CC BY 4.0)"
**Docs:** https://www.hebcal.com/home/developer-apis
**License:** Creative Commons Attribution 4.0 International

### Endpoint

```
GET https://www.hebcal.com/hebcal?v=1&cfg=json&year={year}&maj=on&min=off&nx=off&mf=off&ss=on&mod=on&i=off&lg=s&m=50
```

### Key parameters

| Parameter | Value | Meaning |
|---|---|---|
| `v` | `1` | API version |
| `cfg` | `json` | JSON response format |
| `year` | `{year}` | Gregorian year (e.g. `2026`) |
| `maj` | `on` | Major holidays — required |
| `ss` | `on` | Special Shabbatot (Shabbat Hagadol, Shabbat Shuva, etc.) |
| `mod` | `on` | Modern holidays (Yom HaShoah, Yom HaAtzmaut, Yom Yerushalayim) |
| `i` | `off` | Diaspora rules — US audience, not Israeli rules |
| `min` | `off` | Minor holidays — off by default |
| `lg` | `s` | Standard English transliteration |

### Response shape

```json
{
  "title": "Hebcal Diaspora 2026",
  "items": [
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
  ]
}
```

### Normalization rules

- Filter `items` to `category === 'holiday'`
- Strip Hebrew year suffix from title: `"Rosh Hashana 5787"` → `"Rosh Hashana"`
- Group consecutive items with same normalized name into multi-day events
- Set `endDate` to last day of group; `isMultiDay = true` when span > 1 day
- Populate `hebrewName` from `hebrew` field
- Populate `sourceUrl` from `link` field

### Rate limit

Hebcal throttles clients making >90 requests in a 10-second window.
Cache annual results in `sessionStorage` to avoid repeat calls.

### Fetch code

```typescript
async function fetchJewishHolidays(year: number): Promise<ObservanceEvent[]> {
  const cacheKey = `are_hebcal_${year}`;
  const cached = sessionStorage?.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return parsed.map((e: ObservanceEvent) => ({
      ...e,
      startDate: new Date(e.startDate),
      endDate: new Date(e.endDate),
    }));
  }

  const params = new URLSearchParams({
    v:'1', cfg:'json', year: String(year),
    maj:'on', min:'off', nx:'off', mf:'off',
    ss:'on', mod:'on', i:'off', lg:'s', m:'50',
  });
  const res = await fetch(`https://www.hebcal.com/hebcal?${params}`);
  if (!res.ok) throw new Error(`Hebcal error: ${res.status}`);
  const data = await res.json();

  const items = (data.items || []).filter((i: any) => i.category === 'holiday');
  const events = groupAndNormalizeHebcal(items, year);
  sessionStorage?.setItem(cacheKey, JSON.stringify(events));
  return events;
}
```

---

## 2. AlAdhan REST API — Islamic Holidays

**Attribution:** "Islamic calendar data via AlAdhan.com"
**Docs:** https://aladhan.com/islamic-calendar-api
**License:** GPL-3.0

### Endpoint (per month)

```
GET https://api.aladhan.com/v1/gToHCalendar/{month}/{year}
```

Where `{month}` is 1–12 and `{year}` is the Gregorian year.

### Strategy

Issue 12 parallel fetches (one per month) via `Promise.allSettled`.
Each day in the response contains `date.hijri.holidays[]` — collect
days where that array is non-empty and contains an allowed holiday string.

### Response shape (per day)

```json
{
  "gregorian": {
    "date": "20-03-2026",
    "year": "2026",
    "month": { "number": 3, "en": "March" },
    "day": "20"
  },
  "hijri": {
    "date": "01-09-1447",
    "year": "1447",
    "month": { "number": 9, "en": "Ramaḍān", "ar": "رَمَضَان" },
    "day": "01",
    "holidays": ["Start of Ramadan"]
  }
}
```

### Allowed holiday filter

Only the following strings from `holidays[]` are surfaced (see `holiday-data.md`
for the full `ALADHAN_ALLOWED` set). All others are discarded.

```
"Arafat (Haj) Day"    → "Day of Arafah"
"Eid-ul-Adha"         → "Eid al-Adha"
"Islamic New Year"    → "Islamic New Year (Muharram 1)"
"Ashura"              → "Ashura"
"Mawlid al-Nabi"      → "Mawlid al-Nabi (Prophet's Birthday)"
"Al Isra' Wal Mi'raj" → "Isra and Mi'raj (Night Journey)"
"Start of Ramadan"    → "First Day of Ramadan"
"Laylat al Qadr"      → "Laylat al-Qadr (Night of Power)"
"Eid ul Fitr"         → "Eid al-Fitr"
```

### Moon sighting notice

**Always display alongside Islamic holiday events:**
> "Islamic dates are calculated using the Umm al-Qura method.
>  Actual observance may vary by one day based on local moon sighting."

### Fetch code

```typescript
async function fetchIslamicHolidays(year: number): Promise<ObservanceEvent[]> {
  const cacheKey = `are_aladhan_${year}`;
  const cached = sessionStorage?.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    return parsed.map((e: ObservanceEvent) => ({
      ...e,
      startDate: new Date(e.startDate),
      endDate: new Date(e.endDate),
    }));
  }

  const fetches = Array.from({ length: 12 }, (_, i) =>
    fetch(`https://api.aladhan.com/v1/gToHCalendar/${i + 1}/${year}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => d.data || [])
      .catch(() => [])
  );
  const results = await Promise.allSettled(fetches);
  const allDays = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  if (allDays.length === 0) throw new Error('AlAdhan: all months failed');

  const events = filterAndNormalizeAladhan(allDays, year);
  sessionStorage?.setItem(cacheKey, JSON.stringify(events));
  return events;
}
```

---

## 3. Wikipedia REST API — Holiday Descriptions

**Attribution:** "Description via Wikipedia (CC BY-SA 3.0)" with link to article URL.
**Docs:** https://en.wikipedia.org/api/rest_v1/
**License:** Creative Commons Attribution-ShareAlike 3.0

### Endpoint

```
GET https://en.wikipedia.org/api/rest_v1/page/summary/{article_title}
```

No API key. No authentication. No explicit rate limit for reasonable usage.

### Response shape

```json
{
  "title": "Rosh Hashanah",
  "extract": "Rosh Hashanah is the Jewish New Year, the first of the High Holy Days specified by Leviticus 23:23–25 as a day of rest, and described in the Mishnah as one of the four new years of the Jewish calendar.",
  "content_urls": {
    "desktop": {
      "page": "https://en.wikipedia.org/wiki/Rosh_Hashanah"
    }
  }
}
```

### Usage pattern

- Fetch **only on user interaction** (event click), not on tab load.
- Cache result in `sessionStorage` under `are_wiki_{articleTitle}`.
- Return `null` on failure — always handle gracefully in UI.
- Map `rawName` to `articleTitle` via `WIKIPEDIA_ARTICLE_MAP` in `holiday-data.md`.

### Fetch code

```typescript
async function getHolidayDescription(rawName: string): Promise<WikiResult | null> {
  const normalized = rawName.replace(/\s+\d{4}$/, '').trim();
  const articleTitle = WIKIPEDIA_ARTICLE_MAP[normalized] ?? WIKIPEDIA_ARTICLE_MAP[rawName];
  if (!articleTitle) return null;

  const cacheKey = `are_wiki_${articleTitle}`;
  const cached = sessionStorage?.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${articleTitle}`,
      { headers: { Accept: 'application/json; charset=utf-8' } }
    );
    if (!res.ok || !res.ok) return null;
    const data = await res.json();
    if (!data.extract) return null;
    const result = {
      extract: data.extract,
      wikiUrl: data.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${articleTitle}`,
      articleTitle: data.title ?? normalized,
    };
    sessionStorage?.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}
```
