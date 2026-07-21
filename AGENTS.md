# AGENTS.md: OKHP3/skillz

This is the canonical agent guide and routing index for this repository. Read it before working here. `CLAUDE.md` is a compatibility pointer to this file.

## Project identity

- **Suite:** OverKill Hill
- **Repository:** `OKHP3/skillz`
- **Type:** Public Agent Skills distribution library, using the `SKILL.md` format
- **License:** MIT at the repository level; individual skills may declare a different license in frontmatter
- **Release state:** Unreleased. There are no Git tags.
- **Current inventory:** 67 distribution skills in 11 active families, 2 placeholder family directories, and 18 project-local support skills under `.agents/skills/`
- **Source of truth:** GitHub repository for installable files; the public landing surface is OverKill Hill `/projects/skillz/`

### Mission: confirmed

Package recurring methods as portable, agent-readable delegation contracts that can run across compatible agent runtimes without repeating the same human explanation.

### Vision: inferred

Become the reusable execution layer of the OKHP3 Visual Language Stack, with composable skill families that make recurring work portable and durable.

## Scope and boundaries

This repository contains SKILL.md contracts, references, examples, fixtures, and small validation or rendering utilities. It is not a deployed application, service, monorepo, or npm workspace. There is one Git repository at the root; no nested Git repositories were found.

The root family directories are the distribution surface. `.agents/skills/` is a project-local support surface containing cataloging, skill-authoring, FoundRy tooling, and platform-specific context-extraction support. Do not count those 18 entries as additional distribution families.

Do not add employer-specific confidential material, private credentials, tokens, cookies, customer or employee data, proprietary system names, hidden network calls, or destructive behavior. Public skills must use synthetic or public-safe examples. A skill must not instruct an agent to bypass permissions, conceal actions, or remove user consent.

## Repository map

| Path | Role |
|---|---|
| `abrahamic/` | Scripture lookup, observance calendar, tradition reference, and cross-tradition comparison skills |
| `community/` | Imported or community-oriented general-purpose skills, including UI, MCP, social, and authoring guidance |
| `lifetrkr/` | Celestial-data and daily-oracle skills |
| `linkedin/` | LinkedIn content pipeline: angles, post drafting, and voice filtering |
| `mermaid/` | Mermaid diagram authoring, governance, theming, publishing, updating, and repair |
| `notion/` | AI conversation capture and routing into Notion knowledge structures |
| `process-capture/` | Process-analysis and documentation pipeline plus the recurring-task capture skill |
| `refolddec/` | ReFolDec fold, unfold, and refold transformations |
| `agent-foundry/` | AI-agent creation, readiness, platform comparison, portability, and lifecycle skills |
| `universal/` | Cross-project builders, cataloging, API proxy, OAuth, and deployment skills |
| `context-extraction/` | Source-agnostic and platform-specific AI-thread extraction, project migration, provenance preservation, and handoff skills |
| `glee-fully/` | Placeholder for a future conversion of Glee-fully capabilities |
| `askjamie/` | Placeholder for future professional-support capabilities |
| `.agents/skills/` | Local support skills and the bundled catalog/authoring utilities |
| `docs/` | Stack position, public surfaces, publishing, security, backlog, changelog, and technology inventory |
| `.github/` | Dependabot, runtime pins, and scheduled technology-inventory automation |
| `skillz.manifest.json` | Machine-readable repository metadata synchronized to the current 67-skill distribution inventory |

## Routing index

Load the narrowest matching skill. If several apply, load the foundation or upstream skill first, then the domain or downstream skill. The skill's own `SKILL.md` is the authority for detailed instructions.

### Mermaid family: load `okhp3-mermaid-core` first for every Mermaid task

