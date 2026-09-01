# Cowork host contract

Retrieved 2026-09-01. This reference is a host boundary, not evidence that a
particular tenant has enabled or approved a package.

Microsoft documents three delivery modes. They must not be collapsed into one
generic "Cowork skill" claim:

| Delivery mode | Documented root/shape | Test or sharing boundary |
| --- | --- | --- |
| Personal custom skill | `Documents/Cowork/skills/<name>/SKILL.md` in OneDrive | Cowork discovers it at the start of a new session; the owner can share it later. |
| Uploaded skill | A `.md` `SKILL.md`, or a `.zip`/`.skill` archive with `SKILL.md` at its root | Cowork validates then saves it to OneDrive; test in a new conversation. |
| M365 plugin | ZIP with `manifest.json`, `color.png`, `outline.png`, and `skills/<name>/SKILL.md` | Sideload/tenant-upload path and plugin discovery are separate from skill-file validation. |

Cowork can also use remote MCP connectors, but a connector is a separately
declared service/authentication dependency. A skills-only personal or uploaded
skill must not claim that it creates external-system access.

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

For an uploaded skill, Microsoft documents a required frontmatter `name` and
`description`, trust review before upload, and size/file-count limits. For an
M365 plugin, the manifest schema and package root are strict. These are package
acceptance checks, not a claim that the task workflow has passed live quality
evaluation.

Primary sources: [Use Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork), [Customize Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-customize), and [Build plugins for Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development).
