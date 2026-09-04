---
name: okhp3-notion-core
description: >
  Load first for any Notion task. Negotiates which Notion surface and tools are
  actually available (hosted MCP, REST API, or the ntn CLI), pins the API
  version, enforces the mandatory database-to-data-source resolution rule, and
  applies Notion's error taxonomy before any other Notion skill runs. Use when
  a task involves Notion pages, databases, data sources, blocks, or the Notion
  API or MCP in any way. Performs no read, write, or delete of its own; it is
  never the final answer to a user request.
license: MIT
compatibility: >
  At least one of: a Notion MCP server connection, a Notion integration token
  (NOTION_API_TOKEN) for REST calls, or the ntn CLI. Degrades to report-only
  guidance when none is available.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Surface negotiation, capability-map reading, API version pinning, database/data-source resolution rule, error taxonomy, and routing to sibling skills."
  out_of_scope: "Performing any Notion read, write, query, or delete operation directly. That belongs to a Tier 1+ sibling skill."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-core

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Foundation for the entire `okhp3-notion-*` family. Every Notion task starts here, even when it ends in a domain skill. This mirrors how `okhp3-mermaid-core` anchors the Mermaid family: core carries the cross-cutting contract, domain skills carry the vocabulary.

This skill performs **no Notion operation**. It decides how to talk to Notion, then hands off. If you find yourself about to call a Notion tool from inside this skill, stop and route to the sibling that owns that object type.

## Scope

| In scope | Out of scope |
|---|---|
| Surface detection, capability-map reading, API version pinning, database/data-source resolution rule, error taxonomy, portability fallback | Any actual page read/write, row read/write, search, query, or delete. Those belong to Tier 1+ siblings |

## Step 1: Detect the available surface

Notion is reachable through three incompatible surfaces. A user's environment may offer one, two, or all three. Check in this order and record which is active:

1. **Hosted Notion MCP** (`notion-*` tool prefix, e.g. `notion-search`, `notion-fetch`, `notion-create-pages`). OAuth session, acts as the connected human user's full permissions.
2. **REST-shaped MCP or direct REST** (`API-*` tool prefix or raw `https://api.notion.com` calls). Integration bot token via `NOTION_API_TOKEN` or equivalent. Requires the `Notion-Version` header on every call.
3. **`ntn` CLI** (self-documenting: `ntn api ls`, `ntn api <path> --help`, `ntn pages get`, `ntn files`, `ntn workers`). Auth via `NOTION_API_TOKEN` or `ntn login`. This surface is maintained by Notion itself at `makenotion/skills` and should be used directly rather than re-implemented; do not restate its command reference here.

If none of the three is available, switch every downstream skill to **report-only mode**: produce the exact payload, Markdown, or property map the user would need to execute manually, and say so explicitly. Do not fabricate a fallback destination or invent an ID.

## Step 2: Read the capability map before calling anything

Both hosted-MCP and REST surfaces can report which tools are actually usable on the current plan. Read it once per session and cache the result for downstream skills.

