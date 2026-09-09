---
name: Git sync fixture remotes
description: Isolated Git sync fixtures need an explicit default branch on bare remotes.
---

Bare test remotes do not necessarily advertise a default `HEAD` after the first
branch is pushed. Set the bare symbolic `HEAD` or clone with an explicit branch
before creating the local and remote-writer checkouts.

**Why:** A plain clone can remain unchecked out and make later commits or pushes
fail for reasons unrelated to the synchronization behavior being tested.

**How to apply:** When building disposable Git reconciliation fixtures, establish
the remote's default branch before cloning any working checkout.