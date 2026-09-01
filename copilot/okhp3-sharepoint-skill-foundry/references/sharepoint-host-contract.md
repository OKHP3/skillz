# Native Copilot in SharePoint host contract

Retrieved 2026-09-01. Microsoft documents this capability as preview. Do not
promote analytical design or a structural check to a live tenant claim.

Copilot in SharePoint skills turn repeatable site workflows into reusable
assets. Skill files are stored in the product-managed Agent Assets library at
`/Agent Assets/Skills/<skill-name>/SKILL.md`. Users with Edit permission can
create skills and users with View permission can run them by default; normal
SharePoint governance can be applied to the files.

The host's native boundary is material: it can use built-in SharePoint
capabilities and only the current user's existing permissions. It cannot run
custom code or connect to external systems. Therefore a SharePoint skill must
not claim connector, API, script, or permission-escalation behavior.

Direct Markdown edits are possible, but authors should preserve the format and
validate the skill from the native chat. `SHAREPOINT.md` is not documented here
as a required runtime artifact.

Primary source: [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills).
