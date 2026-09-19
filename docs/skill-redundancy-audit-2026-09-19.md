# Skill redundancy audit: 2026-09-19

## Decision and evidence

Keep distinct capabilities; retire duplicate execution contracts when their useful
behavior is covered by a maintained replacement. Package count and version numbers
are not quality evidence. The first naming/family phase reduced 351 packages to
350 by consolidating the Replit janitors. This second phase reduces 350 to **326**,
with all 21 families retained.

Three delegated reviews screened the 243 non-Community packages and all 107
Community packages. A whole-catalog lexical overlap screen supplied candidates;
reviewers then inspected contracts, supporting files, and meaningful differences.
Similarity was a prompt for review, not an automatic retirement criterion.

The findings establish structural duplication, coverage, and a concrete refactor
example defect. They do not establish measured task-quality uplift or live agent
performance. The seven shared brand workflows have new profile evaluation designs;
all changed workflows retain explicit evidence limits. Earlier benchmark records remain historical, with their original bytes,
versions, and identities.

## Retired branded copies

Each row represents two retirements, one in `askjamie/` and one in `glee-fully/`.
Replace `{brand}` with `askjamie` or `glee-fully`.

| Former package | Shared replacement |
|---|---|
| `okhp3-{brand}-thread-context` | `context-extraction/okhp3-thread-context-extraction` |
| `okhp3-{brand}-extract-chatgpt` | `context-extraction/okhp3-thread-extract-chatgpt` |
| `okhp3-{brand}-extract-claude` | `context-extraction/okhp3-thread-extract-claude` |
| `okhp3-{brand}-chatgpt-migrate` | `context-extraction/okhp3-chatgpt-project-migration` |
| `okhp3-{brand}-repo-organizer` | `universal/okhp3-repository-organizer` |
| `okhp3-{brand}-repo-creator` | `universal/okhp3-repository-creator` |
| `okhp3-{brand}-style-registry` | `universal/okhp3-brand-style-registry` |

The working instructions are equivalent apart from loading a short brand overlay.
Other scripts, templates, reference files, and benchmark records match the shared
packages; evaluation-name substitutions do not add capability. The shared style
registry additionally includes brand-name rendering and narrow-viewport checks
missing from the copies. Creator maturity-label differences arose from the extra
overlay file, not stronger operational behavior.

Every unique overlay is bundled inside its replacement as
`references/brand-profiles/askjamie.md` or `glee-fully.md`, so a standalone package
installation retains it. Conditional instructions prevent a profile from affecting
unrelated work. Family composition tables, old route guidance, and migrated
composer notes retain the original brand context. Favorites and comparisons
converge to the shared package identity.

## Consolidated Community workflows

| Retired package(s) | Canonical replacement | Useful behavior retained |
|---|---|---|
| `review-and-refactor`, `refactor` | `refactoring-best-practices` | Project instructions, requested file boundaries, incremental behavior-preserving refactoring, and attributed examples. |
| `playwright-explore-website`, `playwright-generate-test`, `playwright-automation-fill-in-form`, `webapp-testing` | `browser-testing` | Observed flows before test generation, runtime-supplied form inputs, review before submission, MCP/local adapters, diagnostics, cleanup, and the original helper. |
| `create-readme`, `readme-blueprint-generator` | `markdown-docs` | Repository-specific README conventions and mapping from actual Copilot documentation sources. |
| `data-migration` | `data-migration-best-practices` | PostgreSQL DDL/locking cautions and verified backup/restore rehearsal guidance. |
| `create-specification`, `update-specification` | `specification-authoring` | One shared template with explicit create/update modes; updates preserve paths, requirement IDs, creation date, and valid requirements. |

The old refactor Chain example changes an all-errors result into a first-error
result, violating its behavior-preservation claim. That faulty example is kept
only in the historical archive. The stronger replacement explicitly protects
error contracts, diagnostics, and characterization. Short browser prompts did
not provide comparable selector, waiting, isolation, or failure-diagnosis guidance;
their useful task modes now compose with the fuller browser-testing contract.

## Deliberately retained

- Brand GPT builders and readiness packages add domain gates, examples, and
  brand evaluations. Brand styling, Glee Foundry, and its repository standardizer
  also contain distinct assets or executable behavior.
- Repository janitor, GitHub mirror janitor, and notification maintainer address
  different recovery, mirror/notification, and incident/scheduler boundaries.
- Platform extraction adapters, language pairs, process stages, Replit components,
  and reclamation stages have distinct inputs, outputs, or host requirements.
- Detailed Community security and architecture methods are not subsumed by
  narrower Software Reclamation or Red Teaming governance wrappers.
- Mermaid's community package covers diagram forms excluded by the OKHP3 core;
  rendered UI review differs from static UI guidance; ScoutQA adds a real adapter.
- Refactor planning, existing-code unit testing, test-first development, SQL
  review/optimization/reconciliation, and threat-model file generation remain
  distinct workflows.
- External skill-marketplace discovery and local/runtime discovery retain
  different responsibilities. Notion routing retains its destination-specific
  schema and verified-write behavior.
- Emerging-threat lab and threat-pattern validator have related but different
  declared stages. Neither has evidence establishing it as the superior
  replacement; do not collapse them on vocabulary overlap alone.

## Preservation and compatibility

Full originals, attribution, helpers, and historical evaluations are stored in
[the redundancy archive](archive/skill-redundancy-2026-09-19/README.md).
Per-file manifests record raw SHA-256, original path, source commit, Git blob,
and mode. Nothing is permanently deleted. README-only locators remain at old
directories, outside skill discovery. [The migration registry](skill-migrations.json)
keeps website routes and saved selections usable without duplicate installable
contracts. Consumers of old raw-file URLs must update to the replacement URL.

This report supersedes first-phase retain decisions for the exact packages above;
the original taxonomy audit remains a baseline record. See the
[validation record](skill-organization-validation-2026-09-19.md) for checks and
evidence limits.
