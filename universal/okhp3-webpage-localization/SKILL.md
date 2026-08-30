---
name: okhp3-webpage-localization
description: >
  Localize an authoritative United States English webpage into approved target
  languages while preserving its meaning, brand voice, structure, and source
  provenance. Use when translating, quality-checking, or keeping French,
  Spanish, German, or other localized web pages synchronized from one English
  source. Do not use for copyediting English, translating one target language
  from another, or publishing without approval.
license: MIT
compatibility: >
  Any Agent Skills-compatible client with local file access. Python 3.9+ is
  optional for the bundled HTML job and structural-verification helper.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "One-way, provenance-tracked localization of web pages from an authoritative en-US source."
  out_of_scope: "English copyediting, target-to-target translation, native-speaker certification, automated publication, or legal translation."
---

# okhp3-webpage-localization

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Create localized web pages from one identified United States English source
without flattening the author's voice or allowing a translation to become an
alternate source of truth. The skill pairs an agent's language work with a
deterministic job record and HTML checks; those checks improve consistency but
cannot certify idiomatic fluency or cultural fit without qualified review.

---

## Scope

| In scope | Out of scope |
|---|---|
| One-way `en-US` to target-language web-page localization | Rewriting source English into British, formal, or generic AI English |
| Page provenance, terminology decisions, structural checks, and drift detection | Treating AI review as native-speaker, legal, accessibility, or SEO certification |
| Draft translation artifacts and approval-gated automation design | Committing, deploying, indexing, or changing a live site without separate approval |

## Non-negotiable source rule

The authoritative source for every localized page is an identified `en-US`
page and its SHA-256 fingerprint. Never translate `fr` to `es`, `de` to `fr`,
or a target page back into English for publication. A back-translation may be
used only as a private diagnostic, must not replace source text, and must be
recorded as non-authoritative.

Do not "improve" the source's United States English. Preserve its spelling,
rhythm, contractions, fragments, humor, directness, and deliberate informality
as source facts. Translate the function of those choices into idiomatic target
language rather than carrying English syntax across word for word.

## Inputs and preconditions

Require all of the following before generating a target page:

1. The exact source file or canonical URL, its owning repository, and a stable
   page identifier.
2. A target language tag and intended audience. Use BCP 47 tags. `fr`, `es`,
   and `de` are valid language-level defaults, but choose a regional or audience
   policy before making locale-specific claims.
3. A destination route convention, source-to-target route map, and an explicit
   vocabulary/brand policy. Copy `assets/site-localization-config.template.json`
   into the site's repository and replace every `REQUIRED` value.
4. Permission to create a draft artifact. Permission to create a draft is not
   permission to overwrite an existing translation, commit, merge, deploy, or
   enable a trigger.

If a source is only available on the public web, capture the retrieved URL,
date, and content fingerprint, then label it as an observed snapshot. Prefer
the versioned local source whenever it is available.

## Operating workflow

### 1. Establish the English source contract

Read `references/source-and-voice-contract.md`. Confirm the source is the
authoritative `en-US` page, record its route and fingerprint, and identify its
voice signals: formality, sentence energy, contractions, intentional fragments,
humor, calls to action, and protected brand terms. Do not infer a whole-site
voice from one page; grow the approved profile from representative English
pages.

Create a no-overwrite job packet before translating:

```text
py -3 scripts/webpage_localization.py plan \
  --source <source.html> --page-id <stable-page-id> --target-locale fr \
  --source-url <canonical-source-url> --output <jobs/page-id.fr.json>
```

Use `python3` or `python` if `py -3` is unavailable. The job records the
source hash and an HTML structure fingerprint. A changed source requires a new
job packet and a refresh decision; do not silently patch target prose.

### 2. Decide what is and is not translated

Read `references/translation-rules.md` before drafting. Translate visible prose
including navigation labels, headings, body text, alt text, title text, meta
description, consent copy, and relevant form labels. Preserve code, scripts,
styles, identifiers, analytics keys, CSS classes, API names, URLs unless a
mapped localized route exists, dates/units where factual, trademarks, and every
explicitly protected term.

Use `assets/translation-record.template.json` to record each target page's
source hash, route, target locale, terminology decisions, QA status, and any
intentional exclusions. The record is not a claim that the translation has been
native-speaker reviewed.

### 3. Translate meaning and voice one way

Draft from the English source and the approved glossary only. Keep the target
language natural for its audience while preserving the source's communicative
effect: a candid invitation remains candid; a punchy fragment may remain
punchy when idiomatic; a joke can be adapted only when the meaning and brand
intent remain intact. Do not introduce Queen's English, inflated formality,
invented claims, or a different brand persona.

When a phrase cannot safely carry over, retain the protected English term,
give a short target-language explanation on first use when needed, and flag the
decision in the record. Do not pretend uncertain wordplay, legal language,
regulated claims, or culture-specific references are solved.

### 4. Verify before a review or handoff

Run the structural gate on the source, target, and job packet:

```text
py -3 scripts/webpage_localization.py verify \
  --source <source.html> --target <target.html> --job <jobs/page-id.fr.json> \
  --target-locale fr
```

The command checks the source fingerprint, target `html[lang]`, tag sequence,
and byte-identical script/style content. Repair structural errors before a
language review. Then apply the four review passes in
`references/translation-rules.md`: meaning, source-voice effect, terminology,
and rendered-page behavior.

Mark a page only as one of `draft`, `agent-reviewed`, `native-reviewed`, or
`blocked`. Without qualified native review, use `agent-reviewed` at most. Do
not report certainty scores as if they prove fluency.

### 5. Keep locales synchronized without autonomous publishing

Read `references/automation-pattern.md` when designing page-creation
automation. A safe trigger detects a changed English source, creates or updates
a job record, runs structural checks, and opens an approval-gated change for
each configured target locale. It must fail closed when source authority,
locale policy, route mapping, glossary, model access, or QA gates are missing.

An agent may generate a draft target artifact only with the site's configured
provider and approval boundary. It must never use an existing target translation
as a prompt source, automatically commit directly to the publishing branch, or
deploy solely because the English page changed.

## Output contract

Return or save, in this order:

1. A source contract: page ID, canonical source path/URL, `en-US` status,
   source hash, and voice observations.
2. A target draft and translation record for each requested locale.
3. A terminology ledger naming protected terms, approved translations, and
   unresolved items.
4. Structural-check output and the four-pass review results, with limitations
   clearly labelled.
5. A refresh/automation status: `ready-for-approval`, `blocked`, or
   `not-configured`. Do not imply publication occurred.

## Resource routing

- Read `references/source-and-voice-contract.md` for the authoritative-source
  and voice-capture method.
- Read `references/translation-rules.md` before every target-language draft or
  QA pass.
- Read `references/automation-pattern.md` only when adding a recurring trigger
  or repository workflow.
- Use `assets/site-localization-config.template.json` and
  `assets/translation-record.template.json` as the site-owned configuration
  and per-page provenance records.
- Run `scripts/webpage_localization.py --help` for the deterministic HTML
  planning and verification interface.

## Evaluation and release

`evals/evals.json` contains normal, voice-preservation, and safety-boundary
cases. Its status is `design-ready`: structural tests were run locally, but no
fresh isolated model benchmark or unseen release holdout has been run. Evaluate
the current version before claiming measured translation-quality uplift.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
