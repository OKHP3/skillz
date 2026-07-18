---
title: Christianity -- Orthodox Christian
tradition: christianity
denomination: orthodox
us-share: ~1%
pew-url: https://www.pewresearch.org/religion/religious-landscape-study/
status: active-reference
---

# Christianity -- Orthodox Christian

## Scope note

In scope per ARE criteria: Abrahamic lineage (YES) + 1% US threshold (YES, ~1% Pew 2023 -- at threshold). Encompasses Eastern Orthodox, Oriental Orthodox, and other traditions in apostolic succession outside Rome.

---

## Identity

Eastern Orthodoxy traces unbroken apostolic succession from the original apostles through the seven Ecumenical Councils (325-787 CE). It understands itself as the continuation of the undivided church before the Great Schism of 1054, when the Western (Roman Catholic) and Eastern (Orthodox) churches separated.

US population: ~1% (Pew Research Center Religious Landscape Study, 2023 -- at the minimum threshold)

Key US bodies: Greek Orthodox Archdiocese of America, Orthodox Church in America (OCA), Antiochian Orthodox Christian Archdiocese, Russian Orthodox Church Outside Russia (ROCOR)

---

## Canon -- Septuagint-based (LXX)

The Orthodox OT follows the Septuagint (Greek translation), which includes texts absent from the Protestant and Catholic canons.

| Canon layer | Contents | Books |
|-------------|----------|-------|
| Protestant OT core | Shared with all traditions | 39 books |
| Catholic deuterocanonicals | Tobit, Judith, 1-2 Maccabees, Wisdom, Sirach, Baruch + Greek additions | 7 books + additions |
| Orthodox additions | 3 Maccabees, Psalm 151 | Present in most Eastern Orthodox canons |
| Extended (some jurisdictions) | 4 Maccabees (Georgian/Slavonic), 1 Esdras, Prayer of Manasseh | Varies by jurisdiction |
| New Testament | Shared with all Christian traditions | 27 books |
| **Typical total** | | **76-78 books** (varies by jurisdiction) |

---

## Key distinctives

- **Theosis:** the goal of Christian life is participation in the divine nature (2 Peter 1:4) -- union with God, not merely forgiveness
- **Divine Liturgy:** the primary form of worship; the Liturgy of St. John Chrysostom is the most common; the Liturgy of St. Basil is used on certain feast days
- **Seven Ecumenical Councils:** doctrinal authority alongside Scripture and Holy Tradition; councils binding on all Orthodox
- **Filioque controversy:** Orthodox reject the Western addition of "and the Son" (filioque) to the Nicene Creed regarding the procession of the Holy Spirit -- a root cause of the Great Schism
- **Icons:** veneration (not worship) of holy images as windows into the divine; iconoclasm was condemned at the Seventh Ecumenical Council (787 CE)
- **Holy Tradition:** Scripture and Holy Tradition are co-equal sources; neither alone suffices
- **Theotokos:** Mary is the "God-bearer" -- not merely mother of Jesus the human but of Christ the divine person

---

## Key passages

| Reference | Lookup key | Significance |
|-----------|------------|--------------|
| John 1:1-14 | `john 1:1-14` | Logos Christology -- the Word made flesh |
| 2 Peter 1:4 | `2 peter 1:4` | Theosis -- "partakers of the divine nature" |
| Matthew 3:13-17 | `matthew 3:13-17` | Baptism of Jesus -- Trinitarian theophany |
| John 17:21-23 | `john 17:21-23` | Unity of believers in the Trinity |
| Romans 8:1-11 | `romans 8:1-11` | Life in the Spirit |
| Psalm 103:1-4 | `Psalms 103:1` | Bless the Lord, O my soul -- liturgical psalm |

---

## Preferred translations

| ID | Name | Available in free build | Notes |
|----|------|------------------------|-------|
| `web` | World English Bible | YES | Includes deuterocanonicals; closest to Orthodox OT scope in free APIs |
| `kjv` | King James Version | YES | Does not include deuterocanonicals or Orthodox-only texts |
| `nrsv` | New Revised Standard Version | NO (API key required) | Academic standard; includes most deuterocanonicals |

**API gap:** No free public unauthenticated API covers the full Orthodox OT. The `web` translation on bible-api.com covers the seven Catholic deuterocanonicals but does not include 3 Maccabees, Psalm 151, or 4 Maccabees. Surface this limitation explicitly when users request those texts.

---

## API provider

**bible-api.com** -- free, no authentication required
- Free translations for Orthodox use: `web`, `kjv`
- Full OpenAPI spec: `../okhp3-verse-lookup/api/openapi_bible.json`

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
