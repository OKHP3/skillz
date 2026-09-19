# Single-owner AI-assisted configuration profile

Apply only after confirming the operating model. Values below are recommended
decisions; classify each as changed, retained, blocked, not applicable, or unknown.

| Surface | Starting recommendation | Exceptions and evidence needed |
|---|---|---|
| Identity and visibility | Preserve verified repository identity and intended visibility | Public source does not authorize serving private records or the application |
| Default branch | Preserve the established integration branch, commonly main | Do not rename to satisfy a convention |
| Issues and Projects | Keep useful tracking enabled | Avoid creating redundant tracking systems |
| Wiki and Discussions | Leave unused surfaces off | Preserve an existing knowledge/community workflow |
| Merge methods | Preserve working methods; suggest squash for bounded changes | Do not force squash or linear history onto active reconciliation, release, or stacked-branch workflows |
| Update-branch suggestions | On | This offers an action; it does not synchronize every host |
| Auto-delete merged branches | On for disposable task branches | Preserve long-lived/release branches and inspect stacked PR dependencies; setting does not authorize bulk deletion |
| Allow auto-merge | On where supported | Enrollment is per PR; author review and optional AI review must finish first; it does not bypass checks |
| PR requirement | On for integration branch | Zero approving reviews retains PR workflow; deleting the review object may remove the PR gate |
| Required approvals | Zero for explicitly chosen solo-owner mode | Do not weaken a team, legal, or organizational requirement by inference |
| Code Owner / last push approvals | No additional-person requirement in solo profile | Check inherited policy and explain any conflict |
| Required checks | Real, reliable, relevant jobs | Verify source app, exact name, event coverage and paths; do not require a scheduled-only or filtered-out workflow |
| Up-to-date branches | On when supported by working checks | Explain increased reruns; select an equivalent verified queue strategy only when needed |
| Review conversations | Require resolution | Resolution is not proof that a defect was fixed; record review findings and disposition |
| Admin bypass | Preserve enforcement for normal work | Do not casually grant agents bypass privileges to solve a blocked merge |
| Force pushes / branch deletion | Block on integration branch | Keep recovery operations separately scoped and explicitly authorized |
| Signed commits / linear history | Preserve existing policy | Do not add constraints without testing compatibility with owner and agent workflows |
| Actions enabled / action sources | Preserve necessary working actions | Consider a compatible allowlist after inventorying all workflows; never enable SHA enforcement against tag-based workflows without a migration |
| Default workflow token | Read contents/packages | Grant narrower job-level writes only for demonstrated functions; read-default is not proof every job is read-only |
| Actions create/approve PRs | Off unless an authorized workflow needs it | This is distinct from Copilot approvals and may break update-bot workflows if changed blindly |
| External fork workflows | Require approval for all external contributors for this profile | Record the added maintainer step; do not suppress required checks or trusted integrations |
| Logs and artifacts | Retain useful evidence, e.g. 90 days when permitted | Preserve policy and storage constraints; logs are not durable backups; do not reduce retention without considering evidence needs |
| Cache | Preserve working limits unless measured need | Cache limit is not an account spending cap |
| Pages: local-only application | Do not add a deployment; retain dormant config explicitly as dormant | GitHub Pages cannot host the Python/SQLite backend; do not serve repository root or private data; disabling an existing site needs separate analysis |
| Pages: intended static site | Assess source, workflow, domain, HTTPS, environment and build output | Configure only an authorized publish target; do not copy local-only policy to a storefront |
| Environments | Preserve used environments; constrain deployment branches appropriately | Do not delete copilot or github-pages because they appear idle; do not add production for a local app |
| Copilot review | Manual; Lite when cost-conscious | Inspect personal preferences and inherited rules separately; don't promise zero automated consumption from repo evidence alone |
| Copilot approvals | Optional signal when requested | Inspect combined vs separate controls; avoid provider-specific merge dependency |
| MCP | No additional connections by default | Require a concrete task, compatible authentication, narrow tool access, and billing/authority checks |

## Review allocation contract

ChatGPT/Codex is the default for this owner profile. Other users may select another
default. Keep the protocol provider-independent: repository, base/head revision,
scope, findings, severity, evidence, proposed remedy, and disposition. A review in
ChatGPT or Claude is not automatically a GitHub approving review or status check.
Do not fabricate reviewer identities or install a fake passing check to represent it.
Use a separate reviewer context for substantial changes when available; label
self-review honestly. Prioritize correctness and useful results per credit over
ritual multi-agent debate. No paid provider is required for this skill's core.

## Credit and integration boundary

MCP gives its host tools and context. Configuring Copilot MCP does not route
reviews to ChatGPT, pool subscription balances, or create monthly fallback.
Verify billing for the chosen authentication path; API usage can be billed apart
from a chat subscription. Do not install a bridge merely because an account is paid.
Notion can provide scoped requirements and Mermaid tooling can provide diagrams
when a compatible integration is verified. GitHub remains source authority for
this owner profile; imported editorial context cannot override repository canon.

## When to reconsider

Reassess after a collaborator joins, a runtime becomes publicly hosted, a required
workflow changes, a branch strategy changes, a provider changes UI or billing,
or a real incident exposes a missing control. Do not force periodic churn.
