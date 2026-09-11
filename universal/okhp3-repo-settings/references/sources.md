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
| BILL-01 | [OpenAI billing](https://help.openai.com/en/articles/9039756-chatgpt-search) | ChatGPT and API billing distinction, checked earlier in originating session |
| BILL-02 | [Claude billing](https://support.claude.com/en/articles/9876003-i-have-a-paid-claude-subscription-pro-max-team-or-enterprise-plans-why-do-i-have-to-pay-separately-to-use-the-claude-api-and-console) | Subscription/API distinction, checked earlier in originating session |

## Origin evidence

OWNER-01: The originating owner explicitly identified a one-person team, chose
ChatGPT as the default reviewer, wanted limited Copilot usage and provider fallback,
and asked the agent to execute routine expert decisions instead of repeatedly
returning configuration choices. These are scoped user preferences.

OBS-01: The originating repository is OKHP3/Glee-fullyTools-FoundRy, a public-source
owner-local Python/SQLite application. Its guidance prohibits unapproved hosting
and serving repository root or working data. Do not extrapolate to every child.

OBS-02: In the originating session the actual Copilot page exposed one combined
approval/counting toggle, despite GH-04 describing separate controls. The skill
therefore checks the actual interface and records its limits instead of claiming
a second control was disabled.

The originating session demonstrates configuration operations, not behavioral
validation of this newly authored skill. No subscription balances were measured.
