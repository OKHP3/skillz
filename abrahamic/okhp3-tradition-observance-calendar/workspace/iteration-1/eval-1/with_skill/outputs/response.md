# Implementing a Cross-Tradition Religious Observance Calendar for 2026

To create a unified religious observance calendar for Jewish, Christian, and Islamic holidays, you can utilize a combination of public REST APIs and client-side algorithms. Below is the implementation guide based on the Abrahamic Reference Engine specifications.

## 1. Data Sources & APIs

### Jewish Holidays (Hebcal API)
Use the Hebcal REST API to fetch Jewish holidays. It requires no API key and provides comprehensive holiday data.

*   **Endpoint:** `https://www.hebcal.com/hebcal?v=1&cfg=json&year=2026&maj=on&min=off&nx=off&mf=off&ss=on&mod=on&i=off&lg=s&m=50`
*   **Key Parameters:**
    *   `maj=on`: Includes major holidays.
    *   `mod=on`: Includes modern Israeli holidays (e.g., Yom HaShoah).
    *   `i=off`: Uses Diaspora rules (standard for US audiences).

### Islamic Holidays (AlAdhan API)
The AlAdhan API provides Hijri calendar data. Since holidays are embedded in daily data, you fetch 12 months in parallel for the Gregorian year 2026.

*   **Endpoint Pattern:** `https://api.aladhan.com/v1/gToHCalendar/{month}/2026`
*   **Filtering:** Use an allowed set (e.g., "Eid-ul-Adha", "Start of Ramadan", "Eid ul Fitr") to filter the `hijri.holidays` array.

### Christian Holidays (Computus Algorithm)
Christian holidays are calculated client-side using the **Computus algorithm** to determine Easter dates, from which other movable feasts (like Ash Wednesday or Pentecost) are derived. Fixed feasts (like Christmas) are set to specific dates.

---

## 2. Normalization Strategy

To create a single event list, normalize all data into a shared `ObservanceEvent` interface:

```typescript
interface ObservanceEvent {
  id: string;           // "{tradition}-{rawName}-{year}-{startDateISO}"
  title: string;        // emoji-prefixed: "✡️ Rosh Hashanah"
  rawName: string;      // "Rosh Hashanah"
  emoji: string;        // "✡️" | "✝️" | "☦️" | "☪️"
  tradition: 'judaism' | 'christianity' | 'islam';
  denomination: 'all' | 'catholic' | 'orthodox' | 'protestant' | 'evangelical' | 'restorationist';
  startDate: Date;
  endDate: Date;
  isMultiDay: boolean;
  hebrewName?: string;  // Jewish only
  hijriDate?: string;   // Islamic only
  source: 'hebcal' | 'aladhan' | 'algorithm';
}
```

### Emoji Registry
Use these standard emojis for tradition identification:
*   **Judaism:** `✡️`
*   **Christianity (Western):** `✝️`
*   **Christianity (Orthodox):** `☦️`
*   **Islam:** `☪️`

---

## 3. Implementation Code

### Fetching Jewish Holidays
```typescript
async function fetchJewishHolidays(year: number): Promise<ObservanceEvent[]> {
  const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&year=${year}&maj=on&min=off&nx=off&mf=off&ss=on&mod=on&i=off&lg=s&m=50`;
  const res = await fetch(url);
  const data = await res.json();
  
  return data.items
    .filter((item: any) => item.category === 'holiday')
    .map((item: any) => ({
      id: `judaism-${item.title.toLowerCase().replace(/\s+/g, '-')}-${year}`,
      title: `✡️ ${item.title.replace(/\s+\d{4}$/, '')}`, // Strip year suffix
      rawName: item.title.replace(/\s+\d{4}$/, ''),
      emoji: '✡️',
      tradition: 'judaism',
      denomination: 'all',
      startDate: new Date(item.date),
      endDate: new Date(item.date),
      isMultiDay: false, // Further logic needed for multi-day grouping
      hebrewName: item.hebrew,
      source: 'hebcal'
    }));
}
```

### Computing Christian Easter (Western)
```typescript
function computeWesternEaster(year: number): Date {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}
```

### Fetching Islamic Holidays
Fetch 12 months and filter using the `ALADHAN_ALLOWED` set.
```typescript
const ALADHAN_ALLOWED = new Set(["Eid-ul-Adha", "Start of Ramadan", "Eid ul Fitr", "Islamic New Year", "Ashura"]);

async function fetchIslamicHolidays(year: number): Promise<ObservanceEvent[]> {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const results = await Promise.all(
    months.map(m => fetch(`https://api.aladhan.com/v1/gToHCalendar/${m}/${year}`).then(r => r.json()))
  );

  const daysWithHolidays = results.flatMap(r => r.data).filter(day => 
    day.hijri.holidays.some((h: string) => ALADHAN_ALLOWED.has(h))
  );

  // Map to ObservanceEvent...
}
```

---

## 4. Important Considerations
*   **Islamic Moon Sighting:** Always display a disclaimer: *"Islamic dates are calculated using the Umm al-Qura method. Actual observance may vary by one day based on local moon sighting."*
*   **Attribution:** Ensure you credit the data sources in your UI:
    *   "Calendar data via Hebcal.com"
    *   "Islamic calendar data via AlAdhan.com"
    *   "Description via Wikipedia" (if using the Wikipedia API for event details)