| Skill | Trigger and loading rule |
|---|---|
| `okhp3-mermaid-core` | Any Mermaid authoring, explanation, validation, or diagram task. Owns audience declaration, diagram-type selection, design system, naming, registry, and validation gates. |
| `okhp3-mermaid-bpmn` | Business process, workflow, approval chain, swim lane, gateway, event, task, subprocess, or BPMN-flavored diagram. Load after core. |
| `okhp3-mermaid-architecture` | C4, system or solution architecture, infrastructure, deployment, service topology, packet, protocol, or integration diagram. Load after core. |
| `okhp3-mermaid-data` | ERD, class diagram, schema documentation, data model, object structure, or relationship diagram. Load after core. |
| `okhp3-mermaid-publish` | Render, export, or publish a finished Mermaid diagram locally or through an approved Mermaid Chart integration. Load after core and validation. |
| `okhp3-mermaid-update` | Change content in an existing working `.mmd` file or Mermaid block while preserving style, class definitions, and init configuration. Load after core. |
| `okhp3-mermaid-repair` | Repair a parse failure or malformed Mermaid render with the minimum syntax change. Load after core. Do not use for intentional content changes. |
| `okhp3-mermaid-theme-builder` | Apply or generate a palette, theme, renderer profile, classDef bundle, or renderer-safe Mermaid styling. Load after core. |
| `okhp3-mermaid-governance` | Declare a project diagram standard, check conformance, or audit cross-diagram style and behavior drift. Load after core. |

Mermaid cross-cutting rules: preserve style during updates, repair syntax minimally, keep source local unless the user authorizes publication, use stable short IDs, quote labels with spaces or special characters, avoid semicolons, and never invent classDef names or renderer capabilities.

### LinkedIn family

| Skill | Trigger and loading rule |
|---|---|
| `okhp3-linkedin-angles` | Mine a finished artifact or conversation for 3 to 5 postable angles. It produces candidates and does not draft the post. |
| `okhp3-linkedin-post` | Draft from a selected angle or directly named topic. It applies voice and runs the final employer-context scrub. |
| `okhp3-linkedin-voice` | Final filter for any LinkedIn-bound draft, whether generated by this family or written by hand. It is not a generator. |

LinkedIn cross-cutting rules: no em dashes, preserve standalone punchy lines, make verbosity earn its space, route public links through OverKill Hill, and exclude employer context by default.

### Process-capture family

Use `okhp3-process-intake-and-scope` for a new process, then compose downstream skills as the artifact matures. Use `okhp3-process-capture` for the meta-task of recognizing a recurring workflow and capturing it as backlog or a new skill skeleton.

| Skill | Trigger |
|---|---|
| `okhp3-process-capture` | The user says they keep doing something, it is the second or third repetition, or asks to make a workflow into a skill. |
| `okhp3-process-intake-and-scope` | Document or scope a process from scratch, including boundaries, inputs, outputs, and business rules. |
| `okhp3-as-is-process-capture` | Capture and normalize the current running process before redesign or gap analysis. |
| `okhp3-elicitation-and-interview-facilitation` | Prepare interviews, workshops, question plans, or targeted follow-up to fill process gaps. |
| `okhp3-stakeholder-and-role-mapping` | Identify affected parties, influence, interest, engagement, or RACI-ready roles from a process intake. |
| `okhp3-process-narrative-authoring` | Turn a completed intake and stakeholder register into a Process Narrative Specification. |
| `okhp3-visual-process-modeling` | Turn a PNS or process notes into a Mermaid-native bpmn-beta diagram, or validate and repair one. |
| `okhp3-decision-model-authoring` | Convert three or more meaningful gateway decisions or explicit business rules into a DMN-aligned decision model. |
| `okhp3-process-gap-and-exception-analysis` | Find deviations, missing steps, breakdowns, and undefined exception paths between current and intended process. |
| `okhp3-future-state-and-change-strategy` | Design a target-state process and change strategy from a gap analysis. |
| `okhp3-process-measures-and-controls-definition` | Define KPIs, targets, measures, compliance controls, or governance registers for a validated process narrative. |
| `okhp3-raci-and-governance-matrix-generation` | Generate a RACI or governance responsibility document from a validated PNS. |
| `okhp3-sipoc-generation` | Produce a Suppliers, Inputs, Process, Outputs, Customers summary from a validated PNS. |
| `okhp3-sop-and-work-instruction-generation` | Produce an SOP or role-specific work instructions from a validated PNS. |
| `okhp3-process-validation-and-quality-scoring` | Run the V1 to V9 validation suite, quality scoring, and publication gate for a complete process documentation set. |
| `okhp3-publication-and-handoff-packaging` | Package validated process artifacts for publication or handoff; requires a passing validation report. |

