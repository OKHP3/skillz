# Coverage matrix for v2

Scope: GitHub.com, one owner with AI collaborators, public-source local applications
or intentionally hosted static sites. This is a review inventory, not a universal
certification. Record each row as confirmed, proposed, unknown or not-applicable,
with evidence date, reason, accountable owner and next action. Inherited policy
and plan availability override defaults. Review again after material changes.

| Area | Repeatable assessment | Automation boundary |
|---|---|---|
| Identity and lifecycle | Verify exact owner/repo, default branch, visibility, purpose, license and archival intent | Helper checks repository identity and default branch; visibility changes remain deliberate |
| Access and recovery | Review collaborators, installed apps, deploy keys, token scope/expiry, account 2FA/passkeys and recovery ownership | Manual; never collect credentials or recovery codes |
| Merge controls | PR requirement with zero mandatory approvals for confirmed solo policy; inspect code owner, last-push, stale review, conversation, admin and bypass controls | Helper samples classic approval count/admin/force-push/deletion; effective PR gate is manual |
| Rulesets | Inspect branch/tag targeting, inherited rules, enforcement, bypass actors, compatible merge methods | Manual; classic protection alone is insufficient |
| Checks | Verify exact job/app identity, default-branch existence, PR event/path coverage, current-head results and cancellation behavior | Manual; never infer from one green run |
| Merge workflow | Review current head before auto-merge enrollment; inspect squash/rebase/merge needs and merged-branch cleanup | Helper reads auto-merge and auto-delete; never merges |
| Actions trust | Default read token; explicit minimal job grants; external contribution approvals; action allowlist and full-SHA pinning; review reusable/transitive actions | Helper reads default permissions and approval capability; remainder manual |
| Untrusted execution | Avoid privileged execution of PR code, direct expression injection, shared untrusted caches, and persistent self-hosted runners for public forks | Manual; bundled template isolates audit credentials from PR tests |
| Credentials | Prefer scoped short-lived access where supported, OIDC for authorized cloud deployment, rotation/revocation and separate environment secrets | Manual; no token minting, secrets extraction or cloud provisioning |
| Supply chain | Dependency inventory/lockfiles, Dependabot alerts and appropriate updates, dependency review, supported runtime/action versions | Manual; stdlib apps still have Actions and toolchain dependencies |
| Code and secret security | Assess available secret scanning/push protection, CodeQL or suitable analysis, alert triage and private reporting/SECURITY.md | Manual; eligibility and language coverage vary, enabling is not zero vulnerabilities |
| Pages | Match actual intended publishing source, build output, domain ownership, HTTPS, environment and deployment evidence | Manual; never expose local workbench/private data; an explicitly approved static root is valid |
| Environments | Restrict deployment branches/tags, scope secrets, avoid impossible solo approval, preserve existing environments pending purpose review | Manual |
| Releases | Tag protection, versioning, reproducible artifacts/provenance and attestations where relevant; verify exact released revision | Manual; release work separately authorized |
| Repository guidance | README, LICENSE, AGENTS, contribution/PR templates, issue routing, ownership and support expectations | Manual; CODEOWNERS is not a second human and must not deadlock solo work |
| AI workflow | ChatGPT/Codex first by owner preference, bounded optional Copilot/Claude, personal/inherited automation scopes, exact-head review | Manual; no credit pooling, billing API or automatic host failover |
| MCP and apps | Demonstrated purpose, minimum tool access, trusted provider, data exposure, billing and revocation | Manual; paid subscription is not integration authority |
| Retention and costs | Appropriate logs/artifact/cache lifetime, job timeouts/concurrency, action quotas and private report exposure | Template bounds runtime; actual billing and retention manual |
| Monitoring | Weekly/manual drift checks, unknown permissions, failure routing, schedule inactivity/delay and evidence freshness | Helper compares selected scalars; operator reviews incomplete coverage |
| Recovery and handoff | Preserve before/after evidence, rollback prerequisites, concurrent changes, package version/hash and open decisions | Helper compares snapshots; cannot prove causation or restore settings |

Sources and retrieval dates: [sources.md](sources.md). This matrix guides review;
no uninspected row is implicitly compliant. Team/compliance policy, GHES, enterprise
administration, incident response, application security assessment and deployment
implementation require their own qualified workflows.
