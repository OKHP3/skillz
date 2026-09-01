# Localization-skill maturation circuit — 2026-09-01

## Decision and scope

**Decision supported:** whether seven recently created or enhanced localization
skills warrant a further evidence-backed minor version, without claiming fresh
native-language, search-ranking, or production-site results.

**Authority:** the owner requested an elicitation-to-intake-to-research-to-
equilibrium-review-to-Foundry circuit, followed by a `+1` version increment for
each reviewed skill. This document is the shared, redacted working set for the
reviewers. No deployment, publication, or commit authority is included.

## Reclamation intake manifest

The originals remain in their canonical package paths. Reviewers receive only
these working-copy paths and the frozen `SKILL.md` hash recorded at intake.

| Intake ID | Canonical package | Version at intake | `SKILL.md` SHA-256 | Evidence status |
|---|---|---:|---|---|
| LOC-01 | `universal/okhp3-i18n-page-release` | 1.0.0 | `a5680c8e3dd78b80377a540d41a54b55c1b2d8b24e921c0364a89e41ef4f0511` | observed |
| LOC-02 | `universal/okhp3-i18n-page-sync` | 1.1.0 | `669bcd47da12bc424e95c86971fc464a3d380a8362a3b13550db08f373808902` | observed |
| LOC-03 | `language-mediation/okhp3-translation-en-us-de-de` | 1.1.0 | `708d508f00ce7e8056f11f9b83eab8cd1ea327891b3d859eae82a3c73e85b7f2` | observed |
| LOC-04 | `language-mediation/okhp3-translation-en-us-en-uk` | 1.1.0 | `cd02ad8eaf8dc01d2c57dd3e0239aeab0fcfb0244fc6f65ee1b7edb36f914626` | observed |
| LOC-05 | `language-mediation/okhp3-translation-en-us-es-es` | 1.1.0 | `e97e3cdab4ef27669fd899b6f5b50f27c02eb394dcb9694411dadd2edc498833` | observed |
| LOC-06 | `language-mediation/okhp3-translation-en-us-es-mx` | 1.1.0 | `749494b44045683e47371d3112a2ed50e00fbadca281cdb7b85d32e361bf0035` | observed |
| LOC-07 | `language-mediation/okhp3-translation-en-us-fr-fr` | 1.2.0 | `e487bd992fae981707b2e70685f3e1be272c8000e3ad7afdb0ef3054b27cfac7` | observed |

The authoritative package files, existing tests, evaluations, benchmarks, and
the three existing publication mirrors are in scope. No proprietary source,
personal data, credentials, or live-site data is supplied or required.

## Elicitation record

The user request answers the following high-priority questions:

| Question | Recorded answer | Confidence |
|---|---|---|
| What should mature? | The newly created page-release skill and the six skills enhanced in the prior pass. | high |
| What outcome matters? | A further evolutionary pass informed by initial vision, implementation achievement, and source-backed feasibility. | high |
| What method is required? | Elicitation, reclamation intake, source-backed research, independent equilibrium review, then Skill Foundry. | high |
| What version policy applies? | Increment every reviewed package by one minor version for the revised method and evaluation. | high |
| Is publication authorized? | No. | high |

Open questions deliberately retained rather than inferred:

1. No native reviewer or representative target-language content corpus is
   supplied; native quality remains outside the circuit.
2. No deployed site or search-console access is supplied; live indexing and
   search-performance claims remain `not-run`.
3. No actual framework, CMS, or sitemap topology is supplied; framework and
   deployment adapters remain out of scope.

## Acceptance criteria

Each package may receive a minor-version increase only if the circuit produces:

1. A source ledger with authoritative, current, applicable sources and an
   explicit uncertainty register.
2. An equilibrium decision of `approve` or `approve-with-limits`, with a
   tested response to any credible disruptor finding.
3. A smallest-causal Foundry change, a new or revised evidence-anchored
   regression/evaluation case, and an append-only learning record.
4. Passing structural validation and relevant deterministic tests; exact mirror
   parity for the three already published translation packages.

## Initial vision and current achievement hypothesis

The design seeks a composable chain: exact-pair language work owns linguistic
transformation and review; page sync owns source freshness; page release owns
static localized-page metadata and release readiness; an owner still controls
publication. The current implementation appears to embody that separation, but
the reviewers must test the following claims rather than accept them:

- the chain stays serial and does not collapse specialist-register mediation,
  translation, and technical page release into one generic translator;
- language and `hreflang` metadata are exact enough for a static-site release
  while drafts do not leak into public alternate graphs;
- rendered-language detection remains advisory and cannot certify linguistic
  quality; and
- no package expands into automatic publication, forced redirects, or hidden
  site writes.

## Circuit handoff

