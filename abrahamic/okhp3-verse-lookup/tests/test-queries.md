---
title: Test Query Suite -- Abrahamic Reference Engine
type: test-suite
status: active
---

# Test Query Suite

This document defines the canonical test queries for validating API integrations across all three in-scope Abrahamic traditions. Run these queries to verify that each provider is returning correct, non-empty results.

All queries use free, anonymous public APIs. No API key is required.

---

## How to use

Each entry specifies:
- **Provider:** which API to call
- **Endpoint:** the exact URL to call
- **Expected:** what a successful response should contain
- **Failure behavior:** what the code should do on failure

Run all queries against the live APIs before releasing any change that touches API fetch functions (`src/api/`).

---

## Section 1 -- Sefaria API (Judaism)

**Base URL:** `https://www.sefaria.org/api/texts`

### T-SE-01 -- Genesis 1:1 (single verse)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://www.sefaria.org/api/texts/Genesis%201:1?lang=en` |
| Expected `json.text` | Contains "beginning" and "God" and "heavens" and "earth" |
| Expected `json.ref` | `"Genesis 1:1"` |
| Expected `json.book` | `"Genesis"` |
| Failure | `json.error` is present; or HTTP 4xx/5xx |

### T-SE-02 -- Deuteronomy 6:4 (Shema)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://www.sefaria.org/api/texts/Deuteronomy%206:4?lang=en` |
| Expected `json.text` | Contains "LORD" and "one" |
| Failure | `json.error` is present; or HTTP 4xx/5xx |

### T-SE-03 -- Psalms 23:1-6 (verse range)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://www.sefaria.org/api/texts/Psalms%2023:1-6?lang=en` |
| Expected | `json.text` is an array of 6 elements or a non-empty string |
| Normalization | Flatten array to string by joining with ' '; strip HTML tags |
| Failure | `json.error` is present; or HTTP 4xx/5xx; or empty text |

### T-SE-04 -- Micah 6:8 (minor prophet)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://www.sefaria.org/api/texts/Micah%206:8?lang=en` |
| Expected `json.text` | Contains "justice" or "mercy" or "humbly" |
| Failure | `json.error` is present |

### T-SE-05 -- Invalid reference (error handling)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://www.sefaria.org/api/texts/Genesis%20999:999?lang=en` |
| Expected | `json.error` is a non-empty string |
| Code behavior | Read `json.error` and surface it to the user; do not throw an unhandled exception |

---

## Section 2 -- bible-api.com (Christianity)

**Base URL:** `https://bible-api.com`

### T-BI-01 -- John 3:16 (KJV, core evangelical verse)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://bible-api.com/john%203:16?translation=kjv` |
| Expected `json.text` | Contains "God so loved the world" |
| Expected `json.translation_id` | `"kjv"` |
| Failure | `json.error` is present; or HTTP 4xx/5xx |

### T-BI-02 -- Matthew 5:3-12 (Beatitudes, verse range)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://bible-api.com/matthew%205:3-12?translation=kjv` |
| Expected `json.text` | Contains "Blessed" and "poor in spirit" |
| Expected | `json.verses` is an array of 10 elements |
| Failure | `json.error` is present |

### T-BI-03 -- World English Bible with deuterocanonical (Tobit 1:1)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://bible-api.com/tobit%201:1?translation=web` |
| Expected `json.text` | Non-empty string; contains a word from the book of Tobit |
| Purpose | Verify deuterocanonical access via WEB translation |
| Failure | `json.error` is present; indicates WEB deuterocanonical coverage is broken |

### T-BI-04 -- Douay-Rheims (drc, Catholic traditional)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://bible-api.com/john%201:1?translation=drc` |
| Expected `json.text` | Contains "Word" and "God" and "beginning" |
| Expected `json.translation_id` | `"drc"` |
| Failure | `json.error` is present |

### T-BI-05 -- LDS Bible reference (James 1:5, KJV)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://bible-api.com/james%201:5?translation=kjv` |
| Expected `json.text` | Contains "wisdom" and "ask of God" |
| Purpose | Verify KJV coverage for LDS Bible references |
| Failure | `json.error` is present |

### T-BI-06 -- Invalid reference (error handling)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://bible-api.com/fake%20book%20999:999?translation=kjv` |
| Expected | `json.error` is a non-empty string |
| Code behavior | Read `json.error` and surface it to the user |

