# Repository settings for one owner with AI agents

Date: 2026-09-10. Repository: OKHP3/Glee-fullyTools-FoundRy.
This is an operational recap and reusable configuration rationale, not canon,
an application release, or a claim that other repositories were changed.

## The outcome worth repeating

The owner chooses direction and accepts consequential tradeoffs. ChatGPT/Codex
is the default implementation and review host. Claude and Copilot are optional
specialists, not compulsory approval authorities. GitHub preserves the shared
source and enforces dependable checks. Configure those roles so a one-person
team can finish work without inventing a second human or buying an integration.

The lesson is to reproduce the decision process, not copy all toggle values.
A public static site, a local workbench, and a team-maintained repository need
different deployment and approval profiles.

## Findings and decisions

| Area | Finding / final disposition | Evidence boundary |
|---|---|---|
| Repository identity | Public source, main default, local Python/SQLite workbench | Repository guidance and metadata; public source is not hosting approval |
| General features | Issues and Projects on; Wiki off; retained | Refreshed through GitHub API during skill authoring |
| Merge methods | Merge, squash and rebase remain allowed | No forced history-policy change during Replit reconciliation |
| Branch-update suggestions | Enabled | Saved and independently re-read |
| Merged-branch cleanup | Enabled automatic deletion of merged head branches | Restorable feature; no fleet cleanup or current branch deletion performed |
| Auto-merge capability | Enabled | No individual PR was enrolled or merged by this settings task |
| PRs and approvals | PRs required; approving review count changed from one to zero | Owner explicitly confirmed there is no second person; effective classic protection re-read |
| Additional approval gates | Code Owner and last-push approvals off | No separate-person gate in the observed classic rule |
| Required status check | Validate manifest retained; up-to-date branches required | Required check exists on pending PR 14 but workflow absent from main at inspection |
| Review conversations | Resolution required | Saved through authenticated API after browser requested fresh authentication |
| Admin enforcement | On; retained | Ordinary owner work follows protection too |
| Force pushes / deletion | Blocked on main; retained | Protects integration history |
| Signatures / linear history | Not required; retained | No additional compatibility constraint imposed |
| Actions | Enabled; all action sources allowed; retained | A future allowlist needs inventory, not a blind switch |
| Workflow token | Read default; Actions PR creation/approval off | API refreshed; distinct from Copilot approval feature |
| External fork workflows | Approval required for all external contributors | Browser save confirmed earlier in this session |
| Retention / cache | 90-day artifacts/logs, seven-day cache, 10 GB cache limit retained | Earlier UI observation; not a spending cap or durable backup |
| Pages | Actions selected; no deployment shown | Dormant configuration, not verified disabled and not a live-site guarantee |
| github-pages environment | Preserved; branch policy permits main | Earlier API inspection |
| copilot environment | Preserved | Existing agent environment; not evidence of running tasks or secret contents |
| Copilot review effort | Lite retained | Earlier UI observation |
| Copilot approvals | Enabled optional approving reviews | Actual UI combines approval/counting; no separate counting switch was changed |
| Copilot automation | No repository review rulesets observed | Personal preferences, inherited policy and workflow/app triggers were not exhaustively audited |
| MCP integrations | No additional connections were added | Does not imply built-in MCP tools are absent; existing full configuration was not audited |

The latest API refresh retained zero required approvals, conversation resolution,
strict Validate manifest, admin enforcement, and blocked force pushes/deletion.
PR 14 remained open with successful verify and Validate manifest jobs. That is
PR evidence, not proof that main contains the manifest workflow or all application
changes are protected by a required application test.

## Corrections that belong in the reusable method

1. Documentation described two Copilot approval controls; this account showed
   one combined control. Inspect the actual interface and report the difference.
2. An empty repository ruleset list proves only that scoped observation. Personal
   automatic-review preferences exist too. Do not promise that all automated
   credit consumption is disabled without inspecting those other sources.
3. An optional AI review does not delay auto-merge. Review the exact head and
   resolve findings before enrolling a PR. New commits may require new review.
4. A default reviewer is an operating preference, not a GitHub setting. ChatGPT
   or Claude findings are not automatically GitHub approval records.
5. MCP adds capabilities to the host that uses it. It does not pool paid plans,
   transfer monthly credits, or automatically choose another provider. No billing
   changes or paid bridges were created.
6. A saved-state read matters. A clicked control or authentication screen alone
   cannot substantiate a completed change.
7. The agent should make routine authorized choices and finish them. Ask the
   owner only for unresolved material scope, cost, access, publication, or required
   confirmation. Do not turn mentorship into repeated approval of ordinary details.

## Repeat the result

1. Establish repository identity, purpose, visibility, owner model, active work,
   and explicit authority. Read the local guide before suggesting hosting.
2. Record observed settings and effective rules before any mutation.
3. Map the desired owner workflow onto actual platform controls. Keep useful
   existing values; write down why an exception applies.
4. Validate check identities and trigger coverage before making them mandatory.
5. Apply bounded authorized deltas and read back persistence and retained controls.
6. Use one coordinator and one writer per scope. Default review to ChatGPT/Codex;
   use a separate reviewer context for substantive work where possible.
7. Address findings, run required checks, then merge within authority. Keep source,
   CI, deployment and Replit synchronization evidence separate.
8. Revisit the profile when the team, runtime, workflow or platform changes.

## Remaining work outside this configuration recap

- Complete the separately owned PR 14 reconciliation and verify the manifest
  workflow on main. Do not merge it solely to close this documentation task.
- Before requiring the application verify job, make sure it reports for every
  applicable PR; the inspected workflow has path filters.
- If an account-wide no-automatic-review claim is needed, inspect personal and
  inherited settings and app/workflow review requests within authorized scope.
- Public deployment, new integrations, credit-aware routing, and billing changes
  remain separate decisions. No repository-wide security audit is claimed.

## Reusable package

See [okhp3-repo-settings](../universal/okhp3-repo-settings/SKILL.md) and its
[creator handoff](../universal/okhp3-repo-settings/references/creator-handoff.md).
The companion composes after `okhp3-foundry-repo-creator`; it does not replace
scaffolding, governance, review, or deployment skills.

Official behavior sources and scope limits are recorded in the package's
[source ledger](../universal/okhp3-repo-settings/references/sources.md).
This session is historical motivation for the new package, not a live benchmark
of instructions that did not yet exist when those settings were changed.
