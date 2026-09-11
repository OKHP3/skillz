# Session handoff: repository settings v2

Source host: Codex desktop, Windows. Local date: 2026-09-10.
Objective: preserve the solo-owner plus AI method as a reusable, public-safe skill
with deterministic helper scripts, an inactive Actions adapter, version-specific
review and local Skillz routing.

## Artifact inventory

- `.agents/skills/okhp3-repo-settings/`: editable incubator in the originating
  isolated settings-skill worktree; version 2.0.0.
- `skills/okhp3-repo-settings/`: publication mirror, managed from that source.
- `universal/okhp3-repo-settings/`: corresponding Skillz distribution candidate.
- `docs/repo-settings-v2/`: development, validation, review and promotion records.
- `docs/repo-settings-recap.md` and `docs/repo-settings-review/`: historical
  originating settings assessment and 0.1.0 candidate evidence. Do not treat them
  as a fresh audit or new-version benchmark. They are outside the portable package.

The source branch is codex/solo-ai-repo-settings. The Skillz branch is
codex/repo-settings-skill. Skillz already had staged prior-candidate changes when
v2 began. Preserve the index and all unrelated changes; compare staged and working
content deliberately. No commit, push or remote workflow activation is part of this
handoff. Current synchronization evidence belongs in promotion-manifest.json.

## Decisions and evidence tiers

Confirmed: owner prefers ChatGPT/Codex, has limited Copilot capacity and available
Actions capacity, requested public sharing safety, and authorized local v2 routing.
Confirmed local implementation: read-only CLI, strict identity and schema checks,
synthetic profile, workflow template and offline regression tests.
Analytical: broad coverage matrix is useful for the declared solo-owner scope.
Proposed: install and activate the adapter in a separately selected repository.
Unknown: live helper/Actions operation, administrative endpoint visibility under
GITHUB_TOKEN, delivered notifications and unseen-holdout task quality.

The helper is one module with audit/compare/verify/profile-validation subcommands
so transport and validation rules have one implementation. The template uses no AI
service. Credentials are runtime inputs and never part of the package. Account URLs
are omitted even from attribution at the owner's explicit request, overriding the
standard branding-link convention. Vendor documentation links remain.

## Resume safely

Read validation.json, final-inventory.json, refinements.md, equilibrium-review.json,
graduation.md and promotion-manifest.json before relying on readiness. If any package
hash changes, re-run affected tests and reopen review. Regenerate catalogs with
repository-declared tools; do not hand-edit generated skill entries.

The next operational action is to prepare a repository-bound installation diff:
inspect target instructions/status, copy the reviewed package only into the chosen
location, bind profile values and verify action pins. Preserve existing scripts and
credentials. A local template is not a deployed or scheduled workflow. Do not enable
new permissions solely to eliminate unknowns, and do not enroll a PR in auto-merge
before optional review is finished.

Tests and limits: see validation.json. No hosted run, AI benchmark, protected holdout
or full Skillz regression-suite result is claimed. Package-sharing checks do not
sanitize future runtime reports; review those separately before exposing them.

## Concurrent checkout observation

During v2 work, the previously staged Skillz candidate became commit `7b269c2`
on the same branch, and the checkout became clean. This session did not make
that commit. The seven predecessor package hashes still match baseline.json;
preserve the commit and apply only the reviewed v2 update over it.

## Final status

V2 local routing is complete. Final catalog build and metadata checks passed.
Read attribution-review-addendum.json alongside the original final review: it
accepts the final metadata-only revision. No remote activation was performed.
