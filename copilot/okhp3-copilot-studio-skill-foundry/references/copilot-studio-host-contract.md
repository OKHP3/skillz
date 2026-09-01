# Copilot Studio skill host contract

Retrieved 2026-09-01. This reference concerns Copilot Studio agents or
workflows powered by the GitHub Copilot harness. It does not describe all
Copilot Studio agent types, tenant availability, policy, or publication status.

Microsoft defines a skill as a reusable capability consisting of a name,
description, and Markdown instructions. Skills are distinct from agent
instructions, knowledge sources, and tools: instructions establish general
behavior, knowledge provides reference material, and tools connect to external
services. The runtime selects skills based on the request and description.

Skills can be authored in Copilot Studio or uploaded as a ZIP package. A package
contains `SKILL.md` with YAML frontmatter and Markdown instructions plus
optional supporting scripts, templates, or reference documents. A package is a
portable artifact, not evidence of an approved environment deployment or a
working tool connection.

Primary source: [Skills overview for agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-overview).
