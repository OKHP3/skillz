# Community capability coverage

This index reconciles the 83 capability labels in the supplied 10-section
reverse-engineering workflow with real public Agent Skill packages captured in
this directory.

The labels are not assumed to be published package names. `Direct` means a
captured package has substantially the requested purpose. `Adjacent` means a
captured package provides useful method, evidence, or implementation guidance
but does not fully implement the label. `Gap` means no sufficiently specific
public package was identified in this capture. Gap entries remain explicit so
they can become governed custom skills later without being mistaken for
downloaded community material.

## 1. Governance and authorization

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `assessment-authority-and-scope` | `agent-governance`, `audit-integrity` | Adjacent |
| `software-rights-and-contract-review` | None; legal review remains an owner or counsel activity | Gap |
| `privacy-and-sensitive-data-boundary` | `agent-owasp-compliance`, `secrets-management`, `secret-scanning` | Adjacent |
| `agent-tool-permission-gate` | `agent-governance`, `agent-supply-chain` | Adjacent |
| `evidence-and-provenance-standard` | `build-evidence-map`, `audit-integrity` | Direct |

## 2. Intake and preservation

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `evidence-preserving-artifact-intake` | `build-evidence-map`, `audit-integrity` | Adjacent |
| `artifact-inventory-and-hashing` | `build-evidence-map`, `codebase-memory-mcp` | Adjacent |
| `secrets-and-pii-redaction` | `secret-scanning`, `secrets-management` | Adjacent |
| `repository-and-history-inventory` | `code-tour`, `codebase-memory-mcp`, `code-analysis` | Adjacent |
| `deployed-versus-source-comparison` | `custom-instructions-from-codebase`, `code-analysis` | Adjacent |
| `runtime-evidence-capture` | `appinsights-instrumentation`, `log-analysis`, `incident-postmortem` | Adjacent |

## 3. Platform and technology identification

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `legacy-webapp-platform-fingerprint` | `architecture-blueprint-generator`, `dotnet-upgrade`, `code-analysis` | Adjacent |
| `dotnet-runtime-and-framework-analysis` | `dotnet-upgrade`, `csharp-docs`, `containerize-aspnet-framework`, `containerize-aspnetcore` | Direct |
| `frontend-stack-fingerprint` | `code-analysis`, `web-design-reviewer`, `premium-frontend-ui` | Adjacent |
| `database-engine-and-schema-discovery` | `efcore-d2-db-diagram`, `sql-code-review`, `sql-server-table-reconciliation` | Adjacent |
| `orm-and-query-pattern-analysis` | `ef-core`, `sql-code-review`, `dotnet-design-pattern-review` | Direct |
| `iis-and-windows-hosting-analysis` | `containerize-aspnet-framework`, `devops-rollout-plan`, `multi-stage-dockerfile` | Adjacent |
| `file-storage-and-document-repository-analysis` | `agent-owasp-compliance`, `security-analysis`, `code-analysis` | Adjacent |
| `dependency-and-supply-chain-inventory` | `agent-supply-chain`, `dependency-audit`, `nuget-manager` | Direct |
| `technology-lifecycle-assessment` | `dotnet-upgrade`, `dotnet-design-pattern-review`, `refactoring-best-practices` | Adjacent |

## 4. Static code archaeology

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `legacy-webapp-code-archaeology` | `code-analysis`, `architecture-blueprint-generator`, `codebase-memory-mcp` | Direct |
| `call-graph-and-dependency-analysis` | `codebase-memory-mcp`, `lsp-architecture`, `lsp-test-correlation` | Direct |
| `data-flow-and-control-flow-analysis` | `code-analysis`, `security-analysis`, `codebase-memory-mcp` | Direct |
| `configuration-and-feature-flag-analysis` | `code-analysis`, `review-and-refactor` | Adjacent |
| `background-job-and-scheduled-process-analysis` | `architecture-blueprint-generator`, `appinsights-instrumentation`, `log-analysis` | Adjacent |
| `integration-and-interface-discovery` | `api-design`, `rest-api-best-practices`, `openapi-to-application-code` | Adjacent |
| `dead-code-and-duplicate-path-analysis` | `lsp-dead-code`, `refactor`, `code-analysis` | Direct |
| `static-security-analysis` | `security-review`, `security-analysis`, `agent-owasp-compliance` | Direct |

