---
name: static-route-validation
description: Check Forge route declarations and hash-anchor targets without requiring a browser dependency.
---

# Static route and anchor validation

## Use when

Run after changing `App.tsx`, FAQ anchors, route components, or static hosting
configuration. This is a deterministic source check and complements browser
testing when a browser runner is available.

## Callable command

```bash
node .agents/skills/static-route-validation/run.mjs
```

## Inputs and outputs

The command reads `artifacts/forge/src/App.tsx` and the FAQ data source,
checks the expected route/anchor contract, and exits non-zero for a missing
route, malformed hash target, or missing focus handling. It does not need
private credentials or network access.