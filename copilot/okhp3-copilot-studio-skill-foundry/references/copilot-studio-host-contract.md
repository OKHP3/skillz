# Copilot Studio skill host contract

Retrieved 2026-09-01. This reference concerns Copilot Studio agents or
workflows powered by the GitHub Copilot harness. It does not describe all
Copilot Studio agent types, tenant availability, policy, or publication status.

Microsoft defines a skill as a reusable capability consisting of a name,
description, and Markdown instructions. Skills are distinct from agent
instructions, knowledge sources, and tools: instructions establish general
behavior, knowledge provides reference material, and tools connect to external
services. The runtime selects skills based on the request and description.

Skills can be authored from the Build tab, where the author supplies a lowercase
hyphenated name, activation description, and Markdown instructions. They can
also be uploaded as a Markdown file or as a ZIP package. The ZIP must include
`SKILL.md` with YAML frontmatter and Markdown instructions; supporting scripts,
templates, or reference documents are optional.

After creation or upload, Microsoft directs the author to use the Preview tab to
verify the skill. An accepted artifact is not evidence of correct activation,
an approved environment deployment, or a working tool connection.

Primary sources: [Skills overview for agents](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-overview), [Create a skill for an agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-create), and [Add an existing skill to an agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-add-existing).