## 5. Identity and security boundary

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `authentication-tracing` | `auth-design`, `security-analysis` | Adjacent |
| `authorization-and-rbac-tracing` | `auth-design`, `security-analysis` | Direct |
| `tenant-and-partner-isolation-analysis` | `context-map`, `ddd-best-practices`, `security-analysis` | Adjacent |
| `session-and-request-security-analysis` | `auth-design`, `security-analysis`, `agent-owasp-compliance` | Direct |
| `secret-and-credential-flow-analysis` | `secrets-management`, `secret-scanning`, `security-analysis` | Direct |
| `upload-and-download-security-analysis` | `agent-owasp-compliance`, `security-review`, `security-analysis` | Adjacent |
| `audit-and-accountability-analysis` | `audit-integrity`, `security-analysis`, `incident-postmortem` | Adjacent |
| `authorized-legacy-application-security-review` | `agent-governance`, `security-review`, `threat-model-analyst` | Direct |

## 6. Business and transaction reconstruction

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `business-actor-and-relationship-modeling` | `context-map`, `ddd-best-practices` | Direct |
| `edi-and-structured-document-domain-modeling` | `api-design`, `rest-api-best-practices`, `create-specification` | Adjacent; EDI-specific gap |
| `document-type-and-lifecycle-modeling` | `workflow-analysis-blueprint`, `context-map`, `create-specification` | Adjacent |
| `purchase-order-and-invoice-workflow-modeling` | `workflow-analysis-blueprint`, `context-map` | Adjacent |
| `quotation-and-request-workflow-modeling` | `workflow-analysis-blueprint` | Adjacent |
| `partner-specific-rule-analysis` | `context-map`, `ddd-best-practices`, `code-analysis` | Adjacent |
| `business-rule-extraction` | `code-analysis`, `codebase-memory-mcp`, `workflow-analysis-blueprint` | Direct |
| `workflow-state-machine-reconstruction` | `workflow-analysis-blueprint`, `context-map` | Adjacent |
| `notification-and-exception-analysis` | `log-analysis`, `appinsights-instrumentation`, `incident-postmortem` | Adjacent |
| `data-dictionary-and-field-semantics` | `efcore-d2-db-diagram`, `sql-code-review`, `documentation-writer` | Adjacent |

## 7. Runtime and behavioral analysis

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `passive-web-surface-observation` | None specific; `playwright-explore-website` is active exploration | Gap |
| `authorized-webapp-exploration` | `playwright-explore-website`, `webapp-testing`, `scoutqa-test` | Direct |
| `black-box-behavioral-analysis` | `playwright-explore-website`, `scoutqa-test`, `browser-testing` | Adjacent |
| `characterization-test-generation` | `playwright-generate-test`, `browser-testing`, `integration-testing`, `tdd-best-practices` | Direct |
| `golden-workflow-capture` | `playwright-generate-test`, `breakdown-test`, `integration-testing` | Adjacent |
| `source-to-runtime-reconciliation` | `code-analysis`, `architecture-blueprint-generator`, `appinsights-instrumentation` | Adjacent |
| `runtime-configuration-reconciliation` | `appinsights-instrumentation`, `deployment-strategies`, `devops-rollout-plan` | Adjacent |
| `log-and-telemetry-analysis` | `log-analysis`, `appinsights-instrumentation`, `incident-postmortem` | Direct |
| `performance-and-availability-baseline` | `load-testing`, `scoutqa-test`, `appinsights-instrumentation` | Adjacent |

