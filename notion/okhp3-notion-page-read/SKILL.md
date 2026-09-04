---
name: okhp3-notion-page-read
description: >
  Read Notion page and document content: fetch a page, traverse block
  children, paginate long pages, recover truncated subtrees, and extract the
  page body as faithful markdown. Use when the user asks to read, open,
  summarize, or extract the content of a Notion page, doc, wiki page,
  subpage, or block. Does not read database rows or filtered lists (use
  okhp3-notion-query) and does not produce an external file (use a wave-3
  egress skill).
license: MIT
compatibility: Requires an active Notion MCP or REST connection via okhp3-notion-core.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Fetching page properties and content, block-children traversal and pagination, truncation recovery, markdown extraction."
  out_of_scope: "Database row retrieval (okhp3-notion-query), workspace-wide keyword search (okhp3-notion-search-strategy), writing content (okhp3-notion-page-write), or producing an external file artifact."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-page-read

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Reads a Notion page's properties and content faithfully. Always load `okhp3-notion-core` first.

## Scope

| In scope | Out of scope |
|---|---|
| Page properties, block content, traversal, pagination, truncation recovery, markdown extraction | Database rows or filtered lists (`okhp3-notion-query`). Workspace-wide keyword discovery (`okhp3-notion-search-strategy`). Writing anything (`okhp3-notion-page-write`). Producing a downloadable external file |

## Procedure

1. **Resolve the target.** Load `okhp3-notion-identity-resolution` if the reference is a URL, bare UUID, or title rather than an already-confirmed page ID.
2. **Fetch properties, then content separately.** `GET /v1/pages/:id` (or the equivalent fetch tool) returns page **properties**, not body content. Content requires a separate call to retrieve block children using the page ID as the block ID.
3. **Traverse block children with pagination.** Each block response includes `has_children`; recurse into any block reporting `true` to retrieve nested content. List and pagination responses include `has_more` and `next_cursor` - follow the cursor until `has_more` is `false`. Do not assume a single page of children is the whole document.
4. **Recover truncated subtrees.** If a fetch reports `truncated: true`, it includes `unknown_block_ids` (up to 50) and `unknown_block_count`. Re-fetch each listed ID directly to pull that specific subtree; do not treat a truncated response as the complete page. If a re-fetch of a specific ID returns `object_not_found`, treat that as a **permissions signal** (the block exists but is not accessible to this connection), not proof the block was deleted.
5. **Extract as markdown.** Preserve heading levels, list nesting, checkbox state, code block language tags, table structure, and inline annotations (bold, italic, code, strikethrough, color). Preserve page and user mentions as their resolved display text plus the underlying reference, not as opaque IDs. Preserve inline equations and links.
6. **State what was and was not retrieved.** If the page exceeded a practical size and only a summary was extracted, say so explicitly rather than presenting a partial read as complete.

## Common issues

| Symptom | Cause | Handling |
|---|---|---|
| Page fetch returns no content | Content lives in block children, not page properties | Fetch block children separately, per Step 2 |
| Nested toggle or synced block content missing | `has_children` was not checked, or was true but not recursed | Recurse on every block reporting `has_children: true` |
| Response looks cut off | `truncated: true` was present and ignored | Follow `unknown_block_ids` per Step 4 |
| Mentions render as raw IDs | Rich text was read via a path that does not resolve mentions (for example, SQL-mode output from a different skill) | Page content read through this skill's fetch path resolves mentions normally; if content arrived via `okhp3-notion-query` SQL mode instead, re-read it through this skill |

## Output contract

Report: the resolved page ID and title, whether the read was complete or partial (with `unknown_block_count` if truncated), and the extracted markdown. Never silently drop a block type this skill does not know how to render - note it as an unsupported block type with its raw type name instead.

## Tooling

`scripts/check_markdown_fidelity.py` lints extracted markdown for known extraction-failure signatures before it is presented as a faithful read: bare UUID-shaped tokens outside code fences (likely unresolved mentions), a literal `[object Object]`, empty output, unbalanced code fences, and heading-level jumps.

```
python3 scripts/check_markdown_fidelity.py --file extracted.md
python3 scripts/check_markdown_fidelity.py --self-test
```

It is a lint against known failure signatures, not proof of a complete or faithful read - a clean result does not by itself confirm nothing was lost.

## Validation loop

Plan which page and which traversal depth are needed, fetch and validate that `truncated` is false (or recover every listed subtree), then verify the extracted markdown with `check_markdown_fidelity.py` and confirm it preserves headings, lists, and mentions before presenting it as the page's content.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
