---
title: Christianity -- Tradition Overview
tradition: christianity
us-share: ~63%
pew-url: https://www.pewresearch.org/religion/religious-landscape-study/
status: active-reference
---

# Christianity -- Tradition Overview

## Scope note

In scope per ARE criteria: Abrahamic lineage (YES) + 1% US population threshold (YES, ~63% Pew 2023). Largest single tradition in scope. Five denominations meet the 1% US threshold independently and are documented in separate files.

---

## Identity

Christianity centers on the life, teaching, death, and resurrection of Jesus of Nazareth, identified by believers as the Christ (Messiah). It traces its origins to 1st-century Judaism and the apostolic community formed after Jesus's death. It is the largest religion in the United States and the world.

US population: ~63% total (Pew Research Center Religious Landscape Study, 2023)

---

## Canon

All major Christian traditions share the New Testament (27 books). Old Testament scope varies by denomination.

| Layer | Protestant (66) | Catholic (73) | Orthodox (76-78) | LDS Standard Works |
|-------|----------------|---------------|------------------|--------------------|
| OT core (39 books) | YES | YES | YES | YES (KJV) |
| Deuterocanonicals (7 books) | NO | YES | YES | NO |
| Orthodox additions (3 Maccabees, Psalm 151) | NO | NO | YES | NO |
| New Testament (27 books) | YES | YES | YES | YES |
| Additional LDS scriptures | NO | NO | NO | YES (3 volumes) |

### Denomination canon files

See the individual denomination knowledge files for detailed canon and API coverage:

- `christianity-evangelical-protestant.md`
- `christianity-catholic.md`
- `christianity-mainline-protestant.md`
- `christianity-lds-restorationist.md`
- `christianity-orthodox.md`

---

## Proportional representation (ARE rule)

Christianity receives the most content entries in ARE by count because it represents ~63% of the US population. Pew share drives depth, not preference or theological ranking. Every tradition receives equal visual and structural dignity in the UI.

---

## Key shared themes

- **Jesus as Christ:** all Christian traditions affirm Jesus as the fulfillment of messianic expectation (though the meaning of this differs significantly by denomination)
- **Resurrection:** the bodily resurrection of Jesus is the doctrinal anchor of the faith across denominations
- **Scripture:** the New Testament is the primary authority for all denominations; attitude toward the Old Testament and tradition varies
- **Salvation:** justification, sanctification, and the path to God -- the central soteriological question answered differently by each tradition
- **The Lord's Prayer:** Matthew 6:9-13 / Luke 11:2-4 -- the canonical prayer shared across all denominations

---

## API provider

**bible-api.com** -- free, no authentication required
- Endpoint: `GET https://bible-api.com/{reference}?translation={id}`
- Default translation: `kjv`
- Full OpenAPI spec: `../okhp3-verse-lookup/api/openapi_bible.json`

**LDS non-Bible volumes:** scriptures.nephi.org (community API, no auth, no uptime guarantee)

---

## Cross-tradition note

For thematic parallels across Christianity, Judaism, and Islam, see the `okhp3-cross-tradition-compare` skill.

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
