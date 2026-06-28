# Holiday Data Reference
## okhp3-tradition-observance-calendar

All static reference data: Wikipedia article map, AlAdhan filter sets,
display name normalization, and emoji registry. Copy these directly into
implementation code. No modification needed unless new holidays are added.

---

## WIKIPEDIA_ARTICLE_MAP

Maps holiday display names to Wikipedia article titles for the REST API.
Strip Hebcal year suffixes before lookup (`"Rosh Hashana 5787"` → `"Rosh Hashana"`).

```typescript
export const WIKIPEDIA_ARTICLE_MAP: Record<string, string> = {
  // ── Jewish ──────────────────────────────────────────────────────────────
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
  'Lag BaOmer':           'Lag_BaOmer',
  'Shavuot':              'Shavuot',
  "Tisha B'Av":           "Tisha_B'Av",
  'Yom Yerushalayim':     'Yom_Yerushalayim',

  // ── Christian — Western ─────────────────────────────────────────────────
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
  'Advent (First Sunday)':'Advent',

  // ── Christian — Orthodox ────────────────────────────────────────────────
  'Orthodox Christmas':   'Christmas#Eastern_Christianity',
  'Theophany':            'Theophany',
  'Orthodox Easter':      'Easter#Eastern_Christianity',
  'Orthodox Palm Sunday': 'Palm_Sunday',
  'Orthodox Good Friday': 'Good_Friday',
  'Orthodox Pentecost':   'Pentecost',

  // ── Islamic ─────────────────────────────────────────────────────────────
  'Islamic New Year (Muharram 1)':        'Islamic_New_Year',
  'Ashura':                               'Ashura',
  "Mawlid al-Nabi (Prophet's Birthday)": 'Mawlid',
  "Isra and Mi'raj (Night Journey)":      "Isra%27_and_Mi%27raj",
  'First Day of Ramadan':                 'Ramadan',
  'Laylat al-Qadr (Night of Power)':      'Laylat_al-Qadr',
  'Eid al-Fitr':                          'Eid_al-Fitr',
  'Day of Arafah':                        'Day_of_Arafah',
  'Eid al-Adha':                          'Eid_al-Adha',
};
```

---

## ALADHAN_ALLOWED

AlAdhan returns a broader set of Islamic observances including Sufi-specific
and Shia-specific dates. Only the strings in this set are surfaced. All
others are silently discarded.

```typescript
export const ALADHAN_ALLOWED = new Set<string>([
  'Arafat (Haj) Day',
  'Eid-ul-Adha',
  'Islamic New Year',
  'Ashura',
  'Mawlid al-Nabi',
  "Al Isra' Wal Mi'raj",
  'Start of Ramadan',
  'Laylat al Qadr',
  'Eid ul Fitr',
]);
```

**Ashura note:** Ashura carries different weight in Sunni (commemorative)
vs. Shia (mourning) practice. Include it with a neutral Wikipedia description.
Do not characterize it as exclusively either observance in UI copy.

---

## ALADHAN_DISPLAY_NAMES

Maps AlAdhan internal strings to user-facing English display names.

```typescript
export const ALADHAN_DISPLAY_NAMES: Record<string, string> = {
  'Arafat (Haj) Day':    'Day of Arafah',
  'Eid-ul-Adha':         'Eid al-Adha',
  'Islamic New Year':    'Islamic New Year (Muharram 1)',
  'Ashura':              'Ashura',
  'Mawlid al-Nabi':      "Mawlid al-Nabi (Prophet's Birthday)",
  "Al Isra' Wal Mi'raj": "Isra and Mi'raj (Night Journey)",
  'Start of Ramadan':    'First Day of Ramadan',
  'Laylat al Qadr':      'Laylat al-Qadr (Night of Power)',
  'Eid ul Fitr':         'Eid al-Fitr',
};
```

---

## ALADHAN_MULTIDAY

Holidays that may appear across multiple consecutive days in AlAdhan
responses and should be grouped into a single multi-day event.

```typescript
export const ALADHAN_MULTIDAY = new Set<string>([
  'Eid al-Adha',
  'Eid al-Fitr',
]);
```

---

## Emoji registry

```typescript
export const TRADITION_EMOJI = {
  judaism:               '✡️',   // U+2721 U+FE0F  Star of David
  christianity_western:  '✝️',   // U+271D U+FE0F  Latin Cross
  christianity_orthodox: '☦️',   // U+2626 U+FE0F  Orthodox Cross
  islam:                 '☪️',   // U+262A U+FE0F  Star and Crescent
};
```

- Use `✝️` for Catholic, Mainline Protestant, Evangelical, and Restorationist events.
- Use `☦️` for Orthodox-specific dates only (Orthodox Christmas, Orthodox Easter, Theophany, etc.).
- All emojis render correctly on iOS 15+, Android 12+, Windows 11, macOS 12+.

---

## Tradition colors (Tailwind hex)

```typescript
export const TRADITION_COLORS = {
  judaism:      '#2563EB',   // blue-600
  christianity: '#7C3AED',   // violet-600
  islam:        '#059669',   // emerald-600
};

// Lighter shade for Orthodox events within Christianity
export const ORTHODOX_COLOR = '#A78BFA'; // violet-400
```

---

## Session cache key registry

| Key pattern | Content |
|---|---|
| `are_hebcal_{year}` | Serialized ObservanceEvent[] from Hebcal |
| `are_aladhan_{year}` | Serialized ObservanceEvent[] from AlAdhan |
| `are_wiki_{articleTitle}` | WikiResult (extract + wikiUrl) |

Always re-hydrate `startDate` and `endDate` as `new Date(serialized)` when
reading from sessionStorage — JSON.parse converts them to strings.
