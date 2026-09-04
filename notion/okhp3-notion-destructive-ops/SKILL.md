---
name: okhp3-notion-destructive-ops
description: >
  The only okhp3-notion-* skill authorized to remove Notion content. Archive,
  trash, restore, or permanently delete pages, blocks, databases, data
  sources, and rows, with blast-radius estimation and an explicit
  confirmation gate before any irreversible step. Use when the user asks to
  delete, trash, archive, remove, or restore a Notion page, block, database,
  or row. Does not decide what should be deleted (that is workspace hygiene
  analysis) and does not remove a schema property from a live data source
  (use a wave-2 schema-migration skill).
license: MIT
compatibility: Requires an active Notion MCP or REST connection via okhp3-notion-core.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Archive, trash, restore, and permanent delete of pages, blocks, databases, data sources, and rows, with confirmation and blast-radius estimation."
  out_of_scope: "Deciding what should be deleted (a governance/hygiene skill's job). Removing a property definition from a live schema (a schema-migration skill). Any create, read, or update operation."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-destructive-ops

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

**This is the only skill in the `okhp3-notion-*` family authorized to remove content.** No other skill in this family archives, trashes, restores, or permanently deletes anything - every one of them hands off here explicitly rather than acting. Always load `okhp3-notion-core` first, and `okhp3-notion-identity-resolution` to confirm the target's exact type before touching it.

## Scope

| In scope | Out of scope |
|---|---|
| Archive, trash, restore, permanent delete of pages, blocks, databases, data sources, rows | Deciding **what** should be removed - that is a workspace-hygiene or audit skill's job, and this skill never initiates a removal on its own judgment. Removing a **property definition** from a live schema without touching the entity itself is schema-migration, not this skill |

## The confirmation gate

Before any irreversible step:

1. **Resolve and confirm the exact target.** Use `okhp3-notion-identity-resolution` to confirm entity type. A page and a data source can look identical in casual conversation ("delete the tasks thing") - never guess.
2. **Estimate blast radius before acting.** Fetch the target's children: for a page, its child pages, databases, and blocks; for a database, its data sources and their row counts; for a data source, its row count and any relations pointing into it from elsewhere. State this explicitly: "this will also remove N child pages and M rows" - never perform a removal whose downstream scope was not surfaced first.
3. **State exactly what will happen and ask for explicit confirmation**, distinguishing:
 - **Archive/trash** - recoverable. The item moves to Notion's trash and can be restored through the UI or the restore operation below, subject to the workspace's retention window.
 - **Permanent delete** - not recoverable through this skill or the API. Notion's UI-level "delete forever" is a separate, stronger action than the API's archive operation; confirm which the user actually means, because "delete" in casual language usually means archive/trash, not permanent removal.
4. **Never treat a batch instruction as blanket authorization.** "Clean up my old pages" is not consent to delete anything - it is, at most, consent to identify candidates (route to a hygiene skill) and then present them for a second, specific confirmation before this skill acts.
5. Proceed only after explicit, specific confirmation naming the actual target.

## Mechanics

- **Archive a page:** `PATCH /v1/pages/:id` with `{"archived": true}` (or `in_trash: true`, depending on API surface version - confirm the field the connected client expects).
- **Restore:** the inverse update (`archived: false` / `in_trash: false`), or the client's dedicated restore/undelete operation where offered.
- **Archive a data source:** `PATCH /v1/data_sources/:id` with `in_trash: true`. This is schema-source-level; it does not delete the parent database if other data sources remain.
- **Blocks:** `DELETE /v1/blocks/:id` moves the block to trash (recoverable), it does not purge it outright.
- **Rows:** a database row is a page - archiving it follows the page-archive path above, scoped to that row's page ID.

Reads, non-destructive edits, and this skill's own operations are **not** subject to the Free-workspace block-creation limit - deletion does not create blocks. Do not apply block-limit handling logic here; that only matters for the writing skills.

## What this skill will not do

- It will not infer that "old," "unused," or "duplicate" content is safe to remove. That judgment belongs to a workspace-hygiene skill, which produces a list; this skill only ever executes a **specific, already-identified, already-confirmed** target.
- It will not chain a delete immediately after a search or query result without an intervening confirmation step, even if the user's original request sounded broad.
- It will not remove a property from a live schema. A property-level change (retype, rename, remove a field while keeping the data source) is a schema-migration operation, not an entity-lifecycle operation, and belongs to a wave-2 skill.

## Output contract

Report: the exact target confirmed, the blast-radius estimate presented before the action, the specific operation performed (archive/trash, restore, or permanent delete), and a re-fetch or trash-listing confirmation that the state matches what was requested. If confirmation was not given, report that nothing was removed and restate what would happen if the user confirms.

## Tooling

`scripts/blast_radius_report.py` formats Step 3's confirmation message from a structured target description (entity type, title, operation, and child/row/relation counts), so the archive-versus-permanent-delete wording and blast-radius statement are consistent every time rather than freehand per call. It is a formatter, not a decision-maker - it never decides whether to proceed, and it fails loudly if a required field (including the child/row counts Step 2 requires you to have already fetched) is missing rather than silently treating an unfetched count as zero.

```
python3 scripts/blast_radius_report.py --file target.json
python3 scripts/blast_radius_report.py --self-test
```

## Validation loop

Plan the exact target and blast radius (build the confirmation with `blast_radius_report.py` once child/row/relation counts are fetched), present it for confirmation, execute only the confirmed operation, then verify the result with a re-fetch before reporting success. Never skip the verify step, and never claim a removal succeeded without having re-checked the target's state.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
