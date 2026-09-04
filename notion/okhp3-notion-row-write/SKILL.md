---
name: okhp3-notion-row-write
description: >
  Create or update Notion database rows: schema-first property mapping,
  select and status option handling, relation and people writes, and
  idempotent upsert against a stable key. Use when the user wants to add,
  update, or upsert a record, entry, or row in a Notion database. Does not
  change the schema to fit new data (use a wave-2 schema-migration skill)
  and is not for high-volume bulk loads of thousands of rows.
license: MIT
compatibility: Requires an active Notion MCP or REST connection via okhp3-notion-core.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.1"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Single-row and small-batch row create/update against a resolved data source's actual schema, idempotent upsert."
  out_of_scope: "Changing schema to accommodate new data (a wave-2 schema-migration skill). Multi-thousand-row bulk loads (a wave-3 bulk-data-ops skill). Deleting or archiving rows (okhp3-notion-destructive-ops)."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-row-write

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Creates and updates Notion database rows against their actual, fetched schema. Always load `okhp3-notion-core` first, and `okhp3-notion-identity-resolution` if the data source is not yet confirmed.

## Scope

| In scope | Out of scope |
|---|---|
| Single-row and small-batch create/update, property mapping, idempotent upsert | **If a property is missing, this skill stops and routes to schema-migration rather than inventing a field.** Volume beyond a few dozen rows routes to a future bulk-data-ops skill. Deletion is `okhp3-notion-destructive-ops` |

## The rule: schema-first, always

1. Resolve the target **data source** (never a bare `database_id` - see `okhp3-notion-core` Step 4).
2. Fetch its schema (`GET /v1/data_sources/:id`) before constructing any write payload. Read the exact property names, types, and - for select/status/multi-select - the exact allowed option names.
3. Map only fields the fetched schema actually supports. **If the data the user wants to write includes a field the schema does not have, stop and tell the user this requires a schema change - do not silently drop the field, and do not guess a property name that "should" exist.** Route to a schema-migration skill (wave 2) for that decision.
4. Use the schema's title property by its actual name, not an assumed `"Name"` or `"Title"`.

## Minimal property-type table (wave 1)

The full Notion property-type system (formula semantics, rollup aggregation, every write-value shape) is deferred to a wave-2 `property-type-mapping` skill. This skill handles the common write shapes directly:

| Property type | Write value shape |
|---|---|
| `title` | `{"title": [{"text": {"content": "..."}}]}` |
| `rich_text` | `{"rich_text": [{"text": {"content": "..."}}]}` - or a Notion-markdown string where the tool supports it |
| `select` | `{"select": {"name": "<exact existing option name>"}}` |
| `status` | `{"status": {"name": "<exact existing option name>"}}` |
| `multi_select` | `{"multi_select": [{"name": "..."}, ...]}`, max 100 options per write |
| `date` | `{"date": {"start": "YYYY-MM-DD", "end": null}}` |
| `checkbox` | `{"checkbox": true|false}` |
| `number` | `{"number": <value>}` |
| `url` / `email` / `phone_number` | `{"url": "..."}` etc., each subject to its own length cap (2000 / 200 / 200 chars) |
| `people` | `{"people": [{"id": "<user-id>"}, ...]}`, max 100 per write |
| `relation` | `{"relation": [{"id": "<page-id>"}, ...]}`, max 100 per write. **Send only `data_source_id`-scoped relation targets - never send a bare `database_id` in a relation write under 2025-09-03** |

For `formula`, `rollup`, or any other type not listed above, these are computed or read-mostly properties in most schemas - confirm with the fetched schema whether direct writes are even accepted before attempting one, and if the type is genuinely unfamiliar, say so rather than guessing the payload shape.

## Idempotent upsert

Default to upsert unless the user explicitly wants a guaranteed new row:

1. Query (`okhp3-notion-query`, rows mode) for an existing row matching a stable key - a unique identifier, or a combination of fields the user confirms is unique enough.
2. If exactly one match: update it.
3. If no match: create.
4. If multiple matches: stop and ask which one, or whether a new row is actually intended. Never silently pick one.

## Chunking and limits

Property write limits apply per request regardless of what the property could hold over time: 100 multi-select options, 100 relation targets, 100 people. For more than a handful of rows in one request, load `okhp3-notion-limits-and-retry` to chunk and pace the batch. This skill is not the right tool for a load of hundreds or thousands of rows - that is bulk-data-ops territory (not yet built; report the limitation if asked for genuine volume).

## Block-limit awareness

Row creation creates a block (the row's page). It is subject to the Free-workspace block-creation limit (enforced from 2026-09-08). A property-only **update** to an existing row does not create a block and remains available even after the limit is reached.

## Output contract

Report: the resolved data source, whether the operation was create, update, or upsert-resolved-to-one-or-the-other, the exact properties written, and confirmation via re-fetch that the write landed as intended. If a field was rejected because the schema does not support it, name the field and state that a schema change is required rather than reporting generic failure.

## Tooling

`scripts/validate_row_payload.py` checks a candidate write payload against the fetched schema and this file's minimal property-type table **before** the write is sent. It catches: a field the schema does not have, a wrong write-value shape (a bare string where `{"select": {"name": ...}}` is required, a string where `checkbox` needs a real boolean), an over-100-item array, and the `database_id`-in-a-relation-write violation this family flags as the single most common cross-cutting mistake.

```
python3 scripts/validate_row_payload.py --schema schema.json --payload payload.json
python3 scripts/validate_row_payload.py --self-test
```

`schema.json` accepts either a plain `{"PropertyName": "type"}` map or the raw `properties` object returned by `GET /v1/data_sources/:id`. Run this after fetching the schema (Step 2) and before sending the write - a nonzero exit means stop and fix the payload, not retry it unchanged.

## Validation loop

Plan the property map against the fetched schema, validate every field name and option value exists (`validate_row_payload.py` or the equivalent manual check) before sending the write, execute the create/update/upsert, then verify by re-fetching the row and confirming each written property matches what was intended.

## Validation loop

Plan the property map against the fetched schema, validate every field name and option value exists before sending the write, execute the create/update/upsert, then verify by re-fetching the row and confirming each written property matches what was intended.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
