# Translation Matrix

This document maps commonly used Bible editions and Qur'an translation IDs to friendly names and notes about their provenance or denominational usage. Use this matrix to understand which version corresponds to each code when configuring user preferences or rendering citations.

## Bible translations (bible-api.com)

### Free (no API key required -- enabled in ARE free build)

| ARE ID | API param | Friendly Name | Year | License | Denominations | Notes |
|--------|-----------|---------------|------|---------|---------------|-------|
| `kjv` | `kjv` | King James Version | 1611 | Public domain | Evangelical, LDS, Mainline | Historic translation; culturally prevalent; LDS standard. |
| `web` | `web` | World English Bible | 2000 | Public domain | All | Includes deuterocanonicals; best free option for Catholic and Orthodox. |
| `asv` | `asv` | American Standard Version | 1901 | Public domain | Evangelical, Mainline | Formal equivalent; predecessor to RSV and NASB. |
| `bbe` | `bbe` | Bible in Basic English | 1965 | Public domain | All | Simplified 850-word vocabulary; useful for accessibility. |
| `darby` | `darby` | Darby Translation | 1890 | Public domain | Evangelical | Literal; 19th-century dispensationalist tradition. |
| `akjv` | `akjv` | American King James Version | 1999 | Public domain | Evangelical | Modernized KJV spelling. |
| `ylt` | `ylt` | Young's Literal Translation | 1862 | Public domain | Academic | Highly literal; preserves Hebrew/Greek tense distinctions. |
| `douay` | `dra` | Douay-Rheims 1899 American Edition | 1582/1610 | Public domain | Catholic, Orthodox | Translated from the Latin Vulgate; traditional Catholic usage. API param is `dra` -- `drc` returns HTTP 404 on bible-api.com. |

### Licensed (API key required -- NOT enabled in ARE free build)

| ARE ID | API param | Friendly Name | Year | License | Denominations | Notes |
|--------|-----------|---------------|------|---------|---------------|-------|
| `esv` | `esv` | English Standard Version | 2001 | Licensed (c) Crossway | Evangelical | Most popular modern evangelical translation. Requires ESV API key (api.esv.org). |
| `nrsv` | `nrsv` | New Revised Standard Version | 1989 | Licensed (c) NCC | Mainline, Catholic, Orthodox | Inclusive language; standard in academic and ecumenical settings. Requires API.Bible key. |
| `nabre` | `nabre` | New American Bible Revised Edition | 2011 | Licensed (c) USCCB | Catholic | Official US Catholic liturgical translation; includes Deuterocanonical books (73-book canon). Requires API.Bible key. |
| `niv` | `niv` | New International Version | 1978/2011 | Licensed (c) Biblica | Evangelical | Widely used dynamic-equivalence translation. Requires API.Bible key. |

## Qur'an translations (Quran.com API)

Note: Qur'an translation IDs correspond to the `translations` parameter on Quran.com's API. Always cite the full name and ID when displaying passages to users. In ARE, prefix with `quran-` internally (e.g. `quran-20`); strip the prefix before passing to the API.

| ARE ID | Quran.com ID | AlQuran.cloud edition | Friendly Name | Style | License | Notes |
|--------|-------------|----------------------|---------------|-------|---------|-------|
| `quran-20` | `20` | `en.sahih` | Sahih International | Modern; balanced literal/dynamic | Licensed (via API) | Default for ARE; most widely used modern English translation. |
| `quran-21` | `19` | `en.pickthall` | Pickthall | Early 20th century; archaic style | Public domain (1930) | By Marmaduke Pickthall; widely circulated. Quran.com resource ID is 19 (the API formerly listed this as 21). |
| `quran-22` | `22` | -- | Yusuf Ali | Classic; extensive footnotes | Public domain | By Abdullah Yusuf Ali; widely circulated. ID 22 confirmed active on Quran.com v4 (2026-06-26). |
| `quran-23` | `23` | `en.arberry` | Arberry | Literary | Public domain (1955) | A.J. Arberry's translation; titled *The Koran Interpreted*. Served via AlQuran.cloud (not Quran.com). |
| `quran-24` | -- | `en.shakir` | Shakir | More literal | Public domain | By M.H. Shakir. Formerly Quran.com resource ID 24 -- that ID was removed from Quran.com v4 (confirmed 2026-06-26). Now served via AlQuran.cloud edition `en.shakir`. |

## Judaism translations (Sefaria API)

| ARE ID | API param | Friendly Name | License | Notes |
|--------|-----------|---------------|---------|-------|
| `sefaria-en` | `en` | Sefaria English (composite) | CC BY-SA 2.0 | Aggregates multiple English translations; attribution varies by book. Default for ARE. |
| `sefaria-he-en` | `he-en` | Sefaria Hebrew + English | CC BY-SA 2.0 | Bilingual; returns Hebrew text alongside English translation. |

Note: Qur'an translation IDs correspond to the `translations` parameter on Quran.com's API. Always cite the full name and ID when displaying passages to users.

---

## LDS / Restorationist -- Standard Works canon scope

The LDS canon (Standard Works) is four volumes. Only the Bible (KJV) is available via bible-api.com. The three additional volumes require a separate API.

| Volume | Contents | Books / Sections | Free API |
|--------|----------|-----------------|----------|
| Holy Bible (KJV) | Old and New Testament | 66 books | bible-api.com (`kjv`) |
| Book of Mormon | Narrative scripture attributed to ancient American prophets | 15 books (1 Nephi through Moroni) | scriptures.nephi.org |
| Doctrine and Covenants | Modern revelations given primarily through Joseph Smith | 138 sections + Official Declarations | scriptures.nephi.org |
| Pearl of Great Price | Selections: Moses, Abraham, Joseph Smith -- History, Articles of Faith | 5 texts | scriptures.nephi.org |

**LDS scripture API:** `scriptures.nephi.org` -- community-maintained, no authentication required.
- Base URL: `https://scriptures.nephi.org`
- Reference format: standard book abbreviation + chapter:verse (e.g. `1 Ne. 3:7`, `D&C 76:22`)
- Note: uptime is not guaranteed for this community API. Verify availability before relying on it in production.

The Church of Jesus Christ of Latter-day Saints publishes the full Standard Works online at `https://www.churchofjesuschrist.org/study/scriptures` but does not provide a public unauthenticated REST API for programmatic verse retrieval.

---

## Orthodox Christian -- canon scope

Orthodox Christians use the Septuagint (LXX) as the authoritative Old Testament text, resulting in a broader OT canon than the Protestant 66-book Bible.

| Canon layer | Contents | Books |
|-------------|----------|-------|
| Protestant OT core | Shared with Catholic and Protestant | 39 books |
| Catholic deuterocanonicals | Tobit, Judith, 1-2 Maccabees, Wisdom, Sirach, Baruch + Greek additions to Esther/Daniel | 7 books + additions |
| Orthodox additions | 3 Maccabees, Psalm 151 | 2 texts (present in Greek and most Eastern Orthodox canons) |
| Extended (some jurisdictions) | 4 Maccabees (appendix in Georgian and Slavonic traditions), 1 Esdras, Prayer of Manasseh | Varies |
| New Testament | Shared with all Christian traditions | 27 books |

**Typical Orthodox canon total:** 76-78 books, depending on jurisdiction.

**API coverage:** bible-api.com `web` (World English Bible) includes the seven Catholic deuterocanonicals but does not include 3 Maccabees, Psalm 151, or 4 Maccabees. No free public unauthenticated API covers the full Orthodox OT canon.
