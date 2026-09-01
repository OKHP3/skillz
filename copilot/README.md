# Copilot Agent Skills

The copilot family contains task-focused Agent Skills for Copilot-branded
runtimes. It provides one catalog home for host-specific `SKILL.md` packages
targeting GitHub Copilot, Copilot Cowork, SharePoint Copilot, Copilot Studio,
and future Copilot hosts whose skill support is verified.

The family name is intentionally broad, but package compatibility is not. Each
skill must identify its target host, discovery path, available tools or native
capabilities, knowledge boundary, permission model, and evidence status. Family
membership does not imply that a skill runs unchanged across every Copilot
surface.

## Scope

In scope:

- Task-specific `SKILL.md` workflows for a named Copilot host.
- Host-aware document, inbox, repository, presentation, SharePoint, and
  business-process workflows.
- Portable instruction cores with explicit Copilot host adaptations.
- Host packaging, discovery, permission, confirmation, and capability checks.
- Worked examples, fixtures, evaluations, and compatibility evidence.

Out of scope:

- Generic Copilot marketing, product documentation, or unsupported roadmap
  claims.
- Treating a Copilot agent, prompt, knowledge source, connector, action, and
  skill as interchangeable artifacts.
- Claiming cross-host compatibility from matching Markdown syntax alone.
- Hidden tools, external calls, custom code, permission escalation, or
  destructive actions without an explicit host and approval boundary.
- Adding a skill to this family solely because its name contains “Copilot.”

## Host taxonomy

Use the host token in the package name and metadata:

| Host token | Target surface | Evidence rule |
|---|---|---|
| `github` | GitHub Copilot skill-capable surfaces | Confirm the specific GitHub Copilot surface and repository or personal discovery path. |
| `cowork` | Microsoft Copilot Cowork | Confirm the OneDrive or Microsoft 365 plugin packaging and action boundary. |
| `sharepoint` | Copilot in SharePoint | Confirm the SharePoint Agent Assets path, native capability limits, and site permission boundary. |
| `copilot-studio` | Copilot Studio declarative agents | Confirm the agent skill upload or authoring experience and any separate connector or action dependency. |
| `scout` | Copilot Scout, when supported | Keep as proposed or unverified until current host documentation proves skill support. |
| `crosshost` | More than one verified Copilot host | List each tested host and record behavioral differences. |

## Naming convention

Use the host, object, and action in a short lowercase kebab-case name:

```text
okhp3-[host]-[object]-[action]
```

Examples of proposed package names include:

- `okhp3-sharepoint-library-article-curator`
- `okhp3-cowork-inbox-triage`
- `okhp3-scout-slide-deck-style-review`
- `okhp3-github-issue-triage`
- `okhp3-copilot-studio-requirements-review`

Use `crosshost` only when the same task has been exercised on more than one
named host. Do not use the generic token `copilot` when a more precise host is
known.

Direct child package names in this family may use up to 50 characters when
needed to retain a precise host, object, and action. This is a Copilot-family
exception to the repository's general 36-character directory convention; the
portable Agent Skills limit remains 64 characters.

## Shared package contract

Every package should declare, in frontmatter or its supporting documentation:

- target host and supported host surface;
- support status such as `confirmed`, `preview`, `inferred`, or
  `not-verified`;
- required native knowledge, tools, connectors, actions, or selected inputs;
- read-only, draft-producing, or mutation behavior;
- confirmation and permission boundaries;
- missing-capability and insufficient-permission outcomes;
- portable core versus host-specific behavior;
- version-matched validation and live evidence status.

The shortest reliable workflow belongs in `SKILL.md`. Deep host rules, schemas,
examples, and rare branches belong in one-level-deep relative resources when
the target runtime supports them. A host-specific package may be narrower than
the portable core, but it must not silently require the core's tools or
environment.

## Agent versus skill boundary

An agent may contain identity, general instructions, knowledge, tools,
connectors, actions, conversation starters, and one or more skills. This family
catalogs the task-specific skill layer. Agent configurations and source prompts
may remain as conversion inputs or host-specific wrappers.

When converting an agent or mega-prompt, split independent workflows into
composable skills. Preserve platform-bound behavior as an adapter or explicit
loss record. Do not claim that a converted skill reproduces hidden retrieval,
authorization, connector, memory, or orchestration behavior without evidence.

## Safety and public boundary

Copilot host context is not permission to disclose or publish private material.
Public packages must use synthetic or public-safe examples and must not retain
credentials, private URLs, employer-specific material, customer or employee
data, hidden network calls, or proprietary system identifiers.

Skills must not bypass host permissions, hide actions, remove user consent, or
imply that a draft, recommendation, or preview has been sent or applied. Any
write-capable workflow must expose its target, proposed change, approval point,
and recovery or refusal path.

## Relationships

- Use `agent-foundry/` for creating, assessing, or migrating an entire Copilot
  agent rather than one task skill.
- Use `context-extraction/` for extracting supplied Copilot conversations or
  project material with provenance preserved.
- Use `knowledge-operations/` for evidence, triage, validation, graduation,
  and promotion decisions around a skill or source artifact.
- Use `universal/` for cross-project infrastructure or host-neutral workflows.
- Use the Skill Foundry method before promoting a package from a candidate to a
  validated distribution skill.

## Maturity and validation

The family begins as a catalog scaffold. Individual skills should be added only
after the author has defined the task outcome, inputs, outputs, host contract,
failure boundaries, and evidence plan. Structural validation proves package
integrity only. It does not prove that a host discovered the skill, executed it
correctly, or produced acceptable task results.

Before a release claim, test the normal task, an important host constraint, and
an out-of-scope or safety boundary. Record the exact host, account or tenant
boundary where relevant, model or runner, tool availability, package version,
and whether the evidence is live, analytical, historical, or not run.

## Current status

This active family contains 40 analytically validated packages: 12 SharePoint
Library skills, 12 SharePoint List skills, 12 Copilot Cowork skills, and four
host-specific pattern masters. Structural validation does not establish live
host discovery, tenant permissions, or task-quality performance.

## Host-specific Skill Foundries

The portable `okhp3-skill-foundry` remains the baseline. These packages are
deliberately separate host adapters, because matching `SKILL.md` syntax does
not make discovery, context, governance, tools, or permission behavior the
same:

- `okhp3-cowork-skill-foundry` — Cowork M365 app-package and personal-workflow patterns.
- `okhp3-sharepoint-skill-foundry` — native SharePoint skill patterns, with distinct Library and List references.
- `okhp3-github-skill-foundry` — GitHub Copilot project/personal skill and repository-safety patterns.
- `okhp3-copilot-studio-skill-foundry` — Copilot Studio reusable-capability and agent-component patterns.

## Further reading

- [Microsoft Learn: Agent Skills in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development)
- [Microsoft Learn: Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)
- [Microsoft Learn: Skills overview for Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-overview)
- [GitHub Docs: About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