## 8. Documentation and modeling

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `evidence-led-technical-documentation` | `build-evidence-map`, `documentation-writer`, `code-analysis` | Direct |
| `application-overview-generation` | `architecture-blueprint-generator`, `create-readme`, `create-tldr-page` | Direct |
| `architecture-model-generation` | `architecture-blueprint-generator`, `lsp-architecture`, `efcore-d2-db-diagram`, `diagramming` | Direct |
| `functional-inventory-generation` | `code-analysis`, `workflow-analysis-blueprint`, `create-readme` | Adjacent |
| `workflow-card-generation` | `workflow-analysis-blueprint`, `documentation-writer` | Adjacent |
| `authentication-authorization-documentation` | `api-documentation`, `csharp-docs`, `documentation-writer` | Adjacent |
| `database-and-data-model-documentation` | `efcore-d2-db-diagram`, `sql-code-review`, `documentation-writer` | Direct |
| `operations-runbook-generation` | `devops-rollout-plan`, `deployment-strategies`, `incident-postmortem` | Direct |
| `security-findings-documentation` | `security-review`, `threat-model-analyst`, `data-breach-blast-radius` | Direct |
| `requirements-traceability` | `create-specification`, `update-specification`, `breakdown-test` | Adjacent |
| `unknowns-and-questions-management` | `build-evidence-map`, `audit-integrity`, `documentation-writer` | Adjacent |
| `documentation-quality-validation` | `documentation-writer`, `markdown-docs`, `code-review` | Direct |

## 9. Modernization and replacement

| Requested capability | Captured package(s) | Coverage |
|---|---|---|
| `as-is-to-to-be-separation` | `refactor-plan`, `create-specification`, `dotnet-upgrade` | Adjacent |
| `modern-web-application-target-architecture` | `architecture-blueprint-generator`, `premium-frontend-ui`, `rest-api-best-practices` | Direct |
| `modern-dotnet-application-architecture` | `dotnet-upgrade`, `dotnet-design-pattern-review`, `containerize-aspnetcore` | Direct |
| `modern-frontend-architecture` | `premium-frontend-ui`, `web-design-reviewer`, `refactoring-best-practices` | Adjacent |
| `modern-authentication-and-authorization-design` | `auth-design`, `security-review`, `rest-api-best-practices` | Direct |
| `modern-database-and-data-model-design` | `ef-core`, `sql-code-review`, `ddd-best-practices` | Direct |
| `document-and-file-storage-design` | `agent-owasp-compliance`, `security-review`, `api-design` | Adjacent |
| `integration-and-edi-interface-design` | `api-design`, `openapi-to-application-code`, `rest-api-best-practices` | Adjacent; EDI-specific gap |
| `threat-model-and-security-requirements` | `threat-model-analyst`, `security-analysis`, `agent-owasp-compliance` | Direct |
| `replacement-specification-generation` | `create-specification`, `update-specification`, `documentation-writer` | Direct |
| `migration-and-data-mapping` | `data-migration-best-practices`, `data-migration`, `sql-server-table-reconciliation` | Direct |
| `cutover-and-rollback-planning` | `devops-rollout-plan`, `deployment-strategies`, `data-migration-best-practices` | Direct |
| `replacement-acceptance-test-generation` | `breakdown-test`, `browser-testing`, `integration-testing`, `unit-testing` | Direct |
| `modern-implementation-planning` | `refactor-plan`, `create-specification`, `devops-rollout-plan` | Adjacent |
| `modern-application-implementation` | `openapi-to-application-code`, `containerize-aspnetcore`, `premium-frontend-ui` | Direct |
| `replacement-validation-and-regression` | `tdd-best-practices`, `browser-testing`, `integration-testing`, `scoutqa-test`, `attest` not captured | Adjacent |

## Import boundaries

- This is a source capture and comparison set, not a recommendation to run all
  packages together.
- Security, browser, database, deployment, and migration packages require an
  explicit target, authorization mode, data boundary, and review before use.
- The `project-workflow-analysis-blueprint-generator` source package is
  locally represented as `workflow-analysis-blueprint` because the upstream
  directory name exceeds the repository's 36-character limit.
- The `attest` reference in the matrix is intentionally marked as not
  captured; it is a conceptual analogue only and is not present in this
  community directory.
