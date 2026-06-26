---
title: Reserve 02 -- API Gap Register
type: reserve
status: active-reference
---

# Reserve 02 -- API Gap Register

A register of known API coverage gaps in the Abrahamic Reference Engine. Agents and contributors must consult this document before promising a translation or text is available via the free build.

Each gap entry describes what is missing, why, and what the current fallback or surface behavior should be.

---

## Gap 1 -- NABRE (New American Bible Revised Edition)

**Tradition/Denomination:** Catholic Christianity
**Missing:** Official US Catholic liturgical translation
**Why missing:** NABRE is licensed (c) United States Conference of Catholic Bishops; requires an API.Bible key -- not available in the free anonymous build
**Current fallback:** `web` (World English Bible) -- includes deuterocanonicals but is not the liturgical standard
**UI behavior:** Translation picker shows NABRE with a "licensed -- not in free build" note
**Future path:** API.Bible integration with a user-provided key (deferred; tracked as a follow-up task)
**Status:** open

---

## Gap 2 -- NRSV (New Revised Standard Version)

**Tradition/Denomination:** Mainline Protestant, Catholic (academic), Orthodox
**Missing:** Standard translation in mainline and academic Protestant settings; uses inclusive language
**Why missing:** NRSV is licensed (c) National Council of Churches; requires API.Bible key
**Current fallback:** `kjv`, `web`, or `asv`
**UI behavior:** Translation picker shows NRSV with a "licensed -- not in free build" note
**Future path:** API.Bible integration with a user-provided key (deferred)
**Status:** open

---

## Gap 3 -- ESV (English Standard Version)

**Tradition/Denomination:** Evangelical Protestant
**Missing:** The most widely adopted modern evangelical translation (2001)
**Why missing:** ESV is licensed (c) Crossway; requires an ESV API key from api.esv.org
**Current fallback:** `kjv`, `web`, `asv`
**UI behavior:** Translation picker shows ESV with a "licensed -- not in free build" note
**Future path:** ESV API integration with a user-provided key (deferred)
**Status:** open

---

## Gap 4 -- NIV (New International Version)

**Tradition/Denomination:** Evangelical Protestant, Non-denominational
**Missing:** Widely used dynamic-equivalence translation (1978/2011 revision)
**Why missing:** NIV is licensed (c) Biblica; requires API.Bible key
**Current fallback:** `kjv`, `web`, `bbe`
**UI behavior:** Translation picker shows NIV with a "licensed -- not in free build" note
**Future path:** API.Bible integration with a user-provided key (deferred)
**Status:** open

---

## Gap 5 -- Orthodox OT (3 Maccabees, Psalm 151, 4 Maccabees)

**Tradition/Denomination:** Orthodox Christian
**Missing:** Full Orthodox OT beyond the seven Catholic deuterocanonicals
**Why missing:** No free public unauthenticated API covers 3 Maccabees, Psalm 151, or 4 Maccabees
**Current fallback:** `web` covers the seven Catholic deuterocanonicals but not the Orthodox-specific additions
**UI behavior:** Surface a note when Orthodox-specific texts are requested: "This text is part of the Orthodox OT canon but is not available via a free public API. The World English Bible (WEB) includes the Catholic deuterocanonicals but not all Orthodox additions (3 Maccabees, Psalm 151, 4 Maccabees)."
**Future path:** No clear free API path identified; a static text dataset derived from a public-domain source (e.g., Brenton LXX) may be the only viable option
**Status:** open -- static fallback tracked as a separate project task

---

## Gap 6 -- LDS Standard Works (non-Bible volumes)

**Tradition/Denomination:** LDS / Restorationist
**Missing:** Book of Mormon, Doctrine and Covenants, Pearl of Great Price
**Why missing:** No guaranteed free public API; scriptures.nephi.org is a community API with no uptime SLA
**Current fallback:** scriptures.nephi.org with a graceful failure message; link to official LDS scriptures site
**UI behavior:** On failure: "The LDS Standard Works (Book of Mormon, D&C, Pearl of Great Price) are not available via a guaranteed free API at this time. Visit https://www.churchofjesuschrist.org/study/scriptures to look up this passage."
**Future path:** Static dataset of key passages as a pre-seeded fallback (partially done in compareThemes.ts for cross-tradition compare)
**Status:** open

---

## Gap 7 -- Hadith search / topic index

**Tradition/Denomination:** Islam
**Missing:** Searchable hadith lookup by topic or keyword
**Why missing:** fawazahmed0/hadith-api supports volume/book/hadith-number lookup but not keyword search; no free search API for hadith exists
**Current fallback:** No hadith search in current build; individual hadiths accessible by known collection + book + number reference
**Future path:** Build a static topic-indexed subset of commonly cited hadiths (deferred)
**Status:** open

---

## Gap 8 -- Douay-Rheims (drc) unreliable on bible-api.com

**Tradition/Denomination:** Catholic Christianity, Orthodox Christian
**Missing:** Reliable Douay-Rheims Bible access via bible-api.com
**Why missing:** bible-api.com lists `drc` (Douay-Rheims Challoner) as a supported translation ID, but in practice many verse lookups return empty or malformed responses. The translation data appears to be incomplete in the provider's database.
**Current fallback:** `web` (World English Bible) -- includes deuterocanonicals; best available free Catholic option
**UI behavior:** If `drc` returns an empty or error response, fall back to `web` and note the gap: "The Douay-Rheims translation is not reliably available via the free API. Showing the World English Bible instead."
**Affected passages:** Wide; particularly unreliable for Old Testament books and deuterocanonicals. New Testament coverage is more complete but still inconsistent.
**Future path:** No clear path while dependent on bible-api.com. A static pre-seeded dataset for key Catholic passages (Douay-Rheims) may be needed for reliable display.
**Status:** open -- fix tracked as a separate project task

