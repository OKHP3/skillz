# Sanitized incident evidence

Retrieved 2026-09-05 UTC. These are public repository records, not mailbox
exports. Live incident repairs do not establish the skill's measured uplift.
Private incident identifiers and host snapshots remain outside this package.

| Lesson | Evidence | Boundary |
| --- | --- | --- |
| Generated deployment output scanned as source | [AskJamie repair PR 9](https://github.com/OKHP3/AskJamie/pull/9), [successful main validation and deployment](https://github.com/OKHP3/AskJamie/actions/runs/33938513097) | Distinct from an unsuccessful push; source walkers and checkout-time freshness needed correction |
| Malformed workflow heredoc | [Chai Chasers PR 15](https://github.com/OKHP3/glee-fully-chai-chasers/pull/15), [main landing verification](https://github.com/OKHP3/glee-fully-chai-chasers/actions/runs/33938349531) | Job creation and actual file-hash checks verified after indentation repair |
| Stale generated skill evidence | [refoldec PR 3](https://github.com/OKHP3/refoldec/pull/3), [main freshness run](https://github.com/OKHP3/refoldec/actions/runs/33938353251) | Regeneration retained adverse findings rather than hiding them |
| Test fixtures accidentally treated as public pages | [OverKill-Hill PR 10](https://github.com/OKHP3/OverKill-Hill/pull/10), [main Site Validation](https://github.com/OKHP3/OverKill-Hill/actions/runs/33938540809) | Genuine i18n drift remained unresolved; the site repair did not make the estate all green |
| Incomplete dependency lock and route smoke-test behavior | [Abrahamic Reference Engine PR 12](https://github.com/OKHP3/abrahamic-reference-engine/pull/12), [follow-up PR 13](https://github.com/OKHP3/abrahamic-reference-engine/pull/13), [successful main deployment](https://github.com/OKHP3/abrahamic-reference-engine/actions/runs/33938579540) | Passing install alone was not sufficient; post-merge deployment exposed another boundary |

The lockfile-private-registry and disabled-pull-request examples in the design
are generalized from private evidence and are not independently reproducible
from this public package. Treat them as diagnostic hypotheses until reproduced
against a current target. Finder metadata in Git refs is another observed local
integrity issue: report the nonzero integrity check, never silently return an
empty unreachable-work result. Quarantine or removal is separate authorized work.

[GitHub's notification API](https://docs.github.com/en/rest/activity/notifications)
distinguishes marking read from marking done and from changing subscriptions.
Use the exact operation and independently verify its outcome. A done thread can
still appear in an all-notifications API listing; do not assume absence is the
only valid readback.