- Hosted MCP: call `fetch` (or the client's `notion-fetch` equivalent) with `id: "self"`. The response includes `self.current_tool_access`, a map of base tool names (no `notion-` prefix, hyphens become underscores) to one of:
 - `available` - call it normally.
 - `available_with_limit` - call it, but expect metering; see `references/data-model-and-limits.md`.
 - `upgrade_required` - carries `upgrade_url`. Do not call it; tell the user what plan tier is required.
 - `plan_required` - carries `landing_page_url` and `landing_page_action`. Same handling as `upgrade_required`.
 - `not_enabled` - do not call it, and do not retry. This is a workspace configuration state, not a transient error.
- REST surface: call `GET /v1/users/me` (or the `API-get-self` equivalent) to confirm the bot identity and `workspace_limits`. The REST surface does not expose a capability map as rich as MCP's; assume standard plan limits unless told otherwise.

**Route away from any tool reporting `upgrade_required`, `plan_required`, or `not_enabled` before attempting to call it.** A silent dead end wastes a turn and confuses the user. State the gate plainly instead: "this workspace's plan does not currently support X."

## Step 3: Pin the API version

The Notion API had a non-backwards-compatible break at version `2025-09-03` (the multi-source-database split, see Step 4). Every REST or REST-shaped call must send `Notion-Version: 2025-09-03` or later. Hosted MCP manages this server-side; do not send the header there.

If a tool, script, or example anywhere in this family shows an older version pinned (`2022-06-28` or similar), treat it as stale and correct it. See `references/data-model-and-limits.md` for exactly what changed and why an unpinned connection silently breaks.

## Step 4: The mandatory database-to-data-source resolution rule

This is the single highest-value discipline in the whole family, and it is unenforced anywhere else in the landscape (see the family's Phase 1 research for the audit).

**Never call a create, query, update, or relation operation against a `database_id` directly.** A database is a container for one or more **data sources**, and most operations now require a `data_source_id`. The two ID types are not interchangeable.

Before any schema or row operation:

1. Fetch the database (`GET /v1/databases/:id`, or the hosted-MCP `fetch` on the database URL/ID).
2. Read its `data_sources[]` array.
3. If there is exactly one data source, that is almost always the correct target - but do not assume this stays true. A user can add a second data source to an existing database at any time.
4. Use the resolved `data_source_id` for every downstream schema, query, create, or relation call.

Failure mode if this rule is skipped: if the workspace owner adds a second data source to a database, calls using the bare `database_id` silently disappear from search results and fail on create, read, write, and query. This is not a hypothetical; it is the documented behavior of an unpinned or undiscovered connection.

Full data-source mechanics (relation ID rules, search filter changes, webhook renames) are in `references/data-model-and-limits.md`. Load it whenever a skill is about to touch schema, properties, or relations.

## Step 5: Apply the error taxonomy

Every Notion error carries a `code` field. Branch on the code, never on the message string, because message text is not a stable contract.

| Code | HTTP | Meaning | Handling |
|---|---|---|---|
| `rate_limited` | 429 | Per-connection or per-workspace rate limit exceeded. `additional_data.rate_limit_reason` distinguishes them | Respect `Retry-After`. Route to `okhp3-notion-limits-and-retry` |
| `service_overload` | 529 | Notion temporarily overloaded | Same backoff handling as 429 |
| `restricted_resource` with `additional_data.block_limit` | 403 | Free-workspace block-creation limit reached (new enforcement, effective 2026-09-08) | Do not retry. Tell the user this is a plan limit, not a transient failure. See `references/data-model-and-limits.md` |
| `restricted_resource` without `block_limit` | 403 | Ordinary permission failure | Report the missing permission; do not retry |
| `object_not_found` | 404 | Resource does not exist, or exists but is not shared with this connection | On a retry after a truncation recovery, treat this as a **permissions signal**, not a bug |
| `validation_error` | 400 | Payload does not match the expected schema | Fix the request; do not retry unchanged |
| `conflict_error` | 409 | Data collision during a transaction | Re-fetch current state before retrying |

## Portability and privacy contract

Every skill in this family inherits these two rules from `okhp3-notion-capture-router`, promoted here so no child has to restate them:

- **Portability:** never assume a specific workspace, page hierarchy, database naming convention, or account. Resolve destinations at runtime from user input, connector search, or project configuration, never from a hardcoded ID.
- **Privacy:** never write a real workspace ID, page ID, data-source ID, integration token, or workspace structure into a committed repository file. Runtime anchors belong in the user's environment, prompt, connector context, or an ignored local file.

## Output contract

`core` itself produces no user-facing output beyond a routing decision. When invoked, state: which surface is active, what the capability map allows, and which sibling skill the request routes to. If no surface is available, state that explicitly and offer report-only mode.

## Tooling

`scripts/classify_notion_error.py` turns Step 5's taxonomy table into a callable classifier so every sibling branches on the same logic instead of re-deriving it from message text. Feed it a raw error payload (`--file`, `--json`, or `--stdin`); it returns `category`, whether to `retry`, and the exact action to take. Run `python3 scripts/classify_notion_error.py --self-test` to verify the script's own logic still matches this file's table after any edit to either one. No network access, no external dependencies.

## Reference loading

- `references/data-model-and-limits.md` - full 2025-09-03 data-source mechanics, rate and size limits, the block-limit enforcement, and what the API genuinely cannot do. Load whenever a downstream skill is about to touch schema, properties, relations, or a bulk operation.
- `references/instruction-venues.md` - the Notion Agent vs Custom Agent vs Notion Skill vs Agent Skill disambiguation table. Load when a request is about *where a workflow should live* rather than a direct CRUDq operation; hand off to `okhp3-notion-agent-boundary` for the full routing decision.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
