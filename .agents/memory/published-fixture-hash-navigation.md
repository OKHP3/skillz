---
name: Published fixture hash navigation
description: Browser-fixture behavior to account for when testing hash-routed published surfaces.
---

Static HTTP fixtures serving a hash-routed SPA may keep the same document when
only the URL fragment changes. Inline scripts in that document do not rerun, so
route-specific fixture setup cannot be inferred from a second hash navigation.

**Why:** The published review-surface fixture reused one HTML response for two
approved companion routes, and a route-specific source-link rewrite only ran on
the first document load.

**How to apply:** Keep shared fixture values stable across hash routes, open a
fresh page when route-specific document setup matters, or make the fixture
behavior depend on application-side route state rather than a one-time inline
script.