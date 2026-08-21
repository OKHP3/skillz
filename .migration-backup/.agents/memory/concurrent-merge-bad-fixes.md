---
name: Bad build fixes from concurrent merges
description: A merge commit that "fixes" a build error by deleting the feature/asset causing it, rather than fixing the real cause. Check for these when something that worked before mysteriously stops rendering.
---

Multiple task agents can merge into `main` concurrently (via the project-tasks system) while unrelated work is in flight. If one agent's change causes a build failure that surfaces during another merge or reconciliation step, the fix that lands is sometimes "delete the broken reference" rather than "restore the missing dependency" — e.g. a commit literally titled `fix(forge): remove missing hero asset import` deleted a working `<img>` tag and its import instead of noticing the asset file was still present on disk and the import path was just momentarily stale during the merge.

**Why:** These fixes make the build pass, so they're easy to miss — nothing errors, a feature just silently disappears from the UI (a hero image, a button, a whole element).

**How to apply:** When a user reports something "looks off" that isn't explained by the CSS/layout change they think caused it (e.g. "not centered" when actually an image vanished), check `git log --oneline -- <file>` for a recent commit with a generic "fix"/"remove"/"resolve build error" message touching that file, and diff it — the real fix is often to restore the deleted reference (confirm the asset/dependency still exists first), not to accept the deletion as intentional.
