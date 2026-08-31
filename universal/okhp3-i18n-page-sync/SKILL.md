---
name: okhp3-i18n-page-sync
description: >
  Detect which pages on a static site are missing a translation, or have a
  translation that has fallen behind a changed English source, by reusing
  the site's own generated search index as the page inventory. Reports drift
  and names the exact-pair okhp3-translation-en-us-<pair> skill that owns
  each flagged route. Never drafts, edits, or publishes a translated page
  itself, and never fails a build over a page the site has not declared in
  scope for translation.
license: MIT
compatibility: >
  Any Agent Skills-compatible client, plus a plain GitHub Actions runner.
  Python 3.9+, standard library only. No network access, no paid API, and no
  dependency on any specific static-site generator: it reads one JSON search
  index and compares file hashes.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Deterministic drift detection between an English source page inventory and its configured target-locale counterparts; CI gating; hand-off routing to the correct translation-pair skill."
  out_of_scope: "Performing translation or register mediation itself, discovering pages outside the site's own search index, auto-publishing, or any behavior beyond reporting and an explicit --adopt baseline write."
---

# okhp3-i18n-page-sync

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Keeps a multi-language static site honest about which pages actually have a
current translation, the same way a search-index builder already scours a
site and catalogs every page: this skill reuses that same generated index as
its page inventory rather than inventing a second, competing way to discover
content, and adds one persisted ledger to tell "never translated" apart from
"translated, but the English source moved on since."

It is deliberately a detector, not a translator. Detection is safe to run
unattended in CI on every push; translation is not, because it produces
prose that needs the voice, dictionary, and register-mediation gates the
`language-mediation` family's exact-pair skills already enforce. Keeping
these as two skills, run in sequence, is the same non-negotiable boundary
the `language-mediation` family draws between register mediation and
regional-language translation: detection and translation are two stages,
never one compounded skill.

## Scope

| In scope | Out of scope |
|---|---|
| Reading a site's generated search index as the English page inventory | Crawling the filesystem or a live site to discover pages itself |
| Comparing each in-scope page's source hash against a persisted ledger, per configured target locale | Deciding what "in scope" means; that is an explicit, owner-set config field |
| A read-only `--report`/`--check` mode safe for CI, and an explicit `--adopt` mode that only ever records a baseline | Drafting, editing, or publishing any translated page content |
| Naming the exact-pair `okhp3-translation-en-us-<pair>` skill responsible for each flagged route | Performing that translation itself, or any specialist-register simplification |

## Required inputs

- The site's own generated search index (a JSON file the consuming site already builds, commonly at a path like assets/data/search-index.json; the exact path is set by that site's own `search_index` config field, not fixed by this package), already current. This skill does not build or refresh it.
- `i18n/sync.config.json` in the consuming repository (see `references/config-schema.md`). Its absence is a valid, expected state for a site that has not started translating yet: every mode exits 0 and says so.
- One `okhp3-translation-en-us-<pair>` skill per configured target locale, available to whoever acts on the drift report.

## Procedure

1. Load `i18n/sync.config.json`. If it does not exist, stop here and report "not configured" with exit code 0. This is not an error state.
2. Load the site's search index and take its `entries[].url` values as the candidate page list, excluding any URL containing `#` (a fragment, not a page) and any URL already under a configured target locale's root.
3. If `in_scope_routes` is set, narrow the candidate list to exactly those routes. A route never listed there can never appear in a drift report, no matter how long its translation has lagged. This is what makes a partial pilot rollout safe to run in CI without failing the build over content nobody has committed to translating.
4. For each in-scope English page and each configured target locale, compare the target file's presence and the ledger's recorded `synced_source_sha256` against the page's current source hash to classify it `missing`, `stale`, `needs_baseline` (a translation exists but was never confirmed in the ledger), or `in_sync`.
5. Also report `orphan`: a ledger entry whose English source page no longer appears in the search index at all. This is a warning, not build-breaking drift; a page can be legitimately retired.
6. In `--check` mode (the one wired into CI), exit 1 only when `missing` or `stale` routes exist. `needs_baseline` and `orphan` are surfaced but never fail the build; they need a one-time `--adopt` or a human decision, not an emergency.
7. Never translate. For every `missing` or `stale` route, name the exact `okhp3-translation-en-us-<pair>` skill from the config and stop. Handing that route to the named translation skill, and then confirming the result with `--adopt --routes "<route>"`, is a separate step for a human or a subsequent agent turn — never folded into this skill's own output.

## Format-adapter boundary

This skill assumes a page is exactly the file at `<locale-root>/<route-path>/index.html` (or `index.html` at the site root). A site whose routing does not follow that convention needs its own discovery adapter before this skill's route-to-path mapping applies; this package does not attempt to be a general static-site router.

## Controlled automation

The GitHub Action built around this skill (see `templates/`) runs `--check` on every push and pull request against `main`, and fails the job on real drift so it shows up the same way any other site-validation failure does. It performs no writes, opens no pull request, and calls no external API: the only remediation path out of a failing check is a human or an agent session running the named translation skill and then `--adopt`. This keeps the automation boundary the `language-mediation` family already documents intact: automation may detect and flag, but drafting and publishing stay explicit, reviewed, human-initiated steps.

## Quality and review gates

This skill has nothing to say about translation quality; it only proves that a translated file exists and was confirmed against the current English source. Passing `--check` is not evidence that a translation is accurate, current in tone, or reviewed. Those claims belong entirely to whichever `okhp3-translation-en-us-<pair>` skill produced the page.

## Output contract

Return `Configured` (yes/no), `Missing routes` (route, locale, skill to run), `Stale routes` (route, locale, skill to run), `Needs-baseline routes`, `Orphaned routes`, and `Check result`. When routes are flagged, name the next action explicitly: which translation skill, for which route, followed by `--adopt --routes "<route>"` once that translation lands.

## Resource routing

- Read `references/config-schema.md` before writing or editing a consuming site's `i18n/sync.config.json`.
- Copy `templates/i18n-page-sync-workflow.yml` into a consuming repository's `.github/workflows/` to wire this into CI. It requires no secrets and calls no external service.
- Run `scripts/i18n-page-sync.py --help` before using it directly. Use `--mode report` to preview drift, `--mode check` to verify a repository the way CI does, and `--mode adopt` only once a translation is actually confirmed.

## Evaluation and release

`evals/evals.json` covers missing/stale detection, the never-translates-itself boundary, out-of-scope routes never failing a build, and an unconfigured site being a clean no-op. This is a fully deterministic script over structured JSON and file hashes; its eight-test local suite plus the Foundry structural validator are sufficient evidence for this package. There is no language-quality dimension here requiring a native-review holdout.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
