To add a religious observance calendar covering Jewish, Christian, and Islamic holidays for 2026, you can leverage several well-established APIs. Since these calendars follow different systems (Lunar, Solar, and Lunisolar), normalization is the most critical step.

### 1. Recommended APIs

#### **Jewish Holidays (Hebcal API)**
Hebcal is the gold standard for Jewish calendar data. It provides a REST API that returns holidays, candle lighting times, and Torah portions.
- **Endpoint:** `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=2026&month=x&ss=on&mf=on&c=on&geo=zip&zip=90210&m=50&s=on`
- **Key Features:** Supports diaspora vs. Israel settings and various levels of holiday importance.

#### **Islamic Holidays (Aladhan API)**
The Aladhan API provides comprehensive Islamic calendar data, including prayer times and Hijri dates.
- **Endpoint:** `https://api.aladhan.com/v1/gToHCalendar/2026` (To get the Hijri calendar for the Gregorian year 2026)
- **Key Features:** Allows you to specify the calculation method for prayer times and lunar visibility.

#### **Christian Holidays (Abstract API or Calendarific)**
Christian holidays (especially Easter-related ones) vary between Western (Gregorian) and Eastern (Julian) traditions.
- **Calendarific API:** A general-purpose holiday API that covers major Christian holidays (Christmas, Easter, Pentecost) across different countries.
- **Endpoint:** `https://calendarific.com/api/v2/holidays?&api_key=YOUR_API_KEY&country=US&year=2026&type=religious`

---

### 2. Normalization Strategy

To combine these into a single list, you should define a standard `Event` interface and write adapter functions for each API response.

#### **Step 1: Define the Unified Interface**
```typescript
interface ReligiousEvent {
  id: string;
  title: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  tradition: 'Jewish' | 'Christian' | 'Islamic';
  description?: string;
  importance: 'major' | 'minor' | 'observance';
}
```

#### **Step 2: Create Adapters**

**Hebcal (Jewish):**
```javascript
const normalizeHebcal = (item) => ({
  id: `jewish-${item.date}-${item.title}`,
  title: item.title,
  date: item.date,
  tradition: 'Jewish',
  importance: item.category === 'major' ? 'major' : 'minor'
});
```

**Aladhan (Islamic):**
```javascript
const normalizeAladhan = (item) => ({
  id: `islamic-${item.date.gregorian.date}-${item.title}`,
  title: item.title, // You might need to map specific Hijri dates to names manually if not provided
  date: item.date.gregorian.date, // Convert to YYYY-MM-DD
  tradition: 'Islamic',
  importance: 'major'
});
```

#### **Step 3: Aggregate and Sort**
Fetch data from all sources, run them through your adapters, and sort the final array by date.

```javascript
const fetchAllEvents = async (year) => {
  const [jewish, christian, islamic] = await Promise.all([
    fetchJewish(year),
    fetchChristian(year),
    fetchIslamic(year)
  ]);

  const allEvents = [...jewish, ...christian, ...islamic];
  
  return allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
};
```

### 3. Key Considerations for 2026
*   **Lunar Variance:** Islamic holidays depend on moon sightings. Always indicate that dates are "tentative" or "subject to local moon sighting."
*   **Sunset-to-Sunset:** Jewish and Islamic holidays begin at sunset the evening before. In your UI, decide if you want to show the event on the day it "starts" or the primary day it is observed.
*   **Easter 2026:** In 2026, Western Easter falls on April 5th, while Orthodox Easter falls on April 12th. Ensure your API or logic accounts for both if your audience is global.