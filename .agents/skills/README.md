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
node .agents/skills/validation-smoke/run.mjs
```

| Skill | Use when | Success | Release-blocking failure |
| --- | --- | --- | --- |
| `catalog-integrity` | After catalog source or evidence-contract changes | Rebuilds and validates catalog counts, metadata, evidence vocabulary, provenance, and payload split | Non-zero exit; CI provenance remains fail-closed |
| `static-route-validation` | After route, hash-anchor, or static page changes | Confirms expected routes and anchors exist in the shipped Forge source | Non-zero exit for missing route/anchor or malformed hash target |
| `production-build-verification` | Before presenting or publishing Forge | Builds with the artifact's required `PORT` and `BASE_PATH`, then checks output | Non-zero exit if build fails or output is missing |
| `publishing-trigger-check` | Before changing deploy workflow paths | Reuses the deploy-trigger guard and checks family-agnostic globs | Non-zero exit if workflow is missing, hardcodes families, or loses a glob |
| `validation-smoke` | When changing validators themselves | Exercises malformed catalog, route/hash, missing-output, and blocked-publishing fixtures | Non-zero exit if a fixture is accepted or rejected incorrectly |

Warnings about shallow history are expected during local development when the
catalog builder is allowed to proceed. In CI, the catalog builder must fail
closed unless full Git history is available; do not suppress that failure with
credentials or by fabricating timestamps.