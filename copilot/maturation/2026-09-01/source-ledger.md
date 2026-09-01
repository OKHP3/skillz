# Source Ledger: SharePoint List Skill Maturation

Retrieved: 2026-09-01. Evidence status: sourced for product facts, analytical
for package conclusions.

| ID | Source | Supported claim |
|---|---|---|
| M1 | [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills) | The feature is preview; skills may interact with Lists depending on site capability; skills cannot connect external systems or execute custom code; actions remain within existing user permissions. |
| M2 | [Get started with Copilot in SharePoint](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started) | Availability depends on current preview, licensing, tenant and site configuration; the service applies preview usage limits and may change. |

## Consequence for the packages

The packages may describe their own draft-first confirmation guardrail, but
must not present it as a universal Microsoft-enforced List-write mechanism.
Fine-grained List schema, internal-name, index, view, bulk-scan, and item-write
operations remain host-dependent unless the current site surface exposes them.

## Unresolved evidence

- No disposable-tenant run has verified discovery, selected-List context,
  field access, item writes, view inspection, or permission-denial behavior.
- No claim of task-quality uplift or token reduction has a live benchmark.
