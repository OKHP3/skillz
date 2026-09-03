---
family: language-mediation
display_name: Language Mediation
skill_count: 5
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-09-03T02:07:20Z
---

# language-mediation

Language Mediation governs controlled transformations across human languages,
regional varieties, specialist registers, and audience-appropriate plain
language. Its purpose is to change expression without silently changing source
authority, technical meaning, or uncertainty.

## Serial mediation rule

When a source is specialist-facing and the target must also change language or
locale, execute two distinct stages in order:

```text
specialist source locale -> plainspoken source locale -> plainspoken target locale
```

The first skill mediates the register. The second skill translates the regional
language. They may be launched by one user request or orchestration prompt, but
they must not run in parallel or collapse into one translating skill. The
second stage consumes the first stage's plainspoken artifact and mediation
record, not the original specialist source.

Each stage must identify its input, output, transformation type, terminology
authority, unresolved terms, review state, and limitations. A chain record must
link both stages and preserve the source and intermediate artifact hashes.

## Package boundaries

- Exact-pair packages use `okhp3-translation-<source-locale>-<target-locale>`.
- Register packages name the source domain and plain-language target locale.
- No package supports hidden reverse translation, generic copyediting, or
  automatic publication.
- Specialist-to-plain work must not present itself as legal, medical,
  engineering, or other professional advice.

## Current decision

`okhp3-translation-en-us-fr-fr` is the first family package. It accepts only
plainspoken `en-US` and produces `fr-FR`. The former generic
`okhp3-webpage-localization` package is intentionally not retained: a
multi-target webpage router would weaken exact-pair dictionaries, controlled
locale selection, and the required serial mediation boundary.

## Web-page delivery handoff

An exact-pair skill may produce HTML, but it does not turn that artifact into a
public localized route. For an HTML target, record the exact target BCP-47 tag,
route, intended indexability, and review-record path, then use the separate
Universal stack in this order:

```text
exact-pair translation and review -> i18n page sync -> i18n page release -> owner-authorized publication
```

- `okhp3-i18n-page-sync` detects missing or stale targets from the English
  source inventory. It does not translate or validate technical page metadata.
- `okhp3-i18n-page-release` validates reviewed static HTML for exact language
  declarations, self-canonicals, public alternate clusters, staging state, and
  optional rendered-language evidence. It does not translate or publish.

This preserves the rejection of a generic multi-target translator while making
the technical delivery pattern reusable across pairs and sites.

<!-- FAMILY_SUMMARY_START -->
Language Mediation governs controlled transformations across human languages,
regional varieties, specialist registers, and audience-appropriate plain
language. Its purpose is to change expression without silently changing source
authority, technical meaning, or uncertainty.
<!-- FAMILY_SUMMARY_END -->

## Skills (5)

<!-- FAMILY_INVENTORY_START -->
*5 skills &nbsp;·&nbsp; inventory last updated: **September 3, 2026 at 02:07 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-translation-en-us-de-de](okhp3-translation-en-us-de-de/SKILL.md) | Translate owned plainspoken text artifacts one way from United States English (en-US) to Germany ... | 1.2.0 |
| [okhp3-translation-en-us-en-uk](okhp3-translation-en-us-en-uk/SKILL.md) | Adapt owned plainspoken text artifacts one way from United States English (en-US) to British Engl... | 1.2.0 |
| [okhp3-translation-en-us-es-es](okhp3-translation-en-us-es-es/SKILL.md) | Translate owned plainspoken text artifacts one way from United States English (en-US) to Spain Sp... | 1.2.0 |
| [okhp3-translation-en-us-es-mx](okhp3-translation-en-us-es-mx/SKILL.md) | Translate owned plainspoken text artifacts one way from United States English (en-US) to Mexican ... | 1.2.0 |
| [okhp3-translation-en-us-fr-fr](okhp3-translation-en-us-fr-fr/SKILL.md) | Translate owned plainspoken text artifacts one way from United States English (en-US) to France F... | 1.3.0 |
<!-- FAMILY_INVENTORY_END -->