1. Source-backed research maps authoritative guidance to these hypotheses.
2. Independent evidence, outcome, and safety-portability reviewers receive this
   manifest and the research ledger; they do not edit packages.
3. A disruptor tests any materially concordant recommendation, then a
   negotiator records the release decision and limits.
4. Skill Foundry applies only approved, smallest-causal changes. Fresh
   structural and deterministic checks are version-specific; pre-change
   benchmarks become historical.

## Source-backed research ledger

Retrieved 2026-09-01. These sources inform the changes; they do not authorize
publication or establish native-language, live-site, or search-performance
results.

| ID | Source | Authority and applicable claim |
|---|---|---|
| SRC-01 | [Google: Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions) | HTML alternates are head metadata with fully qualified URLs, self/return links for actual equivalents, and partial clusters when no equivalent exists. |
| SRC-02 | [Google: Managing multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) | Use distinct locale URLs and a selector; do not force locale delivery from IP or language detection. Google determines visible page language algorithmically. |
| SRC-03 | [Google: Canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) | Self-referential canonicals are recommended; a canonical should remain in the same language where applicable. |
| SRC-04 | [W3C: HTML language declarations](https://www.w3.org/International/questions/qa-html-language-declarations) | Use document and embedded-language declarations with BCP 47 language tags; markup does not prove language quality. |
| SRC-05 | [IANA Language Subtag Registry](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry) | The registry supplies BCP 47 subtags; a local syntax check is not a full registry validation. |
| SRC-06 | [Adobe page-langs](https://github.com/adobe/skills/blob/main/plugins/web/skills/page-langs/SKILL.md) | Declared metadata and detected body language are separate signals; short or unreliable pages remain unknown, not failed fluency. |
| SRC-07 | [W3C ITS 2.0](https://www.w3.org/TR/its20/) | Translation and localization QA are distinct phases; automated findings can require human confirmation. |

## Equilibrium review record

**Question:** Do the seven packages fulfil the intended serial localization
chain safely enough for a further minor version, and which smallest changes are
evidence-backed?

**Execution:** three role-separated, same-model, shared-source reviews:
evidence, outcome, and safety-portability. This is analytical rather than
independent live evidence. The reviews agreed that the chain is valuable and
its boundaries should remain, but identified concrete false-readiness risks.

| Claim ID | Claim | Status | Decisive action |
|---|---|---|---|
| CLM-01 | Page-release metadata is sufficiently constrained. | disputed | Restrict relevant metadata to `head`, reject duplicate canonicals and `hreflang` entries, contain paths, and describe policy as policy. |
| CLM-02 | Page-sync can clear real source drift through its documented adoption path. | disputed | Add an explicit, route-limited stale-refresh acknowledgement; preserve its no-translation boundary. |
| CLM-03 | `in_sync` establishes translation review or release readiness. | rejected | Name it source-byte freshness only and route reviewed HTML separately. |
| CLM-04 | A bare object is adequate evidence for an approved pair translation. | disputed | Require an exact-locale, structured review record and validate its shape and supplied file hashes. |
| CLM-05 | Adobe-style detection proves target-language quality. | rejected | Keep it optional, advisory, and capable of returning `unknown`. |
| CLM-06 | Complete public clusters, draft exclusion, exact declaration form, and `x-default` are universal search-engine requirements. | disputed | Preserve a configurable project release policy and distinguish it from source guidance. |

**Disruptor hypotheses tested during review:** malformed metadata could hide in
the body; duplicate tags could be silently accepted; a stale ledger could never
be refreshed; a traversal path could escape a working-site root; an empty review
object could be labeled approved. All are credible against the frozen code, so
the release decision is `approve-with-limits` conditional on deterministic
repairs and regression tests.

**Foundry change decision:** apply the following smallest causal changes:

1. `okhp3-i18n-page-release` gets head-only duplicate-aware parsing,
   root-contained registry paths, basic BCP-47 syntax screening described as
   registry consistency rather than IANA verification, and explicit
   project-policy configuration for `x-default` and declaration form.
2. `okhp3-i18n-page-sync` gets contained config-derived paths, a deliberate
   `--refresh-stale` route-limited confirmation, and source-byte freshness
   wording. It does not acquire review, metadata, translation, or publication
   behavior.
3. Every exact-pair package gets the same minimum approved-review record:
   target locale, approval decision, reviewer role, date, source and target
   SHA-256 values, record reference, and unresolved-terms list. Validation
   checks structure and any supplied files only; it does not certify reviewer
   competence or linguistic quality. The two copied French labels are corrected.

No evidence supports adding an Adobe dependency, a browser requirement,
automatic sitemap changes, forced redirects, a generic multi-target
translator, native-quality certification, or publication automation.
