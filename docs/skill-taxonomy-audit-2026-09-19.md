# Skill taxonomy audit: 2026-09-19

## Scope and evidence

The baseline contains **351 canonical distribution packages across 21 active
families**. The audit covered every canonical directory, frontmatter `name`,
metadata, description, and family assignment, then inspected the full contracts
and supporting files of relocation, naming, and collision candidates. This is a
complete inventory and taxonomy screen, not a behavioral audit of 351 skills.

Baseline commit: `c63c438b596a69887be8455589535db0a3daeaf7`.

Coverage uses tracked `family/package/SKILL.md` paths whose family declares a
`FAMILY.md`. Project-local support packages under `.agents/skills/` and the
`skills/okhp3-skill-promotion` publication mirror are excluded from distribution
counts. No canonical directory/frontmatter-name mismatch or exact duplicate
canonical slug was found at the baseline. A duplicate workflow can still exist
under different names, as the Replit janitor review demonstrated.

The selected set contains six canonical naming or placement changes and one
predecessor/successor consolidation. Seven prior package identities resolve to
six destinations. After consolidation the expected inventory is 350 packages
and 21 families. The integration report and generated checks establish the actual
final counts; this audit does not assert deployment or publication.

## Selected changes

| Prior canonical path | Canonical destination | Reason |
|---|---|---|
| `universal/okhp3-foundry-repo-creator` | `universal/okhp3-repository-creator` | Explicit owner naming direction; the package still creates governed repositories from supplied AI capability origins. |
| `universal/okhp3-repl-repo-janitor` | `replit/okhp3-replit-repository-janitor` | Explicit owner direction; one-Replit cleanup belongs in Replit. Preserve the superseded package in the archive. |
| `replit/okhp3-replit-repl-janitor` | `replit/okhp3-replit-repository-janitor` | Already documented as the preceding package's replacement. Consolidate the active workflow and retain richer support safeguards. |
| `universal/sp-build-auditor` | `copilot/okhp3-sharepoint-content-auditor` | Explicit owner direction; identify SharePoint and keep the existing screenshot-evidence audit boundary. |
| `universal/sp-list-architect` | `copilot/okhp3-sharepoint-list-schema-design` | Explicit owner direction; make the SharePoint list schema task discoverable alongside the host family. |
| `context-extraction/okhp3-thread-context-extraction-grok` | `context-extraction/okhp3-thread-extract-grok` | Match the manually supplied platform-adapter grammar used for ChatGPT, Claude, Gemini, Copilot, Mistral, and Perplexity. |
| `universal/okhp3-repo-settings` | `universal/okhp3-repository-settings` | Use the same full repository term as creator, organizer, and janitor. |

A family move does not certify a new host capability. The two SharePoint packages
are portable, read-only design/screenshot workflows. The screenshot auditor must
not become an implicit document-content audit or native tenant-access claim.
The existing `okhp3-sharepoint-list-schema-view-review` remains distinct: it
reviews accessible configuration in its declared host, while schema design owns
the design and manual-build guidance. Preserve these boundaries in routing.

## Replit collision and preservation

`replit/okhp3-replit-repl-janitor/references/foundry-architecture.md` explicitly
states that the Replit package replaces `okhp3-repl-repo-janitor`. Both were still
published at baseline. The Universal predecessor is version 0.1.0; the Replit
successor is version 1.0.1.

The predecessor has three files, all with corresponding successor paths:
`SKILL.md`, `references/naming-conventions.md`, and `scripts/audit-repo.py`.
There are no predecessor-only paths. Its older script performs an automatic
fetch while describing itself as read-only and suppresses Git failure status;
these behaviors should not be restored. The successor adds explicit fetch
control, visible errors, nested detritus scanning, evaluation artifacts, and tests.

The predecessor's project-local copy is byte-identical to its distribution copy.
The successor's support and distribution copies differ in three files:
`SKILL.md`, `scripts/audit-repo.py`, and `tests/test_audit_repo.py`. The support
copy includes additional safeguards for authoritative remote-tip comparison,
unknown or failed hosted PR evidence, and supplied hosted-lookup reports. It
must not be overwritten with the less complete distribution copy during renaming.
Preserve both original trees before reconciling these differences and validate
the chosen canonical implementation.

## Retained names and family boundaries

