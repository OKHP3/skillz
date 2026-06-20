# Notion Skills

This family covers Notion-centered knowledge operations for OKHP3.

Current skill:

| Skill | Purpose |
|---|---|
| `okhp3-notion-capture-router` | Routes AI conversation threads into Notion as Chat Threads plus Extracts, dedupes existing knowledge, and reconciles against OKHP3 GitHub repos. |

## Design rule

Public repo files must not contain private Notion URLs, database IDs, collection IDs, or connector-only resource IDs. Runtime anchors belong in project knowledge, a private prompt block, or a non-committed `routing-anchors.private.md` file.
