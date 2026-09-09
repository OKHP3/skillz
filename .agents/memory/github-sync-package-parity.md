---
name: GitHub sync package parity
description: Canonical-source and promotion rules for the local and shipped GitHub sync skill copies
---

## The rule

`.agents/skills/okhp3-replit-github-sync` is the canonical working copy used by
the project. `replit/okhp3-replit-github-sync` is the shipped distribution
mirror. Promote reviewed safety fixtures and their trigger coverage from the
canonical copy into the shipped mirror without overwriting distribution-only
release metadata or unrelated evaluation cases.

**Why:** The working copy can gain new regression fixtures and live evidence
before a package release. Blindly replacing the shipped evaluation file can
discard its release-state record or pull in a separate, not-yet-promoted
scenario.

**How to apply:** Compare the package files before release, promote the
intended fixture and trigger entries, validate both JSON documents, and verify
that unrelated branch-cleanup expectations remain unchanged.