### Notion and ReFolDec families

| Skill | Trigger and loading rule |
|---|---|
| `okhp3-notion-capture-router` | Capture ChatGPT, Claude, Perplexity, Copilot, Gemini, PDF, or pasted AI conversations into Notion structures, dedupe them, split extracts, and reconcile against OKHP3 GitHub. This is not generic note-taking. |
| `okhp3-refolddec-core` | Explicitly transform an artifact between representations, such as idea to diagram, diagram to documentation, documentation to SKILL.md, or unfold/refold with semantic-loss tracking. Load the target domain skill alongside it. |

### Context-extraction family

The `context-extraction/` family contains nine distribution skills for extracting durable, actionable context from manually supplied AI conversations and migrating ChatGPT project material. Load the narrowest platform adapter first when one exists, then the shared extraction contract or migration skill, then the downstream destination or artifact skill.

| Skill | Trigger |
|---|---|
| `okhp3-thread-context-extraction` | Cross-platform or unknown-source AI thread extraction with provenance and semantic-loss controls. |
| `okhp3-thread-context-extraction-chatgpt` | Manually supplied ChatGPT chats, Projects, Canvas, Deep Research, or export excerpts. |
| `okhp3-thread-context-extraction-claude` | Manually supplied Claude chats, Projects, Artifacts, Research, or export excerpts. |
| `okhp3-thread-context-extraction-copilot-m365` | Manually supplied Microsoft Copilot or Microsoft 365 Copilot captures. |
| `okhp3-thread-context-extraction-gemini` | Manually supplied Gemini chats, Canvas, Deep Research, or Workspace-grounded captures. |
| `okhp3-thread-context-extraction-grok` | Manually supplied Grok or X-grounded captures. |
| `okhp3-thread-context-extraction-mistral-vibe` | Manually supplied Mistral Vibe or former Le Chat captures. |
| `okhp3-thread-context-extraction-perplexity` | Manually supplied Perplexity threads, Research, or source-rich captures. |
| `okhp3-chatgpt-project-migration` | ChatGPT project migration, lossless archives, provenance ledgers, and repository reconciliation. |

### Abrahamic family

| Skill | Trigger |
|---|---|
| `okhp3-cross-tradition-compare` | Compare parallel teachings or passages across Judaism, Christianity, and Islam, including neutral interfaith displays. |
| `okhp3-tradition-observance-calendar` | Retrieve, compute, or format Jewish, Christian, or Islamic observances, including unified lists and `.ics` output. |
| `okhp3-tradition-reference` | Answer or support canon, denomination, translation, API, and in-scope tradition questions. Read before making tradition-related fetch or scope decisions. |
| `okhp3-verse-lookup` | Route, fetch, normalize, or troubleshoot Bible, Quran, Torah, psalm, or other in-scope scripture passages through public APIs. |

### LifeTrkr family

| Skill | Trigger |
|---|---|
| `okhp3-celestial-data` | Calculate moon phase, illumination, next phase, zodiac season, or Mercury retrograde locally without network access. |
| `okhp3-daily-oracle` | Build a cached daily reading, affirmation, horoscope, tarot, or AI-synthesized daily insight feature. |

### Community family

These are general-purpose or imported skills. Prefer the narrower OKHP3 family skill when both match.

