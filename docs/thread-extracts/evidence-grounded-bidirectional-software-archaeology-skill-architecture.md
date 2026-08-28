---
title: "Bidirectional Software Archaeology Skill Architecture"
primary_topic: "Evidence-grounded bidirectional software archaeology skill architecture"
source_platform: "ChatGPT"
capture_mode: "unknown"
completeness: "unknown"
extraction_depth: "balanced"
requested_extraction_depth: "not supplied"
source_title: "not supplied"
source_date: "unknown"
source_time_context: "unknown"
source_locator: "User-supplied pasted-text.txt attachment(s); ChatGPT URL withheld from artifact"
retention_decision: "public-safe"
source_independence: "pass"
generated_at: "2026-08-28T00:04:20Z"
schema_version: "2.0"
artifact_type: thread-context-extract
---

# Bidirectional Software Archaeology Skill Architecture

## Introduction

This supplied ChatGPT capture develops a reusable skill architecture for understanding undocumented web applications and safely moving from legacy implementation to a modern replacement. It starts by identifying overlapping community skills for codebase discovery, architecture analysis, documentation, and modernization; then refines the idea that forward-engineering skills can serve as normative reference grammars for reverse analysis, provided observed application evidence always outranks expected patterns. The proposed lifecycle is stack reconnaissance, evidence-grounded archaeology, adversarial verification, capability and requirement normalization into a technology-neutral intermediate representation, specification recovery, target architecture and modernization planning, forward engineering, and parity validation. The capture recommends a composable catalog of roughly fifteen primary skills rather than either one monolithic skill or dozens of premature micro-skills. No new skill package was authored by this extract.

## Extraction profile

- **Requested depth:** not supplied
- **Selected depth:** balanced
- **Selection basis:** default balanced profile from the named ChatGPT extraction workflow
- **Profile changes:** none
- **Focus areas:** reusable skill architecture, evidence contract, methodology inversion, skill inventory, modernization boundary
- **Must preserve:** the lifecycle, evidence precedence rule, intermediate representation, security boundary, recommended primary catalog, and existing-versus-new capability distinction
- **Safe exclusions:** conversational repetition, rhetorical transitions, and repeated examples where the underlying decision was retained
- **Coverage rule:** preserve distinct decisions and reusable frameworks individually; compress repeated explanations and parallel diagrams; flag all unverified external or current-state claims
- **Not carried forward:** the inaccessible source page as a runtime dependency, unverified claims about community skill availability or currency, and any assumption that a named creation skill can literally be run backward
- **Source-independence test:** pass. A capable reader can understand the proposed architecture and resume design work without ChatGPT access, although external skill availability and platform facts still require verification before implementation.

## Coverage accounting

| Material class | Assessed | Retained | Compressed | Omitted with reason | Missing or unavailable | Notes |
|---|---:|---:|---:|---:|---:|---|
| Turns or turn groups | 5 | 5 | 0 | 0 | 0 | Speaker roles are inferred from flattened discourse boundaries. |
| Rich elements | 8 | 5 | 1 | 1 | 1 | Text diagrams, tables, quoted examples, URL, and unverified skill claims were cataloged. |
| Decisions and alternatives | 14 | 12 | 2 | 0 | 0 | Rejected monolith and premature micro-skill options remain with rationale. |
| Reusable assets | 9 | 9 | 0 | 0 | 0 | Pipeline, evidence schema, layer model, catalog, and traceability chain retained. |

## Source synopsis

The capture is a flattened, manually supplied excerpt from a ChatGPT conversation. It contains five semantic blocks: an assistant-led survey of overlapping Agent Skills; a user question about reversing web-application creation skills; an assistant explanation of methodology inversion and a compiler-like transformation; a user request for a comprehensive inventory; and an assistant inventory of the proposed skill stack. Explicit speaker labels, timestamps, attachments, citations, tool traces, and Project instructions are absent, so role assignment is low confidence and completeness is unknown.

