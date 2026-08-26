# iCalendar (.ics) Generation Specification
## okhp3-tradition-observance-calendar

Client-side iCalendar generation for all supported observance types.
No external library. Pure string assembly per RFC 5545.
Zero cost. MIT license.

---

## Overview

The `icsGenerator.ts` module converts `ObservanceEvent[]` objects into
RFC 5545-compliant `.ics` files that import correctly into:
- Google Calendar (import or subscription)
- Apple Calendar
- Microsoft Outlook
- Any RFC 5545-compliant calendar application

---

## PRODID

```
-//OKHP3//Abrahamic Reference Engine//EN
```

---

## Event type: All-day (DATE, not DATETIME)

All observances are all-day events. iCal all-day events use `VALUE=DATE`
(YYYYMMDD format) for `DTSTART` and `DTEND`, not `VALUE=DATETIME`.

```
DTSTART;VALUE=DATE:20260920
DTEND;VALUE=DATE:20260922
```

**DTEND rule (RFC 5545):** `DTEND` for all-day events is the day AFTER
the last day of the event. A single-day event ending September 20 has
`DTEND:20260921`. A two-day event ending September 21 has `DTEND:20260922`.

---

## VEVENT structure

```
BEGIN:VEVENT
UID:{event.id}@abrahamic-reference-engine.okhp3
SUMMARY:{emoji} {rawName}
DTSTART;VALUE=DATE:{YYYYMMDD}
DTEND;VALUE=DATE:{YYYYMMDD+1}
DESCRIPTION:{description text}
CATEGORIES:{JUDAISM|CHRISTIANITY|ISLAM}
DTSTAMP:{YYYYMMDDTHHmmssZ}
URL:{sourceUrl}               (optional, Hebcal events only)
END:VEVENT
```

---

## Line folding (RFC 5545 §3.1)

Lines longer than 75 octets must be folded. Continuation lines begin
with a single space character.

```
SUMMARY:This is a very long summary line that exceeds seventy-five octet
 s and must be folded at the 75-octet boundary per RFC 5545
```

---

## Text escaping (RFC 5545 §3.3.11)

The following characters must be escaped in text fields:

| Character | Escaped form |
|---|---|
| `\` | `\\` |
| `;` | `\;` |
| `,` | `\,` |
| newline | `\n` |
| carriage return | (strip) |

---

## Description field

**All events:**
```
More information: https://okhp3.github.io/abrahamic-reference-engine
```

**Islamic events:** Prepend the moon sighting notice:
```
Actual observance may vary by one day based on local moon sighting. More information: https://okhp3.github.io/abrahamic-reference-engine
```

---

## DTSTAMP format

ISO 8601 UTC timestamp with dashes, colons, and dots removed:

```
20260625T150226Z
```

Generate at file creation time. The same stamp is used for all VEVENTs
in a single generation call.

---

## Calendar wrapper

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OKHP3//Abrahamic Reference Engine//EN
X-WR-CALNAME:{calendar title}
X-WR-CALDESC:{calendar description}
CALSCALE:GREGORIAN
METHOD:PUBLISH
{VEVENTs}
END:VCALENDAR
```

---

## Download trigger (browser)

```typescript
function downloadICS(icsContent: string, filename: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
```

---

## Filename conventions

| Use | Filename |
|---|---|
| Full-year download | `ARE-Observances-{year}.ics` |
| Single event | `{slugified-name}-{year}.ics` |

Slugification: lowercase, replace non-alphanumeric runs with `-`, strip leading/trailing `-`.

---

## Validation

Use the [iCal Validator](https://icalendar.org/validator.html) to verify output.

Key checks:
- `BEGIN:VCALENDAR` / `END:VCALENDAR` present
- Each `BEGIN:VEVENT` has matching `END:VEVENT`
- `DTEND` is always one day after `DTSTART` (all-day single-day events)
- No line exceeds 75 octets before folding
- All special characters properly escaped in `SUMMARY` and `DESCRIPTION`

---

*okhp3-tradition-observance-calendar v1.0 | MIT License*
*OverKill Hill P3 | OKHP3/skillz | https://overkillhill.com*
