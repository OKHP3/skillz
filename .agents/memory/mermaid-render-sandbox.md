---
name: Mermaid CLI render needs system Chromium in this sandbox
description: mmdc's ephemeral chrome-headless-shell fails to launch here; a system chromium + PUPPETEER_EXECUTABLE_PATH fixes it without touching skill scripts.
---

`npx --yes @mermaid-js/mermaid-cli` downloads its own `chrome-headless-shell`, which fails
to launch in this container (`libglib-2.0.so.0` / `libgbm.so.1` missing — installing
individual X11/mesa libs was not sufficient).

**Fix:** install the Nix `chromium` package and set
`PUPPETEER_EXECUTABLE_PATH=<path to that chromium binary>` before invoking `mmdc` (or any
script that shells out to it, e.g. `mermaid/okhp3-mermaid-publish/references/render-pipeline.sh`).
No change to the script or skill itself is needed or correct — this is an environment gap,
not a defect in the render pipeline.

**Why:** without this, every local Mermaid render in this workspace fails with a
browser-launch error that looks like a script bug but isn't.

**How to apply:** any future task that needs to actually run `mmdc` locally in this repl
(rendering a `.mmd` to `.svg`/`.png`) should install `chromium` via `installSystemDependencies`
and export `PUPPETEER_EXECUTABLE_PATH` first, rather than debugging the script.
