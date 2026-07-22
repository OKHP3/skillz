---
title: Islam Primer
tradition: islam
us-share: ~1%
pew-url: https://www.pewresearch.org/religion/religious-landscape-study/
status: active-reference
---

# Islam Primer

## Scope note

In scope per ARE criteria: Abrahamic lineage (YES) + 1% US population threshold (YES, ~1% Pew 2023 -- at threshold). Islam is the youngest of the three in-scope traditions and the second largest religion in the world.

---

## Identity

Islam (Arabic: submission/peace) is a monotheistic faith founded in 7th-century Arabia through the prophethood of Muhammad ibn Abdullah. Muslims believe Muhammad was the final prophet in a line beginning with Adam and including Ibrahim (Abraham), Musa (Moses), and Isa (Jesus). The Quran is understood as the direct word of God (Allah) as revealed to Muhammad through the angel Jibril (Gabriel).

US population: ~1% (Pew Research Center Religious Landscape Study, 2023 -- at the minimum threshold)

---

## Canon

### Primary scripture

| Text | Contents | Structure |
|------|----------|-----------|
| Quran | Direct word of God as revealed to the Prophet Muhammad; the authoritative and final word | 114 surahs (chapters), 6,236 ayat (verses); organized primarily by descending length, not chronology |

The Quran exists in a single authoritative text -- there are no competing canonical traditions as in Christianity. Translations are interpretations, not scripture; only the Arabic text is considered the Quran proper.

### Secondary sources

| Source | Description | Authority level |
|--------|-------------|-----------------|
| Sunnah | The practice of the Prophet Muhammad | Complementary to Quran; essential for fiqh |
| Hadith | Reported sayings and actions of the Prophet; compiled in major collections | Degree of authority varies by collection and authenticity grade |

### Major Hadith collections (Kutub al-Sittah)

| Collection | Compiler | Notes |
|------------|----------|-------|
| Sahih al-Bukhari | Muhammad al-Bukhari (d. 870 CE) | Considered most reliable; ~7,563 hadiths |
| Sahih Muslim | Muslim ibn al-Hajjaj (d. 875 CE) | Second most reliable |
| Sunan Abu Dawud | Abu Dawud (d. 889 CE) | Focus on legal hadiths |
| Jami' at-Tirmidhi | al-Tirmidhi (d. 892 CE) | Grading system included |
| Sunan an-Nasa'i | an-Nasa'i (d. 915 CE) | Most stringent criticism of isnad |
| Sunan Ibn Majah | Ibn Majah (d. 887 CE) | Supplementary collection |

---

## The Five Pillars

| Pillar | Arabic | Description |
|--------|--------|-------------|
| Declaration of faith | Shahada | "There is no god but God, and Muhammad is the Messenger of God" |
| Prayer | Salat | Five daily prayers; facing Mecca; ritual purity required |
| Almsgiving | Zakat | Annual 2.5% tithe on savings above a minimum threshold (nisab) |
| Fasting | Sawm | Fasting from dawn to sunset during Ramadan |
| Pilgrimage | Hajj | Once-in-a-lifetime journey to Mecca for those able |

---

## Key themes

- **Tawhid:** the absolute and undivided oneness of God -- the central doctrinal commitment of Islam
- **Prophethood (Nubuwwah):** a chain of prophets from Adam to Muhammad; Muhammad is the "Seal of the Prophets" (Khatam an-Nabiyyin)
- **Akhirah:** the afterlife, the Day of Judgment (Yawm al-Qiyama), paradise (Jannah), and hell (Jahannam)
- **Ummah:** the global community of Muslim believers
- **Submission and peace:** Islam derives from the same root as salam (peace) and aslama (to submit)

---

## Interpretive traditions

**Tafsir:** exegetical commentary on the Quran; major classical works include:
- Tafsir al-Tabari (al-Tabari, d. 923 CE)
- Tafsir ibn Kathir (ibn Kathir, d. 1373 CE)
- Al-Kashshaf (al-Zamakhshari, d. 1144 CE) -- rationalist approach

**Fiqh:** Islamic jurisprudence; four major Sunni legal schools:
- Hanafi (majority in South Asia, Central Asia, Turkey)
- Maliki (majority in North and West Africa)
- Shafi'i (majority in East Africa, Southeast Asia)
- Hanbali (Saudi Arabia; basis for Salafi/Wahhabi positions)

**Shia tradition:** authority of the Imams (descendants of Ali and Fatima) alongside scripture; Twelver Shia is the largest branch

**Sufi tradition:** mystical and devotional interpretation; focus on the inner dimensions of Islamic practice; major orders include Qadiriyya, Naqshbandiyya, Shadhiliyya

---

## Key passages

| Reference | Surah:Ayah | Significance |
|-----------|------------|--------------|
| Al-Fatiha 1:1-7 | `1:1` | The Opening; recited in every unit of prayer (17+ times daily) |
| Ayat al-Kursi 2:255 | `2:255` | The Throne Verse; describes God's omniscience and sovereignty |
| Al-Ikhlas 112:1-4 | `112:1` | "Say: He is God, One" -- the declaration of tawhid |
| An-Nur 24:35 | `24:35` | The Light Verse -- poetic description of divine light |
| Al-Alaq 96:1-5 | `96:1` | First revelation: "Read in the name of your Lord" |
| Al-Baqarah 2:285-286 | `2:285` | "The Messenger believes..." -- the believer's declaration |
| Az-Zumar 39:53 | `39:53` | "Do not despair of the mercy of God" -- God's forgiveness |
| Al-Maidah 5:32 | `5:32` | "Whoever saves one life has saved all of humanity" |

---

## Available translations

| ID (Quran.com) | Name | Style |
|----------------|------|-------|
| `20` | Sahih International | Modern; balanced; default for ARE |
| `21` | Pickthall | Early 20th century; archaic style |
| `22` | Yusuf Ali | Classic translation with extensive footnotes |
| `23` | Arberry | Literary; "The Koran Interpreted" |
| `24` | Shakir | More literal rendering |

---

## API provider

**Primary: Quran.com API v4** -- free, no authentication required
- Endpoint: `GET https://api.quran.com/api/v4/verses/by_key/{surah}:{ayah}?language=en&translations={id}&words=false`
- Reference format: `{surah}:{ayah}` (e.g. `2:255`)
- Full OpenAPI spec: `../okhp3-verse-lookup/api/openapi_quran.json`

**Fallback: AlQuran.cloud** -- free, no authentication required
- Endpoint: `GET https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/{edition}`
- Full OpenAPI spec: `../okhp3-verse-lookup/api/openapi_alquran.json`

**Hadith: fawazahmed0/hadith-api** -- free via jsDelivr CDN (CC BY-4.0)
- CDN: `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/`
- Full OpenAPI spec: `../okhp3-verse-lookup/api/openapi_hadith.json`

---

## Cross-tradition connections

For thematically parallel passages across Islam, Judaism, and Christianity, see the `okhp3-cross-tradition-compare` skill and the cross-tradition-compare-method.md in this directory.

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
