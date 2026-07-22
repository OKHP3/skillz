---
name: okhp3-cross-tradition-compare
description: >
  Compare shared themes across Judaism, Christianity, and Islam using 20 seeded
  passage sets, neutral bridging notes, and the ARE proportional-representation
  rule. Use for side-by-side scripture comparisons, interfaith education,
  neutral common-ground explanations, comparison UI work, or requests about
  what these traditions share. Do not use it to rank traditions, prove
  theological priority, or invent a parallel where none is established.
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
compatibility: Static Markdown and TypeScript data. No network access is required for seeded comparisons.
---

# OKHP3 -- Cross-Tradition Compare Skill

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3) · [OKHP3/skillz](https://github.com/OKHP3/skillz)

## Quick start -- no API required

The 20 pre-seeded themes are embedded in this skill with static passage text. Use them immediately:

1. Pick a theme ID from the index at the bottom of this file (e.g. `forgiveness`)
2. Read the theme's three tradition objects from `compareThemes.ts` in the host project
3. Render each tradition's `staticText` and `translationName` in a three-panel layout; add provider attribution from the host data
4. Display `bridgingNote` below the panels under "What Connects These?"

No network call is required. The data is ready. For live verse fetching on top of static text, use `okhp3-verse-lookup` with the `liveRef` field.

---

## Mission

Identify shared themes and structurally parallel passages across Judaism, Christianity, and Islam -- presented without declaring any tradition superior, more complete, or more historically prior. The goal is discovery and translation between faiths, not synthesis, merger, or competitive ranking.

## Execution contract

- Start from a seeded theme ID when one fits. Preserve its references, lookup
  keys, translation names, and provider mapping exactly unless the host data is
  intentionally being revised.
- Treat `staticText` as display seed text, not proof that a live provider is
  available. If exact wording, scope, or coverage is uncertain, use
  `okhp3-verse-lookup` or label the passage as unavailable instead of inventing
  a quotation.
- Present one structurally equal panel per tradition. Proportionality affects
  the number of examples, never the dignity, visual weight, or authority of a
  panel.
- Describe observed parallels and real differences separately. Do not infer
  borrowing, fulfillment, correction, priority, or superiority from a thematic
  resemblance.
- Preserve translation and source attribution in the host UI. A bridging note
  is interpretation of the comparison structure, not a doctrinal conclusion.

## Scope

Three traditions only. Both criteria must be met for inclusion: (1) Abrahamic lineage, (2) 1% or greater US population per Pew Research Center.
- Judaism (~2% US), Christianity (~63% US), Islam (~1% US)
- Pew citation: https://www.pewresearch.org/religion/religious-landscape-study/

---

## Proportional representation rule

When generating NEW theme entries or expanding the seeded set, the number of examples per tradition should reflect US population share:
- Christianity gets the most examples (5 denominations, ~63% of US)
- Judaism and Islam get equal representation to each other (~2% and ~1%)
- Every tradition gets at least one entry in every comparison -- no tradition is optional

This rule does NOT apply to aesthetic weighting within a comparison. Each panel receives identical visual and structural dignity regardless of population share.

---

## Neutral bridging note style guide

A bridging note explains WHAT connects the passages -- not which is original, more complete, or superior.

**Do:**
- Describe the shared structural move: "All three traditions place X at the heart of Y."
- Note linguistic/conceptual parallels without implying derivation: "The Hebrew shalom, Greek eirene, and Arabic salam share both a root and a meaning."
- Acknowledge real differences neutrally: "The vessel changes; the structure does not."
- Focus on what can be observed, not what is claimed theologically.

**Do not:**
- Assert one tradition fulfills, corrects, or completes another.
- Use words like "original," "earlier," "more complete," "authentic," "fulfilled," or "superseded."
- Present a Christian passage as the culmination of a Jewish one, or an Islamic passage as correcting either.
- Rank the passages by age, depth, or spiritual authority.

**Tone:** Academic-neutral, warm, curious. Imagine a knowledgeable interfaith librarian who deeply respects all three traditions.

---

## Pre-seeded themes (20 total)

Each entry: `id`, `title`, `description`, `bridgingNote`, and three passages with `displayRef`, `lookup`, `staticText`, `translationName`, `apiProvider`.

---

### 1. The Golden Rule (`the-golden-rule`)

**Description:** Reciprocal ethical treatment as a foundation of moral life across all three traditions.

**Bridging note:** All three traditions place a version of this principle at the heart of their ethics. Whether framed as obligation (Leviticus), summary of the Law (Matthew), or hadith of the Prophet, the structure is the same: what you desire for yourself, extend to others.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Leviticus 19:18 | `Leviticus 19:18` | "You shall not take vengeance or bear a grudge against members of your people. Love your neighbor as yourself: I am the LORD." | Sefaria English |
| Christianity | Matthew 7:12 | `matthew 7:12` | "Therefore all things whatsoever ye would that men should do to you, do ye even so to them: for this is the law and the prophets." | KJV |
| Islam | An-Nisa 4:36 | `4:36` | "Worship Allah and associate nothing with Him, and to parents do good, and to relatives, orphans, the needy, the near neighbor, the far neighbor, the companion at your side, the traveler..." | Sahih International |

---

### 2. Creation (`creation`)

**Description:** How each tradition describes the origin of the cosmos and humanity's place within it.

**Bridging note:** All three traditions open their scripture with creation. The shared instinct -- to declare that existence is not accident -- produces strikingly parallel theological moves: the world is spoken or made by one God, and it is good.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Genesis 1:1 | `Genesis 1:1` | "In the beginning God created the heavens and the earth." | Sefaria English |
| Christianity | John 1:1-3 | `john 1:1-3` | "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made by him..." | KJV |
| Islam | Al-Anbiya 21:30 | `21:30` | "Have those who disbelieved not considered that the heavens and the earth were a joined entity, and We separated them and made from water every living thing? Then will they not believe?" | Sahih International |

---

### 3. Prayer (`prayer`)

**Description:** The practice, posture, and purpose of speaking to God across three traditions.

**Bridging note:** Each tradition provides a canonical prayer -- the Shema, the Lord's Prayer, Al-Fatiha. All three orient the person toward God in praise, need, and submission. The structural similarity is remarkable: opening with God's greatness, moving toward human petition.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Deuteronomy 6:4-5 | `Deuteronomy 6:4-5` | "Hear, O Israel! The LORD is our God, the LORD is one! And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might." | Sefaria English |
| Christianity | Matthew 6:9-13 | `matthew 6:9-13` | "Our Father which art in heaven, Hallowed be thy name. Thy kingdom come, Thy will be done in earth, as it is in heaven. Give us this day our daily bread. And forgive us our debts, as we forgive our debtors." | KJV |
| Islam | Al-Fatiha 1:1-7 | `1:1` | "In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds -- The Entirely Merciful, the Especially Merciful, Sovereign of the Day of Recompense. It is You we worship and You we ask for help." | Sahih International |

---

### 4. Mercy and Compassion (`mercy`)

**Description:** God's compassion as a defining attribute -- and humanity's call to reflect it.

**Bridging note:** All three traditions describe mercy as among God's most fundamental attributes, and all three transmit a corresponding human obligation. The Thirteen Attributes in Judaism, the Beatitude on mercy in Christianity, and the opening Bismillah of the Quran -- all center divine and human mercy in the same breath.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Psalm 145:8-9 | `Psalms 145:8` | "The LORD is gracious and full of compassion; slow to anger, and of great mercy. The LORD is good to all; and his tender mercies are over all his works." | Sefaria English |
| Christianity | Matthew 5:7 | `matthew 5:7` | "Blessed are the merciful: for they shall obtain mercy." | KJV |
| Islam | Al-Anbiya 21:107 | `21:107` | "And We have not sent you, [O Muhammad], except as a mercy to the worlds." | Sahih International |

---

### 5. Justice (`justice`)

**Description:** Righteousness toward the poor, the stranger, and the vulnerable.

**Bridging note:** Justice in the Abrahamic traditions is not abstract legal procedure -- it is a demand oriented toward the powerless. Amos thunders for the widow and orphan; Matthew frames justice alongside mercy and faith; An-Nisa commands testimony even against oneself. The direction of concern is identical.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Amos 5:24 | `Amos 5:24` | "But let justice well up like water, righteousness like an unfailing stream." | Sefaria English |
| Christianity | Matthew 23:23 | `matthew 23:23` | "...ye have omitted the weightier matters of the law, judgment, mercy, and faith: these ought ye to have done, and not to leave the other undone." | KJV |
| Islam | An-Nisa 4:135 | `4:135` | "O you who have believed, be persistently standing firm in justice, witnesses for Allah, even if it be against yourselves or parents and relatives." | Sahih International |

---

### 6. Forgiveness (`forgiveness`)

**Description:** The possibility of return and reconciliation across human and divine relationship.

**Bridging note:** No other divine attribute appears more consistently across all three traditions than the willingness to forgive. The distance metaphor in Psalms, the conditional symmetry of the Lord's Prayer, and Az-Zumar's sweeping assurance all locate forgiveness at the center of what God is.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Psalm 103:12 | `Psalms 103:12` | "As far as the east is from the west, so far hath he removed our transgressions from us." | Sefaria English |
| Christianity | Matthew 6:14-15 | `matthew 6:14-15` | "For if ye forgive men their trespasses, your heavenly Father will also forgive you: But if ye forgive not men their trespasses, neither will your Father forgive your trespasses." | KJV |
| Islam | Az-Zumar 39:53 | `39:53` | "Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.'" | Sahih International |

---

### 7. Charity and Generosity (`charity`)

**Description:** The obligation to give -- tzedakah, almsgiving, and zakat as structural parallels.

**Bridging note:** Each tradition institutionalizes giving as an obligation rather than a virtue. The Hebrew tzedakah comes from the same root as justice; Islamic zakat is a pillar of the faith. In Matthew 25, generosity to the needy is inseparable from devotion to God himself.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Proverbs 19:17 | `Proverbs 19:17` | "He that hath pity upon the poor lendeth unto the LORD; and that which he hath given will he pay him again." | Sefaria English |
| Christianity | Matthew 25:35-36, 40 | `matthew 25:35-40` | "For I was an hungred, and ye gave me meat: I was thirsty, and ye gave me drink...Verily I say unto you, Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me." | KJV |
| Islam | Al-Baqarah 2:261 | `2:261` | "The example of those who spend their wealth in the way of Allah is like a seed [of grain] which grows seven spikes; in each spike is a hundred grains. And Allah multiplies [His reward] for whom He wills." | Sahih International |

---

### 8. The Oneness of God (`monotheism`)

**Description:** The Shema, the Creed, and Tawhid -- three articulations of a singular divine reality.

**Bridging note:** This is the doctrinal common ground from which all three traditions originate: there is one God and that God is not to be confused with creation. The Shema is the oldest liturgical form; Al-Ikhlas is the Quranic compression of the same idea. All three root their ethics, law, and narrative in this single claim.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Deuteronomy 6:4 | `Deuteronomy 6:4` | "Hear, O Israel: The LORD our God, the LORD is one." | Sefaria English |
| Christianity | 1 Corinthians 8:6 | `1 corinthians 8:6` | "But to us there is but one God, the Father, of whom are all things, and we in him; and one Lord Jesus Christ, by whom are all things, and we by him." | KJV |
| Islam | Al-Ikhlas 112:1-4 | `112:1` | "Say, 'He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.'" | Sahih International |

---

### 9. Covenant (`covenant`)

**Description:** The binding agreements between God and humanity at the root of all three traditions.

**Bridging note:** All three traditions understand themselves as parties to a covenant -- a binding, initiated by God, with obligations flowing in both directions. The vessel changes: the people of Israel, the church, the umma. The structure -- God binds himself to a community and that community is shaped by it -- is constant.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Genesis 17:7 | `Genesis 17:7` | "I will maintain My covenant between Me and you, and your offspring to come, as an everlasting covenant throughout the ages, to be God to you and to your offspring to come." | Sefaria English |
| Christianity | Hebrews 8:10 | `hebrews 8:10` | "For this is the covenant that I will make with the house of Israel after those days, saith the Lord; I will put my laws into their mind, and write them in their hearts: and I will be to them a God, and they shall be to me a people." | KJV |
| Islam | Al-Baqarah 2:124 | `2:124` | "[Allah] said, 'Indeed, I will make you a leader for the people.' [Abraham] said, 'And of my descendants?' [Allah] said, 'My covenant does not include the wrongdoers.'" | Sahih International |

---

### 10. Faith and Trust (`trust-in-god`)

**Description:** Reliance on God in the face of uncertainty -- the disposition of the believer.

**Bridging note:** Trust in God appears in each tradition as both a theological claim and a practical posture: because God is sovereign, the believer can release anxiety. The Shepherd Psalm, Paul's assurance in Romans, and the Quranic declaration on tawakkul all converge on this same release.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Psalm 23:1-4 | `Psalms 23:1` | "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul... Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me." | Sefaria English |
| Christianity | Romans 8:38-39 | `romans 8:38-39` | "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor height, nor depth, nor any other creature, shall be able to separate us from the love of God." | KJV |
| Islam | At-Talaq 65:3 | `65:3` | "And whoever relies upon Allah -- then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a decreed extent." | Sahih International |

---

### 11. Wisdom (`wisdom`)

**Description:** The pursuit and gift of wisdom -- divine in origin, essential for human flourishing.

**Bridging note:** All three traditions treat wisdom not as mere intelligence but as a faculty oriented toward God. The fear of the LORD in Proverbs, the request to God in James, and the divine gift in Al-Baqarah -- wisdom flows from the same source: relationship with God rather than study alone.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Proverbs 1:7 | `Proverbs 1:7` | "The fear of the LORD is the beginning of wisdom: but fools despise wisdom and instruction." | Sefaria English |
| Christianity | James 1:5 | `james 1:5` | "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him." | KJV |
| Islam | Al-Baqarah 2:269 | `2:269` | "He gives wisdom to whom He wills, and whoever has been given wisdom has certainly been given much good. And none will remember except those of understanding." | Sahih International |

---

### 12. Divine Light (`divine-light`)

**Description:** Light as the primary metaphor for God's presence, guidance, and truth.

**Bridging note:** Light is the most universal divine metaphor in the Abrahamic texts. The Psalmist speaks of God's word as a lamp; Jesus declares himself "the light of the world"; the Nur verse describes God as the Light of the heavens and earth itself. The metaphor is the same; the theology around it differs -- but the instinct to compare God with light is shared across three millennia of tradition.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Psalm 119:105 | `Psalms 119:105` | "Thy word is a lamp unto my feet, and a light unto my path." | Sefaria English |
| Christianity | John 8:12 | `john 8:12` | "Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life." | KJV |
| Islam | An-Nur 24:35 | `24:35` | "Allah is the Light of the heavens and the earth. The example of His light is like a niche within which is a lamp, the lamp is within glass, the glass as if it were a pearly [white] star lit from [the oil of] a blessed olive tree." | Sahih International |

---

### 13. Peace (`peace`)

**Description:** Shalom, peace, and salam -- the same word across three languages, three covenants.

**Bridging note:** The Hebrew shalom, Greek eirene (used in Paul), and Arabic salam share not just a root but a meaning: wholeness, right-relationship, the absence of rupture. When Aaron blesses Israel with peace, when Paul speaks of peace that surpasses understanding, when the Quran describes paths of peace -- they invoke the same telos for human existence.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Numbers 6:24-26 | `Numbers 6:24-26` | "The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace." | Sefaria English |
| Christianity | Philippians 4:7 | `philippians 4:7` | "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus." | KJV |
| Islam | Al-Maidah 5:16 | `5:16` | "By which Allah guides those who pursue His pleasure to the ways of peace and brings them out from darknesses into the light, by His permission, and guides them to a straight path." | Sahih International |

---

### 14. Gratitude (`gratitude`)

**Description:** Praise and thanksgiving as the proper posture of the creature before the Creator.

**Bridging note:** Gratitude is structural to all three traditions: it is not merely a feeling but a practice, a commandment, and a mode of acknowledging the source of all good. Psalm 100, 1 Thessalonians, and Ibrahim 14 all link gratitude to a practical consequence -- entering God's presence, expressing God's will, and receiving more.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Psalm 100:4-5 | `Psalms 100:4` | "Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name. For the LORD is good; his mercy is everlasting." | Sefaria English |
| Christianity | 1 Thessalonians 5:16-18 | `1 thessalonians 5:18` | "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you." | KJV |
| Islam | Ibrahim 14:7 | `14:7` | "And [remember] when your Lord proclaimed, 'If you are grateful, I will surely increase you [in favor]; but if you deny, indeed, My punishment is severe.'" | Sahih International |

---

### 15. Repentance and Return (`repentance`)

**Description:** The path back to God after wrongdoing -- teshuvah, metanoia, tawbah.

**Bridging note:** Each tradition has a technical term for the act of turning back to God -- Hebrew teshuvah (return), Greek metanoia (change of mind), Arabic tawbah (turning). All three insist that this return is possible, divinely welcomed, and transformative. The returning prodigal son is closely mirrored in Sufi and rabbinic parables as well.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Joel 2:12-13 | `Joel 2:12-13` | "Turn ye even to me with all your heart, and with fasting, and with weeping, and with mourning... Rend your heart, and not your garments, and turn unto the LORD your God: for he is gracious and merciful, slow to anger, and of great kindness." | Sefaria English |
| Christianity | Luke 15:20, 22-24 | `luke 15:20` | "And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck, and kissed him...For this my son was dead, and is alive again; he was lost, and is found." | KJV |
| Islam | Al-Baqarah 2:160 | `2:160` | "Except for those who repent, correct themselves and make evident [what they concealed]. Those -- I will accept their repentance, and I am the Accepting of repentance, the Merciful." | Sahih International |

---

### 16. The Sanctity of Life (`sanctity-of-life`)

**Description:** The divine image in every person -- and the weight of one human life.

**Bridging note:** The idea that human life is sacred -- not merely valuable but bearing the imprint of the divine -- runs across all three traditions. From the creation of humanity in God's image (Genesis), to sparrows numbered by the Father (Matthew), to the Quranic teaching that saving one life is saving all of humanity, the logic is the same: life is not a thing to be weighed but a presence to be honored.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Genesis 1:27 | `Genesis 1:27` | "So God created man in his own image, in the image of God created he him; male and female created he them." | Sefaria English |
| Christianity | Matthew 10:29-31 | `matthew 10:29-31` | "Are not two sparrows sold for a farthing? and one of them shall not fall on the ground without your Father. But the very hairs of your head are all numbered. Fear ye not therefore, ye are of more value than many sparrows." | KJV |
| Islam | Al-Maidah 5:32 | `5:32` | "...whoever kills a soul unless for a soul or for corruption [done] in the land -- it is as if he had slain mankind entirely. And whoever saves one -- it is as if he had saved mankind entirely." | Sahih International |

---

### 17. Knowledge and Learning (`knowledge-and-learning`)

**Description:** The imperative to seek knowledge -- a command woven into all three traditions.

**Bridging note:** The first command of the Quran is "Read." The first verse of Proverbs is addressed to someone who desires to know. Christianity frames Jesus as the Word made flesh -- logos, meaning reason and speech. Each tradition understands intellectual engagement as a form of worship rather than its rival.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Proverbs 1:5 | `Proverbs 1:5` | "A wise man will hear, and will increase learning; and a man of understanding shall attain unto wise counsels." | Sefaria English |
| Christianity | Colossians 3:16 | `colossians 3:16` | "Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs, singing with grace in your hearts to the Lord." | KJV |
| Islam | Al-Alaq 96:1-5 | `96:1` | "Read in the name of your Lord who created -- Created man from a clinging substance. Read, and your Lord is the most Generous -- Who taught by the pen -- Taught man that which he knew not." | Sahih International |

---

### 18. Love of God (`love-of-god`)

**Description:** Devotion to God as the first and greatest commandment.

**Bridging note:** All three traditions identify love of God as the primary human obligation -- and all three frame it as total: heart, soul, mind, might. In Judaism and Christianity this command comes from the same verse (Deuteronomy 6:5); in the Quran it appears as an intensifying descriptor of what believers feel. The difference is in how love is expressed; the imperative is shared.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Deuteronomy 6:5 | `Deuteronomy 6:5` | "And thou shalt love the LORD thy God with all thine heart, and with all thy soul, and with all thy might." | Sefaria English |
| Christianity | Matthew 22:37-38 | `matthew 22:37-38` | "Jesus said unto him, Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind. This is the first and great commandment." | KJV |
| Islam | Al-Baqarah 2:165 | `2:165` | "...those who believe are stronger in love for Allah. And if only they who have wronged would consider [that] when they see the punishment, [they will be certain] that all power belongs to Allah." | Sahih International |

---

### 19. The Nature of God (`attributes-of-god`)

**Description:** How each tradition describes what God is -- the names, titles, and attributes of the divine.

**Bridging note:** Each tradition has developed a rich vocabulary for the attributes of God: omnipotence, omniscience, eternity, holiness. Isaiah's declaration that God is incomparable, Paul's doxology on unfathomable riches, and Al-Hashr's litany of divine names all express the same theological impulse: human language strains toward a reality it cannot fully contain.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Isaiah 46:9 | `Isaiah 46:9` | "Remember the former things of old: for I am God, and there is none else; I am God, and there is none like me." | Sefaria English |
| Christianity | Romans 11:33 | `romans 11:33` | "O the depth of the riches both of the wisdom and knowledge of God! how unsearchable are his judgments, and his ways past finding out!" | KJV |
| Islam | Al-Hashr 59:22-23 | `59:22` | "He is Allah, other than whom there is no deity, Knower of the unseen and the witnessed. He is the Entirely Merciful, the Especially Merciful. He is Allah, other than whom there is no deity, the Sovereign, the Pure, the Perfection, the Bestower of Faith, the Overseer." | Sahih International |

---

### 20. Humility (`humility`)

**Description:** Walking lightly on the earth -- the posture of one who knows their place before God.

**Bridging note:** Humility in the Abrahamic traditions is not self-deprecation but accuracy: a right understanding of one's place in relation to God and neighbor. Micah's trio of justice, mercy, and humility; Paul's instruction to count others as better than oneself; and the Quranic portrait of the servants of the Most Merciful who walk upon the earth gently -- all point to the same disposition.

| Tradition | Ref | Lookup | Text (pre-seeded) | Translation |
|-----------|-----|--------|-------------------|-------------|
| Judaism | Micah 6:8 | `Micah 6:8` | "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?" | Sefaria English |
| Christianity | Philippians 2:3-4 | `philippians 2:3-4` | "Let nothing be done through strife or vainglory; but in lowliness of mind let each esteem other better than themselves. Look not every man on his own things, but every man also on the things of others." | KJV |
| Islam | Al-Furqan 25:63 | `25:63` | "And the servants of the Most Merciful are those who walk upon the earth easily, and when the ignorant address them [harshly], they say [words of] peace." | Sahih International |

---

## How to use these themes

### Display a comparison

For each theme, display three panels side by side (or stacked on narrow viewports):

1. **Judaism panel** -- blue accent (`#3b82f6` or Tailwind `blue-400/blue-800/blue-950`)
2. **Christianity panel** -- violet accent (`#8b5cf6` or Tailwind `violet-400/violet-800/violet-950`)
3. **Islam panel** -- emerald accent (`#10b981` or Tailwind `emerald-400/emerald-800/emerald-950`)

Each panel shows:
- Tradition name + badge
- Display reference
- Translation name
- Passage text (use `staticText` for instant rendering; fetch live text as optional enhancement)
- Attribution link

Below the panels, render the `bridgingNote` under a "What Connects These?" heading.

### Fetch live text (optional enhancement)

Use the `okhp3-verse-lookup` skill with each passage's `lookup` key and `apiProvider`:
- Judaism passages: use Sefaria (`tradition: 'judaism'`, `reference: lookup`)
- Christianity passages: use bible-api.com (`tradition: 'christianity'`, `reference: lookup`)
- Islam passages: use Quran.com with fallback (`tradition: 'islam'`, `reference: lookup`)

Pre-seeded `staticText` should be shown immediately. Live fetch is a background enhancement, not a prerequisite for display.

### Generate a new theme

When adding a new theme beyond the 20 seeded here:
1. Verify the theme applies meaningfully to all three traditions (do not add if any tradition has no natural parallel)
2. Select one primary passage per tradition (prefer widely known, liturgically significant verses)
3. Write a bridging note following the style guide above
4. Ensure proportional representation: if adding Christianity entries, add depth across denominations if the theme has denomination-specific variants
5. Never assert one passage is the "source" or "original" of the parallel

---

## Theme index by ID

| ID | Title |
|----|-------|
| `the-golden-rule` | The Golden Rule |
| `creation` | Creation |
| `prayer` | Prayer |
| `mercy` | Mercy and Compassion |
| `justice` | Justice |
| `forgiveness` | Forgiveness |
| `charity` | Charity and Generosity |
| `monotheism` | The Oneness of God |
| `covenant` | Covenant |
| `trust-in-god` | Faith and Trust |
| `wisdom` | Wisdom |
| `divine-light` | Divine Light |
| `peace` | Peace |
| `gratitude` | Gratitude |
| `repentance` | Repentance and Return |
| `sanctity-of-life` | The Sanctity of Life |
| `knowledge-and-learning` | Knowledge and Learning |
| `love-of-god` | Love of God |
| `attributes-of-god` | The Nature of God |
| `humility` | Humility |

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
