# Changelog

All notable changes to `OKHP3/skillz` will be documented in this file.

This project does not yet have a release tag. Until `v0.1.0`, entries are grouped under `Unreleased`.

## Unreleased

### Added

- Added `okhp3-repository-janitor`, an audit-first workflow and helper script for reconciling multiple local Git mirrors with `origin/main`, preserving uncertain work, and preparing evidence-gated branch merge and pruning decisions.

- Added 14 brand-specific forks under `glee-fully/` and `askjamie/` for visual style registration, FoundRy repository creation, content-first repository organization, ChatGPT project migration, shared thread-context extraction, and ChatGPT and Claude thread adapters. Each fork preserves its generic source workflow and adds an explicit brand overlay grounded in the current public site positioning.

- Added brand-specific GPT creation forks under `glee-fully/` and `askjamie/`: `okhp3-glee-fully-gpt-builder`, `okhp3-glee-fully-gpt-readiness`, `okhp3-askjamie-gpt-builder`, and `okhp3-askjamie-gpt-readiness`. They derive from the generic `agent-foundry/` Custom GPT packages and apply the current public Glee-fully and AskJamie positioning as explicit overlays.

- Added the `glee-fully/` family-level `okhp3-glee-fully-foundry` skill. It governs Glee-fully Tool and Tool-ette hierarchy, Persona Density, Twig `Best for` boundaries, leaf logic, sibling awareness, and canon-seal readiness. The consumer-skill conversion remains deferred until clustering is complete.

- Added the `outcome-modeling/` family with a Foundry-3.1-aligned core and four domain adapters: sports, NFL fantasy picks, business-sales, and prediction markets. Each package includes frozen development evaluations, an external-required holdout declaration, and a version-matched benchmark record marked `not-run`.

- Added `okhp3-repository-organizer`, a content-first workflow for profiling organically grown local Git repositories, choosing selective governance scaffolding, and executing approval-gated reorganizations without forcing an application layout.
- Added `okhp3-brand-style-registry`, a public, profile-driven workflow for capturing named visual styles and applying primary and explicitly bounded supporting profiles to SPAs and related artifacts.
- Added `okhp3-database-cartographer`, a read-only SQL schema-reflection,
  specification-diff, and Mermaid ER-handoff skill in the universal family.
- Added the `context-extraction/` distribution family with nine skills for cross-platform AI-thread extraction, platform-specific capture, provenance-preserving handoffs, and ChatGPT project migration.
- Added `okhp3-custom-gpt-readiness` and `okhp3-custom-gpt-skill-conversion-planner` with structured dossiers, gap analysis, semantic-loss tracking, and Foundry handoffs for the Custom GPT lifecycle.
- Added technology inventory, explicit Mermaid CLI and PyYAML dependency declarations, Dependabot configuration, and scheduled version-inventory pull-request automation.
- Added root `AGENTS.md` routing index for active and planned skills.
- Added Mermaid family skeletons:
  - `okhp3-mermaid-core`
  - `okhp3-mermaid-bpmn`
  - `okhp3-mermaid-architecture`
  - `okhp3-mermaid-data`
  - `okhp3-mermaid-publish`
  - `okhp3-mermaid-update`
  - `okhp3-mermaid-repair`
- Added LinkedIn family skeletons:
  - `okhp3-linkedin-voice`
  - `okhp3-linkedin-angles`
  - `okhp3-linkedin-post`
- Added process-capture meta-skill skeleton:
  - `okhp3-process-capture`
- Added Notion capture router family:
  - `okhp3-notion-capture-router`
- Added ReFolDec family skeleton:
  - `okhp3-refolddec-core`
- Added placeholder family area for `askjamie/`.
- Added `PUBLIC_SURFACES.md` to document the canonical OverKill Hill landing-page strategy and contextual Glee-fully / AskJamie touchpoints.
- Added `PUBLISHING.md` for validation, release, registry, and promotion workflow.
- Added `SECURITY.md` for skill supply-chain and employer-data safety posture.
- Added `skillz.manifest.json` as a lightweight machine-readable manifest.

### Changed

- Added the 2026-07-29 repository-wide maturity audit and Replit reconciliation
  PRD. The audit records all 75 distribution skills, package versions, first
  Git records, last modifications, package resources, maturity, and evidence
  state. The Forge catalog now keeps `usable` distinct from `validated` and
  exposes evidence states for none, local checks, analytical design, not-run,
  historical, and live records.
- Enhanced all five `outcome-modeling` skills to version `1.1.0` with
  computational-model references, plain-language glossaries, synthetic JSON
  fixtures, dependency-free Python helpers, package-level calculation tests,
  and evaluation cases for reproducible arithmetic. The helpers are local and
  read-only; live performance evidence remains not run.
