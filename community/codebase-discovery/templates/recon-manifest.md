# Recon Manifest

> **Last updated:** YYYY-MM-DD
> **Purpose:** Records what fed the recon so later runs can detect staleness. NOT an
> onboarding doc.

## Run info

- **Mode:** full | code-only
- **Scope:** <repo / subsystem>
- **Available inputs:** git history (yes/no) · code-intelligence/LSP server (yes/no) · sub-agents (yes/no) · stakeholder (yes/no)
- **Navigation mode chosen:** grep + sub-agents | code-intelligence/LSP (server: <name>)

## Existing docs read (Phase 0)

| Doc | Path | Last modified |
|---|---|---|
| README | ./README.md | <date> |

## Source files analysed (Phase 1)

<!-- Used by the freshness check on the next run: if a file's hash/timestamp changed since
this run, the knowledge derived from it may be stale. -->

| Path | Hash / last-modified | Area |
|---|---|---|
| src/... | <sha or mtime> | data model / rules / workflow / ... |

## Freshness check log

| Date checked | Files changed since last recon | Action taken |
|---|---|---|
| <date> | <n> | re-recon'd <areas> / none |
