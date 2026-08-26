---
name: HashRouter breaks fragment anchors
description: Why href="#id" skip links / in-page jump links must not be used with react-router's HashRouter, and the fix pattern.
---

Under `HashRouter`, the URL hash *is* the route. A normal `<a href="#some-id">` "skip link" or in-page anchor sets `location.hash` to a value the router then tries to match as a path — since it won't match any `<Route>`, it silently falls through to the catch-all route (often the home page), hijacking navigation instead of just scrolling/focusing.

**Why:** discovered when adding a "skip to pagination" in-page link on Explore and re-testing the pre-existing global "Skip to main content" link in `artifacts/forge/src/App.tsx` — both were real anchors and both broke navigation when activated, even though this had gone unnoticed before (nobody keyboard-tested them).

**How to apply:** any in-page jump target (skip links, "back to top", TOC anchors) in an app using `HashRouter` must be a `<button>` with a JS handler that calls `targetEl.focus()` + `targetEl.scrollIntoView(...)`, never a real `href="#id"` anchor. The target element needs `tabIndex={-1}` to be programmatically focusable. If the target can mount asynchronously (e.g. gated behind a data fetch), poll briefly (`requestAnimationFrame` loop with a deadline) rather than a single `getElementById` call, since a user can activate the skip control before the target exists.
