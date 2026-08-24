# Repository validation skills

These skills are local, reusable instructions for assistants working in this
workspace. They are intentionally credential-free: checks read the checkout,
generated assets, and workflow files only.

## Quick operator guide

Run these from the repository root:

```bash
node .agents/skills/catalog-integrity/run.mjs
node .agents/skills/static-route-validation/run.mjs
node .agents/skills/production-build-verification/run.mjs
node .agents/skills/publishing-trigger-check/run.mjs
node .agents/skills/published-keyboard-recovery-check/run.mjs
node .agents/skills/publish-health-check/run.mjs
node .agents/skills/validation-smoke/run.mjs
```

## CI reports

Each validation runner keeps the readable console output above and accepts an
optional `--json <path>` argument. The report is written even when the check
fails, so CI can archive it without scraping logs:

```bash
node .agents/skills/static-route-validation/run.mjs --json validation-reports/routes.json
```

Reports use schema version `1` and include `check`, `status` (`passed` or
`failed`), overall `severity`, `sourcePaths`, and check-specific details.
Current validators classify failures as `release-blocking`; a future
non-blocking finding should use `severity: "warning"` without changing the
exit-code contract.

Example GitHub Actions archival step (it does not authenticate, publish, or
change deployment policy):

```yaml
- name: Run validation with report
  run: |
    mkdir -p validation-reports
    node .agents/skills/static-route-validation/run.mjs \
      --json validation-reports/static-route-validation.json
- name: Archive validation report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: validation-reports
    path: validation-reports/
```

| Skill | Use when | Success | Release-blocking failure |
| --- | --- | --- | --- |
| `catalog-integrity` | After catalog source or evidence-contract changes | Rebuilds and validates catalog counts, metadata, evidence vocabulary, provenance, and payload split | Non-zero exit; CI provenance remains fail-closed |
| `static-route-validation` | After route, hash-anchor, or static page changes | Confirms expected routes and anchors exist in the shipped Forge source | Non-zero exit for missing route/anchor or malformed hash target |
| `production-build-verification` | Before presenting or publishing Forge | Builds with the artifact's required `PORT` and `BASE_PATH`, then checks output | Non-zero exit if build fails or output is missing |
| `publishing-trigger-check` | Before changing deploy workflow paths | Reuses the deploy-trigger guard and checks family-agnostic globs | Non-zero exit if workflow is missing, hardcodes families, or loses a glob |
| `published-keyboard-recovery-check` | After a GitHub Pages deploy, or on demand against the live site | Confirms the published (not local) review surface preserves failed-contract keyboard recovery | Exit `2` for a deployment/staleness problem, exit `1` for an application regression |
| `publish-health-check` | On a schedule and after every deploy run | Confirms the last deploy run succeeded and the live site's `sourceCommit` matches `main` | Exit `2` if the last run failed, `3` if unreachable, `4` if live but stale |
| `validation-smoke` | When changing validators or CI report schemas | Exercises malformed catalog, route/hash, missing-output, blocked-publishing, and passing/failing report-contract fixtures | Non-zero exit if a fixture is accepted or rejected incorrectly |

## CI-only checks (not local skill runners)

The checks below run as `.github/workflows/release-validation.yml` jobs rather
than as `.agents/skills/*/run.mjs` scripts, but they are part of the same
release-validation contract and are documented here for the same reason: a
broken build or review flow must fail the pipeline before merge.

| Check | Use when | Success | Release-blocking failure |
| --- | --- | --- | --- |
| Review Desk type-check + build + browser smoke test | On every push/PR touching `artifacts/forge-review-desk/**` | `pnpm --filter @workspace/forge-review-desk run typecheck`, `run build`, and `run test:review-browser` all pass, confirming the review workspace compiles and its evidence-selection, supervised-check, final-review-gate, and mobile-navigation flows still work | Non-zero exit from any of the three steps fails the `review-desk-surface` job before merge |

Warnings about shallow history are expected during local development when the
catalog builder is allowed to proceed. In CI, the catalog builder must fail
closed unless full Git history is available; do not suppress that failure with
credentials or by fabricating timestamps.