---

## Section 3 -- Quran.com API v4 (Islam)

**Base URL:** `https://api.quran.com/api/v4`

### T-QU-01 -- Al-Fatiha 1:1 (Sahih International, default)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://api.quran.com/api/v4/verses/by_key/1:1?language=en&translations=20&words=false` |
| Expected | `json.verse.translations[0].text` contains "Allah" and "Merciful" |
| Expected | `json.verse.verse_key` equals `"1:1"` |
| Failure | HTTP 4xx/5xx; or `json.verse` is null/undefined |

### T-QU-02 -- Ayat al-Kursi 2:255 (Throne Verse)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://api.quran.com/api/v4/verses/by_key/2:255?language=en&translations=20&words=false` |
| Expected | `json.verse.translations[0].text` contains "Throne" or "throne" and "Allah" |
| Failure | HTTP 4xx/5xx |

### T-QU-03 -- Al-Ikhlas 112:1 (Pickthall, translation ID 21)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://api.quran.com/api/v4/verses/by_key/112:1?language=en&translations=21&words=false` |
| Expected | `json.verse.translations[0].text` contains "Allah" |
| Expected | `json.verse.translations[0].id` equals `21` |
| Purpose | Verify non-default translation ID routing |
| Failure | HTTP 4xx/5xx |

### T-QU-04 -- Al-Alaq 96:1 (first revelation)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://api.quran.com/api/v4/verses/by_key/96:1?language=en&translations=20&words=false` |
| Expected | `json.verse.translations[0].text` contains "Read" |
| Failure | HTTP 4xx/5xx |

---

## Section 4 -- AlQuran.cloud (Islam fallback)

**Base URL:** `https://api.alquran.cloud/v1`

### T-AQ-01 -- Al-Fatiha 1:1 (Sahih International edition)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://api.alquran.cloud/v1/ayah/1:1/en.sahih` |
| Expected | `json.code` equals `200` |
| Expected | `json.data.text` contains "Allah" and "Merciful" |
| Purpose | Primary fallback provider validation |
| Failure | `json.code` != 200; or `json.data` is null |

### T-AQ-02 -- Arberry translation (en.arberry)

| Field | Value |
|-------|-------|
| Endpoint | `GET https://api.alquran.cloud/v1/ayah/2:255/en.arberry` |
| Expected | `json.data.text` is non-empty; contains "throne" or "Throne" |
| Purpose | Verify Arberry edition (quran-23 in ARE) is served by AlQuran.cloud |
| Failure | `json.code` != 200 |

---

## Section 5 -- Hadith API (Islam supplementary)

**CDN:** `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/`

### T-HA-01 -- Bukhari, book 1, hadith 1

| Field | Value |
|-------|-------|
| Endpoint | `GET https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-bukhari/1/1.json` |
| Expected | Response contains `hadiths` array with at least one entry |
| Expected | `hadiths[0].text` is a non-empty string |
| Failure | HTTP 4xx/5xx; or CDN unavailable (jsDelivr outage) |

---

## Section 6 -- Cross-tradition compare smoke test

These queries verify that the three passages used in the most fundamental cross-tradition theme ("The Golden Rule") are all retrievable.

### T-CT-01 -- Judaism passage (Leviticus 19:18)

Same as T-SE-01 pattern; endpoint: `GET https://www.sefaria.org/api/texts/Leviticus%2019:18?lang=en`

### T-CT-02 -- Christianity passage (Matthew 7:12, KJV)

Endpoint: `GET https://bible-api.com/matthew%207:12?translation=kjv`
Expected `json.text`: Contains "do" and "men" and "law"

### T-CT-03 -- Islam passage (An-Nisa 4:36)

Endpoint: `GET https://api.quran.com/api/v4/verses/by_key/4:36?language=en&translations=20&words=false`
Expected: `json.verse.translations[0].text` is non-empty

---

## Failure thresholds

A full test run is considered passing if:
- All T-SE-*, T-BI-*, T-QU-* queries return non-empty text with correct attribution
- T-AQ-* and T-HA-* pass, or are documented as flaky with a recorded date
- T-CT-* (cross-tradition smoke) all pass

A single failure in T-SE-*, T-BI-*, or T-QU-* is a blocking issue -- the primary API path is broken.

T-AQ-* and T-HA-* failures are non-blocking but must be documented.

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