| Skill | Trigger |
|---|---|
| `ai-social-media-content` | Create social content, images, video, reels, shorts, captions, hashtags, or thumbnails. |
| `architecture-decision-records` | Create, review, or maintain ADRs and technical decision records. |
| `brand-guidelines` | Apply Anthropic brand colors, typography, or visual standards. |
| `find-skills` | Discover, evaluate, or recommend an installable specialized skill. |
| `frontend-design` | Build or improve distinctive web UI, pages, components, artifacts, or applications. |
| `mcp-builder` | Build MCP servers or tool integrations in Python, Node, or TypeScript. |
| `mermaid-diagrams` | General Mermaid diagrams when the OKHP3 Mermaid family is not the intended specialized workflow. |
| `skill-creator` | Create, edit, evaluate, benchmark, or optimize a skill. |
| `theme-factory` | Apply or create a reusable theme for slides, documents, reports, HTML, or other artifacts. |
| `vercel-react-best-practices` | Write, review, or refactor React or Next.js for performance. Its nested `agents.md` is package-scoped guidance. |
| `vercel-react-native-skills` | Write, review, or refactor React Native or Expo for performance. Its nested `agents.md` is package-scoped guidance. |
| `web-artifacts-builder` | Build complex multi-component HTML artifacts using React, Tailwind, shadcn, and related frontend tooling. |
| `web-design-guidelines` | Audit UI code for interface, accessibility, UX, or design-guideline compliance. |

### Agent-foundry family

| Skill | Trigger |
|---|---|
| `okhp3-custom-gpt-builder` | Create, audit, test, improve, compare, document, or package a Custom GPT or related reusable AI workflow. Verify current platform facts before stating them as definitive. |
| `okhp3-custom-gpt-readiness` | Assess an incomplete Custom GPT concept, inventory evidence, identify blockers and gaps, and prepare a builder handoff. |
| `okhp3-custom-gpt-skill-conversion-planner` | Assess an existing Custom GPT for conversion into a portable Agent Skill, map semantic coverage and loss, and prepare a Skill Foundry handoff. |

The family is intended to expand to Gemini Gems, Copilot declarative agents, OpenClaw agents, and other agent runtimes when their creation or lifecycle methods become concrete skills.

### Universal family

| Skill | Trigger |
|---|---|
| `okhp3-cloudflare-worker-api-proxy` | Keep an API key server-side while proxying calls from a static frontend through a Cloudflare Worker. |
| `okhp3-foundry-repo-creator` | Convert a GPT, Gem, Copilot agent, prompt bundle, Notion concept, or prototype into a governed FoundRy child repository. |
| `okhp3-google-gis-client-auth` | Implement client-only Google Identity Services OAuth for a static React SPA with Calendar or Tasks access. |
| `okhp3-skill-cataloger` | Catalog local `.agents/skills/` or run full-index mode over root family directories. Use the script below and do not hand-edit generated catalog sections. |
| `okhp3-skill-foundry` | Create, hone, evaluate, benchmark, brand, or polish a production-quality Agent Skill using the eight-phase Foundry method. |
| `okhp3-vite-github-pages` | Deploy or repair a React or Vue Vite SPA on GitHub Pages, especially base path, router, and gh-pages issues. |

### Project-local support skills

`.agents/skills/` contains six local entries: `find-skills`, `okhp3-foundry-repo-creator`, `okhp3-notion-capture-router`, `okhp3-skill-cataloger`, `okhp3-skill-foundry`, and `skill-creator`. They support this project and overlap with some distribution packages. Use the local copy when the task is specifically about this repository's catalog or authoring workflow.

## Technology and runtime

- Markdown, JSON, YAML, Mermaid, and SKILL.md are the primary artifact formats.
- Node.js runs the 15 process-capture package test suites and JavaScript utilities. The tracked CI LTS pin is `.github/node-version`.
- Python runs the cataloger, skill-authoring utilities, MCP examples, and technology inventory script. The tracked CI pin is `.github/python-version`; `.replit` requests Python 3.11.
- `process-capture/*/package.json` files are private, standalone ESM packages at version `0.1.0` with no npm dependencies and the test script `node --test tests/*.test.mjs`.
- `mermaid/okhp3-mermaid-publish/package.json` is a private ESM package with Mermaid CLI `11.16.0` as a dev dependency. There is no root `package.json`, workspace, lockfile, TypeScript config, Vite config, Dockerfile, or deployed runtime.
- Python requirements are local to `community/skill-creator` and `community/mcp-builder`. Do not assume a root virtual environment or dependency installation.
- `.github/workflows/refresh-technology-inventory.yml` is scheduled automation for version inventory updates. It is not the repository's general CI test suite.

