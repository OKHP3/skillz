# Documentation and data-migration originals

These seven files preserve the exact working-copy bytes before the approved
2026-09-19 consolidation. Three retired contracts were moved here; the four
files in the two retained packages were snapshotted before adaptation.
No archived payload has been rewritten.

| Former skill | Current skill | Preserved distinctive method |
|---|---|---|
| `create-readme` | [markdown-docs](../../../../community/markdown-docs/SKILL.md) | Project evidence, logo, Markdown conventions, and dedicated governance-file links |
| `readme-blueprint-generator` | [markdown-docs](../../../../community/markdown-docs/SKILL.md) | Optional `.github/copilot` source map and developer-oriented README sections |
| `data-migration` | [data-migration-best-practices](../../../../community/data-migration-best-practices/SKILL.md) | Separate stages, schema-lock checks, tested restoration, and operator/retirement record |

The [preservation manifest](../docs-data-manifest.json) records each original
path, destination, operation, SHA-256, byte count, and original Git blob and
mode at `ff61152eeda6d7985805c9049840964ca781394b`. Working-copy CRLF is
preserved by a local `.gitattributes` rule; Git-blob hashes are recorded
separately so historical normalization is not mistaken for lost content.

This archive is historical source material, outside the installable family
surface. Its `SKILL.md` files are not active packages. Old relative links
inside unchanged originals retain their historical meaning.

The [community source ledger](../../../../community/COMMUNITY-SKILL-SOURCES.md)
records captured upstream provenance and repository-level MIT declarations.
Adaptations are explicitly marked in the current packages; source attribution
and original license declarations have been retained. Selection was based on
full-body method coverage and stronger verification instructions, not a live
performance comparison.
