---
name: publish-health-check
description: Confirm the live Skillz Forge GitHub Pages site matches the last successful deploy run, independent of whether the last deploy-pages.yml run happened to report success.
---

# Publish health check

Notices, without anyone manually querying the Actions API, when a Skillz
Forge publish silently stops going live.

## Why this exists

`.github/workflows/deploy-pages.yml` once failed on every push for months
after a monorepo migration, and nobody noticed: pushes to `main` looked
normal, but the live site quietly served a stale build. There was no signal
that surfaced the failure without an agent deliberately going and checking.

This check closes that gap two ways at once:

1. It re-checks the *last* `deploy-pages.yml` run's conclusion for `main`,
   so a failed publish is flagged even if nobody is watching the Actions tab.
2. It independently compares the *live* `catalog.json`'s `sourceCommit`
   against the commit that the last successful deploy run actually built
   (its `head_sha`) -- not against `main`'s current tip, since
   `deploy-pages.yml` only fires on a `push.paths` allowlist and plenty of
   legitimate `main` commits (docs, unrelated workflows) never trigger a
   deploy at all. A mismatch here means a run reported "success" but didn't
   actually ship the commit it built (a stale Pages cache, a mis-scoped
   artifact, etc.) -- reporting success is not the same as being live.

## Running it

```bash
node .agents/skills/publish-health-check/run.mjs
node .agents/skills/publish-health-check/run.mjs --json validation-reports/publish-health-check.json
```

No credentials are required -- it only issues public, unauthenticated
`fetch` calls against the GitHub REST API (workflow run history) and the
published GitHub Pages site.

Regression check: a `main` commit that does not touch any of
`deploy-pages.yml`'s watched paths never triggers a deploy, so it must not
be misreported as a stale site. This was verified by pushing a change to the
top-level README (which matches none of `deploy-pages.yml`'s `push.paths`
patterns -- unlike this SKILL.md, which does) and confirming the check still
reported `healthy`, correctly comparing against the previous successful
run's `head_sha` instead of `main`'s new tip.

Exit codes distinguish *why* it's unhealthy, since each needs a different
response:

| Exit | Stage | Meaning |
| --- | --- | --- |
| `0` | healthy | Last run succeeded and the live commit matches that run's `head_sha`. |
| `2` | `workflow_failed` | The last `deploy-pages.yml` run for `main` did not succeed. |
| `3` | `unreachable` | The site, its catalog, or the Actions API could not be reached. |
| `4` | `stale` | The run reported success, but the live `sourceCommit` still doesn't match that run's `head_sha`. |

## CI wiring

`.github/workflows/publish-health-check.yml` runs this on a schedule (every
30 minutes) and immediately after every `deploy-pages.yml` run completes, so
a failure surfaces within minutes rather than at the next unrelated push. An
unhealthy result fails the job (visible in the Actions tab and any GitHub
notification a watcher has enabled) and opens or updates a tracking issue
labeled `publish-health`; a return to healthy automatically closes that
issue. See that workflow file for the exact issue-management steps.

If the repository secret `PUBLISH_HEALTH_WEBHOOK_URL` is configured, the same
workflow sends a real-time transition notification to that webhook when an
incident is first opened and when it recovers. It accepts Slack incoming
webhooks and Discord webhooks: the workflow sends both `text` and `content`
fields so either service can consume the message. Repeated checks during the
same incident do not send another webhook notification. If the secret is
absent, the notification step is skipped and GitHub issue tracking continues
normally.
