# V2 development and public-safety record

Owner requested version 2 with graduation, equilibrium review, handoff, polishing
and local Skillz routing. Subsequent instruction excludes account/profile URLs
and tokens. This explicitly overrides the standard linked attribution convention;
author and license text remain, without account links.

Source: the isolated settings-skill worktree, branch codex/solo-ai-repo-settings.
Distribution: branch codex/repo-settings-skill, universal/okhp3-repo-settings.
Previous candidate was 0.1.0, never released. Owner calls this iteration v2;
metadata is 2.0.0, not an assertion that a public v1 release exists.

Baseline inventory is in baseline.json. Both destination copies matched those
seven files before v2 replacement. The Skillz index already contained the previous
candidate at this turn's start; preserve the index and all unrelated work.

Hypothesis: deterministic read-only scalars plus explicit manual coverage reduce
repeated reasoning and Copilot usage. No measured token savings or skill uplift
is claimed. Three commands plus a profile validator share a single Python module
rather than three duplicated transport implementations. Add a dormant Actions
adapter; do not activate remote jobs or provision credentials during skill routing.

Rejected: every-practice certification, automatic repair, AI-powered scheduled
reviews, copying owner account URLs, and treating historical settings receipts as
v2 runtime results. Coverage matrix and failure cases define the actual scope.
Prior analytical review files in docs/repo-settings-review remain historical.

Development checks: Python fixtures, CLI subprocess cases, YAML parsing, source
link review, public-package pattern scan and structural validation. Independent
review will decide local candidate readiness. Live hosted execution and unseen
holdout remain separate evidence gaps.

## Concurrent checkout observation

During v2 work, the previously staged Skillz candidate became commit `7b269c2`
on the same branch, and the checkout became clean. This session did not make
that commit. The seven predecessor package hashes still match baseline.json;
preserve the commit and apply only the reviewed v2 update over it.