---

## Gap 9 -- Pickthall (quran-21) unavailable via Quran.com

**Tradition/Denomination:** Islam
**Missing:** Mohammed Marmaduke Pickthall's classic 1930 English Quran translation
**Why missing:** Quran.com API v4 does not reliably serve translation ID 21 (Pickthall). The translation is listed in the ARE translation ID map but the API returns empty translation arrays for many verses.
**Current fallback:** `quran-20` (Sahih International) -- modern, balanced; default for ARE
**AlQuran.cloud fallback:** `en.pickthall` edition is available via `https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/en.pickthall` and should be used as the fallback when Quran.com ID 21 fails
**UI behavior:** If Quran.com returns an empty translation for ID 21, retry via AlQuran.cloud `en.pickthall` before displaying an error
**Future path:** Route Pickthall requests directly to AlQuran.cloud as the primary provider for that translation, bypassing Quran.com ID 21
**Status:** open -- fix tracked as a separate project task

---

## Gap 10 -- Hadith lookup by collection + hadith number (not book + number)

**Tradition/Denomination:** Islam
**Missing:** Direct hadith lookup by collection name + sequential hadith number (e.g., "Bukhari hadith 1" without specifying the book)
**Why missing:** fawazahmed0/hadith-api organizes hadiths by collection > book > hadith number within the book. There is no global sequential index. A reference like "Sahih al-Bukhari #6594" requires knowing the correct book number within Bukhari, not just the collection-level sequential number.
**Current fallback:** Require the user to specify collection + book + number (three-part reference); or use pre-seeded static text for known hadiths
**UI behavior:** The hadith lookup form in VerseLookup should accept collection + book + number only; document the three-part requirement clearly in the form label and help text
**Future path:** Build a mapping from common sequential hadith numbers (e.g., USC-MSA numbering) to the fawazahmed0 API's book/number scheme; this mapping is static and could be pre-seeded as a JSON file
**Status:** open -- fix tracked as a separate project task

---

## Gap 11 -- Shakir (quran-19) provider change

**Tradition/Denomination:** Islam
**Missing:** M. H. Shakir's 1907 Quran translation, previously available via Quran.com translation ID 19
**Why missing:** Shakir (ID 19) is no longer reliably served by Quran.com API v4; the translation appears to have been removed or restructured at the provider. Requests return empty or missing translation data.
**Current fallback:** `quran-20` (Sahih International) -- modern, balanced; default for ARE
**AlQuran.cloud fallback:** `en.shakir` edition is available via `https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/en.shakir` and should be used when Quran.com ID 19 fails
**UI behavior:** If Quran.com returns an empty translation for ID 19, retry via AlQuran.cloud `en.shakir` before displaying an error
**Future path:** Route Shakir requests directly to AlQuran.cloud as the primary provider, bypassing Quran.com ID 19
**Status:** open -- fix tracked as a separate project task

---

## Gap summary table

| Gap | Tradition | Text / Translation | Reason | Status | Fallback |
|-----|-----------|-------------------|--------|--------|----------|
| 1 | Catholic | NABRE | Licensed | open | `web` |
| 2 | Mainline / Orthodox | NRSV | Licensed | open | `kjv`, `web` |
| 3 | Evangelical | ESV | Licensed | open | `kjv`, `web` |
| 4 | Evangelical | NIV | Licensed | open | `kjv`, `bbe` |
| 5 | Orthodox | 3 Macc, Ps 151, 4 Macc | No free API | open | `web` (partial) |
| 6 | LDS | Book of Mormon, D&C, PoGP | No guaranteed free API | open | scriptures.nephi.org + link |
| 7 | Islam | Hadith by topic | No search API | open | Lookup by number only |
| 8 | Catholic / Orthodox | Douay-Rheims (drc) | Incomplete data at provider | open | `web` |
| 9 | Islam | Pickthall (quran-21) | Quran.com API gap | open | AlQuran.cloud `en.pickthall` |
| 10 | Islam | Hadith by sequential number | API structure mismatch | open | Three-part reference required |
| 11 | Islam | Shakir (quran-19) | Quran.com provider change | open | AlQuran.cloud `en.shakir` |

---

## How to use this register

Before making any claim -- in UI copy, in an agent response, or in code comments -- that a translation or text is available:

1. Search this register by tradition and text name.
2. If found, check the "Fallback" column and implement the documented fallback behavior exactly.
3. If the gap has a "Future path," do not implement it without a project task tracking the work.
4. If a gap is resolved (e.g., a provider fixes their data), update this register: change the gap's status note, update the summary table, and add a "Resolved:" line citing when it was fixed.

## Relationship to project tasks

The following gaps are tracked as separate fix tasks in the project:
- Gap 8 (Douay-Rheims `drc`): tracked as "Fix the Douay-Rheims Bible translation so Catholic and Orthodox passages load correctly"
- Gap 9 (Pickthall `quran-21`): tracked as "Restore the Pickthall Quran translation so users can access that classic English rendering"
- Gap 10 (Hadith by number): tracked as "Fix hadith loading so individual hadith numbers work again in the app"
- Gap 11 (Shakir `quran-19`): tracked as "Keep Shakir available in the Verse Lookup UI now that it moved to a different provider"

When those tasks are completed, update the corresponding gap entries: change `**Status:** open` to `**Status:** resolved -- <date> -- <one-line summary>`, update the summary table, and remove the entry from this list.

---

*ARE governance: AGENTS.md. Review this register before making any promise about translation or text availability in the free build.*
