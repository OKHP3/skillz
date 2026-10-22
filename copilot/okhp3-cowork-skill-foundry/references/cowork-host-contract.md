# Cowork host contract

Checked 2026-10-21 against the primary sources below. This is not evidence that a
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

## Route-specific acceptance

| Route | Documented checks |
| --- | --- |
| Personal OneDrive | Up to 50 custom skills; SKILL.md up to 1 MB; 20 companion files and 10 MB per skill. |
| Uploaded skill | Markdown up to 1 MB; archive up to 10 MB compressed, 50 MB expanded, and 100 files. |
| Plugin skills | Up to 20 manifest skill entries; per-skill companions: 20 files, 5 MB each, 10 MB combined. |

Upload admission and runtime companion limits are different checks. Inspect the
selected route and verify every required resource after import. Name collisions
on upload can create a numbered copy; verify the effective identity.

Plugin handoffs must record the selected manifest schema/version and each
`agentSkills[].folder` binding. Current documentation has manual v1.28 examples
and tooling-produced v1.29 packages; do not treat either as a universal fixed
requirement. Validate against the chosen schema and delivery channel.
Tenant policy can prevent uploading/sharing otherwise valid packages.

Draft defaults, context boundaries, and approval rules in this Foundry are
OKHP3 policy motivated by safe personal-workflow use. They do not describe
universal Cowork enforcement or confer connector permissions.

Primary sources: [Use Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork), [Customize Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-customize), and [Build plugins for Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development).
