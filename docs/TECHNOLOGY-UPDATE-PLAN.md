# Technology Update Plan

Status: implemented for review on `codex/technology-update-coverage`. New behavior becomes
active only after these files are merged into GitHub's default branch. This is an update
proposal pipeline, not unattended merging or a promise that every new major is compatible.
The existing weekly workflow was already active: its latest three scheduled runs passed,
including [September 14](https://github.com/OKHP3/skillz/actions/runs/34823862560), and it has
an existing inventory PR (#72). The revised workflow reuses that same automation branch.

## Coverage and ownership

| Surface | Detection | Update mechanism | Acceptance |
| --- | --- | --- | --- |
| Workspace dependencies, catalog and lockfile | Daily Dependabot; full weekly inventory | Minor/patch groups; separate major PRs; React/DOM grouped | Frozen install, all workspace typechecks, four artifact builds, Forge unit tests, existing Forge/Review Desk browser checks |
| Standalone Mermaid CLI | Daily Dependabot | Standalone package PR | Installation and CLI startup, then representative rendering before release |
| Python requirements in three declared locations | Daily Dependabot plus full inventory | Requirement PRs | Isolated installs, `pip check`, compilation; behavioral SDK checks where affected |
| Python source imports without requirements | Weekly inventory | Maintainer supplies a requirements file after isolated compatibility evaluation | No guessed installed version or blind minimum-version bump |
| GitHub Actions | Daily Dependabot and weekly release/tag inventory | SHA-preserving action updates | actionlint and relevant workflow run; check action Node/runtime requirements |
| Node | Weekly official release metadata | Higher patch/minor in current LTS major via `.github/node-version` | Inventory tests and workspace typecheck before PR; release checks on PR |
| Python runtime | Weekly official release metadata | Patch in current minor via `.github/python-version` | Inventory tests under proposed Python plus isolated package checks on PR |
| pnpm | Weekly npm metadata | Higher stable 10.x patch/minor via root `packageManager` | Frozen lockfile and typecheck before PR; full dependency validation on PR |
| actionlint installed by Go | Weekly release inventory | Explicit tool-pin PR in workflow-lint.yml | Run the new linter against all workflows; Dependabot does not own this inline Go pin |
| Windows tools, Replit modules/Nix/Chromium, hosted PostgreSQL | Monthly maintainer comparison and every accepted runtime migration | Host/provider update procedure | Read actual runtime/server version, run build/tests, verify running deployment separately |
| HTML, CSS, ECMAScript, Markdown, YAML, JSON Schema, TOML, OpenAPI, Agent Skills | Monthly specification review and compiler/parser changes | Deliberate compatibility changes | Representative parser, renderer, schema, browser and host tests |
| Google Fonts, GA4, GitHub/Replit services | Provider-managed | No numeric repository package bump | Check rendering, integration and runtime behavior after affected changes |

Dependabot's [pnpm catalog support](https://github.blog/changelog/2025-02-04-dependabot-now-supports-pnpm-workspace-catalogs-ga/)
covers the central declarations. At audit time its [supported pnpm versions](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories)
include through 10, so a switch to pnpm 12 should include an updater-support decision.
The report distinguishes npm `latest` from current LTS and approved update targets.

## Routine workflow

1. Dependabot checks daily. Non-major updates are grouped to reduce churn, with a three-day
   release cooldown. The existing pnpm minimum release age stays intact. Security update
   scheduling is a separate GitHub feature; this change does not claim to enable it.
2. Every Monday at 08:17 UTC the inventory workflow discovers the current sources and
   compares all 521 package/action/tool names against official registry and release metadata.
   Node and Python runtimes are compared separately. New matching manifests are discovered
   rather than relying on the old fixed list of 13 technologies.
3. If a source request fails, the audit fails before writing the report or pins. A package
   with no published stable release is explicitly recorded; prereleases are never proposed
   as runtime targets. No automatic downgrade occurs. Date-only changes do not open PRs.
4. Node LTS major, Python minor and pnpm 10.x are the update boundaries. A newly available
   major is visible in the report but remains a migration decision. The candidate runtimes
   run inventory tests and the locked workspace typecheck before the refresh PR is created.
5. Review release notes, changed APIs, engine/peer constraints, overrides, deprecations and
   existing compatibility comments. Run all relevant checks. A failed or missing check
   prevents acceptance; workflow existence alone does not make a repository rule mandatory.
6. Merge an accepted PR through the normal repository process. Dependency-only changes now
   trigger Pages rebuilding through package, lockfile, catalog and shared-library paths.
   Verify deployment success and the published source commit separately.
7. Reconcile Windows and Replit against the accepted commit using a clean, preserved working
   tree. Replit's existing post-merge hook does not itself prove module/runtime upgrades.
   Verify versions and a clean install on each host. Keep recoverable Git state for rollback.

GitHub may require **Approve workflows to run** on PRs created by `GITHUB_TOKEN`.
[Current GitHub documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
explains that these PR events create approval-required runs. The refresh job performs its
own checks and tells the reviewer about that gate. No new credential or permission grant
was created. Repository Actions must allow PR creation; existing successful scheduled PR
updates establish the prior path, but new workflow execution must still be verified after merge.

## Initial migration order

1. Accept this inventory/validation foundation. The new exact pnpm 10.26.1 pin matches the
   observed Replit manager and replaces CI's floating major. Review proposed Node 24.21.0
   and pnpm 10.34.5 after validation; Python 3.14.7 is already the latest stable CI pin.
2. Address straightforward same-major packages and action patches, reusing existing PRs
   where possible. At audit, GitHub had 11 open PRs, including inventory #72, Mermaid #82,
   actions #81/#94, Python #95/#96, and npm migrations #67-#71. Reassess their current heads;
   do not assume an old PR is tested against this new foundation.
3. Migrate Vite 7 to 8 and Vitest 3 to 5 in a compatible set; review plugin support, Node
   engine constraints, configuration and browser test behavior. Upgrade TypeScript 5.9 to
   7 as a separate compiler migration so diagnostics remain attributable.
4. Evaluate React/DOM 19.3 together. The catalog's Expo requirement comment is a retained
   constraint, although no active Expo manifest was discovered; confirm its purpose before
   changing it. Upgrade Zod 3 to 4 with Orval, drizzle-zod and form resolvers as needed.
5. Handle other majors (icons, date/UI/chart components, logging, type definitions) in
   focused PRs. Never force peer compatibility or remove esbuild/native-platform overrides
   merely to get an install to finish.
6. For the SQL Server utility, add tested requirements for pandas, PyArrow and mssql-python
   in its own change using synthetic fixtures. No server access is needed to establish an
   isolated import/install baseline. Add that manifest's directory to Dependabot afterward.
7. Replace the Windows prerelease Python installation and align host tools after acceptance.
   Resolve Replit-supported module/channel choices before changing `.replit`. For PostgreSQL,
   collect server version independently of psql 16.10; rehearse backup/restore and migration
   against a disposable database before any live major upgrade.

## Reproduction

From the repository root, use Python 3.11+ and install `.github/scripts/requirements.txt`
in an isolated environment. On Windows, substitute `py -3` for `python` as appropriate.

```sh
# Local sources only, no network or file writes
python .github/scripts/refresh_technology_inventory.py --discover-only

# Live official metadata, read-only report to stdout
python .github/scripts/refresh_technology_inventory.py

# Save complete report and JSON ledger without changing runtime pins
python .github/scripts/refresh_technology_inventory.py --write

# Proposed runtime updates; run only in a review branch / workflow checkout
python .github/scripts/refresh_technology_inventory.py --write --update-runtimes

# Deterministic offline regression checks
python -m unittest discover -s .github/scripts/tests -v

# Re-render from previously retrieved upstream metadata; preserves its retrieval date
python .github/scripts/refresh_technology_inventory.py --offline --write
```

The public GitHub API has a lower unauthenticated rate limit. Supply an existing authorized
`GH_TOKEN` through the process environment when needed; never put a token in a file, report,
command argument, or repository. The script only sends it to GitHub's API hostname.
All other lookups use public metadata and send no source code or private configuration.

The generated report describes input versions observed before any proposed runtime edits;
`proposed_runtime_updates` records those proposed edits separately. A later audit reflects
accepted pins. Initial host/specification summary tables are dated manually reviewed evidence
and are not silently restamped by the weekly generator.

## Rollback and verification limits

Revert the accepted dependency/pin PR, reinstall the committed lockfile, rerun validation,
and redeploy the prior verified artifact. Database changes need their own tested rollback.
The updater never rewrites historical archives or bulk-edits instructional examples.

Local evidence: 17 offline regression tests passed; actionlint 1.7.12 passed all workflows
(shellcheck was not installed locally); the family-agnostic deployment trigger check and
TypeScript shared-library build and direct typechecks of all four artifacts passed. The normal Windows pnpm command hit the existing
POSIX `sh` preinstall limitation, so it is not a full-workspace pass. Linux CI is the
validation environment for this Replit-oriented dependency layout; native Windows platform
packages are deliberately excluded by existing overrides. Hosted CI and deployment evidence
must be recorded separately after publication of the review branch. SDK compilation and
Mermaid CLI startup are smoke checks, not live integration or rendered-diagram coverage.
