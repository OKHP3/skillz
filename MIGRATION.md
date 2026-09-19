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

## Archived README link audit

- `docs/archive/migration-backup-20260826/legacy-distribution-README.md` is a
  preserved historical snapshot and is excluded from active-content link
  failures.
- Its original inventory contains 181 relative Markdown links and one image
  reference written for the former repository root. The archive notice in that
  README labels any remaining former-root references as intentional historical
  references rather than current repository guidance.
- References that were moved into the consolidated layout use paths that
  resolve from the archived README; the root `README.md`, not this snapshot,
  remains the source of truth for active links.

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

## Skill organization 2026-09-19

Baseline: clean `main` at `c63c438b596a69887be8455589535db0a3daeaf7`,
matching freshly fetched `origin/main`. Existing stashes, recovery refs,
unreachable objects, ignored dependencies, and unrelated pull requests are
preserved. This pass changes names, routing, and archival placement without
changing repository settings or deleting content.

### Repository profile and evidence

Confirmed: this is a portable Agent Skill distribution library with an
application workspace, current evaluation evidence, and historical archives.
The baseline inventory contains 351 canonical skills in 21 families and 53
project-local support packages. A complete path review covered 3,233 tracked
files; representative content, history, references, and package declarations
were examined. This is not a full security audit or a new live skill benchmark.

The [taxonomy audit](docs/skill-taxonomy-audit-2026-09-19.md) records each
baseline package and its disposition. The
[migration registry](docs/skill-migrations.json) is the machine-readable map.

### Canonical package mapping

| Previous path | Current path | Reason |
|---|---|---|
| `universal/okhp3-foundry-repo-creator` | `universal/okhp3-repository-creator` | Owner-requested clear repository name; existing creation scope retained. |
| `universal/okhp3-repl-repo-janitor` | `replit/okhp3-replit-repository-janitor` | Owner-requested Replit placement and name; the already documented successor supplies the current implementation. |
| `replit/okhp3-replit-repl-janitor` | `replit/okhp3-replit-repository-janitor` | Retire the overlapping identity and retain the newer safety-tested package. |
| `universal/sp-build-auditor` | `copilot/okhp3-sharepoint-content-auditor` | Owner-requested SharePoint naming and family; screenshot-audit scope retained. |
| `universal/sp-list-architect` | `copilot/okhp3-sharepoint-list-schema-design` | Owner-requested SharePoint naming and family; list-design scope retained. |
| `universal/okhp3-repo-settings` | `universal/okhp3-repository-settings` | Consistent repository terminology. |
| `context-extraction/okhp3-thread-context-extraction-grok` | `context-extraction/okhp3-thread-extract-grok` | Match sibling platform-adapter naming. |

The two janitor predecessors resolve to one canonical skill, giving 350
distribution skills in the same 21 families. The equivalent local cleanup
leaves 52 support packages. The newer local support janitor has additional
hosted-lookup safeguards and remains a separate preserved implementation;
this migration does not overwrite it or claim mirror equality. Its old
benchmark bytes remain historical under the original identity. The renamed
janitor is version 1.0.2 and does not claim a new live benchmark.

The two SharePoint packages explicitly record unverified native Copilot
packaging and execution. Imported Community names, stable locale slugs, and
brand abbreviations constrained by the 36-character policy are retained.
No case-only collisions or new package-name limit exceptions are introduced.

### Compatibility and generated data

The seven old GitHub directories contain README-only move notices. They are
not installable skills and are excluded from package counts. Old Forge routes
and saved skill names resolve through the migration registry. Review Desk
navigation follows the aliases without transferring review approvals.
GitHub cannot redirect a former raw `SKILL.md` path: external installations
and raw links must be updated to the current paths in the table.

Historical evidence records keep their original identities and hashes. Their
locator notes and archive-link validation distinguish historical locations
from current package paths. Current cross-references, workflow paths,
curated stacks, catalog indexes, and manifest family membership are updated.
The manifest's family member lists are now derived from the same catalog as
its totals so they cannot silently retain the former incomplete inventory.

### Archive and retention

The [dated archive](docs/archive/skill-organization-2026-09-19/README.md)
contains 38 payload files: 22 moves and 16 predecessor snapshots, totaling
2,948,009 original bytes. Its manifest records old and new paths, SHA-256,
Git object identity, file mode, action, and reason. Archive attributes preserve
raw bytes across platforms. The machine-specific OpenClaw link is retained
as a Git symlink without traversal; archived restoration code is inert and
must not be executed as a current workflow.

Current extraction run evidence, all four application artifacts, generated
catalog assets, fixtures, support packages, and the existing publication
mirror remain active. Date or apparent duplication alone was not treated as
evidence that a file was obsolete.

### Verification and rollback

Validation covers package structure, both janitor test suites, repository
settings tests, complete catalog regeneration, alias/manifest and archive-link
regressions, archive byte preservation, frontend type checks, production
builds, and browser navigation. Detailed run results are recorded in
[the validation report](docs/skill-organization-validation-2026-09-19.md).

For rollback, revert this migration's commits as a reviewed change, regenerate
the catalogs, and run the same checks. For individual artifact recovery, use
the archive manifest's exact reverse mapping and verify its hash before
restoring; never overwrite a current destination. The baseline commit and
unaltered predecessor snapshots provide independent recovery points.

## Skill redundancy consolidation 2026-09-19

After the first phase, the owner explicitly prioritized capability over package
count and authorized retirement of redundant or clearly superseded workflows.
The [redundancy audit](docs/skill-redundancy-audit-2026-09-19.md) records the
full-catalog screen, exact comparisons, replacements, and retained distinctions.

Fourteen branded copies now compose shared workflows with bundled optional
profiles. Eleven Community entry points become five maintained workflows, including
one new specification-authoring package with create and update modes. Together
these remove 24 active entries from the first-phase inventory: **326 skills in
21 families**, down from the original 351. Project support remains 52 packages.

The migration registry now records 32 old identities, including the first-phase
renames. Old website links resolve to current packages; branded aliases preserve
the relevant profile through route guidance and composer notes. Reviews and
approvals are never transferred from retired identities. Raw-file consumers must
update their URLs.

The [redundancy archive](docs/archive/skill-redundancy-2026-09-19/README.md) retains
complete originals and pre-adaptation support snapshots with per-file hashes and
Git provenance. Run `python scripts/verify-skill-archives.py` to check both cleanup
archives, adding `--index` before committing to prove staged bytes and modes.
Archive-only attributes preserve original line endings without normalization.

Historical benchmark data stays unchanged and is not current-version evidence.
The changed packages carry structural/analytical limits and new profile evaluation
designs where applicable. Rollback uses the original source commits and manifests;
restore in a review branch, reconcile aliases, and regenerate all catalog surfaces.