- **Community, 107 packages:** retain upstream names and provenance. A Copilot,
  security, Mermaid, or social keyword does not turn an imported package into an
  OKHP3-host adapter or a remastered domain skill. Community remains the origin
  grouping; narrower OKHP3 contracts remain independently selectable.
- **Brand packages:** retain AskJamie and Glee-fully family placement even where
  a branded package adapts repository creation, extraction, or style governance.
  Their brand contracts distinguish them from generic counterparts. Retain the
  existing `repo` abbreviations as a coherent group. Proposed full expansion
  gives `okhp3-glee-fully-repository-standardizer` 40 characters and
  `okhp3-glee-fully-repository-organizer` 37, exceeding the ordinary 36-character
  package-directory limit. The Glee creator and AskJamie variants fit, but
  selectively expanding only those would create another mixed naming pattern.
  No arbitrary length exception is introduced.
- **British English:** retain `okhp3-translation-en-us-en-uk` for this change.
  Its actual contract is `en-US -> en-GB`; its reference record explicitly says
  the stable slug was retained. A future `en-gb` migration would need an explicit
  compatibility decision for dictionary filenames, manifests, and existing
  callers. The current slug must never be interpreted as a different locale.
- **Twitter/X:** keep the `twitter` package slugs. The family and contracts
  explicitly use stable Twitter identifiers for the current X surface.
- **Universal i18n delivery:** keep `okhp3-i18n-page-sync` and
  `okhp3-i18n-page-release` in Universal. `language-mediation/FAMILY.md`
  intentionally separates exact-pair transformation from the Universal technical
  delivery stack. These two packages neither translate prose nor choose locales.
- **Equilibrium and Compass:** `okhp3-equilibrium-review` and
  `okhp3-project-compass` are plausible Knowledge Operations candidates, but
  their cross-domain evaluation and ongoing project-tracking scope also supports
  Universal. They remain there pending a deliberate family-boundary decision.
  Compass's `category: knowledge-operations` is topic metadata, not proof of a
  mistaken path: the catalog separately derives family from the directory.
- **Skill and agent authoring:** Universal skill-foundry, skill-promotion,
  cataloging, and discovery remain portable skill tooling. Agent Foundry governs
  whole-agent creation/readiness/portability; Copilot Foundries govern task-skill
  packaging for declared hosts. Similar words do not make them duplicate methods.
- **Database cartography:** keep the portable live-SQL introspection package in
  Universal. It is neither specific to reclaiming an undocumented application
  nor a source-agnostic conversation-extraction adapter.
- **OpenClaw:** keep the six host/workspace-specific adapters in OpenClaw rather
  than moving them into their topic families. Their host and operating boundary
  is part of their identity; family membership does not prove live performance.
- **Process, Mermaid, and extraction:** retain artifact-boundary distinctions.
  Process visual modeling consumes a validated process narrative; Mermaid owns
  diagram mechanics; source-specific extraction adapters consume manually
  supplied conversations. They compose instead of replacing one another.
- **Red Teaming and Software Reclamation:** retain the defensive-agentic and
  undocumented-application families. Overlapping security/test vocabulary is not
  evidence of an accidental duplicate or permission to combine their contracts.

## Metadata and routing repairs

At baseline the manifest's aggregate counts were correct, but its `families`
array listed only **16 families and 138 package entries**. It omitted Copilot,
Language Mediation, OpenClaw, Red Teaming, and Software Reclamation, and
underspecified Community, Social Posting, Mermaid, Notion, and Universal.
The integration must regenerate the family members from canonical source in
addition to aggregate counts and verify exact parity with the catalog.

Two authored family narratives also drifted: Context Extraction still called
itself a placeholder despite ten packages, and Agent Foundry named a nonexistent
`okhp3-custom-gpt-skill-conversion-planner` instead of
`okhp3-gpt-skill-conversion-plan`. Repair those current narratives without
rewriting historical audits or hand-editing generated inventory sections.

Reference impacts include package identities, evaluation definitions, catalog
entries, search/detail data, stack selectors, companion links, release workflow
path filters, validation commands, and installed support copies. The migration
registry should resolve old identities to canonical destinations without adding
duplicate installable packages. External GitHub folder links cannot be assumed
to redirect because an application route alias exists.

## Evidence preservation and checked changes

The Grok and repository-settings source moves were performed with `git mv` after
checking that both absolute paths remained within this repository and no target
already existed. Their active identity metadata, evaluation definitions,
repository-settings release workflow paths, and Grok stack selection were updated.
Neither package had a same-named project-local or root `skills/` copy here.