The first block identifies codebase-discovery, doc-and-modernize, software-architecture-analysis, and codebase-architecture as relevant prior art. Its main conclusion is that the desired workflow needs a family of composable skills with a governing orchestrator, not one large reverse-engineering prompt. It separates discovery, comprehension, assessment, and disposition. It also proposes an evidence-grounded foundation in which each finding has an identifier, claim, epistemic classification, confidence, evidence locations, contradictory evidence, validation status, and related findings. The source names three preferred epistemic states for the proposed architecture: observed, inferred, and hypothesized.

The second and third blocks develop the inversion concept. A creation method should not be executed backward mechanically. Instead, it should supply expected structures, diagnostic questions, search strategies, and validation criteria. The observed implementation must remain authoritative. The source expresses this precedence as: application evidence > stack-specific expectation > general model knowledge. It recommends explicitly comparing expected pattern, observed pattern, and divergence. Examples include controllers versus code-behind, service and repository layers versus inline SQL, modern identity versus Forms Authentication, external secret storage versus configuration files, and automated deployment versus manual IIS deployment.

The proposed lifecycle has three major transformations: reverse engineer the existing system, normalize findings into an implementation-neutral specification, and forward engineer a modern system. The normalization step is treated as an intermediate representation containing actors, capabilities, entities, relationships, business rules, workflows, events, interfaces, security requirements, data requirements, operational requirements, nonfunctional requirements, and constraints. This is intended to prevent accidental legacy cloning, such as translating a historical `CustomerType == 7` condition directly into a new codebase instead of recovering the business capability it represents.

Security is deliberately separated from active exploitation. Static archaeology may identify authentication, authorization, secrets, cryptography, file handling, input validation, security headers, trust boundaries, and dependency concerns. Internet-facing penetration testing or exploitation remains a separately authorized engagement. External security findings can be inputs to the archaeology package, but the archaeology workflow does not acquire permission to reproduce those tests.

The inventory block groups the needed capabilities into orchestration and governance, reconnaissance, stack-specific archaeology, architecture recovery, data and integration recovery, business and functional recovery, identity and security, runtime and infrastructure, dependency and lifecycle assessment, verification and characterization, documentation synthesis, normalization, specification recovery, target modernization, forward engineering, and replacement testing. It ultimately recommends approximately fifteen deployable primary skills: application-transformation-orchestrator, application-stack-reconnaissance, codebase-discovery, stack-specific-analysis, architecture-recovery, data-integration-recovery, business-capability-recovery, identity-security-analysis, runtime-infrastructure-recovery, dependency-provenance-analysis, evidence-grounded-analysis, software-analysis-verifier, capability-normalization, system-specification-generator, and legacy-system-modernization.

The source treats trading-partner and EDI semantics as a possible domain overlay for the BFS case, not as a universal assumption. It also recommends reusing forward-engineering skills for modern .NET, frontend, database, identity, DevOps, and testing only after the recovered neutral specification and target architecture exist. The durable architectural conclusion is that the novel value lies in bidirectional orchestration, methodology inversion, evidence governance, and the legacy-to-neutral-IR-to-modern traceability chain, rather than in duplicating every existing creation skill.

## Turn ledger

| Turn | Role | Role confidence | Boundary evidence | Content elements | Summary |
|---|---|---|---|---|---|
| T001 | assistant | low | Opening affirmative answer and explanatory survey of existing skills; no explicit label | E001, E003, E004, E005, E006 | Surveys overlapping community methods and proposes composable reverse-engineering skills with an evidence foundation. |
| T002 | user | low | Long interrogative beginning with whether creation skills could be used in reverse | E002, E004 | Asks whether web-application creation skills can be inverted to identify and document an existing application, then support replacement design. |
| T003 | assistant | low | Opening affirmative answer followed by forward and inverse process examples | E003, E004, E005 | Defines methodology inversion, stack reconnaissance, expected-versus-observed comparison, neutralization, and security limits. |
| T004 | user | low | Direct request beginning with using all information thus far to create a comprehensive list | E006 | Requests the complete skill inventory across the local environment and broader community. |
| T005 | assistant | low | Inventory tables followed by a final recommended catalog and conclusion | E003, E005, E006 | Supplies the layered catalog, existing-versus-new assessment, and a recommendation to build a composable transformation framework. |

