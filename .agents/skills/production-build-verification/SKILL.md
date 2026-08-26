---
name: production-build-verification
description: Build the standalone Forge artifact with strict routing inputs and confirm its static output exists.
---

# Production build verification

## Use when

Run before presenting, publishing, or merging changes to the Forge web
artifact. This is a build check, not a deployment and it does not access
credentials.

## Callable command

```bash
node .agents/skills/production-build-verification/run.mjs
```

The command supplies the managed artifact's local port and preview base path,
runs the package build, and checks `dist/public/index.html`. Any build error or
missing output is release-blocking.