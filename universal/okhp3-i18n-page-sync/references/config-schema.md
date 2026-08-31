# `i18n/sync.config.json` schema

This is the only file a consuming site needs to add to turn on drift
detection. Its absence is not an error: the script and the GitHub Action
built around it both treat a missing config as "not configured yet" and exit
cleanly. A site can carry this skill and its Action for months before it
ever writes this file.

```json
{
  "schema_version": "1.0",
  "search_index": "assets/data/search-index.json",
  "state_file": "i18n/sync-state.json",
  "in_scope_routes": ["/", "/about/", "/contact/", "/projects/"],
  "target_locales": {
    "fr": {"locale": "fr-FR", "root": "fr", "skill": "okhp3-translation-en-us-fr-fr"},
    "de": {"locale": "de-DE", "root": "de", "skill": "okhp3-translation-en-us-de-de"},
    "es": {"locale": "es-ES", "root": "es", "skill": "okhp3-translation-en-us-es-es"}
  }
}
```

## Fields

- `schema_version`: always `"1.0"` for this script's current contract.
- `search_index`: path, relative to the repository root, to the site's own
  generated search index. The script reads this file's `entries[].url`
  values as the canonical list of real content pages instead of walking the
  filesystem itself, so it inherits whatever the site's own search-index
  builder already treats as a page. It does not regenerate this file and
  fails with a clear error if it is missing or stale; run the site's search-
  index builder first.
- `state_file`: path, relative to the repository root, to the persisted
  drift ledger this script maintains. Commit this file. It is what lets the
  script tell "not yet translated" apart from "translated and up to date"
  apart from "translated, but the English source changed since."
- `in_scope_routes`: optional. When present, only these exact route strings
  (matching the search index's `url` values, e.g. `"/about/"`) are ever
  checked. Every other page on the site is invisible to this script and can
  never fail a check or show up as drift. Omit this field only when the
  intent is genuinely full-site coverage; for a pilot or a partial rollout,
  list the routes explicitly and add to the list only when a route is
  deliberately brought into scope. This is what keeps the GitHub Action
  fast and honest during a partial rollout instead of failing CI over
  content nobody has decided to translate yet.
- `target_locales`: one entry per target locale, keyed by a short local
  name (`fr`, `de`, `es`, ...). Each entry needs:
  - `locale`: the BCP-47 target locale tag, e.g. `fr-FR`.
  - `root`: the site-relative directory that holds that locale's pages,
    e.g. `fr`. The script also uses every configured `root` to recognize
    and exclude already-localized URLs (`/fr/...`) from its own English
    source discovery, so a target locale never gets mistaken for an
    additional English page.
  - `skill`: the exact-pair `okhp3-translation-en-us-<pair>` skill that
    owns drafting or updating this locale. The drift report names it
    directly next to every flagged route so the next step is unambiguous.

## The ledger (`i18n/sync-state.json`)

Generated and maintained only by this script's `--adopt` mode. Structure:

```json
{
  "schema_version": "1.0",
  "pages": {
    "/about/": {
      "targets": {
        "fr": {"synced_source_sha256": "...", "target_sha256": "..."}
      }
    }
  }
}
```

`synced_source_sha256` is the hash of the English source file the target was
last confirmed against. When the current English source hash no longer
matches, the route is `stale`. `target_sha256` is metadata only; it is not
used to decide drift, so a human or agent improving the translated wording
without touching the English source never triggers a false stale flag.

## Bootstrapping an existing locale

A site that already has translated pages before this skill was added (for
example, a completed pilot) has no ledger yet. Run:

```bash
python3 scripts/i18n-page-sync.py --root . --mode adopt
```

once. This records every existing target-locale page's current state as the
confirmed baseline without touching any content. From then on, `--check` in
CI only fails on genuine drift: a new in-scope English page with no
translation yet, or an in-scope English page whose source changed after its
translation was last confirmed.

## After a translation is drafted or updated

Whoever completes the actual translation (a human, or an agent running the
matching `okhp3-translation-en-us-<pair>` skill) should run:

```bash
python3 scripts/i18n-page-sync.py --root . --mode adopt --routes "/about/"
```

to confirm the ledger against the new content. This script never performs
that adoption automatically as a side effect of `--check`, so a CI run can
never silently mark drift as resolved.
