# New Theme Entry Template

Use this template when generating a new cross-tradition theme entry beyond the 20 pre-seeded set.

Copy the JSON block below into `compareThemes.ts` inside the `COMPARE_THEMES` array.
Fill all required fields. Leave `liveRef` as `null` if the text is already in `staticText`.

---

## Required fields checklist

- [ ] `id` -- kebab-case, unique, no spaces (e.g. `justice`, `hospitality`)
- [ ] `label` -- Title Case, max 5 words
- [ ] All three tradition objects present (judaism, christianity, islam)
- [ ] Each tradition has `displayRef`, `translation`, `staticText`, `attribution`
- [ ] `bridgingNote` -- neutral, max 3 sentences, no "fulfills / supersedes / original"
- [ ] No tradition called "earlier", "derived", "more complete", or "spiritual predecessor"

---

## Proportional representation rule

When generating a batch of new themes, distribute passage count proportionally
to US Pew population share -- but every theme must always include all three traditions:

| Tradition | US share (Pew 2014) | Passage weight in batches |
|-----------|---------------------|--------------------------|
| Christianity | ~63% | More denominations / passages per batch |
| Judaism | ~2% | 1 passage per theme |
| Islam | ~1% | 1 passage per theme |

Visual dignity is always equal regardless of population share.

---

## JSON template

```json
{
  "id": "your-theme-id",
  "label": "Your Theme Label",
  "traditions": {
    "judaism": {
      "displayRef": "Book Chapter:Verse",
      "translation": "Translation name (e.g. JPS Tanakh)",
      "staticText": "The full passage text here.",
      "attribution": "Source attribution (e.g. Sefaria CC BY-SA 2.0)",
      "liveRef": null
    },
    "christianity": {
      "displayRef": "Book Chapter:Verse",
      "translation": "Translation name (e.g. ESV, KJV, WEB)",
      "staticText": "The full passage text here.",
      "attribution": "Source attribution (e.g. Public domain)",
      "liveRef": null
    },
    "islam": {
      "displayRef": "Surah Name Surah:Ayah (e.g. Al-Baqarah 2:177)",
      "translation": "Translation name (e.g. Sahih International)",
      "staticText": "The full passage text here.",
      "attribution": "Source: Quran.com / Sahih International",
      "liveRef": null
    }
  },
  "bridgingNote": "One to three sentences. Neutral tone. Describe the shared theme without asserting historical priority, fulfillment, or synthesis. End with a period."
}
```

---

## Tone review checklist for `bridgingNote`

Do NOT use:
- "fulfills" / "completion" -- implies hierarchy
- "supersedes" / "replaces" -- implies hierarchy
- "original" / "earliest" / "source of" -- implies hierarchy
- "all three agree that" -- flattens legitimate differences
- "God commands" / "God says" -- voice of authority, not description
- "most translations" -- imprecise

DO use:
- "Each tradition..." / "Across these three traditions..."
- "The theme of X appears in..." 
- "Scholars of all three traditions..."
- "In each case..."
- Passive voice when noting shared emphasis without asserting direction
