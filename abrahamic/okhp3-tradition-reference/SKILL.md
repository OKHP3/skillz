---
name: okhp3-tradition-reference
description: >
  Reference ARE scope, canon, denominations, translations, Pew US shares, and
  free API providers for Judaism, Christianity, and Islam. Use before answering
  canon or denomination questions, choosing a translation, writing scripture
  fetch code, checking whether a tradition is in scope, or explaining LDS,
  Catholic, Orthodox, Jewish, or Islamic reference coverage. Preserve
  denominational variation, source dates, licensing, and known API gaps.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.2.0"
  category: interfaith-reference
  origin: okhp3/abrahamic-reference-engine
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  spec-version: "agentskills-1.0"
  reviewed: "2026-07-21"
compatibility: Markdown reference material. Network access is optional and only needed to verify provider availability or current demographic sources.
---

# OKHP3 -- Tradition Reference Skill

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3) · [OKHP3/skillz](https://github.com/OKHP3/skillz)

## Execution contract

- Apply the scope test before adding a tradition, denomination, translation, or
  API: Abrahamic lineage and the 1% US threshold are both required by ARE.
- Use the focused `knowledge/` file for the question at hand. Do not load every
  primer when one denomination or one API gap is sufficient.
- Separate canonical or historical description from ARE implementation policy,
  provider availability, and user-facing UI guidance.
- Preserve variation within a tradition. Do not turn one denomination's canon,
  practice, or interpretation into a universal claim.
- Treat Pew shares and provider coverage as time-sensitive. Cite the source and
  date, record known gaps in `reserve-02-api-gap-register.md`, and verify live
  availability before promising that an endpoint currently works.
- This is a neutral reference layer, not spiritual or doctrinal authority. Do
  not rank traditions or recommend a translation without stating its license
  and coverage limits.

## Scope criteria

Two criteria must BOTH be met for a tradition to be in scope:
1. **Abrahamic lineage** -- traceable descent from the Abrahamic scriptural family (Judaism, Christianity, or Islam, and their direct derivatives)
2. **1% or greater US population** -- per Pew Research Center Religious Landscape Study

Failing either criterion excludes the tradition regardless of global significance, historical importance, or US cultural presence.

**Pew Research Center citation:** https://www.pewresearch.org/religion/religious-landscape-study/ (2023)

---

## In-scope traditions (3 total)

| Tradition | US Share (Pew 2023) | In scope | Abrahamic | Meets 1% |
|-----------|---------------------|----------|-----------|----------|
| Christianity | ~63% | YES | YES | YES |
| Judaism | ~2% | YES | YES | YES |
| Islam | ~1% | YES | YES | YES |

---

## Explicitly out of scope

| Tradition | US Share | Abrahamic | Meets 1% | Reason excluded |
|-----------|----------|-----------|----------|-----------------|
| Hinduism | ~1% | NO | YES | Not Abrahamic |
| Buddhism | ~1% | NO | YES | Not Abrahamic |
| Sikhism | <0.5% | NO | NO | Not Abrahamic; below 1% |
| Baha'i | ~0.1% | YES | NO | Abrahamic but below 1% threshold |
| Druze | <0.1% | YES | NO | Abrahamic but below 1% threshold |
| Wicca / Paganism | <0.5% | NO | NO | Not Abrahamic; below 1% |
| Unaffiliated / Secular | ~26% | N/A | N/A | Not a scriptural tradition |

Exclusion is a methodological boundary, not a judgment of worth or spiritual validity.

---

## Judaism

**US population share:** ~2% (Pew Research Center, 2023)
**Pew URL:** https://www.pewresearch.org/religion/religious-landscape-study/

### Canon

| Division | Contents | Books |
|---------|----------|-------|
| Torah | The Five Books of Moses (Pentateuch) | Genesis, Exodus, Leviticus, Numbers, Deuteronomy |
| Nevi'im | The Prophets | 8 books (Joshua through Malachi) |
| Ketuvim | The Writings | 11 books (Psalms, Proverbs, Job, etc.) |
| **Tanakh total** | | **24 books** |

Secondary authoritative texts: Talmud Bavli, Talmud Yerushalmi, Midrash Rabbah, Mishneh Torah (Maimonides), Zohar, Shulchan Arukh

### Key themes

- Covenant (brit) between God and Israel
- Tikkun olam -- repair of the world
- Shabbat and sacred time
- Torah study as lifelong obligation
- Justice (tzedakah) and ethical monotheism

### Interpretive traditions

- PaRDeS: Peshat (plain), Remez (allegorical), Derash (homiletic), Sod (mystical)
- Talmudic dialectic: argument and counter-argument preserved, not resolved
- Maimonidean rationalism vs. Kabbalistic mysticism
- Modern movements: Orthodox, Conservative, Reform, Reconstructionist

### Key passages

| Reference | Lookup key | Note |
|-----------|------------|------|
| Genesis 1:1 | `Genesis 1:1` | Opening of the Torah |
| Deuteronomy 6:4-5 | `Deuteronomy 6:4-5` | The Shema -- central prayer |
| Exodus 20:1-17 | `Exodus 20:1-17` | The Ten Commandments |
| Psalms 23 | `Psalms 23` | The Lord is my Shepherd |
| Isaiah 6:1-8 | `Isaiah 6:1-8` | Isaiah's call |
| Micah 6:8 | `Micah 6:8` | Do justice, love mercy, walk humbly |

### Available translations

| ID | Name | License | Notes |
|----|------|---------|-------|
| `sefaria-en` | Sefaria English | CC BY-SA 2.0 | Default; mixed from public domain sources |
| `sefaria-he-en` | Sefaria Hebrew + English | CC BY-SA 2.0 | Bilingual display |

### API provider

**Sefaria.org** -- free, no authentication required
- Endpoint: `GET https://www.sefaria.org/api/texts/{ref}?lang=en`
- Reference format: `{Book} {Chapter}:{Verse}` (e.g. `Genesis 1:1`)
- Documentation: https://developers.sefaria.org/

---

## Christianity

**US population share:** ~63% total (Pew Research Center, 2023)
**Pew URL:** https://www.pewresearch.org/religion/religious-landscape-study/

Christianity is subdivided by denomination. Five denominations meet the 1%+ US threshold.

### Canon overview by denomination

| Denomination | US Share | Canon | Books | Deuterocanonicals |
|-------------|----------|-------|-------|-------------------|
| Evangelical Protestant | ~25% | Protestant | 66 (39 OT + 27 NT) | Excluded |
| Catholic | ~20% | Catholic | 73 (46 OT + 27 NT) | Included (7 books) |
| Mainline Protestant | ~16% | Protestant | 66 (39 OT + 27 NT) | Excluded |
| LDS / Restorationist | ~2% | Standard Works | 66 (KJV) + 3 additional | Excluded from Bible; additional LDS scriptures |
| Orthodox Christian | ~1% | Orthodox | Varies by jurisdiction (typically 76-78) | Included (broader set) |

### Denomination reference

#### Evangelical Protestant (~25% US)

- **Description:** Personal conversion, biblical inerrancy/infallibility, centrality of Christ's atonement, evangelism imperative. Includes Baptist, Pentecostal, non-denominational.
- **Distinctives:** Born-again experience, sola scriptura, believer's baptism (typically by immersion).
- **Key texts:** Holy Bible (66 books)
- **Representative passages:** John 3:16 (`john 3:16`), Romans 10:9-10 (`romans 10:9-10`), 2 Timothy 3:16-17 (`2 timothy 3:16-17`)
- **Preferred translations:** KJV, ESV (key req.), NIV (key req.), WEB
- **API translations (free):** `kjv`, `web`, `asv`, `bbe`, `darby`

#### Catholic (~20% US)

- **Description:** Apostolic succession, Eucharist as central sacrament, Magisterium as teaching authority. Seven sacraments. Largest single denomination worldwide.
- **Distinctives:** Scripture + Tradition + Magisterium; 73-book canon; veneration of Mary and saints.
- **Key texts:** Holy Bible (73 books), Catechism of the Catholic Church
- **Representative passages:** Matthew 16:18-19 (`matthew 16:18-19`), John 6:51-58 (`john 6:51-58`), Luke 1:46-55 (`luke 1:46-55`)
- **Preferred translations:** NABRE (key req.), Douay-Rheims, WEB (has deuterocanonicals)
- **API translations (free):** `web` (includes deuterocanonicals), `kjv` (excludes deuterocanonicals)

#### Mainline Protestant (~16% US)

- **Description:** Historic denominations (Methodist, Presbyterian, Lutheran, Episcopal/Anglican, United Church of Christ). Ecumenical, critical-scholarly, social justice oriented.
- **Distinctives:** Theological diversity; many ordain women and LGBTQ+ clergy; Wesleyan Quadrilateral (Scripture, Tradition, Reason, Experience).
- **Key texts:** Holy Bible (66 books), Westminster Confession, Book of Common Prayer
- **Representative passages:** Micah 6:8 (`micah 6:8`), Matthew 25:31-46 (`matthew 25:31-46`), Romans 12:1-2 (`romans 12:1-2`)
- **Preferred translations:** NRSV (key req.), WEB, KJV
- **API translations (free):** `kjv`, `web`, `asv`, `bbe`

#### LDS / Restorationist (~2% US)

- **Description:** Restoration movement founded by Joseph Smith. Modern prophetic revelation, pre-mortal existence, eternal family relationships sealed in temples.
- **Distinctives:** Standard Works (four-volume canon); continuing prophetic succession; temple ordinances.
- **Key texts:** Holy Bible (KJV), Book of Mormon, Doctrine and Covenants, Pearl of Great Price
- **Representative passages:** James 1:5 (`james 1:5`), John 17:3 (`john 17:3`), 2 Ne. 2:25 (Book of Mormon), Moses 1:39 (Pearl of Great Price), D&C 76:22 (Doctrine and Covenants)
- **API translations (free):** `kjv` (Bible only via bible-api.com)

**Canon scope -- Standard Works (4 volumes):**

| Volume | Contents | Books / Sections |
|--------|----------|-----------------|
| Holy Bible (KJV) | Old and New Testament | 66 books |
| Book of Mormon | Narrative scripture from ancient American prophets | 15 books (1 Nephi -- Moroni) |
| Doctrine and Covenants | Modern revelations, primarily through Joseph Smith | 138 sections + Official Declarations |
| Pearl of Great Price | Moses, Abraham, Joseph Smith -- History, Articles of Faith | 5 texts |

**LDS scripture API for non-Bible volumes:** `scriptures.nephi.org` -- community-maintained, no authentication required.
- Base URL: `https://scriptures.nephi.org`
- Covers all four Standard Works
- Reference examples: `1 Ne. 3:7` (Book of Mormon), `D&C 76:22` (D&C), `Moses 1:39` (Pearl of Great Price)
- No uptime guarantee -- implement graceful fallback when unavailable
- Official text (no API): `https://www.churchofjesuschrist.org/study/scriptures`

#### Orthodox Christian (~1% US)

- **Description:** Eastern Orthodox traces apostolic continuity through seven Ecumenical Councils. Theosis (participation in divine nature) as the goal of Christian life. Highly liturgical.
- **Distinctives:** Divine Liturgy (John Chrysostom / Basil); icon veneration; Septuagint (LXX) as authoritative OT; broader canon than Protestant.
- **Key texts:** Holy Bible (Orthodox canon), Church Fathers, Philokalia
- **Representative passages:** John 1:1-14 (`john 1:1-14`), 2 Peter 1:4 (`2 peter 1:4`), Matthew 3:13-17 (`matthew 3:13-17`)
- **API translations (free):** `web` (closest to Orthodox usage -- includes deuterocanonicals but not full Orthodox OT), `kjv`

**Canon scope -- Septuagint-based (LXX):**

| Canon layer | Contents | Books |
|-------------|----------|-------|
| Protestant OT core | Shared with all Christian traditions | 39 books |
| Catholic deuterocanonicals | Tobit, Judith, 1-2 Maccabees, Wisdom, Sirach, Baruch + Greek additions to Esther/Daniel | 7 books + additions |
| Orthodox additions | 3 Maccabees, Psalm 151 | Present in Greek Orthodox and most Eastern Orthodox canons |
| Extended (some jurisdictions) | 4 Maccabees (appendix in Georgian/Slavonic traditions), 1 Esdras, Prayer of Manasseh | Varies by jurisdiction |
| New Testament | Shared with all Christian traditions | 27 books |

**Typical total:** 76-78 books (varies by jurisdiction -- Greek Orthodox, Russian Orthodox, Serbian Orthodox, etc. differ slightly).

**API gap:** No free public unauthenticated API covers the full Orthodox OT. bible-api.com `web` covers the seven Catholic deuterocanonicals but omits 3 Maccabees, Psalm 151, and 4 Maccabees. Surface this limitation explicitly when a user requests those texts.

### Available translations (Christianity -- all denominations)

| ID | Name | License | Denominations | Notes |
|----|------|---------|---------------|-------|
| `kjv` | King James Version (1611) | Public domain | Evangelical, LDS, mainline, Catholic | Standard for Evangelical and LDS use |
| `web` | World English Bible | Public domain | All | Includes deuterocanonicals; best for Catholic/Orthodox |
| `asv` | American Standard Version (1901) | Public domain | Evangelical, mainline | Formal equivalent |
| `bbe` | Bible in Basic English | Public domain | All | Simplified vocabulary |
| `darby` | Darby Translation | Public domain | Evangelical | Literal; 19th century |
| `akjv` | American King James Version | Public domain | Evangelical | Modernized KJV spelling |
| `ylt` | Young's Literal Translation | Public domain | Academic | Highly literal; 1862 |
| `dra` | Douay-Rheims 1899 American Edition | Public domain | Catholic, Orthodox | Traditional Catholic translation from Latin Vulgate; use `dra` -- `drc` returns HTTP 404 |
| `esv` | English Standard Version | **Licensed** | Evangelical | Requires API key; NOT in free build |
| `nrsv` | New Revised Standard Version | **Licensed** | Mainline, academic | Requires API key; NOT in free build |
| `nabre` | New American Bible Revised Edition | **Licensed** | Catholic | US liturgical standard; requires API key |

### API provider (Christianity)

**bible-api.com** -- free, no authentication required
- Endpoint: `GET https://bible-api.com/{reference}?translation={id}`
- Reference format: `{book} {chapter}:{verse}` (lowercase; e.g. `john 3:16`)
- Documentation: https://bible-api.com/

---

## Islam

**US population share:** ~1% (Pew Research Center, 2023)
**Pew URL:** https://www.pewresearch.org/religion/religious-landscape-study/

### Canon

| Text | Contents | Structure |
|------|----------|-----------|
| Quran | Direct word of God as revealed to Prophet Muhammad | 114 surahs (chapters), 6,236 ayat (verses); organized by descending length, not chronology |
| Hadith | Sayings and actions of the Prophet (secondary source) | Six major collections (Kutub al-Sittah); Sahih al-Bukhari and Sahih Muslim are most authoritative |

Major Hadith collections: Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah

### Key themes

- Tawhid: the absolute oneness of God
- Prophethood (Nubuwwah): Adam to Muhammad as final messenger
- The Five Pillars: Shahada, Salat, Zakat, Sawm, Hajj
- Akhirah: the afterlife and Day of Judgment
- Submission (Islam) and peace (Salam) as core meanings

### Interpretive traditions

- Tafsir: exegetical commentary on the Quran
- Fiqh: Islamic jurisprudence derived from Quran and Hadith
- Four major Sunni law schools: Hanafi, Maliki, Shafi'i, Hanbali
- Shia tradition: authority of the Imams alongside scripture
- Sufi tradition: mystical and devotional interpretation

### Key passages

| Reference | Surah:Ayah key | Note |
|-----------|----------------|------|
| Al-Fatiha 1:1-7 | `1:1` | The Opening; recited in every prayer |
| Ayat al-Kursi 2:255 | `2:255` | The Throne Verse |
| Al-Ikhlas 112:1-4 | `112:1` | The Sincerity; on the oneness of God |
| An-Nur 24:35 | `24:35` | The Light Verse |
| Al-Baqarah 2:285-286 | `2:285` | The Messenger believes |
| Al-Alaq 96:1-5 | `96:1` | First revelation: "Read" |

### Available translations

| ID (Quran.com) | Name | Style |
|----------------|------|-------|
| `20` | Sahih International | Modern; balanced; default |
| `21` | Pickthall | Early 20th c.; archaic style -- WARNING: currently returns no translations array from Quran.com v4; use AlQuran.cloud fallback edition `en.pickthall` instead |
| `22` | Yusuf Ali | With explanatory notes |
| `23` | Arberry | Literary; "The Koran Interpreted" |
| `24` | Shakir | More literal |

Use `translationId` values as the integer in the Quran.com `translations` query parameter. In this codebase, prefix with `quran-` (e.g. `quran-20`) and strip the prefix before passing to the API.

### API provider (Islam)

**Primary: Quran.com API v4** -- free, no authentication required
- Endpoint: `GET https://api.quran.com/api/v4/verses/by_key/{surah}:{ayah}?language=en&translations={id}&words=false`
- Reference format: `{surah}:{ayah}` (e.g. `2:255`)
- Documentation: https://api-docs.quran.com/

**Fallback: AlQuran.cloud**
- Endpoint: `GET https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/{edition}`
- Editions: `en.asad`, `en.arberry`, `en.sahih`, `en.pickthall`

**Hadith: fawazahmed0/hadith-api** -- free via jsDelivr CDN (CC BY-4.0)
- CDN: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/`
- **Working endpoint (collection-level):** `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-{collection}.min.json` -- fetch the full collection JSON and extract the hadith by `hadithnumber` from the in-memory result
- **Broken endpoint (per-hadith):** `/{number}.json` URL pattern -- returns HTTP 404 as of 2026-06-25; do not use
- Collections: `bukhari`, `muslim`, `abudawud`, `tirmidhi`, `nasai`, `ibnmajah`
- No authentication required

---

## Quick lookup table

| Tradition | US% | API | Base URL | Ref format | Default translation |
|-----------|-----|-----|----------|-----------|---------------------|
| Judaism | 2% | Sefaria | `sefaria.org/api/texts` | `Genesis 1:1` | Sefaria English |
| Christianity | 63% | bible-api.com | `bible-api.com` | `john 3:16` | KJV |
| Islam | 1% | Quran.com v4 | `api.quran.com/api/v4` | `2:255` | Sahih International (ID 20) |

---

## Knowledge scaffold file inventory

All files live under `knowledge/` in this skill directory. Load only the file(s) relevant to the current task -- do not load the full set upfront. The SKILL.md above is sufficient for most queries; reach for these files when you need deep-dive tradition or denomination detail.

| File | Description |
|------|-------------|
| `judaism-primer.md` | Tradition overview: canon, themes, interpretive schools, key passages |
| `islam-primer.md` | Tradition overview: Quran and Hadith structure, Five Pillars, tafsir traditions |
| `christianity-overview.md` | Christianity as a whole: US share, denominational breakdown, canon summary |
| `christianity-catholic.md` | Catholic denomination: Magisterium, 73-book canon, sacraments, translation notes |
| `christianity-evangelical-protestant.md` | Evangelical Protestant: sola scriptura, inerrancy, born-again distinctives |
| `christianity-mainline-protestant.md` | Mainline Protestant: Wesleyan Quadrilateral, ecumenism, social-justice orientation |
| `christianity-lds-restorationist.md` | LDS / Restorationist: Standard Works four-volume canon, prophetic succession, temple ordinances |
| `christianity-orthodox.md` | Orthodox Christian: theosis, Divine Liturgy, Septuagint canon, API gap notes |
| `cross-tradition-compare-method.md` | Methodology for neutral cross-tradition comparison: proportional representation, bridging note style |
| `neutral-glossary.md` | Shared Abrahamic vocabulary with tradition-neutral definitions |
| `translation-metadata.md` | Translation ID map, license status, and API availability for all three traditions |
| `reserve-01-scope-expansion-notes.md` | Phase 2 notes: traditions considered for future scope expansion beyond Abrahamic lineage |
| `reserve-02-api-gap-register.md` | API gap register: translations and texts with no free anonymous API coverage |
| `reserve-03-ui-copy.md` | UI copy reference: labels, explainer text, and tone guidelines for the ARE interface |
| `reserve-04-denominational-distinctives-extended.md` | Extended denominational distinctives beyond what fits in the main SKILL.md |

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