## Content element ledger

| Element | Turn | Type | Owner | Fidelity | Source locator | Destination reference | Catalog action |
|---|---|---|---|---|---|---|---|
| E001 | T001 | file | user | text-extracted | `pasted-text.txt` attachment supplied in this task | This extract's synopsis and ledgers | retain |
| E002 | T002 | citation | user | metadata-only | User-supplied ChatGPT URL; page was login-gated when checked | Provenance note only; URL not retained in public-safe body | omit-with-reason |
| E003 | T001-T005 | artifact | assistant | text-extracted | ASCII diagrams, tables, and catalog lists in supplied text | Source synopsis, value inventory, and reusable methods | retain |
| E004 | T001-T003 | code | assistant | text-extracted | Evidence schema, pseudo-code, and forward/inverse flow examples | Reusable methods and decisions | retain |
| E005 | T001-T005 | citation | assistant | referenced-not-supplied | Named external/community skills and claims about current availability | Open questions and verification targets | flag-missing |
| E006 | T004-T005 | artifact | assistant | text-extracted | Comprehensive capability inventory in supplied text | Reusable methods and actionable handoff | retain |
| E007 | T003 | diagram | assistant | text-extracted | Compiler-like legacy-to-IR-to-modern flow | Compressed into the canonical lifecycle | compress |
| E008 | T001-T005 | file | user | unavailable | No separate source export, image, Canvas, generated file, or citation payload supplied | Missing sidecar recorded; no runtime reliance | flag-missing |

## Normalization exceptions

- The source is flattened and has no explicit speaker labels. Five roles are assigned from discourse boundaries and question/answer transitions with low confidence. Writing style alone was not used as the only signal.
- The source URL is a locator, not access authorization. The live page exposed only a login shell, so no additional turns, title, date, Project context, branch history, or attachments were recovered.
- The source names external skills and describes them as current or available. Those are preserved as source claims. Current host inventory confirms callable equivalents for several frontend and data skills, but the exact community claims, versions, and suitability remain unverified.
- No actual database, repository, application, image, Canvas, tool trace, generated file, or citation source was supplied. The proposed application examples are illustrative, not evidence about a particular application.

## Value inventory

| Area | Extracted value | Claim class | Source support |
|---|---|---|---|
| Purpose | Define a reusable workflow for application archaeology, capability recovery, specification recovery, modernization, and replacement validation. | stated | T001-T005 |
| Context and constraints | The target class includes undocumented legacy web applications, potentially .NET/IIS/SQL Server and trading-partner portals. Evidence and authorization boundaries must survive across agents. | stated | T001, T003, T005 |
| Reasoning and alternatives | Prefer a skill family and orchestrator over a monolith or an immediate explosion into dozens of micro-skills. Treat creation methods as diagnostic ontologies, not reversible programs. | stated | T001, T003, T005 |
| Decisions and outcomes | Make application evidence authoritative; insert a neutral intermediate representation before modernization; keep active security testing separate; use approximately fifteen primary skills initially. | stated / proposal | T001-T005 |
| Reusable assets | Evidence record, four-layer capability model, reverse/normalize/forward pipeline, expected-observed-divergence table, traceability chain, and primary skill catalog. | stated / proposal | T001-T005 |

## Decisions and rationale