The Grok `evals/benchmark.md` is unchanged as a Git object
(`7ceeacf0d9babd4d5d0a86f8d58709700e68d2cf`). Windows checkout newline conversion
is distinct from a content edit. Original review outputs and hash manifests are
historical evidence, not regenerated endorsements of renamed bytes. Package notes
make that limitation explicit.

Intentionally retained historical identifiers occur in the original
`docs/repo-settings-review/`, `docs/repo-settings-v2/`,
`docs/repo-settings-recap.md`, existing `docs/archive/` records, and
`docs/CHANGELOG.md`. Their eventual archived locations are recorded by the
integration archive manifest. The settings creator-handoff also preserves the
originating project's old `.agents/skills/okhp3-repo-settings/` path explicitly as
a historical source identifier, without claiming that external copy was renamed.

Checks completed for the two delegated renames:

- Repository Settings: 23 offline regression tests passed.
- Grok: its bundled package/contract validator passed.
- Both packages: strict Foundry structural validation passed.
- Scoped diff whitespace checks passed with `core.whitespace=cr-at-eol` to
  respect pre-existing committed CRLF lines; no repository setting was changed.

These checks establish local structural and offline behavior evidence only.
They do not establish public deployment, native-host operation, new model
benchmark results, or current validity of historical release approvals.

## Full baseline inventory coverage

Every baseline package below was included in metadata, description, and family
screening. `Retain` means no naming or family move was selected; it is not a
certification of the package's accuracy, safety, or production readiness. Mapped
rows describe the selected integration destination.

| Family | Baseline packages |
|---|---:|
| `abrahamic` | 4 |
| `agent-foundry` | 3 |
| `askjamie` | 10 |
| `community` | 107 |
| `context-extraction` | 10 |
| `copilot` | 40 |
| `glee-fully` | 12 |
| `knowledge-operations` | 7 |
| `language-mediation` | 5 |
| `lifetrkr` | 2 |
| `mermaid` | 10 |
| `notion` | 11 |
| `openclaw` | 6 |
| `outcome-modeling` | 5 |
| `process-capture` | 16 |
| `red-teaming` | 24 |
| `refolddec` | 1 |
| `replit` | 9 |
| `social-posting` | 31 |
| `software-reclamation` | 15 |
| `universal` | 23 |
| **Total** | **351** |

### abrahamic

| Baseline package | Disposition |
|---|---|
| `abrahamic/okhp3-cross-tradition-compare` | Retain |
| `abrahamic/okhp3-tradition-observance-calendar` | Retain |
| `abrahamic/okhp3-tradition-reference` | Retain |
| `abrahamic/okhp3-verse-lookup` | Retain |

### agent-foundry

| Baseline package | Disposition |
|---|---|
| `agent-foundry/okhp3-custom-gpt-builder` | Retain |
| `agent-foundry/okhp3-custom-gpt-readiness` | Retain |
| `agent-foundry/okhp3-gpt-skill-conversion-plan` | Retain |

### askjamie

| Baseline package | Disposition |
|---|---|
| `askjamie/okhp3-askjamie-brand` | Retain |
| `askjamie/okhp3-askjamie-chatgpt-migrate` | Retain |
| `askjamie/okhp3-askjamie-extract-chatgpt` | Retain |
| `askjamie/okhp3-askjamie-extract-claude` | Retain |
| `askjamie/okhp3-askjamie-gpt-builder` | Retain |
| `askjamie/okhp3-askjamie-gpt-readiness` | Retain |
| `askjamie/okhp3-askjamie-repo-creator` | Retain |
| `askjamie/okhp3-askjamie-repo-organizer` | Retain |
| `askjamie/okhp3-askjamie-style-registry` | Retain |
| `askjamie/okhp3-askjamie-thread-context` | Retain |

### community

