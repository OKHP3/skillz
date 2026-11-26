# Project Compass independent review

| Revision | Decision | Basis |
|---|---|---|
| In-development revision | Reject for unattended use | Private metadata could enter the mirror or baseline. V9 accepted a missing report. A Git outage could demote the project. Artifact adoption and command handoff instructions conflicted. |
| 86a757e2 | Approve with limits for supervised use | Rechecks closed those four findings. Separate synthetic cases exposed a failed-test completion claim, a missing successor, command rendering during a firewall hold, an omitted parent milestone and incompatible paste-prompt baseline examples. |
| 19e28db9ae91491ff1e98881cbe7c570e2cb74d1 | Approve the workflows tested | The independent reviewer used the real CLIs and fresh synthetic projects. All earlier review findings closed. The reviewer had no access to development grades or sealed cases. |

## Final retest

- A failed test, open issue and unmerged pull request each held an unsupported completion. Explicit closure or merge passed. Missing, unknown and self-referential successor IDs held supersession. A known successor passed.
- A firewall failure in an adopted charter returned exit 3 and zero commands. An existing milestone was bound by number. A pending parent yielded a dependency requiring a fresh pull before rendering the issue command.
- The reviewer extracted the exact baseline and mirror examples from the standalone prompt. The installed helper detected a same-length file edit. The aligned mirror produced zero changes, then planned closure of issue 42 after a local transition. A receipt digest mismatch blocked the plan. All 30 identifier comparisons agreed across forms.
- A Git outage retained the previously verified identity with remote access disabled. Verified origin removal changed the mode. The scanner returned the two eligible unchecked rows and omitted checked, fenced, managed and restricted examples.
- Two same-day reports had distinct matching receipts. A missing report or incorrect run ID produced HOLD.

The reviewer verified 22 inspected runtime and documentation files against the final Git revision. The sorted reviewer manifest digest was `67a69c55490d1a62575566c4a9891dda7c421b7ac792ac69606dced2ac7e6373`. The matched behavioral trial separately pins 23 files. The approval applies to the workflows exercised in the independent review. See [the measured release decision](benchmark.json) for unattended production acceptance.
