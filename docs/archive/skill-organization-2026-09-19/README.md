# Skill organization archive - 2026-09-19

This folder preserves historical work and exact janitor-package predecessors from the September 19, 2026 naming and family reorganization. These are historical records, not installable packages, current runtime instructions, current settings, or new performance evidence. Nothing in this archive was deleted or executed during the move.

The [preservation manifest](manifest.json) records all 38 original files: 22 moved files and 16 predecessor snapshots, totaling 2,948,009 original bytes. Every archived file was checked against its original SHA-256 and byte count. The manifest also retains each original path, original Git mode and blob, action, reason, and the source commit. The archive's `.gitattributes` prevents line-ending conversion so those exact bytes remain recoverable across computers.

Whitespace checks treat preserved CRLF endings as intentional. The archived restoration script also retains three original trailing-space lines (37, 40, and 43); a file-specific whitespace exception keeps that historical payload byte-identical. These exceptions apply only within this archive and do not weaken checks on active source.

## Contents

| Area | Contents | Why archived |
| --- | --- | --- |
| `red-teaming-import/` | `cloud_skills.tar` and `skillz_restore.py` | Historical import drafts and a one-time restoration payload; the remastered red-teaming family is current. |
| `session-residue/` | Empty write probe and the original machine-specific OpenClaw directory alias | Neither is a skill or a current runtime dependency. |
| `repo-settings-0.1.0/` | Original settings recap and complete 0.1.0 review/receipt set | The v2 handoff explicitly identifies these as historical predecessor evidence. |
| `predecessors/universal/` | Original `okhp3-repl-repo-janitor` distribution package | Preserved before canonical janitor naming consolidation. |
| `predecessors/replit/` | Snapshot of `okhp3-replit-repl-janitor` distribution package | Preserved before the active package was renamed. |
| `predecessors/.agents/skills/` | Separate snapshots of both project-local janitor predecessors | Support and distribution copies have distinct evidence and safety code; neither was overwritten by the other. |

`skillz_restore.py` contains embedded earlier contracts and an obsolete host-specific destination. It is preserved as evidence; do not run it as part of repository maintenance. The tar contains sixteen numbered historical Markdown drafts and was not extracted.

`session-residue/openclaw-workspace-link` retains Git mode `120000` and its exact original 52-byte link-target blob. On Windows it may appear as a plain file when symlink checkout is disabled. On macOS it can resolve to a directory in a different checkout. Inspect its Git blob as text; do not recursively traverse it or copy the target directory. The archived item is the link itself.

## Historical references and current destinations

Original archive bytes intentionally retain the names, paths, scope statements, and links that existed at the time. Embedded hashes and paths in historical JSON refer to their original snapshot, not the current release. Current evidence remains under the active package and documentation paths.

The archived [settings recap](repo-settings-0.1.0/repo-settings-recap.md) originally lived at `docs/repo-settings-recap.md`. Its relative links were written from that location. Use these current destinations when reading it:

| Original relative reference | Current destination |
| --- | --- |
| `../universal/okhp3-repo-settings/SKILL.md` | [Repository settings contract](../../../universal/okhp3-repository-settings/SKILL.md) |
| `../universal/okhp3-repo-settings/references/creator-handoff.md` | [Creator handoff](../../../universal/okhp3-repository-settings/references/creator-handoff.md) |
| `../universal/okhp3-repo-settings/references/sources.md` | [Source ledger](../../../universal/okhp3-repository-settings/references/sources.md) |

The archived [0.1.0 review README](repo-settings-0.1.0/repo-settings-review/README.md) retains its complete neighboring evidence set. Current v2 evidence is in [the active settings documentation](../../repo-settings-v2/README.md). Historical text in that handoff and learning record may continue to name the original locations; this manifest provides the exact relocation map.

Package references inside the janitor predecessors describe their original sibling/package layout and version. The snapshots preserve that evidence without representing those old names as additional current installable skills.

## Verification and recovery

For each manifest entry, hash the raw bytes at `destination` and compare them with `sha256` and `bytes`. For symlinks, hash the link-target text from the Git blob, never the target's contents. Original Git object identifiers and mode values provide a second provenance check. There were no destination collisions, and every destination remained within this repository.

To recover an item, use its exact `originalPath` and `destination` mapping after checking whether the original location now contains a replacement or compatibility pointer. Never overwrite the current package during recovery. A snapshot entry already had an active original at archive time; a move entry relocated the historical original.

The archive does not include active runtime assets, generated catalogs, current skill fixtures or benchmarks, the current context-extraction evaluation workspace, ignored dependencies/build outputs, stashes, branches, recovery refs, or previously archived material.