| Baseline package | Disposition |
|---|---|
| `community/acquire-codebase-knowledge` | Retain |
| `community/agent-governance` | Retain |
| `community/agent-owasp-compliance` | Retain |
| `community/agent-supply-chain` | Retain |
| `community/ai-social-media-content` | Retain |
| `community/api-design` | Retain |
| `community/api-documentation` | Retain |
| `community/appinsights-instrumentation` | Retain |
| `community/architecture-blueprint-generator` | Retain |
| `community/architecture-decision-records` | Retain |
| `community/audit-integrity` | Retain |
| `community/auth-design` | Retain |
| `community/brand-guidelines` | Retain |
| `community/breakdown-test` | Retain |
| `community/browser-testing` | Retain |
| `community/build-evidence-map` | Retain |
| `community/c4-codebase-architecture` | Retain |
| `community/code-analysis` | Retain |
| `community/code-exemplars-blueprint-generator` | Retain |
| `community/code-linting` | Retain |
| `community/code-review` | Retain |
| `community/code-tour` | Retain |
| `community/codebase-architecture` | Retain |
| `community/codebase-discovery` | Retain |
| `community/codebase-memory-mcp` | Retain |
| `community/containerize-aspnet-framework` | Retain |
| `community/containerize-aspnetcore` | Retain |
| `community/context-map` | Retain |
| `community/copilot-instructions-blueprint` | Retain |
| `community/create-readme` | Retain |
| `community/create-specification` | Retain |
| `community/create-tldr-page` | Retain |
| `community/csharp-docs` | Retain |
| `community/csharp-mstest` | Retain |
| `community/csharp-nunit` | Retain |
| `community/csharp-xunit` | Retain |
| `community/custom-instructions-from-codebase` | Retain |
| `community/data-breach-blast-radius` | Retain |
| `community/data-migration` | Retain |
| `community/data-migration-best-practices` | Retain |
| `community/ddd-best-practices` | Retain |
| `community/dependency-audit` | Retain |
| `community/deployment-strategies` | Retain |
| `community/devops-rollout-plan` | Retain |
| `community/diagramming` | Retain |
| `community/doc-and-modernize` | Retain |
| `community/documentation-writer` | Retain |
| `community/dotnet-best-practices` | Retain |
| `community/dotnet-design-pattern-review` | Retain |
| `community/dotnet-upgrade` | Retain |
| `community/ef-core` | Retain |
| `community/efcore-d2-db-diagram` | Retain |
| `community/find-skills` | Retain |
| `community/folder-structure-blueprint-generator` | Retain |
| `community/frontend-design` | Retain |
| `community/incident-postmortem` | Retain |
| `community/integration-testing` | Retain |
| `community/load-testing` | Retain |
| `community/log-analysis` | Retain |
| `community/lsp-architecture` | Retain |
| `community/lsp-dead-code` | Retain |
| `community/lsp-docs` | Retain |
| `community/lsp-refactor` | Retain |
| `community/lsp-test-correlation` | Retain |
| `community/markdown-docs` | Retain |
| `community/mcp-builder` | Retain |
| `community/mermaid-diagrams` | Retain |
| `community/multi-stage-dockerfile` | Retain |
| `community/nuget-manager` | Retain |
| `community/oo-component-documentation` | Retain |
| `community/openapi-to-application-code` | Retain |
| `community/playwright-automation-fill-in-form` | Retain |
| `community/playwright-explore-website` | Retain |
| `community/playwright-generate-test` | Retain |
| `community/premium-frontend-ui` | Retain |
| `community/readme-blueprint-generator` | Retain |
| `community/refactor` | Retain |
| `community/refactor-plan` | Retain |
| `community/refactoring-best-practices` | Retain |
| `community/rest-api-best-practices` | Retain |
| `community/review-and-refactor` | Retain |
| `community/scoutqa-test` | Retain |
| `community/secret-scanning` | Retain |
| `community/secrets-management` | Retain |
| `community/security-analysis` | Retain |
| `community/security-review` | Retain |
| `community/skill-creator` | Retain |
| `community/software-architecture-analysis` | Retain |
| `community/sql-code-review` | Retain |
| `community/sql-optimization` | Retain |
| `community/sql-server-table-reconciliation` | Retain |
| `community/tdd-best-practices` | Retain |
| `community/technology-stack-blueprint-generator` | Retain |
| `community/theme-factory` | Retain |
| `community/threat-model-analyst` | Retain |
| `community/threat-modeling` | Retain |
| `community/tm7-threat-model` | Retain |
| `community/unit-testing` | Retain |
| `community/update-specification` | Retain |
| `community/vercel-react-best-practices` | Retain |
| `community/vercel-react-native-skills` | Retain |
| `community/web-artifacts-builder` | Retain |
| `community/web-design-guidelines` | Retain |
| `community/web-design-reviewer` | Retain |
| `community/webapp-testing` | Retain |
| `community/workflow-analysis-blueprint` | Retain |
| `community/write-coding-standards-from-file` | Retain |

