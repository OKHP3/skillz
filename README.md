# Skillz Forge

[![Deploy Skillz Forge to GitHub Pages](https://github.com/OKHP3/skillz/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/OKHP3/skillz/actions/workflows/deploy-pages.yml)
[![Publish health check](https://github.com/OKHP3/skillz/actions/workflows/publish-health-check.yml/badge.svg)](https://github.com/OKHP3/skillz/actions/workflows/publish-health-check.yml)

Skillz Forge is a catalog and review platform for the Skillz ecosystem. It
verifies that skill catalog data, accessibility affordances, and release
gates stay trustworthy as the root distribution families and the wider Skillz
project evolve.

## Artifacts in this monorepo

| Artifact | Directory | Purpose |
|---|---|---|
| Skillz Forge | `artifacts/forge` | Public-facing catalog browser and review surface for skills. |
| Skillz Forge Review Desk | `artifacts/forge-review-desk` | Standalone review workspace for auditing skill submissions. |
| API Server | `artifacts/api-server` | Shared backend API used by the Forge artifacts. |
| Canvas / Mockup Sandbox | `artifacts/mockup-sandbox` | Component preview sandbox for design iteration. |

## Validation & release gates

Reusable validators live under `.agents/skills/` and are wired into
`.github/workflows/release-validation.yml` on pushes and pull requests:

- `catalog-integrity` — rebuilds and checks catalog truth/provenance without credentials.
- `production-build-verification` — builds the standalone Forge artifact and confirms its static output exists.
- `publishing-trigger-check` — verifies GitHub Pages publishing stays family-agnostic and fails closed.
- `static-route-validation` — checks Forge route declarations and hash-anchor targets.
- `validation-smoke` — exercises validator failure boundaries with dependency-free fixtures, including CI report-contract checks.
- `publish-health-check` — confirms the live GitHub Pages site matches the last successful deploy, on a schedule and after every deploy.

See `.agents/skills/README.md` for the project-local support catalog and
`.agents/skills/VALIDATION.md` for how to run each validator locally.

## Publishing status

`.github/workflows/deploy-pages.yml` builds and publishes Skillz Forge to
GitHub Pages on pushes to `main` that touch its watched paths.
`.github/workflows/publish-health-check.yml` independently re-checks, every
30 minutes and right after each deploy run, that the live site is actually
reachable and matches the commit the last successful deploy run built -- a
failure opens a tracking issue labeled `publish-health` (auto-closed once
healthy again) so a silent publish failure doesn't go unnoticed between
pushes. If the `PUBLISH_HEALTH_WEBHOOK_URL` repository secret is configured,
the workflow also sends one Slack/Discord-compatible notification when an
incident opens and one when it recovers; repeated checks do not spam the
webhook. Scheduled failures must persist across three consecutive checks
before opening an incident, while a failed deploy run alerts immediately.
Without the secret, issue tracking continues normally.

## Development

This is a pnpm workspace. Each artifact runs as its own workflow/service; see
`.replit`/`artifact.toml` for the managed dev commands, or run an artifact
directly, e.g.:

```bash
pnpm --filter @workspace/forge run dev
```

## Known gaps

- The Review Desk artifact does not yet have automated tests or CI coverage.

## Distribution families

<!-- FAMILIES_TABLE_START -->
<!-- Generated: 2026-09-01 04:39 UTC | Families: 25 (20 active) -->

*25 families &nbsp;·&nbsp; 20 active &nbsp;·&nbsp; updated: **September 1, 2026 at 04:39 UTC***

| Family | Skills | What it covers |
|---|---|---|
| [`abrahamic/`](abrahamic/FAMILY.md) | 4 | A family of 4 skills. Find thematically parallel passages across Judaism, Christianity,... |
| [`agent-foundry/`](agent-foundry/FAMILY.md) | 3 | The agent-foundry family covers the creation, readiness assessment, and portability pla... |
| [`artifacts/`](artifacts/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`askjamie/`](askjamie/FAMILY.md) | 10 | One of the three OKHP3 sub-brands. AskJamie is the calm, architected AI helpdesk and in... |
| [`brand-styles/`](brand-styles/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`community/`](community/FAMILY.md) | 107 | A family of 107 community-originated skills spanning codebase discovery, architecture, ... |
| [`context-extraction/`](context-extraction/FAMILY.md) | 10 | The context-extraction family is the mining, extraction, and refinement layer for sourc... |
| [`copilot/`](copilot/FAMILY.md) | 36 | Host-oriented Agent Skills for GitHub Copilot, Copilot Cowork, SharePoint Copilot, Copi... |
| [`forge/`](forge/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`glee-fully/`](glee-fully/FAMILY.md) | 12 | Conversion target for the Glee-fully custom GPT catalog (~42 GPTs from the `Glee-fullyT... |
| [`knowledge-operations/`](knowledge-operations/FAMILY.md) | 7 | Portable lifecycle skills for capturing, classifying, researching, validating, and prom... |
| [`language-mediation/`](language-mediation/FAMILY.md) | 5 | Language Mediation governs controlled transformations across human languages,
regional ... |
| [`lib/`](lib/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`lifetrkr/`](lifetrkr/FAMILY.md) | 2 | A family of 2 skills. Calculate moon phase, astrological season, and Mercury retrograde... |
| [`mermaid/`](mermaid/FAMILY.md) | 9 | Nine skills. One foundation, four domain skills, one publish layer, one update skill, o... |
| [`notion/`](notion/FAMILY.md) | 1 | This family covers Notion-centered knowledge operations for OKHP3. |
| [`outcome-modeling/`](outcome-modeling/FAMILY.md) | 5 | A family of 5 skills. OverKill Hill P³ NFL fantasy picks. Use when selecting NFL fantas... |
| [`process-capture/`](process-capture/FAMILY.md) | 16 | The family includes `okhp3-recurring-task-capture` as its meta-layer. |
| [`red-teaming/`](red-teaming/FAMILY.md) | 24 | A family of 24 skills. Forecast adoption of emerging agentic attack patterns from dated... |
| [`refolddec/`](refolddec/FAMILY.md) | 1 | Agent Skills for ReFolDec operations — recursive folding, unfolding, and refolding acro... |
| [`replit/`](replit/FAMILY.md) | 7 | Agent Skills for building, presenting, deploying, and maintaining projects on the Repli... |
| [`scripts/`](scripts/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`social-posting/`](social-posting/FAMILY.md) | 31 | Platform-specific drafts for LinkedIn, Facebook, X/Twitter, Discord, YouTube,
Ko-fi, In... |
| [`software-reclamation/`](software-reclamation/FAMILY.md) | 15 | Family crest: The Reclamation Crest, Remastered |
| [`universal/`](universal/FAMILY.md) | 20 | A family of 11 skills. Create a Cloudflare Worker that proxies API calls from a static ... |
<!-- FAMILIES_TABLE_END -->

<!-- SKILLS_CATALOG_START -->
<!-- ⚠️ DO NOT EDIT THIS SECTION MANUALLY — regenerated by scripts/gen-skills-readme.py -->
<!-- Generated: 2026-09-01 04:39 UTC | Skills: 325 | Categories: 20 | Mode: library | Surface: distribution -->

*Catalog last updated: **September 1, 2026 at 04:39 UTC** &nbsp;·&nbsp; **325** skills across **20** categories*

### abrahamic (4 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-cross-tradition-compare](abrahamic/okhp3-cross-tradition-compare/SKILL.md) | Compare shared themes across Judaism, Christianity, and Islam using 20 seeded passage sets, neutr... | 1.2.0 |
| [okhp3-tradition-observance-calendar](abrahamic/okhp3-tradition-observance-calendar/SKILL.md) | Fetch, compute, and format religious observance calendars for the three in-scope Abrahamic tradit... | 1.2.0 |
| [okhp3-tradition-reference](abrahamic/okhp3-tradition-reference/SKILL.md) | Reference ARE scope, canon, denominations, translations, Pew US shares, and free API providers fo... | 1.2.0 |
| [okhp3-verse-lookup](abrahamic/okhp3-verse-lookup/SKILL.md) | Fetch or integrate scripture passages from Judaism, Christianity, or Islam through the ARE free a... | 1.2.0 |

### agent-foundry (3 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-custom-gpt-builder](agent-foundry/okhp3-custom-gpt-builder/SKILL.md) | >- | 1.3.0 |
| [okhp3-custom-gpt-readiness](agent-foundry/okhp3-custom-gpt-readiness/SKILL.md) | >- | 1.2.0 |
| [okhp3-gpt-skill-conversion-plan](agent-foundry/okhp3-gpt-skill-conversion-plan/SKILL.md) | >- | 1.2.0 |

### askjamie (10 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-askjamie-brand](askjamie/okhp3-askjamie-brand/SKILL.md) | OverKill Hill P³ AskJamie SPA styling. Use when a user wants an AskJamie application, documentati... | 1.1.0 |
| [okhp3-askjamie-chatgpt-migrate](askjamie/okhp3-askjamie-chatgpt-migrate/SKILL.md) | OverKill Hill P³ ChatGPT project migration. Use when migrating, preserving, extracting, inventory... | 1.0.0 |
| [okhp3-askjamie-extract-chatgpt](askjamie/okhp3-askjamie-extract-chatgpt/SKILL.md) | Extract manually supplied ChatGPT conversations into standalone, actionable Markdown. Use when th... | 2.0.0 |
| [okhp3-askjamie-extract-claude](askjamie/okhp3-askjamie-extract-claude/SKILL.md) | Extract manually supplied Claude conversations into standalone, actionable Markdown. Use when the... | 2.0.0 |
| [okhp3-askjamie-gpt-builder](askjamie/okhp3-askjamie-gpt-builder/SKILL.md) | >- | 1.0.0 |
| [okhp3-askjamie-gpt-readiness](askjamie/okhp3-askjamie-gpt-readiness/SKILL.md) | >- | 1.0.0 |
| [okhp3-askjamie-repo-creator](askjamie/okhp3-askjamie-repo-creator/SKILL.md) | Create governed FoundRy child repositories from Custom GPTs, Gemini Gems, Copilot agents, prompt ... | 1.1.0 |
| [okhp3-askjamie-repo-organizer](askjamie/okhp3-askjamie-repo-organizer/SKILL.md) | OverKill Hill P³ repository organizer for content-first Git repositories. Use when a local Git re... | 1.1.1 |
| [okhp3-askjamie-style-registry](askjamie/okhp3-askjamie-style-registry/SKILL.md) | OverKill Hill P³ visual style registry and application workflow. Use when a user wants to extract... | 1.1.0 |
| [okhp3-askjamie-thread-context](askjamie/okhp3-askjamie-thread-context/SKILL.md) | Extract pasted or uploaded AI chat threads into standalone, actionable Markdown. Use when the use... | 2.0.0 |

### community (107 skills)

| Skill | Description | Version |
|---|---|---|
| [acquire-codebase-knowledge](community/acquire-codebase-knowledge/SKILL.md) | Use this skill when the user explicitly asks to map, document, or onboard into an existing codeba... | 1.3 |
| [agent-governance](community/agent-governance/SKILL.md) | Patterns and techniques for adding governance, safety, and trust controls to AI agent systems. Us... | — |
| [agent-owasp-compliance](community/agent-owasp-compliance/SKILL.md) | Check any AI agent codebase against the OWASP Agentic Security Initiative (ASI) Top 10 risks. Use... | — |
| [agent-supply-chain](community/agent-supply-chain/SKILL.md) | Verify supply chain integrity for AI agent plugins, tools, and dependencies. Use this skill when:... | — |
| [ai-social-media-content](community/ai-social-media-content/SKILL.md) | Create AI-powered social media content for TikTok, Instagram, YouTube, Twitter/X. Generate: image... | — |
| [api-design](community/api-design/SKILL.md) | Designs an interface other people will depend on — REST endpoints, RPC methods, library functions... | — |
| [api-documentation](community/api-documentation/SKILL.md) | Documents an interface others will call — endpoints, SDK methods, CLI commands, and their paramet... | — |
| [appinsights-instrumentation](community/appinsights-instrumentation/SKILL.md) | Instrument a webapp to send useful telemetry data to Azure App Insights | — |
| [architecture-blueprint-generator](community/architecture-blueprint-generator/SKILL.md) | Comprehensive project architecture blueprint generator that analyzes codebases to create detailed... | — |
| [architecture-decision-records](community/architecture-decision-records/SKILL.md) | Write and maintain Architecture Decision Records (ADRs) following best practices for technical de... | — |
| [audit-integrity](community/audit-integrity/SKILL.md) | Shared audit integrity framework for all AppSec agents — enforces output quality, intellectual ho... | 1.0 |
| [auth-design](community/auth-design/SKILL.md) | Designs how a system knows who someone is and what they may do — login, sessions, tokens, roles, ... | — |
| [brand-guidelines](community/brand-guidelines/SKILL.md) | Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit... | — |
| [breakdown-test](community/breakdown-test/SKILL.md) | Test Planning and Quality Assurance prompt that generates comprehensive test strategies, task bre... | — |
| [browser-testing](community/browser-testing/SKILL.md) | Writes and debugs end-to-end browser tests — Playwright, Cypress, Selenium — covering selector st... | — |
| [build-evidence-map](community/build-evidence-map/SKILL.md) | Build an auditable evidence map for a contested technical choice, research synthesis, proposal re... | — |
| [c4-codebase-architecture](community/c4-codebase-architecture/SKILL.md) | Helps an agent inspect a repository and produce C4 architecture documentation. Use this when reve... | — |
| [code-analysis](community/code-analysis/SKILL.md) | Builds an understanding of a whole codebase or subsystem — what it does, how it is structured, wh... | — |
| [code-exemplars-blueprint-generator](community/code-exemplars-blueprint-generator/SKILL.md) | Technology-agnostic prompt generator that creates customizable AI prompts for scanning codebases ... | — |
| [code-linting](community/code-linting/SKILL.md) | Sets up, fixes, or tunes linting and formatting for a project in any language — Python, JavaScrip... | — |
| [code-review](community/code-review/SKILL.md) | Reviews a change — a diff, a PR, a branch, or uncommitted work — for correctness, risk, and maint... | — |
| [code-tour](community/code-tour/SKILL.md) | Use this skill to create CodeTour .tour files — persona-targeted, step-by-step walkthroughs that ... | — |
| [codebase-architecture](community/codebase-architecture/SKILL.md) | >- | — |
| [codebase-discovery](community/codebase-discovery/SKILL.md) | Extract domain, architecture, business rules, workflows and a business glossary from an existing ... | — |
| [codebase-memory-mcp](community/codebase-memory-mcp/SKILL.md) | Use when exploring unfamiliar code, mapping architecture, finding symbols or relationships, traci... | — |
| [containerize-aspnet-framework](community/containerize-aspnet-framework/SKILL.md) | Containerize an ASP.NET .NET Framework project by creating Dockerfile and .dockerfile files custo... | — |
| [containerize-aspnetcore](community/containerize-aspnetcore/SKILL.md) | Containerize an ASP.NET Core project by creating Dockerfile and .dockerfile files customized for ... | — |
| [context-map](community/context-map/SKILL.md) | Generate a map of all files relevant to a task before making changes | — |
| [copilot-instructions-blueprint](community/copilot-instructions-blueprint/SKILL.md) | Technology-agnostic blueprint generator for creating comprehensive copilot-instructions.md files ... | — |
| [create-readme](community/create-readme/SKILL.md) | Create a README.md file for the project | — |
| [create-specification](community/create-specification/SKILL.md) | Create a new specification file for the solution, optimized for Generative AI consumption. | — |
| [create-tldr-page](community/create-tldr-page/SKILL.md) | Create a tldr page from documentation URLs and command examples, requiring both URL and command n... | — |
| [csharp-docs](community/csharp-docs/SKILL.md) | Ensure that C# types are documented with XML comments and follow best practices for documentation. | — |
| [csharp-mstest](community/csharp-mstest/SKILL.md) | Get best practices for MSTest 3.x/4.x unit testing, including modern assertion APIs and data-driv... | — |
| [csharp-nunit](community/csharp-nunit/SKILL.md) | Get best practices for NUnit unit testing, including data-driven tests | — |
| [csharp-xunit](community/csharp-xunit/SKILL.md) | Get best practices for XUnit unit testing, including data-driven tests | — |
| [custom-instructions-from-codebase](community/custom-instructions-from-codebase/SKILL.md) | Migration and code evolution instructions generator for GitHub Copilot. Analyzes differences betw... | — |
| [data-breach-blast-radius](community/data-breach-blast-radius/SKILL.md) | Pre-breach impact analysis: inventories sensitive data (PII, PHI, PCI-DSS, credentials), traces d... | — |
| [data-migration](community/data-migration/SKILL.md) | Changes a schema or moves data in production without downtime or loss — column changes, backfills... | — |
| [data-migration-best-practices](community/data-migration-best-practices/SKILL.md) | Operational data migration guidance. Use when moving or transforming persisted data between schem... | — |
| [ddd-best-practices](community/ddd-best-practices/SKILL.md) | Domain-Driven Design guidance for modeling complex domains. Use when designing Bounded Contexts o... | 1.0.0 |
| [dependency-audit](community/dependency-audit/SKILL.md) | Assesses what a project depends on — known vulnerabilities, licence obligations, abandoned packag... | — |
| [deployment-strategies](community/deployment-strategies/SKILL.md) | Gets a change into production safely — blue-green, canary, rolling, feature flags, and the rollba... | — |
| [devops-rollout-plan](community/devops-rollout-plan/SKILL.md) | Generate comprehensive rollout plans with preflight checks, step-by-step deployment, verification... | — |
| [diagramming](community/diagramming/SKILL.md) | Draws architecture and flow diagrams as code — Mermaid, C4, sequence, ER, and state diagrams that... | — |
| [doc-and-modernize](community/doc-and-modernize/SKILL.md) | >- | — |
| [documentation-writer](community/documentation-writer/SKILL.md) | Diátaxis Documentation Expert. An expert technical writer specializing in creating high-quality s... | — |
| [dotnet-best-practices](community/dotnet-best-practices/SKILL.md) | Ensure .NET/C# code meets best practices for the solution/project. | — |
| [dotnet-design-pattern-review](community/dotnet-design-pattern-review/SKILL.md) | Review the C#/.NET code for design pattern implementation and suggest improvements. | — |
| [dotnet-upgrade](community/dotnet-upgrade/SKILL.md) | Ready-to-use prompts for comprehensive .NET framework upgrade analysis and execution | — |
| [ef-core](community/ef-core/SKILL.md) | Get best practices for Entity Framework Core | — |
| [efcore-d2-db-diagram](community/efcore-d2-db-diagram/SKILL.md) | Generate D2 database diagrams from Entity Framework Core models. USE FOR: EF Core database diagra... | — |
| [find-skills](community/find-skills/SKILL.md) | Helps agents discover, evaluate, and recommend installable agent skills when a task may be better... | — |
| [folder-structure-blueprint-generator](community/folder-structure-blueprint-generator/SKILL.md) | Comprehensive technology-agnostic prompt for analyzing and documenting project folder structures.... | — |
| [frontend-design](community/frontend-design/SKILL.md) | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill... | — |
| [incident-postmortem](community/incident-postmortem/SKILL.md) | Use when an outage, production incident, or significant service degradation has occurred and the ... | — |
| [integration-testing](community/integration-testing/SKILL.md) | Tests that components work together — service against real database, API against real dependencie... | — |
| [load-testing](community/load-testing/SKILL.md) | Measures how a system behaves under load and finds where it breaks — throughput ceilings, latency... | — |
| [log-analysis](community/log-analysis/SKILL.md) | Extracts an answer from logs, traces, or metrics — finding the relevant lines in volume, correlat... | — |
| [lsp-architecture](community/lsp-architecture/SKILL.md) | Generate a structural architecture overview of a codebase: languages, package map, entry points, ... | — |
| [lsp-dead-code](community/lsp-dead-code/SKILL.md) | Enumerate exported symbols in a file and surface those with zero references across the workspace.... | — |
| [lsp-docs](community/lsp-docs/SKILL.md) | Three-tier documentation lookup for any symbol — hover → offline toolchain doc → source definitio... | — |
| [lsp-refactor](community/lsp-refactor/SKILL.md) | End-to-end safe refactor workflow — blast-radius analysis, speculative preview, apply to disk, ve... | — |
| [lsp-test-correlation](community/lsp-test-correlation/SKILL.md) | Find and run the tests that cover a source file. Use after editing a file to discover exactly whi... | — |
| [markdown-docs](community/markdown-docs/SKILL.md) | Writes or restructures project documentation in Markdown — READMEs, guides, references, runbooks,... | — |
| [mcp-builder](community/mcp-builder/SKILL.md) | Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact... | — |
| [mermaid-diagrams](community/mermaid-diagrams/SKILL.md) | Comprehensive guide for creating software diagrams using Mermaid syntax. Use when users need to c... | — |
| [multi-stage-dockerfile](community/multi-stage-dockerfile/SKILL.md) | Create optimized multi-stage Dockerfiles for any language or framework | — |
| [nuget-manager](community/nuget-manager/SKILL.md) | Manage NuGet packages in .NET projects/solutions. Use this skill when adding, removing, or updati... | — |
| [oo-component-documentation](community/oo-component-documentation/SKILL.md) | Create or update standardized object-oriented component documentation using a shared template plu... | — |
| [openapi-to-application-code](community/openapi-to-application-code/SKILL.md) | Generate a complete, production-ready application from an OpenAPI specification | — |
| [playwright-automation-fill-in-form](community/playwright-automation-fill-in-form/SKILL.md) | Automate filling in a form using Playwright MCP | — |
| [playwright-explore-website](community/playwright-explore-website/SKILL.md) | Website exploration for testing using Playwright MCP | — |
| [playwright-generate-test](community/playwright-generate-test/SKILL.md) | Generate a Playwright test based on a scenario using Playwright MCP | — |
| [premium-frontend-ui](community/premium-frontend-ui/SKILL.md) | A comprehensive guide for GitHub Copilot to craft immersive, high-performance web experiences wit... | — |
| [readme-blueprint-generator](community/readme-blueprint-generator/SKILL.md) | Intelligent README.md generation prompt that analyzes project documentation structure and creates... | — |
| [refactor](community/refactor/SKILL.md) | Surgical code refactoring to improve maintainability without changing behavior. Covers extracting... | — |
| [refactor-plan](community/refactor-plan/SKILL.md) | Create a concrete plan before starting a multi-file refactor. Use when the user asks to plan, seq... | — |
| [refactoring-best-practices](community/refactoring-best-practices/SKILL.md) | Safe refactoring guidance for legacy and existing codebases. Use when improving design without ch... | 1.0.0 |
| [rest-api-best-practices](community/rest-api-best-practices/SKILL.md) | REST API design guidance. Use when designing or reviewing REST endpoints, choosing HTTP methods a... | 1.0.0 |
| [review-and-refactor](community/review-and-refactor/SKILL.md) | Review and refactor code in your project according to defined instructions | — |
| [scoutqa-test](community/scoutqa-test/SKILL.md) | This skill should be used when the user asks to "test this website", "run exploratory testing", "... | — |
| [secret-scanning](community/secret-scanning/SKILL.md) | Guide for configuring and managing GitHub secret scanning, push protection, custom patterns, and ... | — |
| [secrets-management](community/secrets-management/SKILL.md) | Handles credentials safely through their whole life — where they live, how code gets them, how th... | — |
| [security-analysis](community/security-analysis/SKILL.md) | Reviews code or a change for exploitable vulnerabilities — injection, auth and access-control gap... | — |
| [security-review](community/security-review/SKILL.md) | AI-powered codebase security scanner that reasons about code like a security researcher — tracing... | — |
| [skill-creator](community/skill-creator/SKILL.md) | Create new skills, modify and improve existing skills, and measure skill performance. Use when us... | — |
| [software-architecture-analysis](community/software-architecture-analysis/SKILL.md) | Use this skill to reverse-engineer an existing software system, map its | — |
| [sql-code-review](community/sql-code-review/SKILL.md) | Universal SQL code review assistant that performs comprehensive security, maintainability, and co... | — |
| [sql-optimization](community/sql-optimization/SKILL.md) | Universal SQL performance optimization assistant for comprehensive query tuning, indexing strateg... | — |
| [sql-server-table-reconciliation](community/sql-server-table-reconciliation/SKILL.md) | Use when: comparing SQL Server tables across instances, data migration validation, ETL verificati... | — |
| [tdd-best-practices](community/tdd-best-practices/SKILL.md) | Test-Driven Development guidance. Use when writing tests before implementation, applying Red-Gree... | 1.0.0 |
| [technology-stack-blueprint-generator](community/technology-stack-blueprint-generator/SKILL.md) | Comprehensive technology stack blueprint generator that analyzes codebases to create detailed arc... | — |
| [theme-factory](community/theme-factory/SKILL.md) | Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML... | — |
| [threat-model-analyst](community/threat-model-analyst/SKILL.md) | Full STRIDE-A threat model analysis and incremental update skill for repositories and systems. Su... | — |
| [threat-modeling](community/threat-modeling/SKILL.md) | Works out what could go wrong in a system's design before it is built — who would attack it, how,... | — |
| [tm7-threat-model](community/tm7-threat-model/SKILL.md) | Creates valid Microsoft Threat Modeling Tool (.tm7) files compatible with the Microsoft Threat Mo... | — |
| [unit-testing](community/unit-testing/SKILL.md) | Writes unit tests for code that already exists — choosing what deserves a test, what the cases ar... | — |
| [update-specification](community/update-specification/SKILL.md) | Update an existing specification file for the solution, optimized for Generative AI consumption b... | — |
| [vercel-react-best-practices](community/vercel-react-best-practices/SKILL.md) | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should ... | 1.0.0 |
| [vercel-react-native-skills](community/vercel-react-native-skills/SKILL.md) | React Native and Expo best practices for building performant mobile apps. Use when building React... | 1.0.0 |
| [web-artifacts-builder](community/web-artifacts-builder/SKILL.md) | Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern fron... | — |
| [web-design-guidelines](community/web-design-guidelines/SKILL.md) | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check ... | 1.0.0 |
| [web-design-reviewer](community/web-design-reviewer/SKILL.md) | This skill enables visual inspection of websites running locally or remotely to identify and fix ... | — |
| [webapp-testing](community/webapp-testing/SKILL.md) | Toolkit for interacting with and testing local web applications using Playwright. Supports verify... | — |
| [workflow-analysis-blueprint](community/workflow-analysis-blueprint/SKILL.md) | Comprehensive technology-agnostic prompt generator for documenting end-to-end application workflo... | — |
| [write-coding-standards-from-file](community/write-coding-standards-from-file/SKILL.md) | Write a coding standards document for a project using the coding styles from the file(s) and/or f... | — |

### context-extraction (10 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-chatgpt-project-migration](context-extraction/okhp3-chatgpt-project-migration/SKILL.md) | OverKill Hill P³ ChatGPT project migration. Use when migrating, preserving, extracting, inventory... | 1.0.0 |
| [okhp3-session-handoff](context-extraction/okhp3-session-handoff/SKILL.md) | Create a durable continuation record when work pauses, becomes blocked, crosses a machine, or cro... | 0.1.0 |
| [okhp3-thread-context-extraction](context-extraction/okhp3-thread-context-extraction/SKILL.md) | Extract pasted or uploaded AI chat threads into standalone, actionable Markdown. Use when the use... | 2.0.0 |
| [okhp3-thread-context-extraction-grok](context-extraction/okhp3-thread-context-extraction-grok/SKILL.md) | Extract manually supplied xAI Grok conversations into standalone, actionable Markdown. Use when t... | 2.0.0 |
| [okhp3-thread-extract-chatgpt](context-extraction/okhp3-thread-extract-chatgpt/SKILL.md) | Extract manually supplied ChatGPT conversations into standalone, actionable Markdown. Use when th... | 2.0.0 |
| [okhp3-thread-extract-claude](context-extraction/okhp3-thread-extract-claude/SKILL.md) | Extract manually supplied Claude conversations into standalone, actionable Markdown. Use when the... | 2.0.0 |
| [okhp3-thread-extract-copilot-m365](context-extraction/okhp3-thread-extract-copilot-m365/SKILL.md) | Extract manually supplied Microsoft Copilot and Microsoft 365 Copilot chats into standalone, acti... | 2.0.0 |
| [okhp3-thread-extract-gemini](context-extraction/okhp3-thread-extract-gemini/SKILL.md) | Extract manually supplied Google Gemini conversations into standalone, actionable Markdown. Use w... | 2.0.0 |
| [okhp3-thread-extract-mistral-vibe](context-extraction/okhp3-thread-extract-mistral-vibe/SKILL.md) | Extract manually supplied Mistral Vibe or former Le Chat conversations into standalone, actionabl... | 2.0.0 |
| [okhp3-thread-extract-perplexity](context-extraction/okhp3-thread-extract-perplexity/SKILL.md) | Extract manually supplied Perplexity conversations into standalone, actionable Markdown. Use when... | 2.0.0 |

### copilot (36 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-cowork-commitment-tracker](copilot/okhp3-cowork-commitment-tracker/SKILL.md) | Find and reconcile the user's commitments across an agreed set of email and meeting sources. Use ... | 1.0.0 |
| [okhp3-cowork-daily-execution-brief](copilot/okhp3-cowork-daily-execution-brief/SKILL.md) | Build a realistic personal execution brief from an agreed day's priorities, calendar, and commitm... | 1.0.0 |
| [okhp3-cowork-decision-record](copilot/okhp3-cowork-decision-record/SKILL.md) | Draft a durable decision record from an agreed discussion or source set. Use when capturing a dec... | 1.0.0 |
| [okhp3-cowork-document-critique](copilot/okhp3-cowork-document-critique/SKILL.md) | Critique a draft against an explicit audience, purpose, quality bar, and risk checklist. Use when... | 1.0.0 |
| [okhp3-cowork-file-triage-planner](copilot/okhp3-cowork-file-triage-planner/SKILL.md) | Propose a safe folder, naming, and retention cleanup plan for selected files. Use when reviewing ... | 1.0.0 |
| [okhp3-cowork-inbox-triage](copilot/okhp3-cowork-inbox-triage/SKILL.md) | Triage a Microsoft 365 inbox into a prioritized, reviewable work queue. Use when organizing email... | 1.0.0 |
| [okhp3-cowork-meeting-closeout](copilot/okhp3-cowork-meeting-closeout/SKILL.md) | Turn an agreed meeting record into a reviewable decision and action closeout. Use when capturing ... | 1.0.0 |
| [okhp3-cowork-meeting-prep](copilot/okhp3-cowork-meeting-prep/SKILL.md) | Prepare a concise meeting brief from an agreed calendar event and relevant Microsoft 365 context.... | 1.0.0 |
| [okhp3-cowork-project-context-pack](copilot/okhp3-cowork-project-context-pack/SKILL.md) | Create a current, source-linked project context pack from selected Microsoft 365 material. Use wh... | 1.0.0 |
| [okhp3-cowork-research-evidence-log](copilot/okhp3-cowork-research-evidence-log/SKILL.md) | Build a source-linked research evidence log with confirmed, inferred, and unknown claims. Use whe... | 1.0.0 |
| [okhp3-cowork-stakeholder-update](copilot/okhp3-cowork-stakeholder-update/SKILL.md) | Draft a source-grounded stakeholder update for review from an agreed project, time window, and au... | 1.0.0 |
| [okhp3-cowork-weekly-review](copilot/okhp3-cowork-weekly-review/SKILL.md) | Create a personal weekly review from an agreed Microsoft 365 work window. Use when summarizing co... | 1.0.0 |
| [okhp3-sharepoint-library-accessibility-review](copilot/okhp3-sharepoint-library-accessibility-review/SKILL.md) | Review selected SharePoint library documents for supplied accessibility and structure checks, the... | 1.0.0 |
| [okhp3-sharepoint-library-article-curator](copilot/okhp3-sharepoint-library-article-curator/SKILL.md) | Curate selected SharePoint document-library articles into a reviewable collection with titles, su... | 1.0.0 |
| [okhp3-sharepoint-library-canonical-source-finder](copilot/okhp3-sharepoint-library-canonical-source-finder/SKILL.md) | Find likely canonical SharePoint library documents among selected related files and report stale ... | 1.0.0 |
| [okhp3-sharepoint-library-contract-extractor](copilot/okhp3-sharepoint-library-contract-extractor/SKILL.md) | Extract specified obligation, renewal, notice, owner, counterparty, and risk fields from selected... | 1.0.0 |
| [okhp3-sharepoint-library-document-quality-gate](copilot/okhp3-sharepoint-library-document-quality-gate/SKILL.md) | Check selected SharePoint library documents against supplied minimum quality rules for naming, se... | 1.0.0 |
| [okhp3-sharepoint-library-handover-packager](copilot/okhp3-sharepoint-library-handover-packager/SKILL.md) | Prepare a reviewable handover inventory from selected SharePoint library files, with coverage gap... | 1.0.0 |
| [okhp3-sharepoint-library-intake-classifier](copilot/okhp3-sharepoint-library-intake-classifier/SKILL.md) | Classify selected SharePoint library files against an approved taxonomy and return confidence, ex... | 1.0.0 |
| [okhp3-sharepoint-library-metadata-review](copilot/okhp3-sharepoint-library-metadata-review/SKILL.md) | Review SharePoint document-library metadata for completeness, controlled-value conformance, and i... | 1.0.0 |
| [okhp3-sharepoint-library-policy-citations](copilot/okhp3-sharepoint-library-policy-citations/SKILL.md) | Answer a policy question from accessible SharePoint library documents with traceable citations, c... | 1.0.0 |
| [okhp3-sharepoint-library-publish-checkout-hygiene](copilot/okhp3-sharepoint-library-publish-checkout-hygiene/SKILL.md) | Review a SharePoint library for unpublished, stale, or checked-out files and return a remediation... | 1.0.0 |
| [okhp3-sharepoint-library-records-readiness-review](copilot/okhp3-sharepoint-library-records-readiness-review/SKILL.md) | Review selected SharePoint library files against supplied records-readiness criteria and return a... | 1.0.0 |
| [okhp3-sharepoint-library-taxonomy-drift-report](copilot/okhp3-sharepoint-library-taxonomy-drift-report/SKILL.md) | Compare a SharePoint library's accessible tags, folders, and views with a supplied information ar... | 1.0.0 |
| [okhp3-sharepoint-list-data-quality-review](copilot/okhp3-sharepoint-list-data-quality-review/SKILL.md) | Review a SharePoint List for missing required values, duplicate candidates, invalid controlled va... | 1.0.0 |
| [okhp3-sharepoint-list-decision-log-curator](copilot/okhp3-sharepoint-list-decision-log-curator/SKILL.md) | Turn supplied decisions, approvals, and notes into reviewable SharePoint List decision records wi... | 1.0.0 |
| [okhp3-sharepoint-list-duplicate-record-review](copilot/okhp3-sharepoint-list-duplicate-record-review/SKILL.md) | Identify and explain likely duplicate SharePoint List records using supplied matching rules. Use ... | 1.0.0 |
| [okhp3-sharepoint-list-intake-normalizer](copilot/okhp3-sharepoint-list-intake-normalizer/SKILL.md) | Normalize SharePoint List intake items into a reviewable, schema-aligned draft. Use when new list... | 1.0.0 |
| [okhp3-sharepoint-list-knowledge-gap-log](copilot/okhp3-sharepoint-list-knowledge-gap-log/SKILL.md) | Turn unresolved questions and missing-content signals into a reviewable SharePoint List knowledge... | 1.0.0 |
| [okhp3-sharepoint-list-meeting-actions](copilot/okhp3-sharepoint-list-meeting-actions/SKILL.md) | Turn supplied meeting notes into a reviewable SharePoint List action draft. Use when decisions, o... | 1.0.0 |
| [okhp3-sharepoint-list-portfolio-health-brief](copilot/okhp3-sharepoint-list-portfolio-health-brief/SKILL.md) | Create a cited portfolio-health brief from supplied SharePoint List fields and owner-approved hea... | 1.0.0 |
| [okhp3-sharepoint-list-request-triage](copilot/okhp3-sharepoint-list-request-triage/SKILL.md) | Triage SharePoint List requests into a transparent review queue using supplied routing rules. Use... | 1.0.0 |
| [okhp3-sharepoint-list-risk-issue-review](copilot/okhp3-sharepoint-list-risk-issue-review/SKILL.md) | Review a SharePoint List of risks or issues into a ranked, evidence-led exception view. Use when ... | 1.0.0 |
| [okhp3-sharepoint-list-schema-view-review](copilot/okhp3-sharepoint-list-schema-view-review/SKILL.md) | Review a SharePoint List schema, views, indexes, and visible configuration against supplied desig... | 1.0.0 |
| [okhp3-sharepoint-list-sla-breach-watchlist](copilot/okhp3-sharepoint-list-sla-breach-watchlist/SKILL.md) | Produce a SharePoint List SLA exception watchlist from supplied status, due-date, and service-tar... | 1.0.0 |
| [okhp3-sharepoint-list-vendor-obligation-review](copilot/okhp3-sharepoint-list-vendor-obligation-review/SKILL.md) | Review a SharePoint List of vendors or obligations for supplied expiry, ownership, and compliance... | 1.0.0 |

### glee-fully (12 skills)

| Skill | Description | Version |
|---|---|---|
| [glee-fully-repo-standardizer](glee-fully/glee-fully-repo-standardizer/SKILL.md) | Scaffold and standardize any Glee-fully child repository (Toolbox, Tool, or Tool-ette tier). When... | 1.1.0 |
| [okhp3-glee-fully-brand](glee-fully/okhp3-glee-fully-brand/SKILL.md) | OverKill Hill P³ Glee-fully SPA styling. Use when a user wants a Glee-fully application, document... | 1.1.0 |
| [okhp3-glee-fully-chatgpt-migrate](glee-fully/okhp3-glee-fully-chatgpt-migrate/SKILL.md) | OverKill Hill P³ ChatGPT project migration. Use when migrating, preserving, extracting, inventory... | 1.0.0 |
| [okhp3-glee-fully-extract-chatgpt](glee-fully/okhp3-glee-fully-extract-chatgpt/SKILL.md) | Extract manually supplied ChatGPT conversations into standalone, actionable Markdown. Use when th... | 2.0.0 |
| [okhp3-glee-fully-extract-claude](glee-fully/okhp3-glee-fully-extract-claude/SKILL.md) | Extract manually supplied Claude conversations into standalone, actionable Markdown. Use when the... | 2.0.0 |
| [okhp3-glee-fully-foundry](glee-fully/okhp3-glee-fully-foundry/SKILL.md) | Design, author, audit, and canon-seal portable Glee-fully Agent Skills across the Trunk, Branch, ... | 1.0.0 |
| [okhp3-glee-fully-gpt-builder](glee-fully/okhp3-glee-fully-gpt-builder/SKILL.md) | >- | 1.0.0 |
| [okhp3-glee-fully-gpt-readiness](glee-fully/okhp3-glee-fully-gpt-readiness/SKILL.md) | >- | 1.0.0 |
| [okhp3-glee-fully-repo-creator](glee-fully/okhp3-glee-fully-repo-creator/SKILL.md) | Create governed FoundRy child repositories from Custom GPTs, Gemini Gems, Copilot agents, prompt ... | 1.1.0 |
| [okhp3-glee-fully-repo-organizer](glee-fully/okhp3-glee-fully-repo-organizer/SKILL.md) | OverKill Hill P³ repository organizer for content-first Git repositories. Use when a local Git re... | 1.1.1 |
| [okhp3-glee-fully-style-registry](glee-fully/okhp3-glee-fully-style-registry/SKILL.md) | OverKill Hill P³ visual style registry and application workflow. Use when a user wants to extract... | 1.1.0 |
| [okhp3-glee-fully-thread-context](glee-fully/okhp3-glee-fully-thread-context/SKILL.md) | Extract pasted or uploaded AI chat threads into standalone, actionable Markdown. Use when the use... | 2.0.0 |

### knowledge-operations (7 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-artifact-validation](knowledge-operations/okhp3-artifact-validation/SKILL.md) | Validate a project change, draft, research packet, skill, promotion package, or handoff before it... | 0.1.0 |
| [okhp3-capture-intake](knowledge-operations/okhp3-capture-intake/SKILL.md) | Preserve one raw idea, file, link, transcript, or request in a project inbox with provenance and ... | 0.1.0 |
| [okhp3-evidence-standard](knowledge-operations/okhp3-evidence-standard/SKILL.md) | Classify consequential claims as confirmed, inferred, proposal, or unknown and keep those tiers v... | 0.1.0 |
| [okhp3-graduation-gate](knowledge-operations/okhp3-graduation-gate/SKILL.md) | Decide whether an active exploratory effort is ready to become formal, should remain active, shou... | 0.1.0 |
| [okhp3-project-promotion](knowledge-operations/okhp3-project-promotion/SKILL.md) | Prepare an exploratory effort that cleared the graduation gate for owner-approved formalization. ... | 0.1.0 |
| [okhp3-source-backed-research](knowledge-operations/okhp3-source-backed-research/SKILL.md) | Produce research notes, comparisons, or recommendations with traceable sources, retrieval dates, ... | 0.1.0 |
| [okhp3-triage-and-file](knowledge-operations/okhp3-triage-and-file/SKILL.md) | Review one or more project inbox items and assign a recorded lifecycle disposition. Use for inbox... | 0.1.0 |

### language-mediation (5 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-translation-en-us-de-de](language-mediation/okhp3-translation-en-us-de-de/SKILL.md) | Translate owned plainspoken text artifacts one way from United States English (en-US) to Germany ... | 1.2.0 |
| [okhp3-translation-en-us-en-uk](language-mediation/okhp3-translation-en-us-en-uk/SKILL.md) | Adapt owned plainspoken text artifacts one way from United States English (en-US) to British Engl... | 1.2.0 |
| [okhp3-translation-en-us-es-es](language-mediation/okhp3-translation-en-us-es-es/SKILL.md) | Translate owned plainspoken text artifacts one way from United States English (en-US) to Spain Sp... | 1.2.0 |
| [okhp3-translation-en-us-es-mx](language-mediation/okhp3-translation-en-us-es-mx/SKILL.md) | Translate owned plainspoken text artifacts one way from United States English (en-US) to Mexican ... | 1.2.0 |
| [okhp3-translation-en-us-fr-fr](language-mediation/okhp3-translation-en-us-fr-fr/SKILL.md) | Translate owned plainspoken text artifacts one way from United States English (en-US) to France F... | 1.3.0 |

### lifetrkr (2 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-celestial-data](lifetrkr/okhp3-celestial-data/SKILL.md) | OverKill Hill P³ offline celestial data engine. Use when implementing or reviewing moon-phase, zo... | 1.3.0 |
| [okhp3-daily-oracle](lifetrkr/okhp3-daily-oracle/SKILL.md) | OverKill Hill P³ daily oracle workflow. Use when building or reviewing a stable reading that comb... | 1.3.0 |

### mermaid (9 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-mermaid-architecture](mermaid/okhp3-mermaid-architecture/SKILL.md) | System and solution architecture diagrams in Mermaid for technical audiences - C4 model (Context/... | 0.2.0 |
| [okhp3-mermaid-bpmn](mermaid/okhp3-mermaid-bpmn/SKILL.md) | BPMN-informed business process modeling in Mermaid. Use whenever the user wants to diagram a busi... | 0.2.0 |
| [okhp3-mermaid-core](mermaid/okhp3-mermaid-core/SKILL.md) | Foundation skill for ALL Mermaid diagram work. Load this first for any task involving Mermaid syn... | 0.2.0 |
| [okhp3-mermaid-data](mermaid/okhp3-mermaid-data/SKILL.md) | Data model and relationship diagrams in Mermaid - entity-relationship (ER) diagrams, class diagra... | 0.2.0 |
| [okhp3-mermaid-governance](mermaid/okhp3-mermaid-governance/SKILL.md) | OverKill Hill P³ Mermaid governance profile manager. Use when establishing a visual and behaviora... | 1.1.0 |
| [okhp3-mermaid-publish](mermaid/okhp3-mermaid-publish/SKILL.md) | Rendering, exporting, and publishing finished Mermaid diagrams. Use after a diagram has passed ok... | 0.2.0 |
| [okhp3-mermaid-repair](mermaid/okhp3-mermaid-repair/SKILL.md) | Syntax repair for broken Mermaid diagrams. Use when a .mmd file or fenced Mermaid block fails to ... | 0.2.0 |
| [okhp3-mermaid-theme-builder](mermaid/okhp3-mermaid-theme-builder/SKILL.md) | Apply reusable color palettes and visual governance to Mermaid diagram code. Use this skill when ... | 0.5.1 |
| [okhp3-mermaid-update](mermaid/okhp3-mermaid-update/SKILL.md) | Style-preserving update of an existing Mermaid diagram. Use when the user provides an existing .m... | 0.2.0 |

### notion (1 skill)

| Skill | Description | Version |
|---|---|---|
| [okhp3-notion-capture-router](notion/okhp3-notion-capture-router/SKILL.md) | Use this skill whenever an agent needs to export, capture, ingest, summarize, route, deduplicate,... | 0.3.0 |

### outcome-modeling (5 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-nfl-fantasy-picks](outcome-modeling/okhp3-nfl-fantasy-picks/SKILL.md) | Select NFL fantasy players, DFS lineups, salary-cap rosters, waiver priorities, or trade targets ... | 1.1.0 |
| [okhp3-outcome-modeling-core](outcome-modeling/okhp3-outcome-modeling-core/SKILL.md) | Design and operationalize outcome models that compress noisy event histories into calibrated fore... | 1.1.0 |
| [okhp3-outcome-modeling-markets](outcome-modeling/okhp3-outcome-modeling-markets/SKILL.md) | Compare independent probabilities with prediction-market prices and evaluate expected value, cali... | 1.1.0 |
| [okhp3-outcome-modeling-sales](outcome-modeling/okhp3-outcome-modeling-sales/SKILL.md) | Forecast pipeline and compare salespeople, territories, accounts, and commercial allocations usin... | 1.1.0 |
| [okhp3-outcome-modeling-sports](outcome-modeling/okhp3-outcome-modeling-sports/SKILL.md) | Model team, game, and player outcomes from repeated sports events, matchup history, schedules, in... | 1.1.0 |

### process-capture (16 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-as-is-process-capture](process-capture/okhp3-as-is-process-capture/SKILL.md) | Capture and normalise a current-state process description into a structured as-is process YAML wi... | 0.2.0 |
| [okhp3-decision-model-authoring](process-capture/okhp3-decision-model-authoring/SKILL.md) | Author and validate decision models from PNS decision points using DMN-aligned rule tables. Use t... | 0.2.0 |
| [okhp3-elicitation-interviews](process-capture/okhp3-elicitation-interviews/SKILL.md) | Plan and facilitate structured elicitation sessions using BABOK v3 interview and workshop techniq... | 0.2.0 |
| [okhp3-future-state-change-strategy](process-capture/okhp3-future-state-change-strategy/SKILL.md) | Design a target-state process and a structured change strategy from a gap analysis. Use this skil... | 0.2.0 |
| [okhp3-process-gap-exception-analysis](process-capture/okhp3-process-gap-exception-analysis/SKILL.md) | Identify deviations, gaps, and exception paths between an as-is process capture and its intended ... | 0.2.0 |
| [okhp3-process-intake-and-scope](process-capture/okhp3-process-intake-and-scope/SKILL.md) | Conduct structured process intake and scope definition using BABOK v3 elicitation techniques. Use... | 0.2.0 |
| [okhp3-process-measures-controls](process-capture/okhp3-process-measures-controls/SKILL.md) | Define process performance measures, KPIs, and compliance controls for a validated PNS. Use this ... | 0.2.0 |
| [okhp3-process-narrative-authoring](process-capture/okhp3-process-narrative-authoring/SKILL.md) | Author and validate a Process Narrative Specification (PNS) from a PIR and stakeholder register. ... | 0.2.0 |
| [okhp3-process-validation-scoring](process-capture/okhp3-process-validation-scoring/SKILL.md) | Orchestrate the full V1–V9 validation suite across all BP-SKILL process artifacts and produce a 0... | 0.2.0 |
| [okhp3-publication-handoff-packaging](process-capture/okhp3-publication-handoff-packaging/SKILL.md) | Assemble all validated BP-SKILL process artifacts into a publication-ready bundle with a manifest... | 0.2.0 |
| [okhp3-raci-governance-matrix](process-capture/okhp3-raci-governance-matrix/SKILL.md) | Generate and validate a RACI matrix and governance responsibility document from a validated PNS. ... | 0.2.0 |
| [okhp3-recurring-task-capture](process-capture/okhp3-recurring-task-capture/SKILL.md) | Capture a recurring task as either a backlog entry or a new skill skeleton. Use when the user say... | 1.1.0 |
| [okhp3-sipoc-generation](process-capture/okhp3-sipoc-generation/SKILL.md) | Generate a SIPOC table from a validated PNS. Use this skill when the user needs a high-level proc... | 0.2.0 |
| [okhp3-sop-work-instructions](process-capture/okhp3-sop-work-instructions/SKILL.md) | Generate Standard Operating Procedures (SOPs) and work instructions from a validated PNS. Use thi... | 0.2.0 |
| [okhp3-stakeholder-and-role-mapping](process-capture/okhp3-stakeholder-and-role-mapping/SKILL.md) | Derive and validate a structured stakeholder register from a completed Process Intake Record. Use... | 0.2.0 |
| [okhp3-visual-process-modeling](process-capture/okhp3-visual-process-modeling/SKILL.md) | Generate, validate, normalise, and explain Mermaid-native bpmn-beta diagrams from a Process Narra... | 0.2.0 |

### red-teaming (24 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-adversary-forecasting](red-teaming/okhp3-adversary-forecasting/SKILL.md) | Forecast adoption of emerging agentic attack patterns from dated, source-backed signals. Use when... | 2.0.0 |
| [okhp3-agent-capability-inventory](red-teaming/okhp3-agent-capability-inventory/SKILL.md) | Inventory deployed agents, models, tools, identities, permissions, data access, and trust boundar... | 2.0.0 |
| [okhp3-agentic-attack-patterns](red-teaming/okhp3-agentic-attack-patterns/SKILL.md) | Define a defensive taxonomy of agentic attack behaviors and observable indicators. Use when norma... | 2.0.0 |
| [okhp3-agentic-credential-assessment](red-teaming/okhp3-agentic-credential-assessment/SKILL.md) | Assess authentication and credential-abuse controls with synthetic identities and approved harnes... | 2.0.0 |
| [okhp3-agentic-data-exposure](red-teaming/okhp3-agentic-data-exposure/SKILL.md) | Assess data-loss prevention and access boundaries with synthetic canary data. Use when validating... | 2.0.0 |
| [okhp3-agentic-exploitation-testing](red-teaming/okhp3-agentic-exploitation-testing/SKILL.md) | Assess whether an agent, tool, or configuration change can cross a defined control boundary in a ... | 2.0.0 |
| [okhp3-agentic-lateral-assessment](red-teaming/okhp3-agentic-lateral-assessment/SKILL.md) | Assess agent-to-agent and service-to-service authorization boundaries using a synthetic capabilit... | 2.0.0 |
| [okhp3-agentic-pattern-observatory](red-teaming/okhp3-agentic-pattern-observatory/SKILL.md) | Collect and triage dated public or approved threat signals about agentic abuse patterns. Use for ... | 2.0.0 |
| [okhp3-agentic-persistence-assessment](red-teaming/okhp3-agentic-persistence-assessment/SKILL.md) | Assess whether agent and host controls detect unauthorized state retention in an isolated disposa... | 2.0.0 |
| [okhp3-attack-economics](red-teaming/okhp3-attack-economics/SKILL.md) | Measure the economic sustainability of defensive controls against distributed agentic threats. Us... | 2.0.0 |
| [okhp3-authorization-governance](red-teaming/okhp3-authorization-governance/SKILL.md) | Define and enforce authorization checkpoints for defensive assessment and response workflows. Use... | 2.0.0 |
| [okhp3-behavioral-baselining](red-teaming/okhp3-behavioral-baselining/SKILL.md) | Establish privacy-aware baselines for agent behavior, tool use, requests, resource consumption, a... | 2.0.0 |
| [okhp3-decision-chain-audit-trail](red-teaming/okhp3-decision-chain-audit-trail/SKILL.md) | Record decision-relevant evidence for detection, approval, response, and review decisions. Use wh... | 2.0.0 |
| [okhp3-emerging-threat-lab](red-teaming/okhp3-emerging-threat-lab/SKILL.md) | Validate emerging agentic threat hypotheses and defensive controls in a disposable synthetic labo... | 2.0.0 |
| [okhp3-lateral-movement-tracking](red-teaming/okhp3-lateral-movement-tracking/SKILL.md) | Detect abnormal agent-to-agent, service-to-service, and tool-call paths. Use when monitoring auth... | 2.0.0 |
| [okhp3-model-anomaly-detection](red-teaming/okhp3-model-anomaly-detection/SKILL.md) | Detect meaningful changes in approved model behavior, tool use, refusal patterns, or output risk.... | 2.0.0 |
| [okhp3-post-breach-forensics](red-teaming/okhp3-post-breach-forensics/SKILL.md) | Investigate a suspected agentic security incident and convert evidence into validated defensive l... | 2.0.0 |
| [okhp3-precursor-detection](red-teaming/okhp3-precursor-detection/SKILL.md) | Detect early indicators of distributed or agentic abuse before a confirmed incident. Use when cor... | 2.0.0 |
| [okhp3-proportional-response](red-teaming/okhp3-proportional-response/SKILL.md) | Select or execute preapproved, reversible, cost-proportional defensive responses to validated sig... | 2.0.0 |
| [okhp3-response-cost-benefit](red-teaming/okhp3-response-cost-benefit/SKILL.md) | Compare defensive responses using expected loss, effectiveness, uncertainty, reversibility, and r... | 2.0.0 |
| [okhp3-safe-intelligence-amplifier](red-teaming/okhp3-safe-intelligence-amplifier/SKILL.md) | Prepare privacy-preserving, source-traceable threat intelligence for approved peer sharing. Use w... | 2.0.0 |
| [okhp3-supply-chain-agent-provenance](red-teaming/okhp3-supply-chain-agent-provenance/SKILL.md) | Verify provenance and integrity of agent packages, models, tools, configurations, and deployments... | 2.0.0 |
| [okhp3-threat-intelligence-synthesis](red-teaming/okhp3-threat-intelligence-synthesis/SKILL.md) | Synthesize dated threat signals into coherent defensive narratives and validation priorities. Use... | 2.0.0 |
| [okhp3-threat-pattern-validator](red-teaming/okhp3-threat-pattern-validator/SKILL.md) | Validate whether a proposed agentic threat pattern affects a representative synthetic architectur... | 2.0.0 |

### refolddec (1 skill)

| Skill | Description | Version |
|---|---|---|
| [okhp3-refolddec-core](refolddec/okhp3-refolddec-core/SKILL.md) | Core ReFolDec transformation skill. Use when the task is explicitly about transforming an artifac... | 1.1.0 |

### replit (7 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-replit-build-in-public](replit/okhp3-replit-build-in-public/SKILL.md) | Full playbook for a Replit Designathon competition submission — canvas organisation for judges, a... | 1.0.1 |
| [okhp3-replit-canvas-board](replit/okhp3-replit-canvas-board/SKILL.md) | Plan and build a structured multi-frame Replit canvas presentation board — hero rows, labeled zon... | 1.0.0 |
| [okhp3-replit-contest-score-keeper](replit/okhp3-replit-contest-score-keeper/SKILL.md) | Review and score fresh Replit BuildHub contest submissions with live rubric checks, safe public-a... | 1.0.0 |
| [okhp3-replit-design-pipeline](replit/okhp3-replit-design-pipeline/SKILL.md) | The complete Replit design iteration loop as a single coherent workflow — extract → sandbox → var... | 1.0.0 |
| [okhp3-replit-github-sync](replit/okhp3-replit-github-sync/SKILL.md) | Recover and maintain safe GitHub synchronization for a Replit project. Use when Replit reports PU... | 1.0.0 |
| [okhp3-replit-multi-artifact](replit/okhp3-replit-multi-artifact/SKILL.md) | Navigate and build in a Replit pnpm multi-artifact monorepo without silent failures. Covers the n... | 1.0.0 |
| [okhp3-replit-repl-janitor](replit/okhp3-replit-repl-janitor/SKILL.md) | OverKill Hill P³ one-Repl repository cleanup workflow for safely auditing and tidying a single Re... | 1.0.1 |

### social-posting (31 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-discord-comment](social-posting/okhp3-discord-comment/SKILL.md) | Draft a Discord reply to a supplied message, thread, or forum conversation. Use when the user wan... | 1.2.0 |
| [okhp3-discord-post](social-posting/okhp3-discord-post/SKILL.md) | Draft a new Discord message, forum post, or thread opener for a named server destination. Use whe... | 1.2.0 |
| [okhp3-facebook-comment](social-posting/okhp3-facebook-comment/SKILL.md) | Draft a Facebook comment or reply to a supplied post and conversation. Use when the user wants to... | 1.2.0 |
| [okhp3-facebook-post](social-posting/okhp3-facebook-post/SKILL.md) | Draft a Facebook post for a named profile, Page, group, or event surface. Use when the user asks ... | 1.2.0 |
| [okhp3-instagram-comment](social-posting/okhp3-instagram-comment/SKILL.md) | Draft an Instagram comment or reply from supplied post and conversation context. Use when the use... | 1.0.0 |
| [okhp3-instagram-post](social-posting/okhp3-instagram-post/SKILL.md) | Draft an Instagram feed, carousel, Reel, or Story publishing brief from supplied material. Use wh... | 1.0.0 |
| [okhp3-kofi-post](social-posting/okhp3-kofi-post/SKILL.md) | Draft a Ko-fi post for a supplied audience and post form. Use when the user needs a public or sup... | 1.1.0 |
| [okhp3-kofi-supporter-reply](social-posting/okhp3-kofi-supporter-reply/SKILL.md) | Draft a private, privacy-preserving Ko-fi reply to a supplied supporter message. Use when the use... | 1.1.0 |
| [okhp3-linkedin-angles](social-posting/okhp3-linkedin-angles/SKILL.md) | Mine finished work, repository history, or a current conversation for 3 to 5 evidence-linked Link... | 2.3.0 |
| [okhp3-linkedin-comment](social-posting/okhp3-linkedin-comment/SKILL.md) | Draft a thoughtful LinkedIn comment or reply to an existing post. Use when the user wants to resp... | 1.2.0 |
| [okhp3-linkedin-post](social-posting/okhp3-linkedin-post/SKILL.md) | Draft a source-backed LinkedIn post from a chosen angle or named topic. Use for standalone posts,... | 2.3.0 |
| [okhp3-linkedin-voice](social-posting/okhp3-linkedin-voice/SKILL.md) | Apply the platform-specific voice contract to any LinkedIn-bound text. Use as the final pass on a... | 2.2.0 |
| [okhp3-patreon-comment](social-posting/okhp3-patreon-comment/SKILL.md) | Draft a Patreon comment or reply from supplied post and access context. Use when the user needs a... | 1.0.0 |
| [okhp3-patreon-post](social-posting/okhp3-patreon-post/SKILL.md) | Draft a Patreon post with a supplied access boundary and post form. Use when the user needs publi... | 1.0.0 |
| [okhp3-pinterest-comment](social-posting/okhp3-pinterest-comment/SKILL.md) | Draft a Pinterest comment or reply from supplied Pin and conversation context. Use when the user ... | 1.0.0 |
| [okhp3-pinterest-pin](social-posting/okhp3-pinterest-pin/SKILL.md) | Draft a Pinterest Pin title, description, destination-link handoff, and board-context checklist f... | 1.0.0 |
| [okhp3-reddit-comment](social-posting/okhp3-reddit-comment/SKILL.md) | Draft a Reddit comment or nested reply from supplied submission, thread, and community-rule conte... | 1.0.0 |
| [okhp3-reddit-post](social-posting/okhp3-reddit-post/SKILL.md) | Draft a Reddit text, link, image, or media submission for a supplied community. Use when the user... | 1.0.0 |
| [okhp3-slack-channel-message](social-posting/okhp3-slack-channel-message/SKILL.md) | Draft a new Slack channel message for a supplied workspace destination. Use when the user needs a... | 1.0.0 |
| [okhp3-slack-thread-reply](social-posting/okhp3-slack-thread-reply/SKILL.md) | Draft a Slack thread reply from a supplied channel, parent message, and conversation context. Use... | 1.0.0 |
| [okhp3-teams-channel-post](social-posting/okhp3-teams-channel-post/SKILL.md) | Draft a Microsoft Teams channel post for a supplied team and channel. Use when the user needs a c... | 1.0.0 |
| [okhp3-teams-thread-reply](social-posting/okhp3-teams-thread-reply/SKILL.md) | Draft a Microsoft Teams channel-thread reply from supplied parent-post and channel context. Use w... | 1.0.0 |
| [okhp3-telegram-channel-post](social-posting/okhp3-telegram-channel-post/SKILL.md) | Draft a Telegram channel post from supplied broadcast-channel context. Use when the user needs a ... | 1.0.0 |
| [okhp3-telegram-group-reply](social-posting/okhp3-telegram-group-reply/SKILL.md) | Draft a Telegram group reply from supplied group, parent-message, and thread context. Use when th... | 1.0.0 |
| [okhp3-tiktok-comment](social-posting/okhp3-tiktok-comment/SKILL.md) | Draft a TikTok comment or reply from supplied post and conversation context. Use when the user wa... | 1.0.0 |
| [okhp3-tiktok-post](social-posting/okhp3-tiktok-post/SKILL.md) | Draft a TikTok video or photo post caption and publishing handoff from supplied material. Use whe... | 1.0.0 |
| [okhp3-twitter-comment](social-posting/okhp3-twitter-comment/SKILL.md) | Draft an X reply, called a Twitter comment in this family, to a supplied post and conversation. U... | 1.2.0 |
| [okhp3-twitter-post](social-posting/okhp3-twitter-post/SKILL.md) | Draft an X post using the portable name Twitter. Use when the user asks for a tweet, X post, conc... | 1.2.0 |
| [okhp3-youtube-comment](social-posting/okhp3-youtube-comment/SKILL.md) | Draft a YouTube comment or reply from supplied video and conversation context. Use when the user ... | 1.1.0 |
| [okhp3-youtube-community-post](social-posting/okhp3-youtube-community-post/SKILL.md) | Draft a YouTube channel post or participant Community post from supplied destination context. Use... | 1.1.0 |
| [okhp3-youtube-video](social-posting/okhp3-youtube-video/SKILL.md) | Draft a YouTube video publishing brief and metadata bundle from supplied video facts. Use when th... | 1.1.0 |

### software-reclamation (15 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-reclamation-char-tests](software-reclamation/okhp3-reclamation-char-tests/SKILL.md) | Generate safe characterization tests for an undocumented web application, preserving observed beh... | 0.1.0 |
| [okhp3-reclamation-code-archaeology](software-reclamation/okhp3-reclamation-code-archaeology/SKILL.md) | Reconstruct an undocumented web application's code structure, dependency maps, control flow, and ... | 0.1.0 |
| [okhp3-reclamation-intake](software-reclamation/okhp3-reclamation-intake/SKILL.md) | Preserve and inventory source, deployment, runtime, configuration, and business artifacts before ... | 0.1.0 |
| [okhp3-reclamation-migration-cutover](software-reclamation/okhp3-reclamation-migration-cutover/SKILL.md) | Plan a reversible migration and cutover for a reclaimed application, including data, integrations... | 0.1.0 |
| [okhp3-reclamation-platform](software-reclamation/okhp3-reclamation-platform/SKILL.md) | Fingerprint the technology, runtime, dependency, hosting, database, and deployment platform of an... | 0.1.0 |
| [okhp3-reclamation-rbac-tracing](software-reclamation/okhp3-reclamation-rbac-tracing/SKILL.md) | Trace authentication, authorization, roles, permissions, tenant boundaries, and protected actions... | 0.1.0 |
| [okhp3-reclamation-replacement-build](software-reclamation/okhp3-reclamation-replacement-build/SKILL.md) | Guide implementation of an approved replacement web application in small, testable increments wit... | 0.1.0 |
| [okhp3-reclamation-replacement-spec](software-reclamation/okhp3-reclamation-replacement-spec/SKILL.md) | Turn reclaimed application evidence into a replacement specification. Make requirements, acceptan... | 0.1.0 |
| [okhp3-reclamation-runtime-reconcile](software-reclamation/okhp3-reclamation-runtime-reconcile/SKILL.md) | Reconcile source, configuration, deployment, observability, and runtime evidence to determine wha... | 0.1.0 |
| [okhp3-reclamation-scope](software-reclamation/okhp3-reclamation-scope/SKILL.md) | Establish authority, target identity, data boundaries, technique modes, approvals, and stop condi... | 0.1.0 |
| [okhp3-reclamation-security-review](software-reclamation/okhp3-reclamation-security-review/SKILL.md) | Conduct an authorized, evidence-led security review of an undocumented web application for an ass... | 0.1.0 |
| [okhp3-reclamation-target-design](software-reclamation/okhp3-reclamation-target-design/SKILL.md) | Design a secure modernization target for a reclaimed web application, including architecture, dat... | 0.1.0 |
| [okhp3-reclamation-technical-docs](software-reclamation/okhp3-reclamation-technical-docs/SKILL.md) | Produce evidence-led technical documentation for an undocumented application, including architect... | 0.1.0 |
| [okhp3-reclamation-transaction-flow](software-reclamation/okhp3-reclamation-transaction-flow/SKILL.md) | Model vendor, customer, purchase-order, invoice, quotation, document, status, notification, and p... | 0.1.0 |
| [okhp3-reclamation-validation-handoff](software-reclamation/okhp3-reclamation-validation-handoff/SKILL.md) | Validate and hand off the reclaimed understanding, documentation, tests, risks, and next actions ... | 0.1.0 |

### universal (20 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-brand-style-registry](universal/okhp3-brand-style-registry/SKILL.md) | OverKill Hill P³ visual style registry and application workflow. Use when a user wants to extract... | 1.2.0 |
| [okhp3-cloudflare-worker-api-proxy](universal/okhp3-cloudflare-worker-api-proxy/SKILL.md) | Create a Cloudflare Worker that proxies API calls from a static frontend to a keyed API, keeping ... | 1.1.0 |
| [okhp3-database-cartographer](universal/okhp3-database-cartographer/SKILL.md) | OverKill Hill P³ database cartographer. Reverse-engineers and documents the live structure of Pos... | 1.1.0 |
| [okhp3-equilibrium-review](universal/okhp3-equilibrium-review/SKILL.md) | Evaluate a document, report, spreadsheet, hypothesis, decision memo, or Agent Skill with independ... | 1.0.0 |
| [okhp3-foundry-repo-creator](universal/okhp3-foundry-repo-creator/SKILL.md) | Create governed FoundRy child repositories from Custom GPTs, Gemini Gems, Copilot agents, prompt ... | 1.1.0 |
| [okhp3-github-notification-maintainer](universal/okhp3-github-notification-maintainer/SKILL.md) | Triage and maintain GitHub notifications by finding the underlying issue, pull request, review, c... | 1.0.0 |
| [okhp3-google-gis-client-auth](universal/okhp3-google-gis-client-auth/SKILL.md) | OverKill Hill P³ client-only Google Identity Services (GIS) auth workflow. Use when designing, im... | 1.2.0 |
| [okhp3-i18n-page-release](universal/okhp3-i18n-page-release/SKILL.md) | Validate and prepare a localized static-web page set for release after its exact-pair translation... | 1.1.0 |
| [okhp3-i18n-page-sync](universal/okhp3-i18n-page-sync/SKILL.md) | Detect which pages on a static site are missing a translation, or have a translation that has fal... | 1.2.0 |
| [okhp3-overkill-hill-brand](universal/okhp3-overkill-hill-brand/SKILL.md) | OverKill Hill P³ OverKill Hill SPA styling. Use when a user wants an OverKill Hill application, d... | 1.1.0 |
| [okhp3-repl-repo-janitor](universal/okhp3-repl-repo-janitor/SKILL.md) | Clean up a single Replit-hosted Git repository — squash-merge and delete old, merged, or abandone... | 0.1.0 |
| [okhp3-repository-janitor](universal/okhp3-repository-janitor/SKILL.md) | Reconcile a collection of local Git repositories with their GitHub origins, inspect all local var... | 0.1.0 |
| [okhp3-repository-organizer](universal/okhp3-repository-organizer/SKILL.md) | OverKill Hill P³ repository organizer for content-first Git repositories. Use when a local Git re... | 1.1.1 |
| [okhp3-skill-cataloger](universal/okhp3-skill-cataloger/SKILL.md) | OverKill Hill P³ skill cataloger. Inventory and validate repository-local Agent Skills, then safe... | 1.7.0 |
| [okhp3-skill-discovery](universal/okhp3-skill-discovery/SKILL.md) | Find, verify, compare, and route to project-local, installed, runtime, or plugin-provided agent s... | 0.1.0 |
| [okhp3-skill-foundry](universal/okhp3-skill-foundry/SKILL.md) | Create, audit, test, and improve portable Agent Skills with evidence-backed instructions, progres... | 3.1.0 |
| [okhp3-skill-promotion](universal/okhp3-skill-promotion/SKILL.md) | Promote and synchronize a project-local Agent Skill into a portable, reviewable distribution pack... | 0.1.0 |
| [okhp3-vite-github-pages](universal/okhp3-vite-github-pages/SKILL.md) | OverKill Hill P³ Vite-to-GitHub-Pages deployment runbook. Use when deploying or troubleshooting t... | 1.1.0 |
| [sp-build-auditor](universal/sp-build-auditor/SKILL.md) | OverKill Hill P³ SharePoint List build screenshot auditor. Use when reviewing screenshots of Shar... | 1.1.0 |
| [sp-list-architect](universal/sp-list-architect/SKILL.md) | OverKill Hill P³ SharePoint List database architecture reviewer. Use when designing, reviewing, o... | 1.1.0 |

<!-- SKILLS_CATALOG_END -->
