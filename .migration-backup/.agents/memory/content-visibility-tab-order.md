---
name: content-visibility does not fix keyboard access on large lists
description: CSS content-visibility:auto only defers paint/layout cost off-screen; it does not remove elements from the DOM or tab order, so it cannot fix keyboard-traversal problems on large lists by itself.
---

`content-visibility: auto` (plus `contain-intrinsic-size`) is a real render-performance win for long lists — it skips layout/paint for off-screen items. It does **not** shrink the DOM or the tab order: every focusable control in every off-screen item is still present and still reachable via Tab, in document order.

**Why:** discovered while scaling a 113+ item card list. Adding `content-visibility: auto` alone left ~700 focusable elements in the tab order, so keyboard users could not Tab past the list to reach header/nav controls — an actual regression, not just a missed optimization.

**How to apply:** for a list large enough that its total focusable-control count becomes a keyboard-navigation problem, use real pagination or virtualization (which removes/replaces off-screen DOM nodes) as the primary fix. `content-visibility` can still be layered on top for paint performance within a page/window, but never treat it as sufficient for the accessibility requirement on its own.
