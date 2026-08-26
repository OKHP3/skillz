---
name: Review Desk browser fixtures
description: Durable guidance for catalog-response fixtures and UI assertions in Review Desk browser regressions
---

Catalog-response fixtures in the Review Desk browser suite should be enabled only for the scenario that needs them. A response mock changes the catalog for every route on that page, including counts and filters used by earlier checks.

**Why:** A final-review fixture needs to make an existing skill release-ready without changing production data, but enabling it at page setup can invalidate unrelated assertions about the real catalog.

**How to apply:** Keep the route mock pass-through by default, enable it immediately before a full navigation that reloads the catalog, and normalize button-label assertions when the UI applies uppercase styling through CSS.

Browser pages created directly from a Playwright browser do not share storage unless
they belong to the same explicit browser context. Cross-tab persistence regressions
must create all participating pages from one context.

**Why:** The browser storage event models separate tabs only when those pages share
the same origin and storage partition; isolated contexts can make a valid app look
like it failed to hydrate or broadcast state.

**How to apply:** Use `browser.newContext()` once for the writer, matching tab, and
negative-control tab, then create each page from that context.