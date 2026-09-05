---
family: copilot
display_name: Copilot Agent Skills
skill_count: 40
generated_by: okhp3-skill-cataloger v1.7.0
generated_at: 2026-09-05T02:49:22Z
---

# copilot

The copilot family is the host-oriented distribution surface for task-focused
Agent Skills targeting Copilot-branded runtimes. It provides one catalog home
for GitHub Copilot, Copilot Cowork, SharePoint Copilot, Copilot Studio, and
future Copilot hosts whose skill support is verified.

The family is intentionally broader than one vendor product, but compatibility
is never implied by family membership. Every package must identify its target
host, discovery path, native capabilities, knowledge boundary, permission
model, and evidence status.

## Family boundary

In scope:

- Host-specific `SKILL.md` workflows for a named Copilot runtime.
- Portable instruction cores with explicit Copilot host adaptations.
- Host packaging, discovery, permission, confirmation, and capability checks.
- Task-focused document, inbox, repository, presentation, SharePoint, and
  business-process workflows.
- Worked examples, fixtures, evaluations, and compatibility evidence.

Out of scope:

- Generic Copilot marketing, product documentation, or unsupported roadmap
  claims.
- Treating an agent, prompt, knowledge source, connector, action, and skill as
  interchangeable artifacts.
- Claiming cross-host compatibility from matching Markdown syntax alone.
- Hidden tools, external calls, custom code, permission escalation, or
  destructive actions without an explicit host and approval boundary.

## Host taxonomy

Use the host token in each package name and metadata:

| Host token | Target surface | Required evidence |
|---|---|---|
| `github` | GitHub Copilot skill-capable surfaces | Confirm the exact Copilot surface and repository or personal discovery path. |
| `cowork` | Microsoft Copilot Cowork | Confirm OneDrive or Microsoft 365 plugin packaging and the action boundary. |
| `sharepoint` | Copilot in SharePoint | Confirm the Agent Assets path, native capability limits, and site permissions. |
| `copilot-studio` | Copilot Studio declarative agents | Confirm the upload or authoring experience and separate connector or action dependencies. |
| `scout` | Copilot Scout, when supported | Keep proposed or unverified until current documentation proves skill support. |
| `crosshost` | More than one verified Copilot host | List every tested host and record behavioral differences. |

## Naming convention

Use the following package grammar:

```text
okhp3-[host]-[object]-[action]
```

Examples include `okhp3-sharepoint-library-article-curator`,
`okhp3-cowork-inbox-triage`, `okhp3-scout-slide-deck-style-review`,
`okhp3-github-issue-triage`, and
`okhp3-copilot-studio-requirements-review`.

Use `crosshost` only after the same task has been exercised on more than one
named host. Do not use a generic `copilot` host token when a more precise host
is known.

Direct child package names in this family may use up to 50 characters where a
shorter name would lose the precise host, object, or action. This is a scoped
Copilot-family exception to the repository's general 36-character directory
convention; the portable Agent Skills limit remains 64 characters.

## Shared package contract

Every package should declare its target host and supported surface, support
status, required native knowledge or tools, mutation behavior, confirmation
boundary, missing-capability outcome, portable core, host-specific behavior,
and version-matched evidence status.

The package `SKILL.md` contains the shortest reliable workflow, defaults,
decisions, safety gates, and output contract. Supporting resources are allowed
only when the target host supports them and their use is documented.

## Agent versus skill

An agent may contain identity, general instructions, knowledge, tools,
connectors, actions, conversation starters, and one or more skills. This family
catalogs the task-specific skill layer. Agent configurations and source prompts
may remain as conversion inputs or host-specific wrappers.

When converting an agent or mega-prompt, split independent workflows into
composable skills. Preserve platform-bound behavior as an adapter or explicit
semantic-loss record. Do not claim reproduction of hidden retrieval,
authorization, connector, memory, or orchestration behavior without evidence.

## Safety and public boundary

Public packages must use synthetic or public-safe examples. They must not
retain credentials, private URLs, employer-specific material, customer or
employee data, hidden network calls, or proprietary system identifiers.

Skills must not bypass host permissions, hide actions, remove user consent, or
imply that a draft, recommendation, or preview has been sent or applied.
Write-capable workflows must expose their target, proposed change, approval
point, and recovery or refusal path.

## Relationships

- Use `agent-foundry/` for creating, assessing, or migrating an entire Copilot
  agent rather than one task skill.
- Use `context-extraction/` for extracting supplied Copilot conversations or
  project material with provenance preserved.
- Use `knowledge-operations/` for evidence, triage, validation, graduation,
  and promotion decisions around a skill or source artifact.
- Use `universal/` for cross-project infrastructure or host-neutral workflows.

## Maturity and validation

Family membership does not prove runtime support or task quality. Before a
release claim, test the normal task, an important host constraint, and an
out-of-scope or safety boundary. Record the host, package version, tool and
knowledge availability, and whether evidence is live, analytical, historical,
or not run.