## Validated commands

Run from the repository root.

```bash
# Check the full distribution catalog without writing generated files
python3 .agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py --full --check

# Validate one skill with the bundled strict validator
python3 .agents/skills/skill-creator/scripts/quick_validate.py path/to/skill

# Run one process-capture package's tests
(cd process-capture/okhp3-process-intake-and-scope && node --test tests/*.test.mjs)

# Run the Mermaid theme-builder tests
(cd mermaid/okhp3-mermaid-theme-builder && node --test tests/*.test.mjs)
```

The full-index check passed and discovered 67 distribution skills in 11 active families. The project cataloger found 18 local support skills, and a structural frontmatter audit found 85 `SKILL.md` files with delimiters, names, and descriptions present. The bundled strict validator currently reports 26 failures across older or extended frontmatter, description length, and YAML formatting. The 16 Node test suites currently run, but 15 have one failing name assertion because their test expects the directory name without the required `okhp3-` prefix. These are known gaps, not evidence that the whole library is validated.

For generated catalog work, use `okhp3-skill-cataloger` in catalog mode for `.agents/skills/README.md` and full-index mode for root `README.md` plus family inventories. Do not hand-edit generated sections. Do not run the technology refresh script casually because it makes network requests and writes the generated technology section and runtime pins.

## Change safety and conventions

- Preserve existing user changes and use minimal diffs.
- Keep `SKILL.md` and `README.md` uppercase. Skill names use lowercase kebab case and normally match their directory name, including the `okhp3-` prefix for OKHP3 skills.
- Keep domain skills composable. Mermaid domain skills defer audience, naming, registry, and validation to `okhp3-mermaid-core`.
- `okhp3-mermaid-update` changes content while preserving style. `okhp3-mermaid-repair` fixes syntax with minimum intervention. Do not merge these workflows.
- `okhp3-linkedin-voice` filters existing text. It does not generate a post.
- Keep public-surface decisions routed through OverKill Hill. Glee-fully and AskJamie are contextual side doors, not alternate canonical homes.
- Keep employer references excluded by default. The LinkedIn post skill has an explicit final scrub gate.
- Do not add em dashes to generated content. Preserve punchy standalone lines. AutoCAD version references, when relevant, use locked R10 wording.
- A rendered diagram is disposable output unless explicitly requested for retention. Never delete source or rendered output as part of repair.

## Support documents

Read only when relevant:

- `docs/STACK-POSITION.md`: stack architecture and ReFolDec relationship
- `docs/PUBLIC_SURFACES.md`: public information architecture and brand routing
- `docs/PUBLISHING.md`: maturity, release, registry, and promotion gates
- `docs/SECURITY.md`: skill supply-chain and data-safety rules
- `docs/CHANGELOG.md`: historical changes and release notes
- `docs/BACKLOG.md`: maturity model and promotion priorities
- `docs/TECHNOLOGY-INVENTORY.md`: runtime, dependency, and version posture

## Known gaps and maintenance notes

- Generated catalogs now reflect the current filesystem: `README.md` reports 67 distribution skills in 11 active families, `context-extraction/FAMILY.md` is active, and `.agents/skills/README.md` reports 18 project-local support skills.
- `skillz.manifest.json` is a machine-readable package summary and must stay synchronized with the current family and skill inventory when public metadata is refreshed.
- `docs/BACKLOG.md`, `docs/PUBLISHING.md`, and `docs/CHANGELOG.md` contain historical references to the old one-skill process-capture family and the removed `SKILLS.md` catalog. Do not treat those historical claims as the current inventory.
- Not every skill has a version in metadata. The cataloger check warns about 25 unversioned entries but passes structural catalog validation.
- There is no release tag and no repository-wide CI test command. Promotion remains gated by `docs/PUBLISHING.md`.

When a skill, family, maturity level, or generated catalog changes, re-run the structural and catalog checks, update this index, and record release-relevant changes in `docs/CHANGELOG.md`. Keep this file factual. Label inferences and unresolved owner decisions rather than filling gaps with assumptions.

Updated: 2026-07-21
