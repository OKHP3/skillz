---
title: Cross-Tradition Compare Method
type: methodology
status: active-reference
---

# Cross-Tradition Compare Method

This document describes the editorial and technical method for generating and presenting cross-tradition thematic comparisons in the Abrahamic Reference Engine. Read this before adding themes to the `okhp3-cross-tradition-compare` skill or extending the compare feature in the SPA.

---

## Mission

Identify shared themes and structurally parallel passages across Judaism, Christianity, and Islam -- presented without declaring any tradition superior, more complete, or more historically prior.

The goal is **discovery and translation between faiths**, not synthesis, merger, or competitive ranking.

---

## Scope

Three traditions only. Both criteria must be met for inclusion: (1) Abrahamic lineage, (2) 1% or greater US population per Pew Research Center.

- Judaism (~2% US), Christianity (~63% US), Islam (~1% US)
- Pew citation: https://www.pewresearch.org/religion/religious-landscape-study/

---

## Proportional representation rule

When generating NEW theme entries or expanding the seeded set, the number of examples per tradition should reflect US population share:

- Christianity gets the most examples (5 denominations, ~63% of US)
- Judaism and Islam get equal representation to each other (~2% and ~1%)
- **Every tradition gets at least one entry in every comparison** -- no tradition is optional

This rule governs **quantity** of content across the full corpus, not visual weight within a single comparison. Each panel receives identical visual and structural dignity regardless of population share.

---

## Passage selection criteria

1. **Thematic relevance:** the passage must be a primary, authoritative expression of the theme in its tradition -- not a marginal or obscure reference
2. **Retrievable:** the passage must be fetchable from the designated free API (Sefaria, bible-api.com, Quran.com) or available as pre-seeded static text
3. **No hallucination:** never invent or paraphrase verses. Static pre-seeded text must be verbatim from a named translation
4. **Attribution required:** every passage must carry a translation name and API provider attribution
5. **Canonical reference format:** use the standard lookup format for each tradition (see okhp3-verse-lookup SKILL.md)

---

## Neutral bridging note style guide

A bridging note explains WHAT connects the passages -- not which is original, more complete, or spiritually superior.

### Do

- Describe the shared structural move: "All three traditions place X at the heart of Y"
- Note linguistic/conceptual parallels without implying derivation: "The Hebrew shalom, Greek eirene, and Arabic salam share both a root and a meaning"
- Acknowledge real differences neutrally: "The vessel changes; the structure does not"
- Focus on what can be observed, not what is claimed theologically

### Do not

- Assert one tradition fulfills, corrects, or completes another
- Use words like "original," "earlier," "more complete," "authentic," "fulfilled," or "superseded"
- Present a Christian passage as the culmination of a Jewish one, or an Islamic passage as correcting either
- Rank the passages by age, depth, or spiritual authority
- Use comparative language that implies a hierarchy: "even more so," "goes beyond," "surpasses"

### Tone

Academic-neutral, warm, curious. Imagine a knowledgeable interfaith librarian who deeply respects all three traditions and is excited to show visitors a parallel they may not have noticed.

---

## Theme entry schema

Each theme entry in `compareThemes.ts` and in the skill must include:

```typescript
{
  id: string,              // kebab-case slug, unique across all themes
  title: string,           // short display title
  description: string,     // 1-2 sentence description of what is being compared
  bridgingNote: string,    // neutral explanation of the parallel (see style guide)
  passages: [
    {
      tradition: 'judaism' | 'christianity' | 'islam',
      displayRef: string,   // human-readable reference (e.g. "Genesis 1:1")
      lookup: string,       // API lookup key (e.g. "Genesis 1:1" or "john 3:16" or "1:1")
      staticText: string,   // verbatim pre-seeded text; used when API is unavailable
      translationName: string,
      apiProvider: 'sefaria' | 'bible-api' | 'quran.com'
    },
    // one entry per tradition; minimum 3 entries
  ]
}
```

---

## Adding new themes

1. Confirm the theme has a clear, primary passage in all three traditions
2. Verify passages are retrievable via the designated free API (test-query suite: `../okhp3-verse-lookup/tests/test-queries.md`)
3. Write a bridging note following the style guide above
4. Add the entry to `src/data/compareThemes.ts` in the SPA
5. Mirror the entry in `okhp3-cross-tradition-compare/SKILL.md` for agent use
6. Confirm proportional representation is maintained across the full theme set

---

## Quality checklist

Before committing a new theme:

- [ ] All three traditions have a primary passage
- [ ] Static text is verbatim from a named translation (not paraphrased)
- [ ] Bridging note uses no comparative or hierarchical language
- [ ] Lookup keys verified against the API (tested live or against known-good references)
- [ ] Theme slot does not duplicate an existing theme ID

---

*Source: reconstructed from GPT origin bundle (2026-06-14/15). ARE governance: AGENTS.md.*
