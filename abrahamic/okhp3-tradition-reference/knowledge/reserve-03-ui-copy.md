---
title: Reserve 03 -- UI Copy Reference
type: reserve
status: active-reference
---

# Reserve 03 -- UI Copy Reference

Reference copy for recurring text patterns in the Abrahamic Reference Engine UI. Each section cites its source component. Static strings are quoted verbatim. Dynamic strings are marked `[dynamic]` with a template.

Verified 2026-06-26 against: `src/components/ModeNav.tsx`, `src/components/ScopeExplainer.tsx`, `src/data/traditions.ts`, `src/pages/VerseLookup.tsx`, `src/pages/CrossTraditionCompare.tsx`, `src/pages/TraditionBrowser.tsx`, `src/components/ObservanceControls.tsx`, `src/components/ObservanceEventList.tsx`, `src/components/ObservanceEventDetail.tsx`, `src/lib/icsGenerator.ts`, `src/api/sefaria.ts`, `src/api/bible.ts`, `src/api/quran.ts`, `src/api/hadith.ts`.

---

## App identity

**Full name:** Abrahamic Reference Engine
**Short name:** ARE
**Suite:** OverKill Hill P3 / FoundRy
**Tagline (if needed):** A scripture reference engine for the three major Abrahamic traditions.

---

## Scope explainer

Source: `src/components/ScopeExplainer.tsx` + `src/data/traditions.ts` (PEW_SCOPE_NOTE, PEW_2023)

### Heading (verbatim -- h2, uppercase tracking-widest)

Why These Three Traditions?

### Body intro (verbatim)

This application includes only traditions that meet **both** of the following criteria:

### Qualifying criteria (verbatim from PEW_SCOPE_NOTE.qualifyingCriteria)

1. Traceable Abrahamic lineage (descended from the faith of Abraham)
2. 1% or more of the US population (Pew Research Center Religious Landscape Study)

### Out-of-scope intro (verbatim)

Traditions reviewed but excluded from scope:

### Excluded list (verbatim from PEW_SCOPE_NOTE.excluded)

- Hinduism -- Not Abrahamic
- Buddhism -- Not Abrahamic
- Baha'i -- Abrahamic, but below 1% US threshold
- Sikhism -- Not Abrahamic
- Druze -- Abrahamic, but below 1% US threshold

### Note (verbatim from PEW_SCOPE_NOTE.note -- italic)

Exclusions are methodological, not judgments of worth. Every tradition listed here is presented with equal respect.

### Citation link (verbatim from PEW_2023)

Source: Pew Research Center, Religious Landscape Study, 2023
URL: https://www.pewresearch.org/religion/religious-landscape-study/

---

## Navigation labels

Source: `src/components/ModeNav.tsx` -- MODES array

| Label | Route | aria-label |
|-------|-------|------------|
| Browse | /browse | Explore traditions |
| Lookup | /lookup | Find a passage |
| Compare | /compare | Side-by-side themes |
| Observances | /observances | Religious holiday calendar |

Single-word tab labels. Verbose forms (e.g., "Browse Traditions") appear only in page h1 headings, not the tab bar.

---

## TraditionBrowser page copy

Source: `src/pages/TraditionBrowser.tsx`

### Page heading (verbatim -- h1, lines 422-423)

Browse Traditions

### Page description (verbatim -- lines 425-429)

Three Abrahamic traditions with meaningful presence in the United States. Each is presented with equal respect -- the proportions below reflect Pew Research data, not a ranking of worth.

### Tradition not found state (verbatim -- lines 228-232)

Tradition not found. [Return to Browse] (link to /browse)

Note: "Return to Browse" is a `<Link to="/browse">` that appears only in the error state when a denomination slug is invalid. There is no back-link in the normal denomination detail view.

---

## VerseLookup page copy

Source: `src/pages/VerseLookup.tsx`

### Page heading (verbatim -- h1, lines 367-369)

Verse Lookup

### Page description (verbatim -- lines 370-373)

Retrieve a specific passage from any of the three in-scope Abrahamic traditions. Text is fetched live from free public APIs -- no account required.

### Tradition field legend (verbatim -- line 381)

Tradition

### Tradition radio options (verbatim -- line 384, order in UI)

