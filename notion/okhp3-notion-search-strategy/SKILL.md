---
name: okhp3-notion-search-strategy
description: >
  Find content across a Notion workspace and its connected apps by keyword.
  Chooses between workspace search and AI search, applies creator, date,
  teamspace, title-only, and content-status filters, respects the
  search-specific rate limit, and routes around plan-gated filters. Use when
  the user wants to find, locate, or look up a page, database, or piece of
  content by name or topic without already knowing where it lives. Does not
  query structured rows from a known database (use okhp3-notion-query) and
  does not enumerate everything that exists (use a wave-2/3
  workspace-inventory skill).
license: MIT
compatibility: >
  Requires an active Notion MCP or REST connection via okhp3-notion-core.
  Searching connected apps (Slack, Drive, GitHub, Jira, Teams, SharePoint,
  OneDrive, Linear) requires Notion AI on the workspace.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Keyword and semantic search across Notion and connected apps, filter selection, plan-gate awareness, result triage."
  out_of_scope: "Querying a known data source with filters and sorts (okhp3-notion-query). Full workspace enumeration regardless of a query (a later governance skill)."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-search-strategy

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Finds content by keyword or topic when the user does not already know where it lives. Always load `okhp3-notion-core` first.

## Scope

| In scope | Out of scope |
|---|---|
| Keyword/semantic search across Notion and connected apps, filter selection, plan-gate routing | Filtering and sorting rows in a **known** data source (`okhp3-notion-query`). Enumerating everything that exists regardless of a search term (a governance-tier skill) |

## Choosing a search backend

- **Workspace search:** faster, Notion-only, supports exact filters and non-relevance sorting (by `last_edited` or `created`).
- **AI search:** semantic, includes connected apps (Slack, Google Drive, GitHub, Jira, Microsoft Teams, SharePoint, OneDrive, Linear). Requires Notion AI on the workspace.
- If the caller does not specify a backend, the default auto-selects AI search when available, otherwise workspace search. Only force a specific mode when the task specifically needs one: force workspace search for exact-filter or non-relevance-sort needs (these cannot combine with AI search), or force AI search when the target is explicitly in a connected app.

## Filters and plan gating

Available on every plan: location scoping (page, data source, or single teamspace), creator, and created-date range.

**Business or Enterprise required** (full Notion MCP): filtering by editor, last-edited date, multiple teamspaces at once, title-only matching, content status, and sorting by date. If `okhp3-notion-core`'s capability map shows these are gated on the current workspace, do not attempt them - fall back to a broader unfiltered search and note the limitation rather than silently dropping the filter and returning misleading results.

An empty query is valid when a filter or a non-relevance sort is supplied instead of keyword text.

## Rate limit discipline

Search carries its own tighter limit: **30 requests/minute**, on top of the general 180/minute MCP ceiling. Never issue parallel search calls - serialize them, and load `okhp3-notion-limits-and-retry` for backoff handling if a search-heavy task is likely to approach this ceiling.

## Result triage

- Search results are **candidates to verify, not conclusions.** Fetch a genuinely important result (via `okhp3-notion-page-read` or the appropriate reader) before treating it as authoritative, especially before using it as the basis for a write.
- Results may include `path` and `verification` fields. A verified page with a recent `verification.expires_at` is a stronger signal than an unverified page with a similar title - but recency alone is a tiebreaker, not proof of authority.
- When multiple plausible matches exist for an ambiguous title, present the candidates with enough distinguishing detail (location, last-edited date, verification state) for the user or calling skill to choose, rather than picking the first result.

## Output contract

Report: which backend was used and why, which filters were applied versus skipped due to plan gating, the result count, and - for each result surfaced to the user - enough context (title, location, last-edited date) to distinguish it from a similarly named alternative. State plainly when zero results likely means the search terms were too narrow versus the content genuinely does not exist.

## Tooling

`scripts/select_search_backend.py` applies "Choosing a search backend" and "Filters and plan gating" as deterministic functions instead of a per-task judgment call. It never silently applies a gated or unrecognized filter.

```
python3 scripts/select_search_backend.py --requested-filters last_edited_date,creator --business-or-enterprise false
python3 scripts/select_search_backend.py --self-test
```

## Validation loop

Plan the backend and filter set with `select_search_backend.py` against the current capability map, validate that no gated filter was silently dropped without a stated limitation, execute the search serialized against the 30/minute search ceiling, then verify any result that matters before treating it as authoritative.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