1. **Use a composable family.** The source rejects one 1,500-line reverse-engineering skill because applications vary and progressive disclosure can select only relevant specialists.
2. **Separate lifecycle stages.** Discovery should not silently decide modernization. The sequence is identify, inventory, recover, verify, normalize, specify, redesign, rebuild, and validate.
3. **Make evidence the constitutional rule.** Application evidence outranks stack expectations, which outrank general model knowledge. This prevents expected architecture from being mistaken for observed architecture.
4. **Invert methods, not code.** Forward skills contribute diagnostic questions, expected patterns, and validation criteria. They do not override missing or contradictory application evidence.
5. **Preserve divergence.** Expected pattern, observed pattern, and divergence are all useful outputs. A missing service layer, inline SQL, fragmented authorization, or manual deployment is a finding, not a reason to invent the expected layer.
6. **Create a neutral IR.** The recovered system model should preserve capabilities, rules, data semantics, interfaces, security, and operational requirements while removing accidental implementation choices.
7. **Gate modernization.** Target architecture, technology selection, and replacement construction activate only after recovery, verification, and normalization reach an explicit acceptance state.
8. **Keep security scoped.** Static discovery and documentation are in scope. Exploitation of a deployed application requires a distinct authorization boundary.
9. **Start with primary boundaries.** Build or compose roughly fifteen primary skills and defer lower-level skills until repeated work demonstrates that a separate boundary is justified.

## Actionable handoff

- **Current state:** A durable architectural proposal exists, but no application-specific reconnaissance, skill-source verification, or new skill package has been completed.
- **Resume point:** Build a source-backed candidate matrix for the fifteen primary boundaries, separating local, currently callable, community, proposed, and unverified capabilities.
- **Required context:** This extract, repository `AGENTS.md`, the local skill indexes, current host skill inventory, and any safe application repository or artifact to be analyzed.

| Action | Owner | Status | Dependencies | Evidence or acceptance condition |
|---|---|---|---|---|
| Verify candidate skills and exact callable names across local repository, installed host, and community sources | agent | proposed | Current indexes and source-backed lookup | Each candidate has source, availability, fit, near-miss risk, prerequisites, and fallback. |
| Define the shared evidence contract and neutral IR schema | user / agent | proposed | Owner agreement on fields and epistemic classes | Schema records claim, classification, confidence, evidence, contradiction, validation, and relationships. |
| Select the first primary package boundary, likely reconnaissance plus orchestration or evidence grounding | user | proposed | Candidate matrix and repeatability evidence | Explicit approval before authoring a new package. |
| Analyze a real application repository read-only | agent | blocked | Safe repository path and scope authorization | Inventory and findings cite exact paths; no production testing or unrelated writes. |
| Add a BFS trading-partner/EDI overlay only if application evidence warrants it | user / agent | proposed | Confirmed domain scope and public-safe references | Overlay is optional and never treated as proof that the application uses EDI. |
| Design matched development and protected holdout evaluations for any new skill | agent | proposed | Draft package and evidence contract | Frozen prompts, fixtures, expectations, version, runner, and holdout status are recorded. |

## Reusable methods and assets

### Canonical pipeline

```text
Existing application
  -> stack reconnaissance
  -> matched reverse-analysis methods
  -> recovered implementation model
  -> evidence verification and reconciliation
  -> capability and requirement normalization
  -> technology-neutral system IR
  -> target architecture and modernization decision
  -> modern forward-engineering skills
  -> replacement implementation
  -> parity, security, migration, and acceptance validation
```

### Evidence record

Use a stable finding identifier and retain the claim, classification, confidence, evidence locations, contradictory evidence, validation requirement, and related findings. The source's illustrative classifications are `OBSERVED`, `INFERRED`, and `HYPOTHESIZED`. The repository's broader evidence standard should be reconciled with these before implementation.

### Expected-versus-observed analysis

| Concern | Expected pattern from a matched creation method | Observed pattern from the application | Result |
|---|---|---|---|
| Authentication | Modern identity provider | Legacy or custom mechanism | Evidence-backed finding and modernization input |
| Authorization | Central policy or RBAC | Fragmented checks or custom filters | Coverage and tenant-isolation investigation |
| Persistence | Service and repository separation | Inline SQL or code-behind access | Architectural divergence, not an invented layer |
| Secrets | External secret management | Configuration or source files | Static security finding; no secret disclosure |
| Deployment | Automated pipeline | Manual web-server deployment | Operational recovery and drift investigation |

### Neutral intermediate representation

The IR should include actors, capabilities, entities, relationships, business rules, workflows, events, interfaces, security requirements, data requirements, operational requirements, nonfunctional requirements, and constraints. Preserve a traceability chain from legacy code to evidence, recovered rule, requirement, target design, implementation, and test.