### context-extraction

| Baseline package | Disposition |
|---|---|
| `context-extraction/okhp3-chatgpt-project-migration` | Retain |
| `context-extraction/okhp3-session-handoff` | Retain |
| `context-extraction/okhp3-thread-context-extraction` | Retain |
| `context-extraction/okhp3-thread-context-extraction-grok` | Canonical destination: `context-extraction/okhp3-thread-extract-grok` |
| `context-extraction/okhp3-thread-extract-chatgpt` | Retain |
| `context-extraction/okhp3-thread-extract-claude` | Retain |
| `context-extraction/okhp3-thread-extract-copilot-m365` | Retain |
| `context-extraction/okhp3-thread-extract-gemini` | Retain |
| `context-extraction/okhp3-thread-extract-mistral-vibe` | Retain |
| `context-extraction/okhp3-thread-extract-perplexity` | Retain |

### copilot

| Baseline package | Disposition |
|---|---|
| `copilot/okhp3-copilot-studio-skill-foundry` | Retain |
| `copilot/okhp3-cowork-commitment-tracker` | Retain |
| `copilot/okhp3-cowork-daily-execution-brief` | Retain |
| `copilot/okhp3-cowork-decision-record` | Retain |
| `copilot/okhp3-cowork-document-critique` | Retain |
| `copilot/okhp3-cowork-file-triage-planner` | Retain |
| `copilot/okhp3-cowork-inbox-triage` | Retain |
| `copilot/okhp3-cowork-meeting-closeout` | Retain |
| `copilot/okhp3-cowork-meeting-prep` | Retain |
| `copilot/okhp3-cowork-project-context-pack` | Retain |
| `copilot/okhp3-cowork-research-evidence-log` | Retain |
| `copilot/okhp3-cowork-skill-foundry` | Retain |
| `copilot/okhp3-cowork-stakeholder-update` | Retain |
| `copilot/okhp3-cowork-weekly-review` | Retain |
| `copilot/okhp3-github-skill-foundry` | Retain |
| `copilot/okhp3-sharepoint-library-accessibility-review` | Retain |
| `copilot/okhp3-sharepoint-library-article-curator` | Retain |
| `copilot/okhp3-sharepoint-library-canonical-source-finder` | Retain |
| `copilot/okhp3-sharepoint-library-contract-extractor` | Retain |
| `copilot/okhp3-sharepoint-library-document-quality-gate` | Retain |
| `copilot/okhp3-sharepoint-library-handover-packager` | Retain |
| `copilot/okhp3-sharepoint-library-intake-classifier` | Retain |
| `copilot/okhp3-sharepoint-library-metadata-review` | Retain |
| `copilot/okhp3-sharepoint-library-policy-citations` | Retain |
| `copilot/okhp3-sharepoint-library-publish-checkout-hygiene` | Retain |
| `copilot/okhp3-sharepoint-library-records-readiness-review` | Retain |
| `copilot/okhp3-sharepoint-library-taxonomy-drift-report` | Retain |
| `copilot/okhp3-sharepoint-list-data-quality-review` | Retain |
| `copilot/okhp3-sharepoint-list-decision-log-curator` | Retain |
| `copilot/okhp3-sharepoint-list-duplicate-record-review` | Retain |
| `copilot/okhp3-sharepoint-list-intake-normalizer` | Retain |
| `copilot/okhp3-sharepoint-list-knowledge-gap-log` | Retain |
| `copilot/okhp3-sharepoint-list-meeting-actions` | Retain |
| `copilot/okhp3-sharepoint-list-portfolio-health-brief` | Retain |
| `copilot/okhp3-sharepoint-list-request-triage` | Retain |
| `copilot/okhp3-sharepoint-list-risk-issue-review` | Retain |
| `copilot/okhp3-sharepoint-list-schema-view-review` | Retain |
| `copilot/okhp3-sharepoint-list-sla-breach-watchlist` | Retain |
| `copilot/okhp3-sharepoint-list-vendor-obligation-review` | Retain |
| `copilot/okhp3-sharepoint-skill-foundry` | Retain |

### glee-fully

