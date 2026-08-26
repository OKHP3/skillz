---
name: Mockup sandbox first-run setup
description: npm install required in artifacts/mockup-sandbox/ before Component Preview Server workflow can start.
---

## Rule
After `createArtifact({ artifactType: "mockup-sandbox", ... })`, run `npm install` inside `artifacts/mockup-sandbox/` before calling `restartWorkflow`. The artifact creation scaffolds the folder but does not install dependencies.

**Why:** The workflow tries to launch Vite immediately, which needs `@tailwindcss/vite`, `chokidar`, `fast-glob`, etc. Without install it fails with ERR_MODULE_NOT_FOUND.

**How to apply:**
1. `createArtifact({ artifactType: "mockup-sandbox", ... })`
2. `cd artifacts/mockup-sandbox && npm install`
3. `restartWorkflow({ workflowName: "artifacts/mockup-sandbox: Component Preview Server" })`