### Recommended primary catalog

1. `application-transformation-orchestrator`
2. `application-stack-reconnaissance`
3. `codebase-discovery`
4. `stack-specific-analysis`
5. `architecture-recovery`
6. `data-integration-recovery`
7. `business-capability-recovery`
8. `identity-security-analysis`
9. `runtime-infrastructure-recovery`
10. `dependency-provenance-analysis`
11. `evidence-grounded-analysis`
12. `software-analysis-verifier`
13. `capability-normalization`
14. `system-specification-generator`
15. `legacy-system-modernization`

Lower-level candidates named in the source include database and schema recovery, API and file-interface recovery, workflow and business-rule recovery, RBAC and tenant isolation, deployment and environment drift, SBOM and license analysis, characterization tests, documentation generators, target architecture, migration and rollback planning, and replacement testing. Treat these as candidate procedures or references until repeatable demand justifies separate packages.

### Current routing record

- `okhp3-thread-extract-chatgpt`: best match for converting this supplied ChatGPT material into a standalone artifact; requires no ChatGPT login or API key.
- `okhp3-skill-discovery`: governs source-aware candidate discovery and prevents historical or unavailable inventory from being treated as callable.
- `okhp3-skill-foundry`: governs any later skill package design, evaluation, evidence record, release gate, and synchronization. It does not authorize publication or create a new package by itself.
- Current host inventory confirms callable equivalents of several named forward-oriented skills, including frontend application building, frontend testing/debugging, React best practices, shadcn composition, and Supabase/Postgres best practices. These are reference candidates, not reverse-analysis evidence.

## Open questions and limits

- What is the exact source title, date, capture method, and completeness of the original ChatGPT conversation?
- Are the named community skills real, current, accessible, and licensed for reuse? The supplied text does not provide source URLs or version evidence.
- Which Agent Skills-compatible clients must support the eventual package, and which host adapters are permitted?
- Should `evidence-grounded-analysis` be a shared foundation, a reference contract, or an orchestrator-owned schema?
- What is the canonical name and placement for the proposed family in the Skillz repository?
- Is the first deliverable an orchestrator, a reconnaissance skill, an evidence contract, or a full architecture packet?
- Which application repository, database artifacts, deployment artifacts, and authorized runtime observations will provide actual evidence?
- Are BFS trading-partner and EDI semantics in scope for the general package or only an optional domain overlay?
- No benchmark, live task comparison, protected holdout, or production-readiness result is supplied. Any prior skill claims must be re-evaluated for the exact future version.

## Rehydration test

| Test | Result | Evidence or gap |
|---|---|---|
| A reader can explain the objective without the source platform | pass | Introduction and source synopsis state the objective and boundaries. |
| Decisions and consequential rationale are recoverable | pass | Decisions and rationale preserve the family, evidence, inversion, IR, security, and sequencing decisions. |
| Current state and next action are unambiguous | pass | Actionable handoff identifies candidate-matrix verification as the resume point. |
| Retained assets are available or missing assets are explicitly cataloged | pass | Pipeline, evidence record, IR, and catalog are included; missing source page and sidecars are recorded in E002 and E008. |
| No source account, thread, project, canvas, or connector is a runtime dependency | pass | The artifact is standalone and retains no private URL as an operating dependency. |

- **Overall source-independence result:** pass
- **Blocked capability, if any:** Current community-skill verification and application-specific analysis cannot be completed from this capture alone.

## Provenance and retention

- **Capture boundary:** User-supplied `pasted-text.txt` attachment containing a flattened ChatGPT conversation excerpt, plus a user-supplied ChatGPT URL used only as a locator. The original page, account, Project, branches, attachments, and tool traces were not available.
- **Completeness:** unknown
- **Source time context:** unknown
- **Retention decision:** public-safe, with the private or inaccessible URL withheld from the artifact body
- **Source caveats:** speaker roles and turn boundaries are inferred with low confidence; community and current-environment claims remain source assertions or separately checked host-routing observations; this is a reviewed semantic extract, not a lossless transcript.
