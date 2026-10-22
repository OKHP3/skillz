# Native Copilot in SharePoint host contract

Checked 2026-10-21. Use current tenant availability rather than the old blanket
preview label. Do not turn design or structural evidence into a tenant claim.

Copilot in SharePoint distinguishes personal and site skills. Personal skills
are user-owned and stored in OneDrive; their availability can follow the owner
across supported sites. Site skills are owned by the site admin and stored at
`/Agent Assets/Skills/<skill-name>/SKILL.md`. Edit/View defaults described by
Microsoft apply to site-skill creation/use, subject to file governance.
Neither type changes the current user's underlying access.

The host's native boundary is material: it can use built-in SharePoint
capabilities and only the current user's existing permissions. It cannot run
custom code or connect to external systems. Therefore a SharePoint skill must
not claim connector, API, script, or permission-escalation behavior.

The native authoring route matters. Microsoft documents a chat-created draft
that the author reviews and confirms before saving. Direct Markdown edits are
also possible, but authors should preserve the format and validate the revised
skill from the native chat. A saved `.md` file or structural check therefore
proves neither host discovery nor supported mutation behavior.

Record personal/site ownership, the observed storage location, target objects, selected test input,
current-user permission, and observed loaded-skill indicator for a live result.
Site context and task skills serve different purposes. `SHAREPOINT.md` is not
established here as a required skill-package artifact. Verify any exact name,
location, automatic loading, or precedence rule in primary documentation or a
target-site observation; documentation silence does not disprove site context.

Separate Library and List contracts are Foundry design policy. One coherent
workflow may compose them, as in Microsoft's document-review-to-list example.
Record each object's schema, selection and supported operation separately.
The chosen section order and draft/approval defaults are also house policy.

Primary source: [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills).
