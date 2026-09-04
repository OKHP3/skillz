# Notion Data Model and Limits Reference

Verified against Notion API version `2025-09-03` and Notion MCP documentation, as of 2026-09-02. Re-verify before relying on this for a minor version bump.

## The 2025-09-03 data-source split

A database is now a container for one or more **data sources**. This was a non-backwards-compatible change.

- Most operations that took `database_id` now take `data_source_id`. The two ID types are not interchangeable.
- Discovery: `GET /v1/databases/:id` returns a `data_sources[]` array (each with `id` and `name`). This is the mandatory first step before any schema or row operation - see the parent `SKILL.md`, Step 4.
- `GET /v1/data_sources/:id` is the new home for the property schema. It returns `parent` (the database) and `database_parent` (the grandparent page).
- Create a page under a database: `parent: {type: "data_source_id", data_source_id: "..."}`.
- Query moved to `PATCH /v1/data_sources/:id/query` (was `PATCH /v1/databases/:id/query`).
- Create database: schema goes under `initial_data_source.properties`. Top-level fields (`icon`, `cover`, `title`, `parent`) apply to the database itself.
- Create data source: adds a **second** table to an existing database. Does not create a block, so it still works after the Free-workspace block limit is exhausted (see below).
- Update database handles `parent`, `title`, `is_inline`, `icon`, `cover`, `in_trash`. Update **data source** handles `properties`, `title`, `in_trash`. `cover` is unsupported when `is_inline` is `true`.
- Relation properties: the API response includes both `database_id` and `data_source_id` for convenience, but **the request must contain only `data_source_id`**. Sending `database_id` in a relation write is a validation error under 2025-09-03.
- Search: `filter.value` changed from `"page" | "database"` to `"page" | "data_source"`. A multi-source database returns one search result per data source. The query still matches against the database title, not the data source title.
- Database mentions in rich text still reference the database, not the data source.
- Webhooks: `database.content_updated` → `data_source.content_updated`; `database.schema_updated` → `data_source.schema_updated`; new events `data_source.created`, `data_source.moved`, `data_source.deleted`, `data_source.undeleted`. Every entity with a data-source parent gains `data.parent.data_source_id`.

**Unpinned-connection failure mode:** if a workspace owner adds a second data source to a database, a connection still on an old API version silently loses that database from search results, and create-page, read, write, and query against it all fail with no obvious signal beyond `object_not_found` or `validation_error`.

## Rate limits

- Per connection: average **3 requests/second**, brief bursts allowed.
- Per workspace: shared across all connections on that workspace, scaled to plan. A connection can be limited while itself under the per-connection limit.
- Via Notion MCP specifically: stated as **180 requests/minute** total across all tool calls, with search additionally capped at **30 requests/minute**.
- `429` (`rate_limited`) and `529` (`service_overload`) both require respecting `Retry-After` (integer seconds) plus exponential backoff with jitter on repeat failures. Retry `500`/`502`/`503`/`504` only for idempotent methods (GET, DELETE) unless the caller has its own idempotency protection.
- `additional_data.rate_limit_reason` on a 429 distinguishes `public_api_request_rate_limit` (per-connection) from `public_api_space_request_rate_limit` (per-workspace, shared).
- Full backoff contract (queueing, chunking, checkpointing for bulk work) lives in `okhp3-notion-limits-and-retry`. Load that skill for anything beyond a single call.

## Size and payload limits

Single-request caps: **1000 block elements**, **500KB** total payload. Rich text `content` and any URL: 2000 characters. Equations: 1000 characters. Email, phone: 200 characters. Any array of blocks or rich text objects: 100 elements. Multi-select: 100 options. Relation: 100 related pages per write. People: 100 users per write.

**These cap a single request, not the total a property can hold.** A relation property can contain far more than 100 related pages; the 100-item cap only governs how many you add in one call. Paginate large reads with the Retrieve a Page Property Item endpoint.

MCP-specific: single-part file upload capped at **20 MiB**. Inline attachment text: 200 KiB. URL-download attachments: 5 MiB on free workspaces, 50 MiB on paid, must complete within 60 seconds, no redirects, no private-network addresses. Signed cover/icon URLs expire after **5 minutes** via MCP versus **1 hour** via REST; re-fetch to refresh.

## Free workspace block limit (new enforcement: 2026-09-08)

Free workspaces with **more than one member** have a lifetime cap of **1,000 blocks**. Single-member free workspaces and all paid workspaces are unlimited. Applies to internal connections and workspace-restricted OAuth connections. **Does not apply** to personal access tokens (PATs) or install-anywhere OAuth connections. Notion MCP enforces this separately from the REST API.

- Error shape: HTTP 403, `code: "restricted_resource"`, `additional_data.block_limit: "block_creation"`. Detect on this field, never on message text.
- Retrying does not help - this is a plan limit, not a rate limit. Tell the user a workspace owner needs to upgrade the plan, or that the operation works for single-member free workspaces.
- **Fails after grace expires:** create page, create database (2022-06-28 API version), append block children, update page markdown, update page or block when the update adds blocks, create view when it adds a linked database block, create comment with an attachment.
- **Still works:** create **data source** on 2025-09-03+ (adds no block), all reads, deletes, non-block-adding edits, a new view tab on an existing database, a comment without an attachment.
- A successful write starts a **three-day grace period**. Creation stays available during grace; API enforcement does not restart an expired grace period.
- Background template jobs re-check the limit when they run, not just when scheduled. A success response from `create-pages` with a template does not guarantee the template finished - the target page may end up blank or partially populated. There is no failure webhook and no public job-status endpoint. Do not automatically reapply a template to a partially populated page; that risks duplicating content. Poll block children with a timeout instead.

## What the API genuinely cannot do

- Start a **new** inline discussion thread via the comments API. It can only add a top-level page comment or reply to an existing discussion.
- Edit or delete an existing comment.
- Change a user's workspace permissions or sharing settings (read-only via the API).
- Notion MCP acts with the connected user's **full** permissions - it adds no permission layer of its own. A capability being `available` in `current_tool_access` means the tool can be called, not that the user has access to every object it might touch.

## Search and query plan gating

- Search: filtering by editor, last-edited date, multiple teamspaces, title-only, or content status, and sorting by date, all require full Notion MCP on Business or Enterprise. Other filters work on every plan. Searching connected apps (Slack, Drive, GitHub, Jira, Teams, SharePoint, OneDrive, Linear) requires Notion AI.
- Query: view mode is free on every plan with no tool-specific quota. SQL mode across one or more data sources is unlimited only on Business/Enterprise with Notion AI. Other plans share a per-workspace metered allowance for single-data-source SQL, and "rows" mode draws on that same allowance.
- A query resolving more than 1,000 distinct mention targets errors rather than returning partial rich text.
- SQL-mode output can silently omit mention text, link targets, and rich-text formatting. This is a known limitation, not corruption - verify with "rows" mode or a direct fetch before mutating anything read via SQL.

## Async operations

`create-pages` and `update-page` accept `allow_async: true` for large content, returning an `async_task` handle with `status_url` and `poll_after_seconds`. Poll `get-async-task` until `succeeded` or `failed`. `duplicate-page` is always async. Use async mode whenever writing a large amount of markdown content in one call.

## Tool-name instability

OpenAI-family MCP clients strip the `notion-` prefix from `fetch` and `search` specifically, per the Deep Research spec (they become plain `fetch` and `search`). Do not hardcode a literal tool name anywhere in this family; always resolve through the logical-operation mapping established in `okhp3-notion-core`.
