# Cowork host contract

Retrieved 2026-09-01. This reference is a host boundary, not evidence that a
particular tenant has enabled or approved a package.

Microsoft documents Cowork extensibility through an M365 app package. A package
can contain `manifest.json`, two icons, and `skills/<name>/SKILL.md`, with
optional references. Cowork can also use remote MCP connectors, but a
skills-only package is a supported prompt-workflow shape.

Use this Foundry when the result is a personal-workflow skill for Cowork. Keep
the following distinct:

| Artifact | Meaning |
| --- | --- |
| `SKILL.md` | Task-specific instructions and portable core |
| M365 manifest | Cowork extension identity, distribution, and declared entries |
| Connector | Separately deployed external service and authentication contract |
| Cowork agent/workspace | Runtime, available Microsoft 365 context, tenant policy, and approval UI |

Imported plugin features are not automatically supported in Cowork. Microsoft
documents that commands, sub-agents, hooks, and settings do not convert to the
M365 manifest. A package author must record those as loss or redesign them;
never silently imply that they execute.

Primary source: [Build plugins for Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development).