| Baseline package | Disposition |
|---|---|
| `glee-fully/glee-fully-repo-standardizer` | Retain |
| `glee-fully/okhp3-glee-fully-brand` | Retain |
| `glee-fully/okhp3-glee-fully-chatgpt-migrate` | Retain |
| `glee-fully/okhp3-glee-fully-extract-chatgpt` | Retain |
| `glee-fully/okhp3-glee-fully-extract-claude` | Retain |
| `glee-fully/okhp3-glee-fully-foundry` | Retain |
| `glee-fully/okhp3-glee-fully-gpt-builder` | Retain |
| `glee-fully/okhp3-glee-fully-gpt-readiness` | Retain |
| `glee-fully/okhp3-glee-fully-repo-creator` | Retain |
| `glee-fully/okhp3-glee-fully-repo-organizer` | Retain |
| `glee-fully/okhp3-glee-fully-style-registry` | Retain |
| `glee-fully/okhp3-glee-fully-thread-context` | Retain |

### knowledge-operations

| Baseline package | Disposition |
|---|---|
| `knowledge-operations/okhp3-artifact-validation` | Retain |
| `knowledge-operations/okhp3-capture-intake` | Retain |
| `knowledge-operations/okhp3-evidence-standard` | Retain |
| `knowledge-operations/okhp3-graduation-gate` | Retain |
| `knowledge-operations/okhp3-project-promotion` | Retain |
| `knowledge-operations/okhp3-source-backed-research` | Retain |
| `knowledge-operations/okhp3-triage-and-file` | Retain |

### language-mediation

| Baseline package | Disposition |
|---|---|
| `language-mediation/okhp3-translation-en-us-de-de` | Retain |
| `language-mediation/okhp3-translation-en-us-en-uk` | Retain |
| `language-mediation/okhp3-translation-en-us-es-es` | Retain |
| `language-mediation/okhp3-translation-en-us-es-mx` | Retain |
| `language-mediation/okhp3-translation-en-us-fr-fr` | Retain |

### lifetrkr

| Baseline package | Disposition |
|---|---|
| `lifetrkr/okhp3-celestial-data` | Retain |
| `lifetrkr/okhp3-daily-oracle` | Retain |

### mermaid

| Baseline package | Disposition |
|---|---|
| `mermaid/okhp3-mermaid-architecture` | Retain |
| `mermaid/okhp3-mermaid-bpmn` | Retain |
| `mermaid/okhp3-mermaid-core` | Retain |
| `mermaid/okhp3-mermaid-data` | Retain |
| `mermaid/okhp3-mermaid-governance` | Retain |
| `mermaid/okhp3-mermaid-publish` | Retain |
| `mermaid/okhp3-mermaid-repair` | Retain |
| `mermaid/okhp3-mermaid-theme-builder` | Retain |
| `mermaid/okhp3-mermaid-update` | Retain |
| `mermaid/okhp3-universe-map` | Retain |

### notion

| Baseline package | Disposition |
|---|---|
| `notion/okhp3-notion-agent-boundary` | Retain |
| `notion/okhp3-notion-capture-router` | Retain |
| `notion/okhp3-notion-core` | Retain |
| `notion/okhp3-notion-destructive-ops` | Retain |
| `notion/okhp3-notion-identity-resolution` | Retain |
| `notion/okhp3-notion-limits-and-retry` | Retain |
| `notion/okhp3-notion-page-read` | Retain |
| `notion/okhp3-notion-page-write` | Retain |
| `notion/okhp3-notion-query` | Retain |
| `notion/okhp3-notion-row-write` | Retain |
| `notion/okhp3-notion-search-strategy` | Retain |

### openclaw

| Baseline package | Disposition |
|---|---|
| `openclaw/okhp3-openclaw-capture-note` | Retain |
| `openclaw/okhp3-openclaw-linkedin-drop` | Retain |
| `openclaw/okhp3-openclaw-mermaid-lint` | Retain |
| `openclaw/okhp3-openclaw-repo-pulse` | Retain |
| `openclaw/okhp3-openclaw-skillz-sync` | Retain |
| `openclaw/okhp3-openclaw-stack-status` | Retain |

### outcome-modeling

| Baseline package | Disposition |
|---|---|
| `outcome-modeling/okhp3-nfl-fantasy-picks` | Retain |
| `outcome-modeling/okhp3-outcome-modeling-core` | Retain |
| `outcome-modeling/okhp3-outcome-modeling-markets` | Retain |
| `outcome-modeling/okhp3-outcome-modeling-sales` | Retain |
| `outcome-modeling/okhp3-outcome-modeling-sports` | Retain |

### process-capture

