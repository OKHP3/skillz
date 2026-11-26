# Security integration checkpoint

The initial PR head `e14a0b5eb11d97f4ffde37b537d06fa5b4b91b63` triggered
[Skillz Shield run 39766022405](https://github.com/OKHP3/skillz/actions/runs/39766022405).
The scan and separate review-policy jobs failed. Neither result is a pass.

Cisco 2.3.1 reported no findings with complete coverage. NVIDIA SkillSpector
2.13.0 reported two high rule categories, AE1 and MP3, and three medium rule
categories, AS3, AST4, and LP3. Coverage was incomplete: 22 of 23 components
fully inspected, with two reference-resolution exceptions and one static parse
limit. The report did not locate that parse-limit exception.

The reference diagnostics point to the quoted/backticked version at SKILL.md
lines 17 and 190. Those version strings have been normalized to the Foundry's
documented plain SemVer form without changing the version or behavior. This is
a reproducible format correction, not a scan exclusion. A subsequent run must
establish whether those two coverage exceptions are resolved.

Located high findings require contextual review:

- AE1 points to SKILL.md lines 116 and 185, where the package names its exact
  local validator and planner. Code inspection and executed tests show these
  helpers read local files, return reports, and do not translate or publish.
- MP3 points to line 32 of the historical
  `benchmarks/equilibrium-review-2026-08-30-v1.json`, an evidence-review record.
  The recorded role description is historical data, not an agent instruction
  to change its own authority. It remains preserved for review.
- AST4 points to temporary-fixture tests that invoke the exact packaged Python
  helpers through explicit argument arrays. No shell or external executable is
  selected by source page text.

These observations are an agent assessment, not an owner approval or a complete
vendor scan. The original evidence remains intact. No finding is suppressed,
no scanner/workflow gate is weakened, and no review approval is inserted into
the PR. Repository policy reads exact owner dispositions only from the PR base
commit, and other incomplete-analysis reasons remain failures. No required
branch check is currently configured, but that fact does not turn these failed
checks into acceptance evidence for this closeout.

## Local validation correction

A catalog test run overlapped a later generation and observed different source
revisions in its cached catalog and the newly written summary: 50 passed and
one sourceCommit-consistency assertion failed. The earlier baseline run passed
all 51 assertions. The failed overlapping run is retained as failure evidence.
Generation has now finished, and the full suite is rerun sequentially against
one frozen catalog. The test was not weakened.

The final local receipt beside preserved scanner artifacts records subsequent
CI, integration, and cleanup outcomes. Do not infer a merge or COMPLETE status
from this checkpoint.
