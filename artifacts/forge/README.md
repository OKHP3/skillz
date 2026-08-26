# Skillz Forge

## Review-surface browser check

Run the review workflow regression check from the repository root:

```sh
pnpm --filter @workspace/forge test:review-browser
```

The check starts an isolated Vite server, reads the current generated catalog,
and chooses real catalog entries for blocked, stale-evidence, and locally
unlocked states. It verifies contract loading and missing-contract fallback,
the validation tab, release gate controls, source links, and horizontal
overflow at desktop and narrow viewports.

Prerequisites:

- Dependencies installed with `pnpm install`
- Chromium available on `PATH` (the repository Nix configuration installs it)
- `PORT` and `BASE_PATH` are supplied automatically to the isolated test
  server; `FORGE_BROWSER_PORT` can override its default port if needed
- Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when Chromium is installed at a
  non-standard path