christianity / islam / judaism (rendered in that order in the DOM)

### Denomination field legend (verbatim -- line 412)

Denomination

### Denomination options (verbatim -- label values from lines 421-424)

- All (value: null)
- Catholic (value: 'catholic')
- Protestant (value: 'protestant')
- LDS (value: 'lds')
- Orthodox (value: 'orthodox')

### Denomination helper text -- Catholic (verbatim -- lines 444-448)

Roman Catholic -- includes the deuterocanonical books (Tobit, Judith, 1-2 Maccabees, Wisdom, Sirach, Baruch). Defaults to World English Bible (WEB), which covers most deuterocanonicals via the free API. NABRE is not available in the free build.

### Denomination helper text -- Protestant (verbatim -- lines 451-453)

Protestant -- 66-book canon. Deuterocanonical books are not included. Defaults to King James Version.

### Denomination helper text -- LDS (verbatim -- lines 457-460)

Latter-day Saint -- includes Bible (KJV) via bible-api.com and Standard Works (Book of Mormon, D&C, Pearl of Great Price) via scriptures.nephi.org.

### Denomination helper text -- Orthodox (verbatim -- lines 462-467)

Eastern and Oriental Orthodox -- uses the Septuagint-based canon (76-78 books). Most books work normally; 3 Maccabees, 4 Maccabees, and Psalm 151 are not yet covered by the connected API.

### Reference field label (verbatim -- line 476)

Reference

### Reference field placeholder -- LDS (verbatim -- LDS_PLACEHOLDER constant)

e.g. 2 Ne. 2:25 or D&C 76:22 or james 1:5

### LDS reference format hint (verbatim -- line 491)

Bible: book chapter:verse (e.g. james 1:5) -- Standard Works: e.g. 2 Ne. 2:25, D&C 76:22, Moses 1:39

### Submit button (verbatim -- line 541, conditional)

- Default: Look up passage
- Loading: Fetching...

### Loading spinner label (verbatim -- line 548)

Fetching passage from API...

### LDS fallback error heading (verbatim -- lines 562-563)

LDS Standard Works

### LDS fallback error body (verbatim -- lines 565-568)

The Book of Mormon, Doctrine & Covenants, and Pearl of Great Price are served via a community-maintained API (scriptures.nephi.org) with no uptime guarantee. It appears to be unreachable right now.

### LDS fallback link (verbatim -- line 576)

Look up on ChurchOfJesusChrist.org →

### Orthodox canon gap heading (verbatim -- lines 583-584)

Orthodox Canon -- Coverage Gap

### Orthodox canon gap body (verbatim -- lines 586-592)

[dynamic: canonGapBook.name] (serif heading)
[dynamic: canonGapBook.description] (book-specific text; see ORTHODOX_GAP_BOOKS constant)
This text is part of the Orthodox canon but is not yet available through the connected API (bible-api.com WEB). Coverage may be added in a future update.

### Orthodox canon gap link (verbatim template -- line 600)

Read [canonGapBook.name] on BibleGateway →

---

## CrossTraditionCompare page copy

Source: `src/pages/CrossTraditionCompare.tsx`

### Page heading (verbatim -- h1, lines 247-248)

Cross-Tradition Compare

### Page description (verbatim -- lines 250-254)

The signature feature. Select a theme and see parallel passages from Judaism, Christianity, and Islam side by side -- with neutral bridging notes that invite discovery rather than declare a winner.

### Theme list heading (verbatim template -- lines 259-261)

Themes ({N})

Where N = COMPARE_THEMES.length (currently 20). Renders as e.g. "Themes (20)".

### Theme count note (verbatim template -- lines 262-264)

All {N} themes have entries for all three traditions

### Pre-seeded fallback label (verbatim -- line 78)

Showing pre-seeded text (live fetch failed):

### Bridging note heading (verbatim -- h3, lines 313-314)

What Connects These?

### Bridging note disclaimer (verbatim -- lines 317-319)

This note draws out the structural or thematic parallel. It does not rank traditions, endorse any interpretation, or suggest one text is derived from another.

### Footer back-link (verbatim -- lines 329-331)

← Verse Lookup  (links to /lookup)

### Footer forward-link (verbatim -- lines 335-337)