- Advanced `okhp3-skill-foundry` to `3.1.0`, an analytical structural-integrity release. It enforces coherent evaluation and benchmark versions, finite protected/external-required holdout states, dated learning-ledger validation, current-state mirror-hash records, and regression tests for invalid evidence states. The release does not claim fresh live benchmarking, unseen-holdout results, task-quality uplift, or production readiness.
- Synchronized the `3.1.0` Foundry core, its verification record, and its validator regression suite to the project-local active copy and every discovered authorized `.agents/skills/okhp3-skill-foundry` mirror. The current-state record verifies present equality only and does not recreate unrecorded historical authorization or pre-sync state.

- Renewed `okhp3-skill-foundry` to version `3.0.0` with portable-core and host-adapter boundaries, risk-based version-specific evaluation records, protected-holdout rules, non-compensatory critical-risk gates, a learning ledger, a reviewed mirror manifest, and a conditional dissent protocol. The protocol treats agreement as a trigger for falsification and material disagreement as a trigger for evidence-based negotiation; it does not claim consensus or a historical benchmark proves current quality.
- Synchronized the reviewed Foundry core package, including its evaluation, evidence, validator, and equilibrium-review resources, to the project-local active copy and every discovered authorized `.agents/skills/okhp3-skill-foundry` mirror. Local `workspace/` evidence was intentionally excluded from propagation.
- Refined `okhp3-repository-organizer` with explicit assess/propose/execute inputs, optional-tool fallback behavior, assessment-only output semantics, compact portable examples, and stricter read-only inventory argument and truncation diagnostics. Bumped the skill package to `1.1.1`.
- Hardened `okhp3-repository-organizer` with a cross-platform naming gate covering ASCII-safe web paths, case and Unicode normalization collisions, Windows reserved names, URL and shell hazards, and conservative path-length diagnostics.
- Reindexed the full distribution surface at 68 skills across 11 active families, refreshed all generated `README.md` and `FAMILY.md` catalogs, refreshed the 18-entry project-local support catalog, and regenerated the Forge search catalog.
- Shortened 15 public and 7 project-local package identifiers to a 36-character maximum, updated their frontmatter, eval manifests, routing, manifest, stack references, and generated catalogs, and added a portable path gate to the Foundry validator.
- Hardened `okhp3-skill-cataloger` for UTF-8 Windows-console output and documented the explicit Forge search-index refresh step.
- Hardened `okhp3-skill-foundry` with a recursive, line-ending-safe validator that enforces current portable Agent Skills limits for names, descriptions, compatibility, bodies, and repository paths.
- Moved detailed observance-calendar and LDS reference-format material into focused reference files to keep every `SKILL.md` at or under the 500-line progressive-disclosure limit.
- Updated all Replit handoff PRDs to the 68-skill public inventory and required Replit to rebuild generated catalog data rather than preserve stale counts, timestamps, or package identifiers.
- Updated the Skillz Forge generated catalog, build pipeline, and curated AI conversation capture stack so new and improved repository skills are represented automatically. The catalog builder now preserves nested frontmatter metadata such as versions, categories, and maturity signals.
- Updated the Skillz Forge and OverKill Hill Replit handoffs, public-surface family cards, agent routing guide, and machine-readable manifest to reflect the current inventory and distinguish public distribution skills from project-local support tooling.
- Hardened the `agent-foundry`, `linkedin`, `mermaid`, `notion`, and `universal` skills against the current Agent Skills format: standardized discovery metadata, clarified scope and output contracts, replaced Mermaid scaffold references with operational guidance, tightened connector and publication safety, and removed brittle quota/platform guarantees.
- Created the `agent-foundry/` family and migrated the Custom GPT readiness, builder, and Agent Skill conversion-planning packages from `universal/`; updated the catalogs, routing guide, Forge catalog, and Pages workflow path.
- Generalized `okhp3-notion-capture-router` from a personal-workspace capture workflow into a platform-neutral Notion export and API/connector usage contract for pages, databases, and data sources.
- Clarified that GitHub is the installable source of truth, Notion is the strategy and decision ledger, and OverKill Hill is the canonical public landing surface.
- Updated root catalog, index, and README to include the Notion capture router and ReFolDec family.
- Merged `CLAUDE.md` into `AGENTS.md`; deleted `CLAUDE.md`.

### Removed

- Removed manually maintained `SKILLS.md` (was: human-facing catalog and maturity tracker).
  - Maturity model and promotion priority moved to `BACKLOG.md`.
  - Planned and active family status moved to `BACKLOG.md`.
  - Catalog upkeep rules moved to `BACKLOG.md`.
  - Skill family cards updated in `PUBLIC_SURFACES.md`.
  - Skill routing table is now auto-generated by `okhp3-skill-cataloger --full`.

### Next

- Verify every active `SKILL.md` frontmatter block.
- Add GitHub topic tags.
- Promote Mermaid Core + BPMN + Publish from skeleton to usable maturity (see promotion priority in `BACKLOG.md`).
- Add worked examples and validation checklists.
- Tag `v0.1.0` after the first usable skill path is complete.
