---
family: notion
display_name: Notion
skill_count: 11
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-09-05T02:49:22Z
---

# notion

This family covers Notion-centered knowledge operations for OKHP3.

Current skill:

| Skill | Purpose |
|---|---|
| `okhp3-notion-capture-router` | Routes AI conversation threads into Notion as Chat Threads plus Extracts, dedupes existing knowledge, and reconciles against OKHP3 GitHub repos. |

## Design rule

Public repo files must not contain private Notion URLs, database IDs, collection IDs, or connector-only resource IDs. Runtime anchors belong in project knowledge, a private prompt block, or a non-committed `routing-anchors.private.md` file.

<!-- FAMILY_SUMMARY_START -->
This family covers Notion-centered knowledge operations for OKHP3.
<!-- FAMILY_SUMMARY_END -->

## Skills (11)

<!-- FAMILY_INVENTORY_START -->
*11 skills &nbsp;·&nbsp; inventory last updated: **September 5, 2026 at 02:49 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-notion-agent-boundary](okhp3-notion-agent-boundary/SKILL.md) | Decide where a repeatable Notion-related workflow should live: the in-app Notion Agent, a Notion ... | 1.1.0 |
| [okhp3-notion-capture-router](okhp3-notion-capture-router/SKILL.md) | Use this skill whenever an agent needs to export, capture, ingest, summarize, route, deduplicate,... | 0.4.0 |
| [okhp3-notion-core](okhp3-notion-core/SKILL.md) | Load first for any Notion task. Negotiates which Notion surface and tools are actually available ... | 1.1.0 |
| [okhp3-notion-destructive-ops](okhp3-notion-destructive-ops/SKILL.md) | The only okhp3-notion-* skill authorized to remove Notion content. Archive, trash, restore, or pe... | 1.1.0 |
| [okhp3-notion-identity-resolution](okhp3-notion-identity-resolution/SKILL.md) | Dependency-loaded by other okhp3-notion-* skills. Resolves any Notion reference format (full URL,... | 1.1.0 |
| [okhp3-notion-limits-and-retry](okhp3-notion-limits-and-retry/SKILL.md) | Dependency-loaded by other okhp3-notion-* skills. Applies Notion's rate limits, payload size limi... | 1.1.0 |
| [okhp3-notion-page-read](okhp3-notion-page-read/SKILL.md) | Read Notion page and document content: fetch a page, traverse block children, paginate long pages... | 1.1.0 |
| [okhp3-notion-page-write](okhp3-notion-page-write/SKILL.md) | Create or update Notion pages and document content: page creation, content append, targeted searc... | 1.1.0 |
| [okhp3-notion-query](okhp3-notion-query/SKILL.md) | Query Notion database rows and filtered lists from a known data source: SQL mode, rows mode, save... | 1.1.0 |
| [okhp3-notion-row-write](okhp3-notion-row-write/SKILL.md) | Create or update Notion database rows: schema-first property mapping, select and status option ha... | 1.1.1 |
| [okhp3-notion-search-strategy](okhp3-notion-search-strategy/SKILL.md) | Find content across a Notion workspace and its connected apps by keyword. Chooses between workspa... | 1.1.0 |
<!-- FAMILY_INVENTORY_END -->
