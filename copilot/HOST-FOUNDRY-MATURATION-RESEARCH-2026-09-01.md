# Copilot host Foundry maturation research

**Research question:** Which current host facts justify a small v1.1.0 revision
to each Foundry, without claiming live deployment or cross-host equivalence?

**Decision context:** `CF-MAT-20260901`, recorded in
`HOST-FOUNDRY-MATURATION-INTAKE-2026-09-01.md`.

## Source ledger

| Host | Primary source | Retrieved | Claim used |
| --- | --- | --- | --- |
| Cowork | [Use Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/use-cowork) | 2026-09-01 | Personal OneDrive skills, upload paths, new-session discovery, and active-skill visibility are distinct from plugins. |
| Cowork | [Customize Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-customize) | 2026-09-01 | Cowork validates uploaded Markdown/archives, saves them to OneDrive, and has separate skill/plugin sharing paths. |
| Cowork | [Build plugins for Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-plugin-development) | 2026-09-01 | M365 plugin packages require a manifest, icons, and a `skills/` directory. |
| SharePoint | [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills) | 2026-09-01 | Preview-native Agent Assets storage, permission model, no external/custom-code capability, creation/review/save, and loaded-skill indicator. |
| GitHub Copilot | [Adding agent skills for GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) | 2026-09-01 | Project/personal locations, package resources, `allowed-tools` risk, preview-before-install, and skill/custom-instruction distinction. |
| Copilot Studio | [Create a skill for an agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-create) | 2026-09-01 | Build-tab creation and Preview-tab test are distinct lifecycle points. |
| Copilot Studio | [Add an existing skill to an agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/skills-add-existing) | 2026-09-01 | Markdown upload differs from ZIP upload; ZIP must contain `SKILL.md`. |
| Portable baseline | [Agent Skills best practices](https://agentskills.io/skill-creation/best-practices) | 2026-09-01 | Keep the core concise, use progressive disclosure, test realistic behavior, and add fragile host rules near their decision point. |

## Claim-to-change map

| Change | Evidence class | Why it is host-specific |
| --- | --- | --- |
| Cowork delivery-mode table | sourced | OneDrive, uploaded skills, and M365 plugins have distinct roots and discovery/installation tests. |
| SharePoint discovery/revision record | sourced | Agent Assets save/format is distinct from native-chat skill loading in the preview host. |
| GitHub `allowed-tools` default-deny rule | sourced | GitHub Copilot exposes a host-specific pre-approval mechanism with a documented shell risk. |
| Studio authoring/Preview record | sourced | Build creation and Markdown/ZIP upload are separate Studio lifecycle routes. |
| v1.1.0 test disclosure | analytical | The packages were structurally validated after revision; no live-host execution was run. |

## Uncertainty register

- Tenant policy, plan, regional availability, and preview behavior can change.
- Documentation does not prove that any particular account, repository, agent,
  site, connector, or package has been enabled or approved.
- The packaged evaluation holdouts were seen during revision and are not a
  protected release holdout.

## Recommended next action

Run one bounded live acceptance test per host, using the test matrix named in
each package's v1.1.0 maturation record. Record environment, host version,
selected input, discovery evidence, and result before promoting any analytical
claim to live evidence.
