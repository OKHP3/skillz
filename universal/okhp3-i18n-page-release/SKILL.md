---
name: okhp3-i18n-page-release
description: >
  Validate and prepare a localized static-web page set for release after its
  exact-pair translation is reviewed. Use when checking locale URLs, BCP-47
  html lang values, self-canonicals, hreflang alternates, noindex staging, or
  rendered-language evidence. It does not translate prose, publish a site, or
  replace source-drift detection.
license: MIT
compatibility: >
  Any Agent Skills-compatible client with filesystem access. Python 3.9+ is
  needed only for the optional dependency-free structural validator. A browser
  language-detection adapter is optional and must be available locally.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Release-readiness verification for localized static HTML routes, locale metadata, alternate graphs, and declared-versus-rendered language evidence."
  out_of_scope: "Translating content, certifying native fluency, creating an i18n architecture without an owner-approved registry, automatic publication, or source-drift detection."
---

# okhp3-i18n-page-release

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

This is the release stage after an exact-pair translation skill and before a
localized page is treated as public. It keeps language transformation separate
from page delivery and keeps deterministic source drift separate from technical
SEO and rendered-content evidence.

## Scope

| In scope | Out of scope |
|---|---|
| Static HTML release checks for reviewed or explicitly staged localized routes | Translating, rewriting, or native-language certification |
| BCP-47 language declarations, self-canonicals, alternates, and noindex state | Publishing, sitemap writes, analytics changes, or forced language redirects |
| Optional declared-versus-rendered language evidence when a local adapter exists | Replacing `okhp3-i18n-page-sync` source-drift detection |

## Required inputs

- one reviewed or explicitly draft-marked output from the matching
  `okhp3-translation-<source>-<target>` skill;
- an owner-approved locale registry based on
  `assets/locale-registry.example.json`;
- the static HTML files named in that registry; and
- the site's stated release policy for each target: `indexable` or
  `draft-noindex`.

If the source locale, target BCP-47 tag, route mapping, site origin, or release
state is unknown, return `BLOCKED`. Do not guess a country from a language-only
folder name, and do not change a draft to indexable to make validation pass.

## Procedure

1. Confirm the exact-pair translation record: direction, source and target
   hashes, dictionary, review state, unresolved terms, and output locale. A
   translation without a review record remains a draft, even if HTML exists.
2. Read the locale registry and its explicit release policy. It is the one
   source for locale tag, route root, direction, indexability, optional
   x-default fallback, declaration policy, and exact-pair skill. A filesystem
   slug such as `fr` is not a substitute for `fr-FR`.
3. Run `scripts/validate-i18n-page-release.py --help`, then use `--check` on
   the registry. It verifies each declared HTML file, BCP-47 `html lang`,
   self-canonical URL, configured alternate graph, noindex staging policy, and
   optional `og:url` equality. It never writes files or fetches a site.
4. Apply the owner-set public-cluster policy. By default, an indexable locale
   set is a complete, reciprocal cluster: each
   indexable page names itself and every other indexable equivalent with the
   registry's BCP-47 tags, plus the declared `x-default`. Draft-noindex pages
   remain outside that public cluster until their review gate is complete. This
   is a project release policy, not a claim that every item is universally
   required by a search engine.
5. If a browser language-detection adapter is available, inspect the rendered
   page and retain its report. Reconcile detected body language with `html
   lang`, nested `lang` declarations, and `hreflang`. A short page, unreliable
   detector result, or unavailable adapter is `UNKNOWN`, not a pass or a
   language-quality failure.
6. Check the language switcher manually or with a browser: it names locales in
   their own language and maps to the equivalent available route. Do not force
   a geo-IP or `Accept-Language` redirect.
7. Return structural results, rendered-language evidence, translation-review
   evidence, and release state separately. `ready-for-release` requires all
   structural checks to pass, a reviewed indexable translation, and an explicit
   owner decision to publish. This skill never makes that publication.

## Boundaries with adjacent skills

| Need | Use this skill? | Route instead |
|---|---|---|
| Translate one owned plainspoken artifact | No | Matching exact-pair translation skill |
| Detect a changed English source or missing target | No | `okhp3-i18n-page-sync` |
| Validate a reviewed localized page before release | Yes | This skill |
| Certify idiomatic target-language prose | No | Authorized native review |
| Add locale routing to an application framework | No | Framework-specific i18n workflow |

## Output contract

Return `Locale registry`, `Translation evidence`, `Structural validation`,
`Rendered-language evidence`, `Release state`, `Warnings and unknowns`, and
`Next action`. Distinguish `pass`, `fail`, `warning`, `unknown`, and
`not-run`. A passing structural validator is not native-language certification,
search-ranking evidence, or publication confirmation.

## Resource routing

- Read `references/locale-registry.md` before creating or changing a registry.
- Use `assets/locale-registry.example.json` as a starting shape, never as live
  site data.
- Run `scripts/validate-i18n-page-release.py --help` before direct use.
- Read `evals/evals.json` when changing the skill's validation policy.
- Browser adapters may use an Adobe `page-langs`-style declared-versus-detected
  report, but that optional adapter must not become a dependency of the
  portable core.

## Evaluation and release

`evals/evals.json` covers an indexable reciprocal cluster, a staged noindex
draft, head-only duplicate-aware metadata, configured language-declaration and
x-default policy, and unavailable rendered-body language evidence. Tests
establish structural behavior only. No fresh live browser benchmark,
native-review study, or search-performance result has been run for version
`1.1.0`.

## About

Built by [Jamie Hill](https://github.com/JamieHill) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
