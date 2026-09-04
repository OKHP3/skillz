---
name: okhp3-notion-page-write
description: >
  Create or update Notion pages and document content: page creation, content
  append, targeted search-and-replace, icons and covers, and async handling
  for large writes. Use when the user asks to create, edit, update, append
  to, or restructure a Notion page, doc, wiki page, or subpage. Does not
  write pages whose parent is a database or data source (use
  okhp3-notion-row-write) and does not delete or archive anything (use
  okhp3-notion-destructive-ops).
license: MIT
compatibility: Requires an active Notion MCP or REST connection via okhp3-notion-core.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Standalone page creation, content append, targeted content replacement, icon/cover updates, async writes for large content."
  out_of_scope: "Pages with database/data-source parents (okhp3-notion-row-write). Archiving, trashing, or permanent deletion (okhp3-notion-destructive-ops). Comment threads (deferred to wave 2)."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-page-write

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Creates and edits Notion pages that are not database rows. Always load `okhp3-notion-core` first, and `okhp3-notion-limits-and-retry` for anything writing more than a handful of blocks.

## Scope

| In scope | Out of scope |
|---|---|
| Standalone page creation, block append, targeted replace, icon/cover, async large writes | **If it has properties, it is a row.** Any page whose parent is a database or data source is `okhp3-notion-row-write`, not this skill. Deletion of any kind is `okhp3-notion-destructive-ops` |

## Before writing: read first

Never blind-write to an existing page. Fetch it first (via `okhp3-notion-page-read` or a direct fetch) and record: current title, existing content relevant to the request, child pages or databases, and whether the page functions as a container, a full document, or an index. Preserve child pages and databases unless the user explicitly authorizes removing them.

## Choosing the least destructive operation

| Need | Preferred operation |
|---|---|
| Add new content without disturbing existing content | Append block children (default position: end; or `position: {type: "start"}` / `{type: "after_block", after_block: {id}}`) |
| Correct a specific known passage | Targeted search-and-replace via the update-content command |
| Regenerate content wholesale | Full replacement - only after confirming with the user and checking for child content that would be lost |
| Change only title, icon, or cover | Property/metadata update, no content touched |

## Targeted search-and-replace semantics

The update-content style command applies content-changing search-and-replace operations as a single batch:

- If **any** operation's `old_str` does not match content currently on the page, the entire call fails with a validation error naming the unmatched value, and **the page is left unchanged** - there is no partial application.
- An operation whose `old_str` and `new_str` are identical is silently ignored without a match check.
- Each `old_str` must match exactly **one** location on the page unless `replace_all_matches: true` is explicitly set for that operation.
- Because a batch either fully applies or fully fails, always re-fetch the page immediately before constructing `old_str` values, especially if any time has passed since the last read.

## Minimal block vocabulary (wave 1)

Full markdown round-trip fidelity and the complete Notion block-type catalog are deferred to a wave-2 `block-composition` skill. Until that lands, this skill supports the common cases directly:

- Headings (`#`, `##`, `###`), paragraphs, bulleted and numbered lists, to-do checkboxes, code blocks with a language tag, quotes, dividers, and simple tables.
- Inline formatting: bold, italic, code, strikethrough, links.
- Page mentions: use the `<mention-page url="...">Display Text</mention-page>` form (or the client's equivalent), never a raw page ID pasted as plain text.

For equations, custom-emoji annotations, colored text/backgrounds beyond the default, synced blocks, or any block type not listed above, state the limitation explicitly and offer the nearest supported approximation rather than silently dropping the formatting. This gap closes when `okhp3-notion-block-composition` ships.

## Chunking and async

Block append is capped at 100 blocks per request and 2 levels of nesting; load `okhp3-notion-limits-and-retry` to chunk a larger write into sequential calls. For a single very large write (long document, full page replacement), prefer `allow_async: true` and poll the returned `async_task` handle rather than risking a request-size failure.

## Block-limit awareness

Every operation in this skill **creates blocks** and is subject to the Free-workspace block-creation limit (enforced from 2026-09-08). If a write fails with `code: "restricted_resource"` and `additional_data.block_limit` present, do not retry - report the plan limit to the user per `okhp3-notion-core`'s error taxonomy. A property-only update (icon, cover, title, no content change) is not subject to this limit and remains a viable fallback.

## Output contract

Report: the resolved page ID, the operation performed (create, append, targeted replace, or property update), whether it was synchronous or async (with the poll status if async), and confirmation that a re-fetch after the write matches the intended result. If a search-and-replace batch failed due to an unmatched `old_str`, report exactly which value failed rather than a generic error.

## Tooling

`scripts/lint_search_replace_batch.py` checks a targeted search-and-replace batch before it is sent, catching the two traps in this file's "Targeted search-and-replace semantics" section: a no-op operation where `old_str` equals `new_str`, and a duplicate `old_str` across the batch that makes the intended target ambiguous.

```
python3 scripts/lint_search_replace_batch.py --file batch.json
python3 scripts/lint_search_replace_batch.py --self-test
```

It only inspects the batch's shape - it has no access to live page content, so it cannot confirm an `old_str` actually matches anything. Re-fetching the page immediately before constructing the batch is still required.

## Validation loop

Plan the least destructive operation for the request, validate the payload against the block-vocabulary and chunking limits (and run `lint_search_replace_batch.py` for any targeted replace), execute the write, then verify by re-fetching the page and confirming the change landed as intended.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
