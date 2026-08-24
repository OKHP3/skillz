---
name: Forge Pages workflow build requirements
description: What .github/workflows/deploy-pages.yml must supply for the artifacts/forge/ Vite build to succeed and for Pages to serve the right files.
---

# Forge Pages workflow build requirements

`artifacts/forge/vite.config.ts` throws at config-load time if `PORT` or
`BASE_PATH` env vars are missing — CI's build step must set both explicitly
(e.g. `PORT: "5000"`, `BASE_PATH: /skillz/`) or `pnpm run build` fails before
producing any output.

Vite's `build.outDir` is `dist/public` (not `dist`). The Pages workflow's
`upload-pages-artifact` step must point at `artifacts/forge/dist/public`,
not `artifacts/forge/dist` — uploading the parent directory serves a
`public/` subfolder with no `index.html` at the site root.

**Why:** A completion-review pass caught both issues only by actually running
the build locally with the required env vars set; the workflow YAML alone
looked plausible but would have failed (or deployed a broken site) in CI.

**How to apply:** Before trusting any edit to `deploy-pages.yml`'s build/upload
steps, run `PORT=5000 BASE_PATH=/skillz/ pnpm --filter @workspace/forge run
build` locally and confirm `dist/public/index.html` exists before assuming CI
will succeed.
