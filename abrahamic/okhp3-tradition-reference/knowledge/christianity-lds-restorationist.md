---
title: Christianity -- LDS / Restorationist
tradition: christianity
denomination: lds-restorationist
us-share: ~2%
pew-url: https://www.pewresearch.org/religion/religious-landscape-study/
status: active-reference
---

# Christianity -- LDS / Restorationist

## Scope note

In scope per ARE criteria: Abrahamic lineage (YES) + 1% US threshold (YES, ~2% Pew 2023). Covers The Church of Jesus Christ of Latter-day Saints (LDS) and closely related Restorationist bodies.

---

## Identity

The LDS Restorationist movement teaches that Christ's original church fell into apostasy after the death of the apostles and was restored through the prophet Joseph Smith in 1830. The restoration brought new scripture, new prophetic leadership, and new doctrinal clarifications -- including teachings not found in the standard Protestant or Catholic creeds.

US population: ~2% (Pew Research Center Religious Landscape Study, 2023)

Key bodies: The Church of Jesus Christ of Latter-day Saints (predominant); Community of Christ (formerly RLDS); other Restorationist splinter groups

---

## Canon -- Standard Works (4 volumes)

| Volume | Description | Books / Sections | Free API |
|--------|-------------|-----------------|----------|
| Holy Bible (KJV) | Old and New Testament; LDS uses King James Version | 66 books | bible-api.com (`kjv`) |
| Book of Mormon | Narrative scripture attributed to ancient American peoples; translated by Joseph Smith | 15 books (1 Nephi -- Moroni) | scriptures.nephi.org |
| Doctrine and Covenants | Modern revelations given primarily through Joseph Smith; 138 sections + Official Declarations | 138 sections | scriptures.nephi.org |
| Pearl of Great Price | Moses, Abraham, Joseph Smith-History, Joseph Smith-Matthew, Articles of Faith | 5 texts | scriptures.nephi.org |

---

## Key distinctives

- **Continuing revelation:** the President of the Church is a living prophet; scripture is open, not closed
- **Pre-mortal existence:** all humans lived as spirit children of God before birth
- **Eternal family relationships:** families can be sealed in the temple for time and eternity
- **Degrees of glory:** three levels of post-mortal existence (Celestial, Terrestrial, Telestial) replacing a binary heaven/hell
- **No original sin doctrine:** the LDS Articles of Faith: "We believe that men will be punished for their own sins, and not for Adam's transgression" (A of F 1:2)
- **The Godhead:** Father, Son, and Holy Ghost are three separate personages (not a Trinity in the classical Nicene sense)

---

## Key passages

### Bible (KJV via bible-api.com)

| Reference | Lookup key | Significance |
|-----------|------------|--------------|
| James 1:5 | `james 1:5` | Joseph Smith's prayer prompt; wisdom sought from God |
| John 17:3 | `john 17:3` | Eternal life as knowing God and Jesus Christ |
| Matthew 3:13-17 | `matthew 3:13-17` | Baptism of Jesus -- pattern for baptism by immersion |

### Non-Bible Standard Works (scriptures.nephi.org)

| Reference | Key | Significance |
|-----------|-----|--------------|
| 2 Nephi 2:25 | `2 Ne. 2:25` | "Adam fell that men might be; and men are, that they might have joy" |
| Moses 1:39 | `Moses 1:39` | God's purpose: the immortality and eternal life of man |
| D&C 76:22 | `D&C 76:22` | Vision of the Celestial Kingdom |
| Articles of Faith 1:1-13 | `A of F 1:1` | Thirteen-article statement of LDS belief |

---

## Reference format -- Standard Works

### Book of Mormon abbreviations

| Book | Abbreviation |
|------|-------------|
| 1 Nephi | `1 Ne.` |
| 2 Nephi | `2 Ne.` |
| Jacob | `Jacob` |
| Mosiah | `Mosiah` |
| Alma | `Alma` |
| Helaman | `Hel.` |
| 3 Nephi | `3 Ne.` |
| Mormon | `Morm.` |
| Ether | `Ether` |
| Moroni | `Moro.` |

### Doctrine and Covenants

`D&C {section}:{verse}` -- e.g. `D&C 76:22`, `D&C 1:37`

### Pearl of Great Price

`{text} {chapter}:{verse}` -- texts: `Moses`, `Abraham`, `JS-H`, `JS-M`, `A of F`

---

## API provider

**Bible (KJV):** bible-api.com (`kjv` translation)
- Endpoint: `GET https://bible-api.com/{reference}?translation=kjv`

**Non-Bible Standard Works:** scriptures.nephi.org -- community-maintained, no auth, no uptime guarantee
- Base URL: `https://scriptures.nephi.org`
- Fallback message when unavailable: "The LDS Standard Works (Book of Mormon, D&C, Pearl of Great Price) are not available via a guaranteed free API. Visit https://www.churchofjesuschrist.org/study/scriptures to look up this passage."

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
