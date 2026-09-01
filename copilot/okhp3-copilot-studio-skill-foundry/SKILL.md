---
name: okhp3-copilot-studio-skill-foundry
description: >
  Design, author, evaluate, and package a reusable Microsoft Copilot Studio agent
  skill. Use when a task-specific capability must be created or shared across
  Copilot Studio agents powered by the GitHub Copilot harness. Do not use for
  Cowork packages, SharePoint site skills, GitHub repository skills, agent identity,
  knowledge-source design, or tool/connector implementation alone.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P3)
  version: "1.0.0"
  category: copilot-studio
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Copilot Studio reusable skill patterns, agent-component separation, package handoffs, and evaluation design."
  out_of_scope: "Cowork, SharePoint, and GitHub Copilot host contracts; agent identity, knowledge-source, connector, or autonomous publication work."
---

# okhp3-copilot-studio-skill-foundry

**OverKill Hill P3** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Create a reusable capability for a Copilot Studio agent. This Foundry treats a
skill as one task-specific component in an agent design, explicitly separate
from agent identity/instructions, knowledge sources, and tools.

## Scope

| In scope | Out of scope |
| --- | --- |
| A focused reusable task capability usable by one or more Copilot Studio agents | Whole-agent personality, conversation design, or organizational policy |
| Markdown skill files and optional package contents | A connector, API, MCP server, action, or knowledge-source implementation |
| Authoring, sharing, testing, and package/deployment planning | Publishing to a live environment or changing agent configuration without approval |

## Host contract

- **Target:** Copilot Studio agents/workflows powered by the GitHub Copilot
  harness.
- **Skill shape:** name, description, YAML frontmatter, Markdown instructions,
  and optionally a ZIP package with supporting files.
- **Activation:** the orchestration runtime decides relevance using the request
  and skill description. Therefore descriptions need concrete trigger language
  and one coherent job.
- **Component boundary:** skills guide task behavior; instructions set general
  behavior, knowledge provides reference data, and tools connect external
  services. Do not conceal a tool dependency in a skill.
- Read [references/copilot-studio-host-contract.md](references/copilot-studio-host-contract.md)
  before defining the capability or package contents.

## Foundry workflow

1. Name a repeatable outcome that recurs across agents, not a one-off answer.
   Capture real task inputs, expected outputs, known corrections, failure
   conditions, and the agent surfaces expected to use it.
2. Classify every requirement: **skill instruction**, **agent instruction**,
   **knowledge source**, **tool/action/connector**, or **human approval**. If a
   requirement crosses categories, record the dependency and integration point.
3. Design the skill's activation description. It should identify the task,
   inputs, desired result, and exclusion terms that prevent it from absorbing a
   neighboring skill.
4. Put the normal procedure and output template in `SKILL.md`. Put detailed
   taxonomies, examples, or schemas in `references/` only when the workflow
   explicitly tells the agent when to load them. Bundle scripts only when their
   execution contract and environment have been validated.
5. Default to advice, analysis, and draft output. If a skill directs an agent
   to a tool or knowledge source, disclose the required component, permission
   assumption, input/output contract, and user approval point. The skill itself
   neither creates the tool nor expands its authority.
6. Create normal, activation-collision/missing-dependency, and tool-action or
   prompt-injection evaluations. Test through a named Studio agent before
   claiming that an orchestrator selects or executes the skill correctly.

## Required SKILL.md pattern

```markdown
## Purpose and activation
## Agent-component contract
## Required input
## Procedure
## Output contract
## Tool and approval boundary
## Safe outcomes
## Validation
## References
```

The component contract must say what remains in agent instructions, knowledge,
or tools. It must not duplicate an entire agent configuration in the skill.

## Copilot Studio-specific gotchas

- A skill is not a tool. Never write a tool/API call as if Markdown itself can
  execute it.
- A skill is not a knowledge source. Cite or request the relevant knowledge
  dependency rather than embedding confidential tenant content in a portable
  package.
- A skill is not an agent's identity. Keep personality, broad guardrails, and
  general conversation behavior out unless they are essential to this one task.
- A ZIP package carries the skill and optional files; it does not prove that an
  environment has approved or published it.
- Usage, build, test, and evaluation may have environment and cost controls.
  Record those as deployment assumptions rather than hiding them.

## Output contract

Return a Foundry handoff with the reusable-task definition, component map,
activation description, SKILL.md skeleton, dependency and approval ledger,
three-case evaluation plan, and an agent-level test/deployment plan. Do not add
the package to an agent, change a tool, or publish an environment without a
separate authorization.

## Validation gate

- Folder/frontmatter name match and clear trigger phrases.
- One coherent task distinct from identity, knowledge, and tools.
- Explicit dependency contract for every external action or knowledge source.
- Draft/approval behavior for any effectful tool use.
- Evaluations cover normal activation, a collision or missing dependency, and
  hostile/untrusted input or unapproved effect.
- Structural validation does not prove a Copilot Studio orchestrator activated
  the skill or that an agent package is live.

## References

- [references/copilot-studio-host-contract.md](references/copilot-studio-host-contract.md) — Studio skill, package, and component evidence.
- [Agent Skills creation best practices](https://agentskills.io/skill-creation/best-practices) — portable baseline used by this host adapter.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P3](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
