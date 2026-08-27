---
name: Archived document link audit
description: Archived Markdown can retain historical paths while active-content link checks stay fail-closed.
---

Archived documents are a separate link-audit scope from active repository content. A preserved snapshot may keep former-root references when the document labels them as historical and the migration ledger records the exception; references intentionally carried forward should still be rebased and verified against the current layout.

**Why:** Consolidating a repository changes the base directory used by GitHub for relative Markdown links, but rewriting every historical reference can obscure what the preserved source actually contained.

**How to apply:** When moving or preserving Markdown under `docs/archive/`, distinguish references that resolve from the archive location, intentionally labeled historical references, and active-content failures. Record the scope and counts in the migration or provenance ledger.