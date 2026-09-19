# Skill organization validation

Date: 2026-09-19. Baseline: `c63c438b596a69887be8455589535db0a3daeaf7`.
Scope and reverse mapping: [MIGRATION.md](../MIGRATION.md#skill-organization-2026-09-19).

## Local checks

| Check | Result |
|---|---|
| Full baseline taxonomy inventory | 351 canonical packages, 21 families; every package has a disposition in the audit. |
| Final catalog generation | 350 canonical packages, 21 families; 52 support packages. |
| Manifest membership reconciliation | All 350 members match their catalog families; Copilot 42, Replit 9, Universal 20. |
| Retired identities | Seven old identities resolve to six canonical packages; none remains installable. |
| Strict package validation | All six canonical destinations and the renamed local janitor pass. |
| Repository settings offline tests | 23 pass. |
| Canonical janitor offline tests | 6 pass. |
| Local support janitor offline tests | 15 pass; its extra hosted-evidence safeguards are preserved. |
| Forge unit tests | 49 pass in 8 files, including alias, comparison, favorites, composer-note, and Review Desk lookup regressions. |
| Migration and archived-link regressions | 11 pass; 182 historical README destinations resolve. |
| TypeScript | Forge and Review Desk pass. |
| Archive working files and staged Git objects | 38 payloads, 2,948,009 bytes, exact SHA-256 and modes verified; no unexplained source loss across 3,233 baseline paths. |
| Source discovery | Regular packages included; cyclic, file, dangling, and archived links excluded. |
| Routes and publication trigger | Static route/anchor check and family-independent deployment-trigger check pass. |
| Production Forge build | Pass; generated catalog copied into the built output. |
| Production Review Desk build | Pass; synchronized 350-skill catalog copied into the built output. |
| Built-site browser checks | All seven former routes open their canonical detail page and render the new raw SKILL.md URL and complete contract. |
| Built Review Desk browser check | Old SharePoint route becomes the canonical Copilot route; 350 skills / 21 families displayed, with no owner sign-off transferred. |
| Independent review | Source/taxonomy, migration behavior, and archive preservation reviewed separately; no remaining must-fix findings. |

The full local catalog suite began successfully (first 23 assertions) but was
stopped before the source commit: its subprocess and Git-HEAD archive scenarios
need the committed migration. This partial local run is not a full-suite pass.
The committed change must pass the complete Linux release and deployment checks.

## Environment and evidence limits

Windows native optional build binaries were missing from the pre-existing
dependency installation. Exact locked package versions were restored from the
official registry into ignored dependencies, with registry integrity verified;
no package manifest or lockfile change was required.

Windows permits directory junctions here but not unprivileged file symlinks.
The source-discovery test uses real directory junctions and an explicit lstat
adapter for the file-link boundary on this host. Linux CI retains native symlink
coverage. Preserved CRLF archive bytes and two pre-existing mixed-ending source
files have narrowly scoped whitespace attributes; historical payloads were not
rewritten to silence whitespace diagnostics.

Historical benchmarks retain original names, versions, and bytes. Renaming,
structural validation, UI navigation, and offline tests do not establish a new
live behavioral benchmark or native Copilot support. External raw-file URLs
must be updated by their consumers; README notices preserve old GitHub directory
links, and the website handles its own route aliases.

## Hosted verification

GitHub pull-request, deployment, and final live-source checks are recorded in
the task closeout after they complete. Local results above do not claim that a
deployment has already occurred.
