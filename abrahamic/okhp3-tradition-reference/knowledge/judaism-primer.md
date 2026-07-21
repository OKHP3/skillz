---
title: Judaism Primer
tradition: judaism
us-share: ~2%
pew-url: https://www.pewresearch.org/religion/religious-landscape-study/
status: active-reference
---

# Judaism Primer

## Scope note

In scope per ARE criteria: Abrahamic lineage (YES) + 1% US population threshold (YES, ~2% Pew 2023).

---

## Identity

Judaism is the oldest of the three in-scope Abrahamic traditions, tracing continuous religious and cultural identity from the covenant at Sinai through the present day. It encompasses a people, a law, a literature, and a living practice -- not reducible to any single one of these alone.

US population: ~2% (Pew Research Center Religious Landscape Study, 2023)

---

## Canon

The Hebrew Bible, known in Jewish tradition as the **Tanakh**, is the primary scripture. It is organized into three divisions:

| Division | Hebrew name | Contents | Books |
|----------|-------------|----------|-------|
| Torah | "Teaching" | Five Books of Moses (Pentateuch) | Genesis, Exodus, Leviticus, Numbers, Deuteronomy |
| Nevi'im | "Prophets" | Former Prophets + Latter Prophets | Joshua, Judges, Samuel (1-2), Kings (1-2), Isaiah, Jeremiah, Ezekiel, The Twelve |
| Ketuvim | "Writings" | Psalms, Proverbs, Job, and more | 11 books including Psalms, Proverbs, Job, Ruth, Song of Songs, Ecclesiastes, Lamentations, Esther, Daniel, Ezra-Nehemiah, Chronicles |
| **Tanakh total** | | | **24 books** |

Note: the Christian "Old Testament" covers the same texts but with a different book-count convention (39 books by Protestant count). Judaism counts Samuel as one book, Kings as one book, etc.

### Secondary authoritative literature

These texts are not scripture in the same sense as Tanakh but carry enormous interpretive weight:

| Text | Period | Description |
|------|--------|-------------|
| Mishnah | ~200 CE | Oral law codified; 6 orders, 63 tractates |
| Talmud Bavli (Babylonian) | ~500 CE | Mishnah + Gemara (rabbinic discussion); primary legal reference |
| Talmud Yerushalmi (Jerusalem) | ~400 CE | Earlier Talmud; less studied in most traditions |
| Midrash Rabbah | 400-900 CE | Homiletic and narrative commentary on Torah and 5 scrolls |
| Mishneh Torah | Maimonides, 1180 CE | Systematic legal code; rationalist tradition |
| Zohar | Attributed to Shimon bar Yochai; compiled ~1280 CE | Primary kabbalistic text |
| Shulchan Arukh | Joseph Karo, 1565 CE | Standard code of Jewish law; still authoritative in Orthodox communities |

---

## Key themes

- **Covenant (brit):** God's binding agreement with the Jewish people, initiated with Abraham, formalized at Sinai
- **Torah study:** lifelong religious obligation; "turn it and turn it again, for everything is in it" (Avot 5:22)
- **Tikkun olam:** repair of the world; ethical and social responsibility as religious act
- **Shabbat:** the seventh-day rest as cornerstone of sacred time
- **Justice and mercy (tzedakah, chesed):** ethical monotheism expressed in care for the stranger, widow, and orphan
- **Memory and covenant transmission:** "In every generation, one is obligated to regard oneself as if one had personally left Egypt" (Passover Haggadah)

---

## Interpretive traditions

**PaRDeS** -- four levels of Torah interpretation:
- Peshat: plain, contextual meaning
- Remez: allegorical meaning
- Derash: homiletic, moral application
- Sod: mystical/hidden meaning (Kabbalah)

**Talmudic dialectic:** argument and counter-argument are preserved, not resolved -- "these and these are the words of the living God" (Eruvin 13b). Disagreement itself is a sacred form.

**Modern movements (US-relevant):**

| Movement | Approach |
|----------|----------|
| Orthodox | Halakha as binding law; Talmudic authority intact |
| Conservative | Halakha as binding but historically evolving |
| Reform | Halakha as informing but not binding; individual autonomy |
| Reconstructionist | Judaism as evolving civilization; democratic communal process |
| Renewal | Mystical and contemplative revival within liberal Judaism |

---

## Key passages

| Reference | Lookup key | Significance |
|-----------|------------|--------------|
| Genesis 1:1 | `Genesis 1:1` | Opening of Torah; creation narrative |
| Deuteronomy 6:4-9 | `Deuteronomy 6:4` | The Shema -- central daily prayer |
| Exodus 20:1-17 | `Exodus 20:1` | The Ten Commandments |
| Leviticus 19:18 | `Leviticus 19:18` | "Love your neighbor as yourself" |
| Micah 6:8 | `Micah 6:8` | "Do justice, love mercy, walk humbly" |
| Psalms 23 | `Psalms 23:1` | The Lord is my Shepherd |
| Isaiah 53:1-12 | `Isaiah 53:1` | Suffering servant passage |
| Amos 5:24 | `Amos 5:24` | "Let justice roll like a river" |

---

## API provider

**Sefaria.org** -- free, no authentication required
- Endpoint: `GET https://www.sefaria.org/api/texts/{ref}?lang=en`
- Reference format: `{Book} {Chapter}:{Verse}` (e.g. `Genesis 1:1`)
- License: CC BY-SA 2.0
- Full OpenAPI spec: `../okhp3-verse-lookup/api/openapi_sefaria.json`

---

## Cross-tradition connections

For thematically parallel passages across Judaism, Christianity, and Islam, see the `okhp3-cross-tradition-compare` skill and the cross-tradition-compare-method.md in this directory.

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
