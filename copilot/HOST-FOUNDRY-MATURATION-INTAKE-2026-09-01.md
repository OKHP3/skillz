# Copilot host Foundry maturation intake

**Intake ID:** `CF-MAT-20260901`  
**Status:** working evidence record  
**Authorization:** user requested an evolutionary pass for all four Foundries,
with a minor-version increment after intake, research, independent review, and
validation. No tenant deployment, app upload, remote publication, or mutation
outside this repository is authorized.

## Decision question

What is the smallest evidence-backed maturation that makes each v1.0.0 host
Foundry more reliable as a pattern master, while preserving the distinction
between Copilot Cowork, Copilot in SharePoint, GitHub Copilot, and Copilot
Studio?

## Preserved source manifest

| Package | v1.0.0 SHA-256 | Source commit | Evidence status |
| --- | --- | --- | --- |
| `okhp3-cowork-skill-foundry` | `e003f0a635b3c7f1f8eca9d7e38228fd1a8c24506fae1edfa808c507250eab0b` | `9338a9576468b3e3fc58dd8d6dc3fb6d72e94cc7` | observed local artifact |
| `okhp3-sharepoint-skill-foundry` | `5861850a422242fa995cc5f3bf5c55500ed256617b56f36a3228bd66d79b9d6e` | `9338a9576468b3e3fc58dd8d6dc3fb6d72e94cc7` | observed local artifact |
| `okhp3-github-skill-foundry` | `c29f0d30516a7f068dfcffd3b64d8ce822b0b7abb78e372bb092c5a1822d8c47` | `9338a9576468b3e3fc58dd8d6dc3fb6d72e94cc7` | observed local artifact |
| `okhp3-copilot-studio-skill-foundry` | `0dc4f6d0765d8a8a616af8664446e88243b02e4b84ad61bd8dc7e7dff45e1c70` | `9338a9576468b3e3fc58dd8d6dc3fb6d72e94cc7` | observed local artifact |

The unrelated staged translation-package removals are outside this intake and
must remain untouched.

## Requirements ledger

| ID | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| R-01 | Treat Cowork, SharePoint Library, SharePoint List, GitHub Copilot, and Copilot Studio as distinct host contracts, not formatting variants. | confirmed | User direction, 2026-09-01 |
| R-02 | Retain `okhp3-skill-foundry` as the portable baseline; use each host Foundry as a tailored pattern master. | confirmed | User direction, 2026-09-01 |
| R-03 | Keep SharePoint Library and List patterns distinct within the SharePoint Foundry. | confirmed | User direction and package scope |
| R-04 | Ground host-specific claims in current primary documentation and distinguish documented, inferred, analytical, and live evidence. | confirmed | User direction; Foundry evidence contract |
| R-05 | Use structured requirements, source-backed research, independent equilibrium review, then a versioned evolution pass. | confirmed | User direction, 2026-09-01 |
| R-06 | Increment every Foundry from `1.0.0` to `1.1.0` only when the change has a traceable hypothesis and validation record. | confirmed | User direction; Foundry release gate |
| R-07 | Do not infer tenant enablement, skill discovery, permissions, connector availability, or successful writes from documentation or structural checks. | confirmed | host constraints and repository evidence policy |

## Elicitation plan and open questions

The current conversation supplies the decision, scope, and desired outcome. No
additional stakeholder answer is available in this pass, so these questions
become explicit follow-up tests rather than invented requirements:

1. Which named Cowork tenant and distribution route should validate a real M365
   app package?
2. Which disposable SharePoint site, one library, and one list may be used for
   native discovery and supported-write tests?
3. Which GitHub Copilot surfaces (cloud agent, CLI, app, VS Code, JetBrains)
   are in release scope for a practical host matrix?
4. Which Copilot Studio environment and agent may accept a test skill package,
   and what tools/knowledge sources are intentionally available?

## Acceptance criteria for this pass

- Each Foundry gains one concrete, host-specific improvement rather than generic
  prose expansion.
- Each records a short version-specific learning/review record, fresh research
  ledger, and validation change.
- Each has a visible activation/discovery, capability, permission/approval, and
  evidence-status boundary appropriate to its host.
- Each remains under the portable body limit and passes the repository validator.
- The final report separates analytical evidence from unrun live-host proof.