| Baseline package | Disposition |
|---|---|
| `process-capture/okhp3-as-is-process-capture` | Retain |
| `process-capture/okhp3-decision-model-authoring` | Retain |
| `process-capture/okhp3-elicitation-interviews` | Retain |
| `process-capture/okhp3-future-state-change-strategy` | Retain |
| `process-capture/okhp3-process-gap-exception-analysis` | Retain |
| `process-capture/okhp3-process-intake-and-scope` | Retain |
| `process-capture/okhp3-process-measures-controls` | Retain |
| `process-capture/okhp3-process-narrative-authoring` | Retain |
| `process-capture/okhp3-process-validation-scoring` | Retain |
| `process-capture/okhp3-publication-handoff-packaging` | Retain |
| `process-capture/okhp3-raci-governance-matrix` | Retain |
| `process-capture/okhp3-recurring-task-capture` | Retain |
| `process-capture/okhp3-sipoc-generation` | Retain |
| `process-capture/okhp3-sop-work-instructions` | Retain |
| `process-capture/okhp3-stakeholder-and-role-mapping` | Retain |
| `process-capture/okhp3-visual-process-modeling` | Retain |

### red-teaming

| Baseline package | Disposition |
|---|---|
| `red-teaming/okhp3-adversary-forecasting` | Retain |
| `red-teaming/okhp3-agent-capability-inventory` | Retain |
| `red-teaming/okhp3-agentic-attack-patterns` | Retain |
| `red-teaming/okhp3-agentic-credential-assessment` | Retain |
| `red-teaming/okhp3-agentic-data-exposure` | Retain |
| `red-teaming/okhp3-agentic-exploitation-testing` | Retain |
| `red-teaming/okhp3-agentic-lateral-assessment` | Retain |
| `red-teaming/okhp3-agentic-pattern-observatory` | Retain |
| `red-teaming/okhp3-agentic-persistence-assessment` | Retain |
| `red-teaming/okhp3-attack-economics` | Retain |
| `red-teaming/okhp3-authorization-governance` | Retain |
| `red-teaming/okhp3-behavioral-baselining` | Retain |
| `red-teaming/okhp3-decision-chain-audit-trail` | Retain |
| `red-teaming/okhp3-emerging-threat-lab` | Retain |
| `red-teaming/okhp3-lateral-movement-tracking` | Retain |
| `red-teaming/okhp3-model-anomaly-detection` | Retain |
| `red-teaming/okhp3-post-breach-forensics` | Retain |
| `red-teaming/okhp3-precursor-detection` | Retain |
| `red-teaming/okhp3-proportional-response` | Retain |
| `red-teaming/okhp3-response-cost-benefit` | Retain |
| `red-teaming/okhp3-safe-intelligence-amplifier` | Retain |
| `red-teaming/okhp3-supply-chain-agent-provenance` | Retain |
| `red-teaming/okhp3-threat-intelligence-synthesis` | Retain |
| `red-teaming/okhp3-threat-pattern-validator` | Retain |

### refolddec

| Baseline package | Disposition |
|---|---|
| `refolddec/okhp3-refolddec-core` | Retain |

### replit

| Baseline package | Disposition |
|---|---|
| `replit/okhp3-replit-build-in-public` | Retain |
| `replit/okhp3-replit-canvas-board` | Retain |
| `replit/okhp3-replit-contest-score-keeper` | Retain |
| `replit/okhp3-replit-design-pipeline` | Retain |
| `replit/okhp3-replit-free-mode-autonomy` | Retain |
| `replit/okhp3-replit-github-sync` | Retain |
| `replit/okhp3-replit-multi-artifact` | Retain |
| `replit/okhp3-replit-repl-janitor` | Canonical destination: `replit/okhp3-replit-repository-janitor` |
| `replit/okhp3-replit-task-executor` | Retain |

### social-posting

