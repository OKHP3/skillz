---
name: okhp3-notion-limits-and-retry
description: >
  Dependency-loaded by other okhp3-notion-* skills. Applies Notion's rate
  limits, payload size limits, the Free-workspace block limit, backoff
  policy, chunking strategy, and idempotency discipline to any sequence of
  Notion API or MCP calls. Not intended to be selected directly from a user
  prompt; always loaded by a sibling skill that is about to make more than
  one call or a call at risk of hitting a limit.
license: MIT
compatibility: Requires an active Notion MCP or REST connection via okhp3-notion-core.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: notion
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Pacing, chunking, retry, backoff, and idempotency for Notion calls. Detecting and reporting the block-creation limit."
  out_of_scope: "Deciding what to call. That is always the calling skill's job. Never user-triggered directly. High-volume multi-thousand-row jobs with checkpointing belong to a wave-3 bulk-data-ops skill, not here."
  verified-against: "2026-09-02, Notion API version 2025-09-03"
---

# okhp3-notion-limits-and-retry

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Dependency-loaded reference skill. Owns *how* a sequence of Notion calls is paced and retried, never *what* to call. Always loaded through `okhp3-notion-core` or a sibling that needs it; never select this skill directly from a user request.

## Scope

| In scope | Out of scope |
|---|---|
| Rate-limit pacing, payload chunking, backoff and retry, block-limit detection, idempotency guidance for a bounded sequence of calls | Deciding the operation itself. Multi-thousand-item volume jobs with checkpointing and resumability are out of scope for wave 1 and belong to a future bulk-data-ops skill |

## Rate limit contract

- **Per connection:** average 3 requests/second, brief bursts allowed. Via Notion MCP, stated as 180 requests/minute total across all tool calls.
- **Search specifically:** 30 requests/minute, tighter than the general limit. Never fan out parallel search calls; serialize them.
- **Per workspace:** shared across every connection on that workspace. A caller can be rate-limited while itself under its own connection limit, because another connection consumed the shared budget.
- On `429` (`rate_limited`) or `529` (`service_overload`): read `Retry-After` (integer seconds) and wait at least that long before the next call. If `Retry-After` is absent, use exponential backoff starting at 1 second, doubling each attempt, capped at 30 seconds, plus random jitter of 0–250ms to avoid synchronized retries across parallel workers.
- Retry `500`/`502`/`503`/`504` only for idempotent methods (GET, DELETE) unless the caller has its own idempotency protection (see below). Do not blindly retry a POST or PATCH that may have partially succeeded.
- Set a maximum retry count (5–6 attempts is reasonable) and surface the final error clearly rather than looping silently.
- `additional_data.rate_limit_reason` on a 429 tells you whether it was `public_api_request_rate_limit` (back off this connection) or `public_api_space_request_rate_limit` (the whole workspace is saturated; back off harder and consider spacing out unrelated work too).

## Payload chunking

Respect these caps on every single request, regardless of what the target property or page could theoretically hold:

- Maximum 1000 block elements and 500KB total payload per request.
- Any array of blocks or rich-text objects: 100 elements per request. Split a large append into sequential batches of 100 or fewer.
- Block nesting: maximum 2 levels per append call. Deeper structures need sequential append calls, each targeting the newly created parent.
- Relation and people properties: maximum 100 items added per write. A property can hold far more than 100 over time; the cap is per-request, not per-property-lifetime.

When a caller has more items than one request allows, chunk deterministically (fixed batch size, sequential order) rather than adaptively, so a partial failure is easy to resume from a known offset.

## Block-limit detection (Free workspace, effective 2026-09-08)

Check every write response for `code: "restricted_resource"` with `additional_data.block_limit` present. This is a **plan limit, not a rate limit** - retrying will not help.

- Detect on the `additional_data.block_limit` field, never on message text.
- Report to the user: this Free workspace has used its 1,000-block lifetime allowance, and a workspace owner needs to upgrade the plan (or the operation will work if the workspace has only one member).
- Reads, deletes, non-block-adding edits, a new view on an existing database, a comment without an attachment, and creating an **additional data source** on an existing database (2025-09-03+) all continue to work even after the limit is reached. If a write fails on this code, check whether a non-block-adding alternative accomplishes the same goal before reporting total failure.
- Background template jobs re-check this limit when they actually run, not just at request time. A success response from a page-creation-with-template call does not guarantee the template finished. There is no failure webhook and no public job-status endpoint - poll the page's block children with a timeout instead, and never auto-reapply a template to a partially populated page.

## Idempotency guidance

Notion's write APIs are not inherently idempotent (repeating a create-page call creates a second page). When a caller needs safe retries:

- Prefer **search-then-write**: search or query for an existing match on a stable key before creating, and update the match instead of creating a duplicate.
- For a batch of creates, track which items in the batch already succeeded before a retry, using the response IDs, so a retry after a partial failure only processes the remainder.
- Never retry a `create-pages` or `row-write` call blindly after an ambiguous failure (timeout, 5xx) without first checking whether the write actually landed.

## Output contract

When loaded, state: the pacing plan for the calling skill's sequence of operations, the batch size chosen for any chunked payload, and whether the block-creation limit is a live risk given the current workspace's plan (from `okhp3-notion-core`'s capability map). If a call fails, report the error code, whether it was retried, and the final outcome - never silently swallow a failure.

## Tooling

`scripts/chunk_and_backoff.py` computes the two numbers this skill is most often trusted to get right by hand: the batch plan for a chunked write, and the wait before a retry.

```
python3 scripts/chunk_and_backoff.py plan --items 347 --batch-size 100
python3 scripts/chunk_and_backoff.py backoff --attempt 3
python3 scripts/chunk_and_backoff.py backoff --attempt 1 --retry-after 12
python3 scripts/chunk_and_backoff.py --self-test
```

`plan` enforces the 100-element-per-request cap and errors rather than silently producing an oversized batch. `backoff` implements the documented contract exactly: honor `Retry-After` when present, otherwise exponential backoff from 1s doubling to a 30s cap plus 0-250ms jitter, and flags when an attempt count has exceeded the recommended 5-6 retry ceiling. Use it instead of computing chunk boundaries or backoff delays by hand.

## Validation loop

Plan the batch size and pacing before the first call using `chunk_and_backoff.py plan`, validate the block-limit risk against `okhp3-notion-core`'s capability map, execute the sequence, then verify each response for the error codes in the taxonomy before deciding whether to continue, chunk further, or stop.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
