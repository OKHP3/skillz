---
title: Reserve 01 -- Phase 2 Scope Expansion Notes
type: reserve
status: active-reference
---

# Reserve 01 -- Phase 2 Scope Expansion Notes

Planning reference for future scope expansion beyond the three current in-scope Abrahamic traditions. This document records the deferred candidates, the conditions that would trigger a review, and the technical prerequisites that must be satisfied before any expansion is viable.

---

## ARE Phase 1 scope (current)

Three traditions meet both qualifying criteria:
1. Abrahamic lineage -- traceable descent from the Abrahamic scriptural family
2. 1% or greater US population -- per Pew Research Center Religious Landscape Study (2023)

| Tradition | US Share | In scope |
|-----------|----------|----------|
| Christianity | ~63% | YES |
| Judaism | ~2% | YES |
| Islam | ~1% | YES |

---

## Phase 2 deferred candidates

The following traditions are explicitly deferred for potential future phases, not permanently excluded. Exclusion is a methodological boundary for Phase 1, not a judgment of worth or global significance.

### Abrahamic traditions below the 1% US threshold

| Tradition | US Share | Abrahamic | Reason deferred | Phase 2 path |
|-----------|----------|-----------|-----------------|--------------|
| Baha'i | ~0.1% | YES | Below 1% US threshold | Threshold revision required |
| Druze | <0.1% | YES | Below 1% US threshold | Threshold revision required |

**Baha'i notes:** Baha'i scripture (Kitab-i-Aqdas, Kitab-i-Iqan, Hidden Words) is available in English via the Baha'i Reference Library (bahai.org). No dedicated free anonymous API exists for structured verse lookup; the official site is HTML-only. A custom scraper or static dataset would be required.

**Druze notes:** Druze scripture (Rasa'il al-Hikma -- "Epistles of Wisdom") is largely esoteric and not publicly available in a structured digital form. No free API exists. A static excerpt dataset would be required.

### Non-Abrahamic traditions above the 1% threshold

These traditions would require dropping the Abrahamic lineage criterion entirely -- a major governance change to AGENTS.md Section 8.

| Tradition | US Share | Abrahamic | Reason deferred | Primary text | Free API |
|-----------|----------|-----------|-----------------|--------------|----------|
| Hinduism | ~1% | NO | Not Abrahamic | Bhagavad Gita, Upanishads | Bhagavad Gita API (bhagavad-gita.org/api) |
| Buddhism | ~1% | NO | Not Abrahamic | Pali Canon, Dhammapada | SuttaCentral API (suttacentral.net) |

**Hinduism notes:** The Bhagavad Gita API (api.bhagavad-gita.org) provides free, unauthenticated access to Sanskrit and English translations by chapter and verse. SuttaCentral also covers some Hindu-adjacent texts. The Pew 2023 figure of ~1% covers a wide range of Hindu traditions with significant internal diversity; any primer would need to acknowledge that diversity explicitly.

**Buddhism notes:** SuttaCentral (suttacentral.net/api) provides free, unauthenticated access to the Pali Canon and many other Buddhist texts in multiple languages. Coverage is extensive. The API supports verse and sutta lookup. Key challenge: "Buddhism" at ~1% US encompasses Theravada, Mahayana, Vajrayana, and Zen/Ch'an traditions with substantially different textual canons.

---

## Phase 2 prerequisites

Before expanding scope to any new tradition, all four conditions must be satisfied:

### 1. Governance revision

AGENTS.md Section 8 ("Scope") must be revised to either:
- Relax the Abrahamic lineage requirement (for non-Abrahamic traditions at 1%+), or
- Revise the 1% US threshold (for Abrahamic traditions below the threshold)

Both are significant changes requiring explicit sign-off.

### 2. Free anonymous API availability

A free, public, unauthenticated API must exist for the tradition's primary texts that:
- Covers at least the central authoritative texts (equivalent to Quran for Islam, Tanakh for Judaism)
- Supports verse-level or passage-level lookup
- Has a stable base URL and documented endpoint format
- Can be queried without login, OAuth, or rate-limited API keys

No API = the tradition is not ready for ARE regardless of other criteria.

### 3. Proportional representation recalibration

Adding a tradition changes the proportional weight of all existing content. The cross-tradition compare theme set must be recalibrated to reflect the new set of traditions. The proportional representation rule in cross-tradition-compare-method.md governs this.

### 4. Neutral primer and glossary expansion

A knowledge scaffold equivalent to the existing Judaism and Islam primers must be drafted before any feature work begins. This includes:
- Tradition primer (equivalent to judaism-primer.md or islam-primer.md)
- Glossary entries for that tradition's core terms
- At least 5 cross-tradition themes updated to include the new tradition

---

## API landscape survey (as of 2026)

Summary of known free APIs for deferred candidates, for future maintainers.

| Tradition | API | Base URL | Auth | Coverage |
|-----------|-----|----------|------|----------|
| Hinduism (Bhagavad Gita) | bhagavad-gita.org | `https://bhagavad-gita.org/api/v1` | None | 18 chapters, 700 verses; Sanskrit + English |
| Buddhism (Pali Canon) | SuttaCentral | `https://suttacentral.net/api` | None | Extensive; multi-language; Pali, Chinese, Tibetan |
| Baha'i | None identified | -- | -- | No structured verse API; HTML only |
| Druze | None identified | -- | -- | Text not publicly available in structured form |

---

## Content to be developed if scope expands

### If Hinduism is added

- Hinduism primer: primary texts (Vedas, Upanishads, Bhagavad Gita, Mahabharata), six orthodox schools (Nyaya, Vaisesika, Samkhya, Yoga, Mimamsa, Vedanta), key themes (dharma, karma, moksha, brahman/atman)
- Glossary additions: dharma, karma, atman, brahman, moksha, samsara, puja, mantra
- 5 cross-tradition themes updated: monotheism, compassion, sacred law, prayer, afterlife

### If Buddhism is added

- Buddhism primer: Pali Canon (Theravada), Mahayana sutras, Vajrayana texts; Three Jewels (Buddha, Dharma, Sangha); Four Noble Truths; Eightfold Path
- Glossary additions: dharma (Buddhist sense), karma, nirvana, sangha, sutra, dukkha, sila, samadhi, prajna
- 5 cross-tradition themes updated; note: Buddhist non-theism requires careful neutral bridging note guidance -- concepts of God and afterlife differ structurally

### If Baha'i is added

- Baha'i primer: Kitab-i-Aqdas, Kitab-i-Iqan, Hidden Words; Manifestation theology; progressive revelation; Baha'u'llah as latest Manifestation
- Note: Baha'i explicitly affirms all Abrahamic traditions as prior revelation -- bridging notes require care to avoid implied hierarchy where Baha'i "completes" others
- Static dataset required (no free API)

---

## Note on proportional representation if non-Abrahamic traditions are added

The ARE cross-tradition compare proportional representation rule was designed for three traditions. Adding a fourth or fifth requires:
1. Revising the panel layout (currently three-panel)
2. Revising the proportional distribution formula in cross-tradition-compare-method.md
3. Auditing all 20 existing themes for accurate representation of the new tradition

This is a substantial UI and content effort, not just a data addition.

---

*ARE governance: AGENTS.md Section 8. Review this file before any scope expansion work begins.*