| Baseline package | Disposition |
|---|---|
| `social-posting/okhp3-discord-comment` | Retain |
| `social-posting/okhp3-discord-post` | Retain |
| `social-posting/okhp3-facebook-comment` | Retain |
| `social-posting/okhp3-facebook-post` | Retain |
| `social-posting/okhp3-instagram-comment` | Retain |
| `social-posting/okhp3-instagram-post` | Retain |
| `social-posting/okhp3-kofi-post` | Retain |
| `social-posting/okhp3-kofi-supporter-reply` | Retain |
| `social-posting/okhp3-linkedin-angles` | Retain |
| `social-posting/okhp3-linkedin-comment` | Retain |
| `social-posting/okhp3-linkedin-post` | Retain |
| `social-posting/okhp3-linkedin-voice` | Retain |
| `social-posting/okhp3-patreon-comment` | Retain |
| `social-posting/okhp3-patreon-post` | Retain |
| `social-posting/okhp3-pinterest-comment` | Retain |
| `social-posting/okhp3-pinterest-pin` | Retain |
| `social-posting/okhp3-reddit-comment` | Retain |
| `social-posting/okhp3-reddit-post` | Retain |
| `social-posting/okhp3-slack-channel-message` | Retain |
| `social-posting/okhp3-slack-thread-reply` | Retain |
| `social-posting/okhp3-teams-channel-post` | Retain |
| `social-posting/okhp3-teams-thread-reply` | Retain |
| `social-posting/okhp3-telegram-channel-post` | Retain |
| `social-posting/okhp3-telegram-group-reply` | Retain |
| `social-posting/okhp3-tiktok-comment` | Retain |
| `social-posting/okhp3-tiktok-post` | Retain |
| `social-posting/okhp3-twitter-comment` | Retain |
| `social-posting/okhp3-twitter-post` | Retain |
| `social-posting/okhp3-youtube-comment` | Retain |
| `social-posting/okhp3-youtube-community-post` | Retain |
| `social-posting/okhp3-youtube-video` | Retain |

### software-reclamation

| Baseline package | Disposition |
|---|---|
| `software-reclamation/okhp3-reclamation-char-tests` | Retain |
| `software-reclamation/okhp3-reclamation-code-archaeology` | Retain |
| `software-reclamation/okhp3-reclamation-intake` | Retain |
| `software-reclamation/okhp3-reclamation-migration-cutover` | Retain |
| `software-reclamation/okhp3-reclamation-platform` | Retain |
| `software-reclamation/okhp3-reclamation-rbac-tracing` | Retain |
| `software-reclamation/okhp3-reclamation-replacement-build` | Retain |
| `software-reclamation/okhp3-reclamation-replacement-spec` | Retain |
| `software-reclamation/okhp3-reclamation-runtime-reconcile` | Retain |
| `software-reclamation/okhp3-reclamation-scope` | Retain |
| `software-reclamation/okhp3-reclamation-security-review` | Retain |
| `software-reclamation/okhp3-reclamation-target-design` | Retain |
| `software-reclamation/okhp3-reclamation-technical-docs` | Retain |
| `software-reclamation/okhp3-reclamation-transaction-flow` | Retain |
| `software-reclamation/okhp3-reclamation-validation-handoff` | Retain |

### universal

| Baseline package | Disposition |
|---|---|
| `universal/okhp3-brand-style-registry` | Retain |
| `universal/okhp3-cloudflare-worker-api-proxy` | Retain |
| `universal/okhp3-database-cartographer` | Retain |
| `universal/okhp3-equilibrium-review` | Retain |
| `universal/okhp3-foundry-repo-creator` | Canonical destination: `universal/okhp3-repository-creator` |
| `universal/okhp3-github-mirror-janitor` | Retain |
| `universal/okhp3-github-notification-maintainer` | Retain |
| `universal/okhp3-google-gis-client-auth` | Retain |
| `universal/okhp3-i18n-page-release` | Retain |
| `universal/okhp3-i18n-page-sync` | Retain |
| `universal/okhp3-overkill-hill-brand` | Retain |
| `universal/okhp3-project-compass` | Retain |
| `universal/okhp3-repl-repo-janitor` | Canonical destination: `replit/okhp3-replit-repository-janitor`; archive superseded source |
| `universal/okhp3-repo-settings` | Canonical destination: `universal/okhp3-repository-settings` |
| `universal/okhp3-repository-janitor` | Retain |
| `universal/okhp3-repository-organizer` | Retain |
| `universal/okhp3-skill-cataloger` | Retain |
| `universal/okhp3-skill-discovery` | Retain |
| `universal/okhp3-skill-foundry` | Retain |
| `universal/okhp3-skill-promotion` | Retain |
| `universal/okhp3-vite-github-pages` | Retain |
| `universal/sp-build-auditor` | Canonical destination: `copilot/okhp3-sharepoint-content-auditor` |
| `universal/sp-list-architect` | Canonical destination: `copilot/okhp3-sharepoint-list-schema-design` |
