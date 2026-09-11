# Sources and freshness

Retrieved or checked 2026-09-10. Treat GitHub previews and account UI as changing.
These sources support product behavior, not universal approval of this profile.
Reopen the relevant official page before changing a behavior that may have drifted.
Use observed saved state for the target repository; report conflicts with docs.

| ID | Source | Bounded use |
|---|---|---|
| GH-01 | [Protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) | Protection capabilities and merge conditions |
| GH-02 | [Auto-merge](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request) | Per-PR enrollment and requirements |
| GH-03 | [Actions settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository) | Default tokens, external approvals, retention |
| GH-04 | [Copilot review configuration](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/configure-code-review) | Personal and repository automation, effort, approval preview |
| GH-05 | [Copilot MCP](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers) | Tools/context for Copilot; review tool restrictions and authentication compatibility |
| GH-06 | [Copilot review](https://docs.github.com/en/copilot/concepts/agents/code-review) | Approvals are model assessments, not correctness guarantees |
| BILL-01 | [OpenAI billing](https://help.openai.com/en/articles/9039756-managing-billing-settings-on-the-chatgpt-web-and-api-platform) | ChatGPT and API billing distinction, checked earlier in originating session |
| BILL-02 | [Claude billing](https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-do-i-have-to-pay-separately-to-use-the-claude-api-and-console) | Subscription/API distinction, checked earlier in originating session |

## Origin evidence

OWNER-01: The originating owner explicitly identified a one-person team, chose
ChatGPT as the default reviewer, wanted limited Copilot usage and provider fallback,
and asked the agent to execute routine expert decisions instead of repeatedly
returning configuration choices. These are scoped user preferences.

OBS-01: The originating case involved a public-source
owner-local Python/SQLite application. Its guidance prohibits unapproved hosting
and serving repository root or working data. Do not extrapolate to every child.

OBS-02: In the originating session the actual Copilot page exposed one combined
approval/counting toggle, despite GH-04 describing separate controls. The skill
therefore checks the actual interface and records its limits instead of claiming
a second control was disabled.

The originating session demonstrates configuration operations, not behavioral
validation of this newly authored skill. No subscription balances were measured.


## V2 additions, retrieved 2026-09-10

Primary GitHub documentation; accepted for the narrow rules summarized here.
Recheck on host/API drift. Recommendations in the profile remain owner choices.

- [Secure use](https://docs.github.com/en/actions/reference/security/secure-use): immutable action pins, untrusted-input and credential boundaries. Applied to template design.
- [Required checks troubleshooting](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks): filtered workflows can leave pending checks. Template job is not a mandatory gate.
- [Disable and enable workflows](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows): public scheduled workflows may disable after 60 days without activity.
- [Repository security quickstart](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository): dependency, code and secret security plus reporting policy. These remain manually assessed, not claimed as helper coverage.
- [Actions permissions REST](https://docs.github.com/en/rest/actions/permissions): default workflow permissions read endpoint and Administration-read access.
- [Branch protection REST](https://docs.github.com/en/rest/branches/branch-protection): classic protection scalar fields; not an effective-ruleset evaluator.
- [Actions repository settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository): token/fork/retention choices depend on host policy.

Action pins resolved read-only from publisher Git refs: actions/checkout v4
11d5960a326750d5838078e36cf38b85af677262 and actions/upload-artifact v4
ea165f8d65b6e75b540449e92b4886f43607fa02. Pins identify reviewed template dependencies,
not a claim they are the newest major release or immune to vulnerabilities.

- [Workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows): default-branch schedules can be delayed or dropped; a scheduled template is not proof of execution.
