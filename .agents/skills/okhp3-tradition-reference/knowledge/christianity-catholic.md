---
title: Christianity -- Catholic
tradition: christianity
denomination: catholic
us-share: ~20%
pew-url: https://www.pewresearch.org/religion/religious-landscape-study/
status: active-reference
---

# Christianity -- Catholic

## Scope note

In scope per ARE criteria: Abrahamic lineage (YES) + 1% US threshold (YES, ~20% Pew 2023). Largest single denomination worldwide; second largest in the US.

---

## Identity

The Catholic Church (Roman Catholic) understands itself as the continuation of the apostolic church founded by Jesus through Peter. Authority flows through apostolic succession -- the unbroken line of bishops from the apostles to the present. The Magisterium (teaching authority of the Pope in union with the bishops) interprets Scripture and Tradition together.

US population: ~20% (Pew Research Center Religious Landscape Study, 2023)

---

## Canon (73 books)

| Layer | Books | Notes |
|-------|-------|-------|
| Old Testament (Protestant core) | 39 books | Shared with Protestant traditions |
| Deuterocanonical books | 7 books | Tobit, Judith, 1 Maccabees, 2 Maccabees, Wisdom of Solomon, Sirach (Ecclesiasticus), Baruch (with Letter of Jeremiah) |
| Greek additions | Additions to Esther (Est A-F), Daniel additions (Song of the Three Young Men, Susanna, Bel and the Dragon) | Present in LXX; not in Protestant canon |
| New Testament | 27 books | Shared with all Christian traditions |
| **Total** | **73 books** | |

---

## Key distinctives

- **Scripture + Tradition:** the Magisterium interprets Scripture in light of Sacred Tradition; neither alone is sufficient
- **Seven sacraments:** Baptism, Eucharist (Mass), Confirmation, Reconciliation (Confession), Anointing of the Sick, Marriage, Holy Orders
- **Real Presence:** the Eucharist is the body and blood of Christ (transubstantiation) -- the central sacrament
- **Mary and the saints:** veneration (not worship) as mediators of prayer; Marian dogmas (Immaculate Conception, Assumption)
- **Purgatory:** a state of purification after death for those who die in God's friendship but still imperfectly
- **Papal infallibility:** defined in 1870; applies only when the Pope speaks ex cathedra on faith and morals

---

## Key passages

| Reference | Lookup key | Significance |
|-----------|------------|--------------|
| Matthew 16:18-19 | `matthew 16:18-19` | Peter as foundation of the Church; keys of the Kingdom |
| John 6:51-58 | `john 6:51-58` | Real Presence -- "My flesh is true food" |
| Luke 1:46-55 | `luke 1:46-55` | The Magnificat -- Mary's prayer |
| Matthew 26:26-28 | `matthew 26:26-28` | Institution of the Eucharist |
| James 5:14-15 | `james 5:14-15` | Anointing of the Sick (sacrament) |
| Romans 6:3-4 | `romans 6:3-4` | Baptism as death and resurrection with Christ |
| Sirach 24:1-12 | available via `web` | Wisdom as God's dwelling -- deuterocanonical |

---

## Preferred translations

| ID | Name | Available in free build | Notes |
|----|------|------------------------|-------|
| `web` | World English Bible | YES | Includes deuterocanonicals; best free option |
| `nabre` | New American Bible Revised Edition | NO (API key required) | Official US Catholic liturgical translation |
| `douay` (drc) | Douay-Rheims | YES | Traditional; from Latin Vulgate |
| `kjv` | King James Version | YES | Does not include deuterocanonicals |

---

## API provider

**bible-api.com** -- free, no authentication required
- `web` includes deuterocanonicals; best free option for Catholic OT
- Deuterocanonical reference format: book name as in WEB (e.g. `tobit 1:1`, `sirach 24:1`)
- Full OpenAPI spec: `../okhp3-verse-lookup/api/openapi_bible.json`

**API gap:** NABRE requires an API.Bible key -- not enabled in the free build. Surface this limitation explicitly when users request the official Catholic translation.

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
