# Migration and Consolidation Ledger

**Date:** 2026-08-26
**Scope:** Consolidation of the tracked `.migration-backup/` tree into the
authoritative root monorepo layout.

## Baseline

- Branch: `main`
- The working tree was refreshed from `origin/main` before migration.
- The repository had only generated catalog/manifest/activity changes dirty at
  the start of this work.
- Root artifacts and workflows were treated as authoritative. No branches,
  pull requests, stashes, remotes, deployment settings, or `main` history were
  changed.

## Content moved

- Sixteen distribution families were moved from `.migration-backup/` to the
  repository root. Their `FAMILY.md` files and `SKILL.md` packages now live
  beside the root governance and manifest files.
- Backup-only support skills were merged into `.agents/skills/`, backup memory
  topics into `.agents/memory/`, and prompts into `.agents/prompts/`.
- Publication mirrors were merged into `skills/`.
- Unique documentation was merged into `docs/`; the existing root
  `docs/TECHNOLOGY-INVENTORY.md` remained authoritative.
- `FUNDING.yml`, the backup-only landing verification workflow, and the
  maturity audit script were moved to their active root locations.
- The promoted `.agents/skills/README.md` is the project-local support catalog;
  the validator operator guide is `VALIDATION.md`.

## Authority and collisions

- Existing root monorepo artifacts, app source, generated data, workflows,
  package manifests, and current documentation won all collisions.
- The root `skillz.manifest.json` is authoritative and is regenerated from the
  root distribution catalog.
- The root Forge and Review Desk artifacts remain the only application copies.
  Their current package and workflow configuration was not replaced by the
  legacy standalone copies.

## Archived and deleted legacy material

- The legacy distribution README and the backup post-merge script were
  preserved under `docs/archive/migration-backup-20260826/`.
- The legacy Forge copy was compared with the current artifact and removed
  after the current copy was confirmed authoritative.
- The legacy Mockup Sandbox copy was compared with the current artifact and
  removed. Unique prototype components were preserved under the current
  artifact's mockups directory, and legacy screenshots plus provenance notes
  were preserved under `docs/archive/migration-backup-20260826/mockup-sandbox/`.
- Obsolete backup configs, markers, duplicate workflows, runtime pins, and the
  backup tree itself were removed. No active source depends on
  `.migration-backup/`.

## Ignored working artifacts

Pre-existing ignored root working directories named `forge/`, `community/`,
and `universal/` were not treated as tracked migration authority and were
quarantined at `/tmp/skillz-consolidation-hold-20260826/` for preservation
during review. They were not committed, deleted, or allowed to overwrite the
tracked root layout.

## Rollback guidance

The migration is represented by ordinary file moves and deletions in the Git
working tree. Review the diff before committing; if the consolidation must be
reversed, restore the pre-migration checkpoint or use `git restore`/`git mv`
from the diff rather than copying the archived legacy application over the
current artifacts. The ignored quarantine is separate from Git and should be
removed only after the migration has been accepted.