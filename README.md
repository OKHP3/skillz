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
<!-- Generated: 2026-08-26 17:35 UTC | Families: 20 (16 active) -->

*20 families &nbsp;·&nbsp; 16 active &nbsp;·&nbsp; updated: **August 26, 2026 at 17:35 UTC***

| Family | Skills | What it covers |
|---|---|---|
| [`abrahamic/`](abrahamic/FAMILY.md) | 4 | A family of 4 skills. Find thematically parallel passages across Judaism, Christianity,... |
| [`agent-foundry/`](agent-foundry/FAMILY.md) | 3 | The agent-foundry family covers the creation, readiness assessment, and portability pla... |
| [`artifacts/`](artifacts/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`askjamie/`](askjamie/FAMILY.md) | 10 | One of the three OKHP3 sub-brands. AskJamie is the calm, architected AI helpdesk and in... |
| [`brand-styles/`](brand-styles/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`community/`](community/FAMILY.md) | 13 | A family of 13 skills. Create AI-powered social media content for TikTok, Instagram, Yo... |
| [`context-extraction/`](context-extraction/FAMILY.md) | 10 | The context-extraction family is the mining, extraction, and refinement layer for sourc... |
| [`glee-fully/`](glee-fully/FAMILY.md) | 12 | Conversion target for the Glee-fully custom GPT catalog (~42 GPTs from the `Glee-fullyT... |
| [`knowledge-operations/`](knowledge-operations/FAMILY.md) | 7 | Portable lifecycle skills for capturing, classifying, researching, validating, and prom... |
| [`lib/`](lib/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`lifetrkr/`](lifetrkr/FAMILY.md) | 2 | A family of 2 skills. Calculate moon phase, astrological season, and Mercury retrograde... |
| [`mermaid/`](mermaid/FAMILY.md) | 9 | Nine skills. One foundation, four domain skills, one publish layer, one update skill, o... |
| [`notion/`](notion/FAMILY.md) | 1 | This family covers Notion-centered knowledge operations for OKHP3. |
| [`outcome-modeling/`](outcome-modeling/FAMILY.md) | 5 | A family of 5 skills. OverKill Hill P³ NFL fantasy picks. Use when selecting NFL fantas... |
| [`process-capture/`](process-capture/FAMILY.md) | 16 | One skill: `okhp3-process-capture`. The meta-layer. |
| [`refolddec/`](refolddec/FAMILY.md) | 1 | Agent Skills for ReFolDec operations — recursive folding, unfolding, and refolding acro... |
| [`replit/`](replit/FAMILY.md) | 7 | Agent Skills for building, presenting, deploying, and maintaining projects on the Repli... |
| [`scripts/`](scripts/) | — placeholder | A family of 0 skills. No skills cataloged yet. |
| [`social-posting/`](social-posting/FAMILY.md) | 31 | Platform-specific drafts for LinkedIn, Facebook, X/Twitter, Discord, YouTube,
Ko-fi, In... |
| [`universal/`](universal/FAMILY.md) | 18 | A family of 11 skills. Create a Cloudflare Worker that proxies API calls from a static ... |
<!-- FAMILIES_TABLE_END -->

<!-- SKILLS_CATALOG_START -->
<!-- ⚠️ DO NOT EDIT THIS SECTION MANUALLY — regenerated by scripts/gen-skills-readme.py -->
<!-- Generated: 2026-08-26 17:35 UTC | Skills: 149 | Categories: 16 | Mode: library | Surface: distribution -->

*Catalog last updated: **August 26, 2026 at 17:35 UTC** &nbsp;·&nbsp; **149** skills across **16** categories*

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

### community (13 skills)

| Skill | Description | Version |
|---|---|---|
| [ai-social-media-content](community/ai-social-media-content/SKILL.md) | Create AI-powered social media content for TikTok, Instagram, YouTube, Twitter/X. Generate: image... | — |
| [architecture-decision-records](community/architecture-decision-records/SKILL.md) | Write and maintain Architecture Decision Records (ADRs) following best practices for technical de... | — |
| [brand-guidelines](community/brand-guidelines/SKILL.md) | Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit... | — |
| [find-skills](community/find-skills/SKILL.md) | Helps agents discover, evaluate, and recommend installable agent skills when a task may be better... | — |
| [frontend-design](community/frontend-design/SKILL.md) | Create distinctive, production-grade frontend interfaces with high design quality. Use this skill... | — |
| [mcp-builder](community/mcp-builder/SKILL.md) | Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact... | — |
| [mermaid-diagrams](community/mermaid-diagrams/SKILL.md) | Comprehensive guide for creating software diagrams using Mermaid syntax. Use when users need to c... | — |
| [skill-creator](community/skill-creator/SKILL.md) | Create new skills, modify and improve existing skills, and measure skill performance. Use when us... | — |
| [theme-factory](community/theme-factory/SKILL.md) | Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML... | — |
| [vercel-react-best-practices](community/vercel-react-best-practices/SKILL.md) | React and Next.js performance optimization guidelines from Vercel Engineering. This skill should ... | 1.0.0 |
| [vercel-react-native-skills](community/vercel-react-native-skills/SKILL.md) | React Native and Expo best practices for building performant mobile apps. Use when building React... | 1.0.0 |
| [web-artifacts-builder](community/web-artifacts-builder/SKILL.md) | Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern fron... | — |
| [web-design-guidelines](community/web-design-guidelines/SKILL.md) | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check ... | 1.0.0 |

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
| [okhp3-as-is-process-capture](process-capture/okhp3-as-is-process-capture/SKILL.md) | Capture and normalise a current-state process description into a structured as-is process YAML wi... | 0.1.0 |
| [okhp3-decision-model-authoring](process-capture/okhp3-decision-model-authoring/SKILL.md) | Author and validate decision models from PNS decision points using DMN-aligned rule tables. Use t... | 0.1.0 |
| [okhp3-elicitation-interviews](process-capture/okhp3-elicitation-interviews/SKILL.md) | Plan and facilitate structured elicitation sessions using BABOK v3 interview and workshop techniq... | 0.1.0 |
| [okhp3-future-state-strategy](process-capture/okhp3-future-state-strategy/SKILL.md) | Design a target-state process and a structured change strategy from a gap analysis. Use this skil... | 0.1.0 |
| [okhp3-handoff-packaging](process-capture/okhp3-handoff-packaging/SKILL.md) | Assemble all validated BP-SKILL process artifacts into a publication-ready bundle with a manifest... | 0.1.0 |
| [okhp3-process-capture](process-capture/okhp3-process-capture/SKILL.md) | Capture a recurring task as either a backlog entry or a new skill skeleton. Use when the user say... | 1.1.1 |
| [okhp3-process-controls-metrics](process-capture/okhp3-process-controls-metrics/SKILL.md) | Define process performance measures, KPIs, and compliance controls for a validated PNS. Use this ... | 0.1.0 |
| [okhp3-process-gap-analysis](process-capture/okhp3-process-gap-analysis/SKILL.md) | Identify deviations, gaps, and exception paths between an as-is process capture and its intended ... | 0.1.0 |
| [okhp3-process-intake-and-scope](process-capture/okhp3-process-intake-and-scope/SKILL.md) | Conduct structured process intake and scope definition using BABOK v3 elicitation techniques. Use... | 0.1.0 |
| [okhp3-process-narrative-authoring](process-capture/okhp3-process-narrative-authoring/SKILL.md) | Author and validate a Process Narrative Specification (PNS) from a PIR and stakeholder register. ... | 0.1.0 |
| [okhp3-process-quality-validation](process-capture/okhp3-process-quality-validation/SKILL.md) | Orchestrate the full V1–V9 validation suite across all BP-SKILL process artifacts and produce a 0... | 0.1.0 |
| [okhp3-raci-governance-matrix](process-capture/okhp3-raci-governance-matrix/SKILL.md) | Generate and validate a RACI matrix and governance responsibility document from a validated PNS. ... | 0.1.0 |
| [okhp3-sipoc-generation](process-capture/okhp3-sipoc-generation/SKILL.md) | Generate a SIPOC table from a validated PNS. Use this skill when the user needs a high-level proc... | 0.1.0 |
| [okhp3-sop-work-instructions](process-capture/okhp3-sop-work-instructions/SKILL.md) | Generate Standard Operating Procedures (SOPs) and work instructions from a validated PNS. Use thi... | 0.1.0 |
| [okhp3-stakeholder-and-role-mapping](process-capture/okhp3-stakeholder-and-role-mapping/SKILL.md) | Derive and validate a structured stakeholder register from a completed Process Intake Record. Use... | 0.1.0 |
| [okhp3-visual-process-modeling](process-capture/okhp3-visual-process-modeling/SKILL.md) | Generate, validate, normalise, and explain Mermaid-native bpmn-beta diagrams from a Process Narra... | 0.1.0 |

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

### universal (18 skills)

| Skill | Description | Version |
|---|---|---|
| [okhp3-brand-style-registry](universal/okhp3-brand-style-registry/SKILL.md) | OverKill Hill P³ visual style registry and application workflow. Use when a user wants to extract... | 1.2.0 |
| [okhp3-cloudflare-worker-api-proxy](universal/okhp3-cloudflare-worker-api-proxy/SKILL.md) | Create a Cloudflare Worker that proxies API calls from a static frontend to a keyed API, keeping ... | 1.1.0 |
| [okhp3-database-cartographer](universal/okhp3-database-cartographer/SKILL.md) | OverKill Hill P³ database cartographer. Reverse-engineers and documents the live structure of Pos... | 1.1.0 |
| [okhp3-equilibrium-review](universal/okhp3-equilibrium-review/SKILL.md) | Evaluate a document, report, spreadsheet, hypothesis, decision memo, or Agent Skill with independ... | 1.0.0 |
| [okhp3-foundry-repo-creator](universal/okhp3-foundry-repo-creator/SKILL.md) | Create governed FoundRy child repositories from Custom GPTs, Gemini Gems, Copilot agents, prompt ... | 1.1.0 |
| [okhp3-github-notification-maintainer](universal/okhp3-github-notification-maintainer/SKILL.md) | Triage and maintain GitHub notifications by finding the underlying issue, pull request, review, c... | 1.0.0 |
| [okhp3-google-gis-client-auth](universal/okhp3-google-gis-client-auth/SKILL.md) | OverKill Hill P³ client-only Google Identity Services (GIS) auth workflow. Use when designing, im... | 1.2.0 |
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
