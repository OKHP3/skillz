---
name: published-keyboard-recovery-check
description: Confirm the published Skillz Forge review surface still preserves failed-contract keyboard recovery after a GitHub Pages deploy.
---

# Published keyboard recovery check

## Use when

Run after a Forge deploy (or on demand against the live site) to catch
hosting or artifact differences that local validation cannot see -- a stale
GitHub Pages artifact, a build that shipped without the failed-contract
recovery path, or the keyboard-recovery behavior itself regressing once
served from production.

## Callable command

```bash
node .agents/skills/published-keyboard-recovery-check/run.mjs
```

Set `FORGE_PUBLISHED_URL` to point at a non-default deployment (defaults to
`https://okhp3.github.io/skillz/`). In a post-deploy CI job, set
`EXPECTED_SOURCE_COMMIT` to the commit that was just deployed (e.g.
`${{ github.sha }}`) so a lagging Pages artifact is reported before the
keyboard checks even run.

## Inputs and outputs

The command drives a headless browser against the **published** site only --
plain, unauthenticated HTTPS requests, no repository access, no production
credentials. It forces a skill-detail contract load to fail and checks that
the failed-contract alert, the raw-markdown fallback link, and the focusable
panel remain keyboard reachable, exactly as validated locally by
`artifacts/forge/scripts/test-review-surface-browser.mjs`.

Failures are reported on two distinct channels so an operator does not
confuse "the deploy did not ship" with "the deploy shipped a regression":

- **Deployment failures** (exit code `2`, `[deployment]` prefix): the site or
  its catalog is unreachable, the published bundle never mounts, or the
  published catalog's `sourceCommit` does not match the expected commit
  (a stale artifact).
- **Assertion failures** (exit code `1`, `[assertion]` prefix): the site and
  catalog are current, but the failed-contract alert, panel focus, or
  fallback-link keyboard reachability itself is broken.

Never paste credentials into the command; it does not need any.
