# Composition with okhp3-foundry-repo-creator

The inspected companion is `universal/okhp3-foundry-repo-creator/SKILL.md`, version
1.1.0 in the originating skill catalog. It owns source provenance, parent selection, naming,
scaffolding, manifest, and graduation. Its current contract excludes autonomous
remote creation and publication. This package does not expand that authority.

Suggested sequence:

1. Creator produces an approved scaffold and records parent, runtime, visibility,
   data boundary, expected default branch and deployment intent.
2. A separately authorized workflow creates the remote, if needed.
3. Invoke `okhp3-repo-settings` with exact owner/repository, those decisions,
   available workflows and permissions, owner review preference, and authorized
   settings scope. Before a remote exists, produce a proposed settings record only.
4. This skill audits current settings, resolves prerequisite checks, applies only
   authorized deltas, and returns verified state and remaining blockers.
5. The implementation/review workflow owns PR fixes and merge. A deployment skill
   owns publication if the approved architecture calls for it.

Example invocation:

> Configure the already-created repository identified in this handoff for its
> confirmed single owner and AI agents. Default to ChatGPT/Codex review, preserve
> its local-only runtime boundary, and inspect existing checks before requiring
> them. Apply authorized routine changes and return the settings record.

## Placement

The authored candidate lives in the originating project's
`.agents/skills/okhp3-repo-settings/`. Intended canonical distribution placement
is `universal/okhp3-repo-settings/`, adjacent to the creator. This is
a promotion destination, not a claim that publication or synchronization occurred.
The core uses no cross-repository relative imports or machine-specific paths.

Before promotion, inspect destination guidance/status and all existing copies;
use the approved skill-promotion workflow, compare full package hashes, and
regenerate the destination catalog with its documented tools. Add an optional
creator routing sentence only under an authorized creator change, then validate
both packages. Do not make a network service or companion installation mandatory.
