---
family: copilot
display_name: Copilot Agent Skills
skill_count: 0
generated_by: hand-authored family scaffold
generated_at: 2026-08-31T00:00:00Z
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

This family is a catalog scaffold with no distribution skills yet. It becomes
active when the first host-specific, reviewed `SKILL.md` package is added.

<!-- FAMILY_SUMMARY_START -->
Host-oriented Agent Skills for GitHub Copilot, Copilot Cowork, SharePoint Copilot, Copilot Studio, and other verified Copilot runtimes.
<!-- FAMILY_SUMMARY_END -->

## Skills (0)

<!-- FAMILY_INVENTORY_START -->
*0 skills &nbsp;·&nbsp; inventory not started*

No Copilot Agent Skills are cataloged yet.
<!-- FAMILY_INVENTORY_END -->
