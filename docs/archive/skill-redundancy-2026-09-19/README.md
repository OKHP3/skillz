# Retired duplicate skill packages

These are preserved originals from the quality consolidation on 2026-09-19,
based on commit `ff61152eeda6d7985805c9049840964ca781394b`. They are historical
material, excluded from active skill discovery. Do not install or execute them
as current guidance. No source content has been permanently deleted.

| Payload group | Manifest |
|---|---|
| Fourteen branded workflow copies | [brands-manifest.json](brands-manifest.json) |
| Browser and refactoring prompts | [browser-refactor-manifest.json](browser-refactor-manifest.json) |
| README and data migration prompts | [docs-data-manifest.json](docs-data-manifest.json) |
| Both specification templates | [specifications-manifest.json](specifications-manifest.json) |
| Previous project-local support contracts | [support-manifest.json](support-manifest.json) |

Each manifest records original paths, raw working-byte SHA-256 and length,
original Git blob and mode, destination, and reason. Differences between a raw
working file and its prior Git blob can reflect Windows newline conversion;
both identities are retained. Archive attributes prevent further normalization.

Use [the audit](../../skill-redundancy-audit-2026-09-19.md) and
[migration registry](../../skill-migrations.json) to locate replacements. Brand
overlays and useful task-specific safeguards have been retained in the active
shared packages; archive benchmarks are historical evidence only.

To restore a predecessor, verify its manifest hash, copy the selected payload
to its recorded original path, and reconcile any README locator or newer
package in a review branch. Update the migration registry and regenerate the
catalog. Never overwrite an active package or restore old approvals blindly.
