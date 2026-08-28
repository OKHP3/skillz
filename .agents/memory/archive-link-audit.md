---
name: Archived document link audit
description: Archived Markdown can retain historical paths while active-content link checks stay fail-closed.
---

Archived documents are a separate link-audit scope from active repository content. A preserved snapshot may keep former-root references when the document labels them as historical, the migration ledger records the exception, and the corresponding consolidated root target still exists. Rebased archive paths and malformed destinations remain release-blocking.

**Why:** Consolidating a repository changes the base directory used by GitHub for relative Markdown links, but rewriting every historical reference can obscure what the preserved source actually contained; allowing a missing root target would hide a real regression.

**How to apply:** When moving or preserving Markdown under `docs/archive/`, distinguish references that resolve from the archive location, intentional former-root references whose root targets remain available, and failures. Record the scope and counts in the migration or provenance ledger.