# Review refinements

Candidate-1 is frozen in review-input.json; current candidate-2 inventory is
final-inventory.json. Initial reviewers' 18-test results apply to candidate-1.

- E1/O2/SP1: replace two-account-only scan with a documentation-host allowlist,
  reserved synthetic URL host and Windows/POSIX path checks. New counterexamples
  reject unrelated profile URLs and personal paths. Pattern scanning remains
  bounded evidence rather than an exhaustive secret-detection guarantee.
- E2: local workbench/private data must not be exposed; intentionally approved
  static root publishing is permitted. No runtime deployment authority added.
- O1: correct count-only wording to status-only, matching the existing summary.
- Integration check: PR job now validates the bound profile and exact target with
  validate-profile --repo. Wrong-target fixture rejects it. No secret added to PR.

Current local suite: 19 tests pass. YAML parses; hosted execution not run.

Adversarial transport finding: stdout is now bounded during collection; stderr
is discarded. Oversized/timed-out children are killed and reaped. Offline floods
and timeout tests pass. To keep one honest cross-platform minimum, the helper
requires Python 3.12+ (Windows nonblocking pipes). Current suite: 23 tests passed.

Catalog integration found a mandatory attribution-link baseline conflicting with
the explicit owner request. Candidate adds metadata attribution-links:
"omitted-by-author". Skillz builder recognizes this exact opt-out for only the
two link fields, rejects malformed declarations and retained links, and preserves
all other baseline requirements. Structural and catalog contract tests cover it.