## Current status

This active family contains 36 analytical, structurally validated packages:
12 SharePoint Library skills, 12 SharePoint List skills, and 12 Copilot Cowork
skills. It does not yet have live host discovery, tenant, or benchmark evidence.

<!-- FAMILY_SUMMARY_START -->
Host-oriented Agent Skills for GitHub Copilot, Copilot Cowork, SharePoint Copilot, Copilot Studio, and other verified Copilot runtimes.
<!-- FAMILY_SUMMARY_END -->

## Skills (40)

<!-- FAMILY_INVENTORY_START -->
*40 skills &nbsp;·&nbsp; inventory last updated: **September 5, 2026 at 02:49 UTC***

| Skill | Description | Version |
|---|---|---|
| [okhp3-copilot-studio-skill-foundry](okhp3-copilot-studio-skill-foundry/SKILL.md) | Design, author, evaluate, and package a reusable Microsoft Copilot Studio agent skill. Use when a... | 1.1.0 |
| [okhp3-cowork-commitment-tracker](okhp3-cowork-commitment-tracker/SKILL.md) | Find and reconcile the user's commitments across an agreed set of email and meeting sources. Use ... | 1.1.0 |
| [okhp3-cowork-daily-execution-brief](okhp3-cowork-daily-execution-brief/SKILL.md) | Build a realistic personal execution brief from an agreed day's priorities, calendar, and commitm... | 1.1.0 |
| [okhp3-cowork-decision-record](okhp3-cowork-decision-record/SKILL.md) | Draft a durable decision record from an agreed discussion or source set. Use when capturing a dec... | 1.1.0 |
| [okhp3-cowork-document-critique](okhp3-cowork-document-critique/SKILL.md) | Critique a draft against an explicit audience, purpose, quality bar, and risk checklist. Use when... | 1.1.0 |
| [okhp3-cowork-file-triage-planner](okhp3-cowork-file-triage-planner/SKILL.md) | Propose a safe folder, naming, and retention cleanup plan for selected files. Use when reviewing ... | 1.1.0 |
| [okhp3-cowork-inbox-triage](okhp3-cowork-inbox-triage/SKILL.md) | Triage a Microsoft 365 inbox into a prioritized, reviewable work queue. Use when organizing email... | 1.1.0 |
| [okhp3-cowork-meeting-closeout](okhp3-cowork-meeting-closeout/SKILL.md) | Turn an agreed meeting record into a reviewable decision and action closeout. Use when capturing ... | 1.1.0 |
| [okhp3-cowork-meeting-prep](okhp3-cowork-meeting-prep/SKILL.md) | Prepare a concise meeting brief from an agreed calendar event and relevant Microsoft 365 context.... | 1.1.0 |
| [okhp3-cowork-project-context-pack](okhp3-cowork-project-context-pack/SKILL.md) | Create a current, source-linked project context pack from selected Microsoft 365 material. Use wh... | 1.1.0 |
| [okhp3-cowork-research-evidence-log](okhp3-cowork-research-evidence-log/SKILL.md) | Build a source-linked research evidence log with confirmed, inferred, and unknown claims. Use whe... | 1.1.0 |
| [okhp3-cowork-skill-foundry](okhp3-cowork-skill-foundry/SKILL.md) | Design, author, evaluate, and package a task-focused Microsoft Copilot Cowork skill. Use when con... | 1.1.0 |
| [okhp3-cowork-stakeholder-update](okhp3-cowork-stakeholder-update/SKILL.md) | Draft a source-grounded stakeholder update for review from an agreed project, time window, and au... | 1.1.0 |
| [okhp3-cowork-weekly-review](okhp3-cowork-weekly-review/SKILL.md) | Create a personal weekly review from an agreed Microsoft 365 work window. Use when summarizing co... | 1.1.0 |
| [okhp3-github-skill-foundry](okhp3-github-skill-foundry/SKILL.md) | Design, author, evaluate, and install-plan a task-focused GitHub Copilot Agent Skill. Use when cr... | 1.1.0 |
| [okhp3-sharepoint-library-accessibility-review](okhp3-sharepoint-library-accessibility-review/SKILL.md) | Review selected SharePoint library documents for supplied accessibility and structure checks, the... | 1.1.0 |
| [okhp3-sharepoint-library-article-curator](okhp3-sharepoint-library-article-curator/SKILL.md) | Curate selected SharePoint document-library articles into a reviewable collection with titles, su... | 1.1.0 |
| [okhp3-sharepoint-library-canonical-source-finder](okhp3-sharepoint-library-canonical-source-finder/SKILL.md) | Find likely canonical SharePoint library documents among selected related files and report stale ... | 1.1.0 |
| [okhp3-sharepoint-library-contract-extractor](okhp3-sharepoint-library-contract-extractor/SKILL.md) | Extract specified obligation, renewal, notice, owner, counterparty, and risk fields from selected... | 1.1.0 |
| [okhp3-sharepoint-library-document-quality-gate](okhp3-sharepoint-library-document-quality-gate/SKILL.md) | Check selected SharePoint library documents against supplied minimum quality rules for naming, se... | 1.1.0 |
| [okhp3-sharepoint-library-handover-packager](okhp3-sharepoint-library-handover-packager/SKILL.md) | Prepare a reviewable handover inventory from selected SharePoint library files, with coverage gap... | 1.1.0 |
| [okhp3-sharepoint-library-intake-classifier](okhp3-sharepoint-library-intake-classifier/SKILL.md) | Classify selected SharePoint library files against an approved taxonomy and return confidence, ex... | 1.1.0 |
| [okhp3-sharepoint-library-metadata-review](okhp3-sharepoint-library-metadata-review/SKILL.md) | Review SharePoint document-library metadata for completeness, controlled-value conformance, and i... | 1.1.0 |
| [okhp3-sharepoint-library-policy-citations](okhp3-sharepoint-library-policy-citations/SKILL.md) | Answer a policy question from accessible SharePoint library documents with traceable citations, c... | 1.1.0 |
| [okhp3-sharepoint-library-publish-checkout-hygiene](okhp3-sharepoint-library-publish-checkout-hygiene/SKILL.md) | Review a SharePoint library for unpublished, stale, or checked-out files and return a remediation... | 1.1.0 |
| [okhp3-sharepoint-library-records-readiness-review](okhp3-sharepoint-library-records-readiness-review/SKILL.md) | Review selected SharePoint library files against supplied records-readiness criteria and return a... | 1.1.0 |
| [okhp3-sharepoint-library-taxonomy-drift-report](okhp3-sharepoint-library-taxonomy-drift-report/SKILL.md) | Compare a SharePoint library's accessible tags, folders, and views with a supplied information ar... | 1.1.0 |
| [okhp3-sharepoint-list-data-quality-review](okhp3-sharepoint-list-data-quality-review/SKILL.md) | Review a SharePoint List for missing required values, duplicate candidates, invalid controlled va... | 1.1.0 |
| [okhp3-sharepoint-list-decision-log-curator](okhp3-sharepoint-list-decision-log-curator/SKILL.md) | Turn supplied decisions, approvals, and notes into reviewable SharePoint List decision records wi... | 1.1.0 |
| [okhp3-sharepoint-list-duplicate-record-review](okhp3-sharepoint-list-duplicate-record-review/SKILL.md) | Identify and explain likely duplicate SharePoint List records using supplied matching rules. Use ... | 1.1.0 |
| [okhp3-sharepoint-list-intake-normalizer](okhp3-sharepoint-list-intake-normalizer/SKILL.md) | Normalize SharePoint List intake items into a reviewable, schema-aligned draft. Use when new list... | 1.1.0 |
| [okhp3-sharepoint-list-knowledge-gap-log](okhp3-sharepoint-list-knowledge-gap-log/SKILL.md) | Turn unresolved questions and missing-content signals into a reviewable SharePoint List knowledge... | 1.1.0 |
| [okhp3-sharepoint-list-meeting-actions](okhp3-sharepoint-list-meeting-actions/SKILL.md) | Turn supplied meeting notes into a reviewable SharePoint List action draft. Use when decisions, o... | 1.1.0 |
| [okhp3-sharepoint-list-portfolio-health-brief](okhp3-sharepoint-list-portfolio-health-brief/SKILL.md) | Create a cited portfolio-health brief from supplied SharePoint List fields and owner-approved hea... | 1.1.0 |
| [okhp3-sharepoint-list-request-triage](okhp3-sharepoint-list-request-triage/SKILL.md) | Triage SharePoint List requests into a transparent review queue using supplied routing rules. Use... | 1.1.0 |
| [okhp3-sharepoint-list-risk-issue-review](okhp3-sharepoint-list-risk-issue-review/SKILL.md) | Review a SharePoint List of risks or issues into a ranked, evidence-led exception view. Use when ... | 1.1.0 |
| [okhp3-sharepoint-list-schema-view-review](okhp3-sharepoint-list-schema-view-review/SKILL.md) | Review a SharePoint List schema, views, indexes, and visible configuration against supplied desig... | 1.1.0 |
| [okhp3-sharepoint-list-sla-breach-watchlist](okhp3-sharepoint-list-sla-breach-watchlist/SKILL.md) | Produce a SharePoint List SLA exception watchlist from supplied status, due-date, and service-tar... | 1.1.0 |
| [okhp3-sharepoint-list-vendor-obligation-review](okhp3-sharepoint-list-vendor-obligation-review/SKILL.md) | Review a SharePoint List of vendors or obligations for supplied expiry, ownership, and compliance... | 1.1.0 |
| [okhp3-sharepoint-skill-foundry](okhp3-sharepoint-skill-foundry/SKILL.md) | Design, author, evaluate, and deploy-plan a native Copilot in SharePoint skill for a named site. ... | 1.1.0 |
<!-- FAMILY_INVENTORY_END -->
