# Technology Inventory

Audit date: 2026-07-13. Updated 2026-08-24 for the pnpm-workspace monorepo migration.

## Scope and method

This repository is a pnpm workspace monorepo. It hosts deployed applications under `artifacts/` (the Skillz Forge review surface at `artifacts/forge`, its review desk at `artifacts/forge-review-desk`, an API server, and a mockup sandbox) alongside the root distribution families and project-local support packages. The inventory below distinguishes technology required to run the deployed apps and repository scripts from technology shown only in examples, templates, or reference snippets inside individual skills. Version evidence comes from committed manifests (`package.json`, `pnpm-workspace.yaml`), CI workflow files, runtime configuration, source imports, and the latest official registry metadata.

## Executable technology

| Technology | Current repository state | Version in place | Update path |
| --- | --- | --- | --- |
| Node.js | Runs the pnpm-workspace build/dev tooling and every deployed artifact (`artifacts/forge`, `artifacts/forge-review-desk`, `artifacts/api-server`, `artifacts/mockup-sandbox`), plus standalone ESM skill scripts and Mermaid tooling. | `.github/node-version` (`24.19.0`) is the single authoritative pin. `deploy-pages.yml` and `release-validation.yml` read it via `actions/setup-node`'s `node-version-file` input, so both workflows follow it directly. | The weekly "Refresh technology inventory" PR updates this one file; once merged, the app CI workflows run on the new version on their next trigger. |
| pnpm | Workspace package manager; the root `package.json` `preinstall` script refuses non-pnpm installs. | Pinned via `packageManager`/lockfile in the workspace; local runtime observed at install time. | Dependabot / manual bump; not currently tracked by this inventory script. |
| TypeScript | Direct root and per-artifact dependency; `pnpm run typecheck` builds project references across the workspace. | `~5.9.3` (root), workspace catalog version for artifacts. | Dependabot reviews updates weekly. |
| Vite / React / Tailwind CSS | Real, deployed dependencies of `artifacts/forge` (and sibling web artifacts) via the pnpm workspace catalog — no longer reference-only. | Vite `^7.3.2`, React `19.1.0`, Tailwind CSS `^4.1.14` per `pnpm-workspace.yaml`. | Dependabot reviews updates weekly; a major bump still needs manual template review before merging. |
| npm | Package registry client for Node tooling metadata lookups. | No repository pin or lockfile (the workspace uses pnpm exclusively). | Installed with the selected Node release. |
| JavaScript | `.mjs`, `.cjs`, and `.js` scripts use Node built-ins and native ESM. | No ECMAScript edition is declared. | Governed by the Node LTS pin. |
| Python | Cataloger requires Python 3.9+; Replit config requests `python-base-3.13`; other utilities (including this inventory script) use Python. | CI tracks the latest stable release via `.github/python-version` (`3.14.7`). | Weekly inventory PR updates the CI pin. |
| Anthropic Python SDK | Direct dependency of `community/mcp-builder/scripts/evaluation.py`. | `>=0.39.0` | Dependabot reviews updates weekly. |
| MCP Python SDK | Direct dependency of `community/mcp-builder/scripts/connections.py`. | `>=1.1.0` | Dependabot reviews updates weekly. |
| PyYAML | Direct import in `community/skill-creator/scripts/quick_validate.py`. | `>=6.0.3` | Added explicit requirements file; Dependabot reviews updates weekly. |
| Mermaid CLI | Local Mermaid publish pipeline. | Exact dev dependency: 11.16.0. | Dependabot reviews updates weekly. |
| Bash | Shell utilities, including the Mermaid render pipeline. | No Bash version is pinned. | Runner supplied. Scripts use `#!/bin/bash`. |
| Mermaid diagram syntax | `.mmd` files plus generator and validator scripts. | No language or renderer version was previously pinned. Mermaid CLI is now pinned above. | Mermaid CLI Dependabot PRs. |
| Markdown, JSON, YAML | Repository content, manifests, fixtures, and SKILL.md files. | No parser or format version is declared. YAML fixtures use local minimal parsers where applicable. | No package update applies. |
| Agent Skills / SKILL.md | Repository's primary capability-package format. | No repository-declared spec version. | Review compatibility claims when runtime support changes. |

## Reference-only technologies

These technologies appear only in instructional material or reusable starter scripts belonging to individual skills (not the deployed `artifacts/` apps). They are not installed dependencies of those skills and are deliberately not auto-upgraded, because a major version change could make the guidance incorrect.

| Technology | Repository reference | Current reference | Automated handling |
| --- | --- | --- | --- |
| Vite (skill guidance) | Vite GitHub Pages guide and web-artifact bootstrap script content inside individual skills. | References Node 18-era generated projects; independent of the real `artifacts/forge` Vite dependency above. | Latest version is reported below. Major upgrades require template review. |
| pnpm (skill guidance) | Web-artifact bootstrap script content inside individual skills. | Unpinned global installation in generated-project guidance. | Latest version is reported below. |

## Latest stable releases

This section is generated by `.github/scripts/refresh_technology_inventory.py`. It reads only official Node.js, Python, PyPI, and npm metadata endpoints. A scheduled workflow opens a pull request if any observed version or CI runtime pin changes.

<!-- technology-latest:start -->
Last checked: 2026-08-31 (UTC).

| Technology | Latest stable | Basis |
| --- | --- | --- |
| Node.js | 26.8.1 | latest stable Current release |
| Node.js LTS | 24.20.0 | recommended tracked runtime |
| Python | 3.14.7 | latest stable release |
| npm | 12.0.2 | npm registry latest tag |
| Anthropic Python SDK | 1.2.0 | PyPI latest release |
| MCP Python SDK | 2.1.1 | PyPI latest release |
| PyYAML | 6.0.3 | PyPI latest release |
| Mermaid CLI | 11.16.0 | npm latest tag |
| TypeScript | 7.0.2 | reference-only technology |
| Vite | 8.2.2 | reference-only technology |
| React | 19.2.8 | reference-only technology |
| Tailwind CSS | 4.3.3 | reference-only technology |
| pnpm | 11.24.0 | template bootstrap tool |
<!-- technology-latest:end -->

## Maintenance plan

1. Dependabot (`.github/dependabot.yml`) opens weekly pull requests for the root npm workspace, the Mermaid package, the two Python package locations, and GitHub Actions dependencies.
2. The `Refresh technology inventory` workflow runs every Monday and creates one pull request when Node LTS, Python, or any observed latest release changes.
3. Review generated-project/skill guidance separately before changing Vite, React, or Tailwind versions there. Those are examples inside individual skills, not the live `artifacts/forge` dependencies, and Tailwind 4 requires template changes.
4. Merge only after normal repository validation passes. The automation has no auto-merge permission.

For scheduled pull requests to work, the repository's Actions settings must allow `GITHUB_TOKEN` to create pull requests.
