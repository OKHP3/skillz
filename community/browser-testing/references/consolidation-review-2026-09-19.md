# Browser-testing consolidation review — 2026-09-19

Version: **1.0.0**, the first explicit version declared by this package. The existing browser
testing core is retained; four smaller entry points are incorporated through one optional
Playwright adapter. This is an analytical source review, not an agent-performance benchmark.

## Source and license

All source paths below refer to `OKHP3/skillz` at commit
`ff61152eeda6d7985805c9049840964ca781394b`:

| Source package | Useful behavior retained |
|---|---|
| `community/playwright-explore-website` | Required URL, three to five observed flows, interactions/locators/outcomes, test proposals |
| `community/playwright-generate-test` | Required scenario, browser execution before TypeScript `@playwright/test` generation, save/run/diagnose cycle |
| `community/playwright-automation-fill-in-form` | Prepare values and attachments for review; do not infer submission permission from filling permission |
| `community/webapp-testing` | MCP/local Node adapter, reachability checks, console/network/screenshot debugging, responsive testing, unchanged helper |

The core's upstream MIT notice (Arjun Prabhulal) is preserved in `LICENSE`. The incorporated
packages were verified against GitHub's `awesome-copilot` sources; their MIT notice (GitHub,
Inc.) is preserved in `LICENSE.awesome-copilot`. `LICENSE.OKHP3` covers the local adaptations,
not the upstream authorship. See `THIRD-PARTY-NOTICES.md` for immutable source references.
Original metadata and complete working-tree bytes remain in the repository archive at
`docs/archive/skill-redundancy-2026-09-19/browser-refactor/`; its sibling
`browser-refactor-manifest.json` records original paths, hashes, bytes, Git blobs, and modes.
No source authorship has been reassigned.

Pre-change core `SKILL.md` working-byte SHA256:
`a413e75bf08ff9caee1f3c93ebd918388a6db1bfc9ad3a345b10af8e91cd0cf5`.

## Decisions and evidence limits

- The destination already covers selectors, state waits, isolated data, critical journeys,
  diagnosis, and flakiness. The adapter supplies the concrete exploration and generation
  sequence missing from that core.
- Hardcoded form data and upload paths are retained in the raw archive only. Active instructions
  require runtime values. This avoids substituting example data for the user's request.
- Automatic dependency installation and unconditional browser closure are replaced with runtime
  checks and cleanup of task-owned resources. Existing user authorization remains effective.
- The helper is copied unchanged. Its CommonJS and polling limitations are documented.
- New evaluation prompts exercise exploration, observed-first generation, review-only forms,
  missing inputs, unavailable runtimes, and prompt injection. They are **not run** and have no
  measured score. A protected external holdout is still required for a release-performance claim.

Archive-byte checks and package structural checks can establish preservation and valid packaging.
They do not establish that a live browser agent follows the skill better than the predecessors.
