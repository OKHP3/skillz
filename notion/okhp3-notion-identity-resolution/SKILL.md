---
name: okhp3-notion-identity-resolution
description: >
  Dependency-loaded by other okhp3-notion-* skills. Resolves any Notion
  reference format (full URL, notion.site URL, bare UUID with or without
  dashes, collection:// data-source URL, view:// saved-view URL,
  discussion:// comment-thread URL, or a plain page/database title) to the
  correct entity type and ID, and disambiguates database versus data source
  versus page versus block. Not intended to be selected directly from a user
  prompt; always loaded by okhp3-notion-core or a sibling that needs an ID
  resolved before it can act.
license: MIT
compatibility: Requires an active Notion MCP or REST connection via okhp3-notion-core.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Reference-format detection and entity-type disambiguation for pages, blocks, databases, data sources, views, and discussions."
  out_of_scope: "Fetching or returning entity content. That is okhp3-notion-page-read or okhp3-notion-query. Never user-triggered directly."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-identity-resolution

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Dependency-loaded reference skill. Resolves whatever a user or a sibling skill hands it into a typed Notion ID, and nothing more. Always loaded through `okhp3-notion-core`; never select this skill directly from a user request.

## Scope

| In scope | Out of scope |
|---|---|
| Parsing and classifying Notion references; disambiguating database vs data source vs page vs block | Fetching content. Content retrieval is `okhp3-notion-page-read`; row retrieval is `okhp3-notion-query` |

## Reference formats to recognize

| Format | Example shape | Resolves to |
|---|---|---|
| Standard page/database URL | `https://notion.so/workspace/Page-Title-<32-hex>` | Page or database ID (trailing hex block, dashes optional) |
| Notion Sites URL | `https://<slug>.notion.site/...` | Same resolution path as a standard URL once the underlying ID is extracted |
| Bare UUID | `215d872b-594c-81bd-bea2-0002d0d66c12` or without dashes | Ambiguous by itself - requires a fetch to determine object type |
| Data source URL | `collection://<uuid>` | Data source ID directly. Never pass this to an endpoint expecting a `database_id` |
| Saved view URL | `view://<uuid>` | A specific database view's filters, sorts, and display config, not the underlying rows |
| Discussion/comment URL | `discussion://<uuid>` | A comment thread anchor, for `okhp3-notion-comments-and-discussions` (wave 2) |
| Plain title or name | `"the Tasks database"`, `"Q3 Planning"` | Not directly resolvable. Route to `okhp3-notion-search-strategy` to find candidates, then confirm with the user before proceeding |

## Resolution procedure

1. **Extract the ID.** Strip query parameters and view fragments (`?v=...`) from a URL unless the fragment itself is the target (a `view://` reference). A `?v=` parameter on a database URL still resolves to the **database**, not the view; use `notion-query-data-sources` with `mode: "view"` to read what that view shows.
2. **Classify by prefix or shape.** `collection://` is always a data source. `view://` is always a saved view. `discussion://` is always a comment thread. A bare hex string is ambiguous.
3. **Disambiguate an ambiguous ID with a fetch, not a guess.** Fetching an ID that turns out to be a database returns its `data_sources[]` array - do not treat the database ID as usable for row operations. Fetching an ID that is actually a data source returns `parent` (the database) and `database_parent` (the grandparent page). See `okhp3-notion-core`'s Step 4 for why this distinction is mandatory.
4. **A plain title or name is not an ID.** Never invent a UUID from a title. Route to `okhp3-notion-search-strategy`, present candidate matches, and require confirmation before the calling skill proceeds - unless exactly one unambiguous match exists and the calling skill's operation is read-only.
5. **`object_not_found` on a re-fetch is a permissions signal, not evidence the entity was deleted.** Report this distinction back to the calling skill rather than silently treating it as "does not exist."

## Truncation handling

When a fetch reports `truncated: true`, it includes `unknown_block_ids` (up to 50) and `unknown_block_count`. Each ID in that list can be passed back through this same resolution procedure to pull that specific subtree. Do not treat a truncated response as complete.

## Output contract

Return to the calling skill: the resolved entity type (`page`, `database`, `data_source`, `block`, `view`, `discussion`, or `unresolved`), the canonical ID, and - for a database - its `data_sources[]` list so the caller never has to re-fetch it. If resolution failed or was ambiguous, return the candidate list and a clear statement that confirmation is required before any write.

## Tooling

`scripts/classify_reference.py` implements Steps 1-2 (extract, classify by prefix or shape) as a deterministic function instead of freehand regex per caller. It never calls Notion - it cannot resolve an ambiguous bare UUID to a concrete type, which still requires the fetch in Step 3. Run it on any raw reference string before applying the rest of this procedure:

```
python3 scripts/classify_reference.py "<reference>"
python3 scripts/classify_reference.py --self-test
```

## Validation loop

Plan which format the reference is likely to be, run it through `classify_reference.py` (or the equivalent manual classification) to validate the format and extracted ID, then verify an ambiguous or unresolved result is followed by a fetch or a search-and-confirm step rather than a guess.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