Browse traditions →  (links to /browse)

### Default selection note

The component always initializes with the first COMPARE_THEME as the default selection. There is no user-visible empty/no-theme state in the current build.

---

## ObservancesCalendar page copy

Source: `src/components/ObservanceControls.tsx`

### Page heading (verbatim -- h1, line 74)

Observances

### Page subtitle (verbatim -- line 76)

Religious holidays for Judaism, Christianity, and Islam

### Year stepper (verbatim -- lines 82-98)

The year control is a prev/next stepper group, not a select element.
- Previous year button: aria-label "Previous year"; renders ‹ (&#8249;)
- Year display: centered numeric span, e.g. 2026
- Next year button: aria-label "Next year"; renders › (&#8250;)

### Download button label (verbatim -- line 108)

Download .ics  (hidden on small screens via `hidden sm:inline`)

### Download button tooltip (verbatim template -- line 105)

Download all {N} events as .ics

### Tradition filter buttons (verbatim -- lines 33-47, alphabetical order)

Christianity / Islam / Judaism

(Button labels exactly as listed; rendered in alphabetical order: Christianity first, then Islam, then Judaism)

### Christianity denomination sub-filter label (verbatim -- lines 133-134)

Denomination

### Christianity denomination sub-filter options (verbatim -- DENOM_BUTTONS, lines 52-58)

All / Catholic / Protestant / LDS / Orthodox

### Loading state (verbatim -- src/pages/ObservancesCalendar.tsx line 199)

Loading [dynamic: loadingTraditions] holidays...

Where `loadingTraditions` is one of: `Jewish`, `Islamic`, or `Jewish and Islamic` -- computed from which API calls are still in flight.

### API error states (verbatim -- src/pages/ObservancesCalendar.tsx lines 93 and 97)

```
Could not load Jewish holidays. Check your connection.
Could not load Islamic holidays. Check your connection.
```

Each renders inline below the controls with a warning glyph (Unicode &#9888;). Both can appear simultaneously.

### No-events state (verbatim -- src/components/ObservanceEventList.tsx line 177)

```
No events found for the selected filters.
```

Rendered as centered `<p>` with 8-unit vertical padding when `visibleMonths.length === 0` (after month grouping). Appears in the event list below the calendar grid -- not inside the grid itself.

### Event detail -- Islamic moon sighting notice (verbatim -- src/components/ObservanceEventDetail.tsx lines 121-123)

Islamic dates are calculated using the Umm al-Qura method. Actual observance may vary by one day based on local moon sighting.

Rendered as italic `<p>` only for `event.tradition === 'islam'`.

### Event detail -- description loading state (verbatim -- src/components/ObservanceEventDetail.tsx line 130)

Loading description...

### Event detail -- description unavailable state (verbatim -- src/components/ObservanceEventDetail.tsx line 146)

No description available.

### Event detail -- Wikipedia attribution link (verbatim -- src/components/ObservanceEventDetail.tsx line 143)

Description via Wikipedia (CC BY-SA 3.0)

### Event detail -- "Add to Calendar" button (verbatim -- src/components/ObservanceEventDetail.tsx line 157)

Add to Calendar (.ics)

---

## .ics export field reference

Source: `src/lib/icsGenerator.ts`

### PRODID (verbatim -- line 24)

```
-//OKHP3//Abrahamic Reference Engine//EN
```

This is the value that calendar applications display as the generating product. Some apps (e.g., Apple Calendar) surface it in import dialogs.

### ORGANIZER

No ORGANIZER field is emitted. The export uses `METHOD:PUBLISH`, which is a broadcast calendar (not a meeting invite). ORGANIZER is not required and not present. Calendar apps will show the PRODID or X-WR-CALNAME as the source identity, not an ORGANIZER email.

### X-WR-CALNAME patterns

Year download (verbatim template -- `downloadYearICS`, line 165):

```
ARE Observances {year}
```

Single-event download (verbatim template -- `generateSingleEventICS`, line 144):

```
{event.rawName} -- ARE Observances
```

### X-WR-CALDESC patterns

Year download (verbatim -- `generateICS`, lines 134-137):

```
Religious observances for Judaism, Christianity, and Islam. Source: Abrahamic Reference Engine by OverKill Hill P3. https://okhp3.github.io/abrahamic-reference-engine
```

Single-event download (verbatim template -- `generateSingleEventICS`, line 145):

```
{event.rawName} -- Abrahamic Reference Engine. https://okhp3.github.io/abrahamic-reference-engine
```

### VEVENT DESCRIPTION template (verbatim -- `buildDescription`, lines 73-76)

All traditions except Islam:

```
More information: https://okhp3.github.io/abrahamic-reference-engine
```

Islam only (prepends moon sighting notice -- `MOON_SIGHTING_NOTICE` constant, line 27):

```
Actual observance may vary by one day based on local moon sighting. More information: https://okhp3.github.io/abrahamic-reference-engine
```

### VEVENT UID pattern (verbatim template -- line 83)

```
{event.id}@abrahamic-reference-engine.okhp3
```

### VEVENT CATEGORIES

Set to the tradition in uppercase: `JUDAISM`, `CHRISTIANITY`, or `ISLAM`.

### Downloaded filename patterns

Year download (verbatim template -- `downloadYearICS`, line 166):

```
ARE-Observances-{year}.ics
```

Single-event download (verbatim template -- `downloadEventICS`, lines 171-176): event name lowercased, non-alphanumeric runs replaced with hyphens, leading/trailing hyphens stripped, year appended:

```
{slug}-{year}.ics
```

---

## Attribution strings (verbatim from API layer)

These strings appear in the `attribution` field of the Passage object and are rendered by `src/components/VerseCard.tsx` (line 42: `{passage.attribution}`).

### Sefaria (verbatim from src/api/sefaria.ts line 66 and 102)

```
Sefaria.org -- CC BY-SA 2.0
```

### Bible via bible-api.com (verbatim template from src/api/bible.ts line 78)

```
{translationName} -- served via bible-api.com. {json.translation_note || ''}
```
(trailing whitespace trimmed; translation_note is often empty)

### Quran.com primary (verbatim template from src/api/quran.ts line 81)

```
{translation.resource_name} -- served via Quran.com
```

### AlQuran.cloud fallback (verbatim template from src/api/quran.ts line 113)

```
{data.edition.englishName || 'Arberry'} -- served via AlQuran.cloud
```

### Hadith (verbatim template from src/api/hadith.ts lines 66 and 94)

```
{displayName} #{number} -- via github.com/fawazahmed0/hadith-api (CC BY-4.0)
```
or (batch variant):
```
{COLLECTION_DISPLAY_NAMES[collection]} #{number} -- via github.com/fawazahmed0/hadith-api (CC BY-4.0)
```

### Pre-seeded compare panel (verbatim template from CrossTraditionCompare.tsx line 54)

```
{translationName} -- pre-seeded
```

---

## Tradition labels

Use these consistently in UI; do not abbreviate:
- Judaism
- Christianity -- Evangelical Protestant
- Christianity -- Catholic
- Christianity -- Mainline Protestant
- Christianity -- LDS / Restorationist
- Christianity -- Orthodox Christian
- Islam

When context is already within a Christianity section, the "Christianity --" prefix may be dropped in headings.

---

## TraditionBadge display labels

Source: `src/data/traditions.ts` or `src/components/TraditionBadge.tsx`

| Family key | Display label |
|-----------|---------------|
| judaism | Judaism |
| christianity | Christianity |
| islam | Islam |

---

## Tone guidelines

1. **Neutral register:** describe, do not advocate. No language implying one tradition is superior, earlier, or a fulfillment of another.
2. **Scholarly-librarian voice:** warm, curious, accessible. Not devotional, not dry.
3. **No em dashes:** use -- (double hyphen) throughout. Project-wide convention.
4. **No emojis:** in any ARE copy, UI, or documentation.
5. **US English:** not British spelling.
6. **Active voice:** "Select a theme" not "A theme should be selected."
7. **Brevity (ROY principle):** every word must earn its space.
8. **Attribution always:** any scripture passage displayed must carry a translation name and provider.
9. **Pew citation required:** any US religious population claim must cite Pew Research Center Religious Landscape Study.

---

*ARE governance: AGENTS.md. Source component citations embedded per section above.*
