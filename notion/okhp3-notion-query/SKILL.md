---
name: okhp3-notion-query
description: >
  Query Notion database rows and filtered lists from a known data source: SQL
  mode, rows mode, saved-view mode, filter and sort syntax, plan metering,
  mention-resolution limits, and rich-text fidelity caveats. Use when the
  user wants rows, records, or a filtered/sorted list from a Notion
  database, or to run a saved view. Does not find content by keyword across
  the workspace (use okhp3-notion-search-strategy), does not read page body
  content (use okhp3-notion-page-read), and does not write anything.
license: MIT
compatibility: >
  Requires an active Notion MCP or REST connection via okhp3-notion-core.
  SQL mode across multiple data sources or above the metered allowance
  requires Business/Enterprise with Notion AI.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Reading database rows via SQL mode, rows mode, or a saved view's own filters and sorts, against a resolved data source."
  out_of_scope: "Workspace-wide keyword discovery (okhp3-notion-search-strategy). Page body content (okhp3-notion-page-read). Any write, update, or delete."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-query

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Reads rows from a **known** Notion data source. Always load `okhp3-notion-core` first, and `okhp3-notion-identity-resolution` if the data source is not yet a confirmed ID.

## Scope

| In scope | Out of scope |
|---|---|
| SQL mode, rows mode, saved-view mode against a resolved data source | Finding content by keyword (`okhp3-notion-search-strategy`). Page body content (`okhp3-notion-page-read`). Any write (`okhp3-notion-row-write`) |

## The mandatory prerequisite

Every query targets a **data source**, never a bare `database_id`. If the caller has only a database reference, resolve it first: fetch the database, read `data_sources[]`, and use the correct `data_source_id`. This is `okhp3-notion-core`'s Step 4 rule, restated here because it is the most common failure point in query work specifically.

## Three modes

| Mode | Use when | Cost model |
|---|---|---|
| **View mode** | The user wants exactly what a saved view already shows | Free on every plan, no tool-specific quota |
| **Rows mode** | Simple filter/sort against one data source, no custom aggregation needed | Metered on non-Business/Enterprise plans, shares an allowance with single-data-source SQL |
| **SQL mode** | Complex joins, aggregation, or multi-data-source queries | Unlimited only on Business/Enterprise with Notion AI. Metered elsewhere for single-data-source use; multi-data-source SQL requires the unmetered tier |

Prefer view mode or rows mode by default. Reach for SQL mode only when the query genuinely needs aggregation, joins across data sources, or logic rows mode cannot express - not as a default habit, because it burns the metered allowance faster on constrained plans.

Check `okhp3-notion-core`'s capability map before choosing SQL mode across multiple data sources; if the plan does not support it, fall back to sequential rows-mode or view-mode calls against each data source individually and combine the results in-context instead.

## Rows mode specifics

`limit` defaults to 50, maximum 100 per call, and returns **no cursor** - there is no built-in pagination for rows mode. For a data source larger than 100 matching rows, either narrow the filter or fall back to SQL mode with explicit `LIMIT`/`OFFSET` pagination.

## SQL mode caveats - read before trusting output

- **SQL-mode output can silently omit mention text, link targets, and rich-text formatting.** This is a documented limitation, not corruption. Never conclude a rich-text property is damaged based on SQL output alone - verify with rows mode or a direct fetch before acting on it, and especially before any downstream write based on what looked like missing content.
- A query resolving more than **1,000 distinct mention targets** errors outright rather than returning partial rich text. If this happens, narrow the query (fewer rows, fewer mention-heavy columns) rather than retrying unchanged.
- Checkbox values in SQL mode use the literal strings `"__YES__"` and `"__NO__"`, not boolean `true`/`false`.
- Always use parameterized queries (`?` placeholders with a `params` array) rather than string-interpolating user-supplied values into SQL text.

## View mode specifics

Pass the view's URL (`view://<uuid>` or the `?v=` form) with `mode: "view"`. This runs the view's own filters, sorts, and grouping exactly as configured in Notion - it does not accept additional ad hoc filters layered on top. To read a view's configuration without running it (to inspect what it filters on), fetch the `view://` reference directly instead of querying it.

## Output contract

Report: which mode was used and why, the resolved data source ID(s), the row count returned versus any limit or metering ceiling hit, and - if SQL mode was used on rich-text columns - an explicit caveat that mentions and formatting may be incomplete in the raw output. Never present SQL-mode rich-text output as a faithful copy without that caveat.

## Tooling

`scripts/lint_sql_query.py` catches the SQL-mode traps in this file before the query is sent: a placeholder/params count mismatch, a likely string-interpolated literal instead of a parameterized value, a `TRUE`/`FALSE` literal where the `__YES__`/`__NO__` checkbox convention may apply, and an unbounded `SELECT *` with no `LIMIT`.

```
python3 scripts/lint_sql_query.py --sql "SELECT * FROM ds WHERE status = ?" --params '["Open"]'
python3 scripts/lint_sql_query.py --self-test
```

It is a heuristic lint, not a SQL parser or a schema-aware type checker - it cannot know a column's real type, so the checkbox-literal finding is always a warning to confirm, not a hard error. Findings exit nonzero; review every one before sending SQL mode.

## Validation loop

Plan the mode (view, rows, or SQL) and the resolved data source before querying, validate an SQL-mode query with `lint_sql_query.py` if used, execute, then verify the row count and any rich-text columns against rows-mode or a direct fetch before treating SQL-mode output as faithful.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
