---
title: Translation Metadata
type: reference
status: active-reference
---

# Translation Metadata

Full translation reference for the Abrahamic Reference Engine. This document covers all translations recognized by the SPA and the agent skills, including free (enabled in build) and licensed (API key required, not enabled in free build) translations.

For the canonical agent-facing version, see `../okhp3-verse-lookup/translation-matrix.md`. This document provides additional provenance and denominational context.

---

## Judaism -- Sefaria translations

| ARE ID | API param | Name | License | Notes |
|--------|-----------|------|---------|-------|
| `sefaria-en` | `en` | Sefaria English (composite) | CC BY-SA 2.0 | Aggregates multiple English translations; attribution varies by book |
| `sefaria-he-en` | `he-en` | Sefaria Hebrew + English | CC BY-SA 2.0 | Bilingual; returns Hebrew text alongside English |

All Sefaria translations are available in the free build. No API key required.

---

## Christianity -- Bible translations (bible-api.com)

### Free translations (enabled in build)

| ARE ID | API ID | Name | Year | License | Denominations |
|--------|--------|------|------|---------|---------------|
| `kjv` | `kjv` | King James Version | 1611 | Public domain | Evangelical, LDS, Mainline, Catholic (study) |
| `web` | `web` | World English Bible | 2000 | Public domain (no restrictions) | All; includes deuterocanonicals |
| `asv` | `asv` | American Standard Version | 1901 | Public domain | Evangelical, Mainline |
| `bbe` | `bbe` | Bible in Basic English | 1965 | Public domain | All; simplified 850-word vocabulary |
| `darby` | `darby` | Darby Translation | 1890 | Public domain | Evangelical |
| `akjv` | `akjv` | American King James Version | 1999 | Public domain | Evangelical |
| `ylt` | `ylt` | Young's Literal Translation | 1862 | Public domain | Academic |
| `douay` | `drc` | Douay-Rheims Bible | 1582/1610 | Public domain | Catholic, Orthodox; from Latin Vulgate |

Note: `douay` is the ARE internal ID; the bible-api.com API param is `drc`.

### Licensed translations (API key required -- NOT in free build)

| ARE ID | API ID | Name | Year | License | Notes |
|--------|--------|------|------|---------|-------|
| `esv` | `esv` | English Standard Version | 2001 | Licensed (c) Crossway | api.esv.org; requires ESV API key |
| `nrsv` | `nrsv` | New Revised Standard Version | 1989 | Licensed (c) NCC | API.Bible; requires key |
| `nabre` | `nabre` | New American Bible Revised Edition | 2011 | Licensed (c) USCCB | API.Bible; US Catholic liturgical standard |
| `niv` | `niv` | New International Version | 1978/2011 | Licensed (c) Biblica | API.Bible; widely used evangelical translation |

These translations are listed in the SPA's `translations.ts` data file with `license: 'licensed'` and are displayed as reference information but not used for API calls in the free build.

---

## Islam -- Quran translations (Quran.com)

| ARE ID | Quran.com ID | Name | Style | License |
|--------|-------------|------|-------|---------|
| `quran-20` | `20` | Sahih International | Modern; balanced literal/dynamic | Licensed (served via API) |
| `quran-21` | `21` | Pickthall | Early 20th century; archaic | Public domain (1930) |
| `quran-22` | `22` | Yusuf Ali | Classic; extensive footnotes | Public domain |
| `quran-23` | `23` | Arberry | Literary; "The Koran Interpreted" | Public domain (1955); served via alquran.cloud |
| `quran-24` | `24` | Shakir | More literal | Public domain |

Default: `quran-20` (Sahih International).

### AlQuran.cloud edition IDs (fallback provider)

| Edition | Name |
|---------|------|
| `en.asad` | Muhammad Asad |
| `en.arberry` | A.J. Arberry |
| `en.sahih` | Sahih International |
| `en.pickthall` | Pickthall |

---

## Denominational translation preference matrix

| Denomination | Primary (free) | Secondary (free) | Preferred (licensed, not in build) |
|-------------|----------------|-----------------|-------------------------------------|
| Evangelical Protestant | `kjv` | `web`, `asv`, `bbe` | `esv` |
| Catholic | `web` | `douay`, `kjv` | `nabre` |
| Mainline Protestant | `kjv` | `web`, `asv`, `bbe` | `nrsv` |
| LDS / Restorationist | `kjv` | -- | -- |
| Orthodox Christian | `web` | `kjv` | `nrsv` |
| Judaism | `sefaria-en` | `sefaria-he-en` | -- |
| Islam | `quran-20` | `quran-21`, `quran-22` | -- |

---

## Translation notes for agents

1. **Always cite the translation name when presenting a passage.** Never present a passage without attribution.
2. **WEB is the best free option for Catholic and Orthodox passages** -- it is the only free bible-api.com translation that includes the deuterocanonicals.
3. **KJV is the LDS Bible standard.** The Church of Jesus Christ of Latter-day Saints uses the King James Version without modification.
4. **Quran.com serves translation IDs as integers.** Strip the `quran-` prefix from ARE IDs before passing to the API.
5. **Arberry (quran-23) is served via AlQuran.cloud**, not Quran.com, due to API availability differences.
6. **ESV, NRSV, NABRE, NIV are listed for informational purposes only** in the ARE free build. Agents should not attempt to call these APIs without a key.

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md. Cross-reference: `../okhp3-verse-lookup/translation-matrix.md`.*
