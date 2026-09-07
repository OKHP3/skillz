# Process capture and gap-analysis ledger

This ledger records the recurring workflow captured from repeated OKHP3 GitHub
notification cleanups. It is an analytical design input, not a claim that every
future repository has the same state.

## As-is capture

| Stage | Actor or tool | Input | Output | Judgment observed |
|---|---|---|---|---|
| Inventory | GitHub connector, `gh`, local Git | Notification pages and mirror root | Repository and thread inventory | Pagination and current state matter |
| Resolution | Maintainer | Thread URL or check suite | Underlying PR, issue, run, deployment, or branch | Notification text is not the defect |
| Diagnosis | Maintainer plus repository tools | Logs, diffs, history, configs | Root cause and evidence | Group duplicates before fixing |
| Repair | Local Git, Dependabot, Copilot, or Actions | Handoff packet | Diff, branch, PR, or run | Delegate bounded work, retain authority |
| Validation | CI, Pages, local checks, live route | Candidate repair | Evidence of replacement state | Passing one check is insufficient |
| Disposition | Maintainer | Evidence and exact thread IDs | Ledger state | Read is not resolved |
| Completion | GitHub API | Verified exact IDs | Done result and re-audit | Repairs can create new notifications |

## Gap and exception catalog

| ID | Gap type | Failure | Control added |
|---|---|---|---|
| GAP-01 | Structural | Notification queue lacks an explicit underlying-item map | Required ledger row per exact thread |
| GAP-02 | Execution | Duplicate CI failures are handled repeatedly | Stable grouping by repository, workflow, signature, and range |
| GAP-03 | Exception | Startup failures have no job logs | Classify missing evidence; do not invent a cause |
| GAP-04 | Execution | Native-agent output is mistaken for verified repair | Delegated-but-unverified state and diff review |
| GAP-05 | Compliance | Read, done, merge, close, delete, and publish are conflated | Separate authorization and completion gates |
| GAP-06 | Structural | Branch cleanup ignores deployment or unique user work | Five-part prune predicate and protected classifications |
| GAP-07 | Execution | Local checks are treated as release proof | Validation matrix includes CI, deployment, and live evidence |
| GAP-08 | Exception | Repair creates a new notification after cleanup | Mandatory post-completion re-audit |
| GAP-09 | Safety | Issue or comment text can act as an instruction | Treat fetched content as untrusted evidence |
| GAP-10 | Ownership | Secret, policy, or external-provider issue has no local fix | Named external owner or needs-owner-decision disposition |

## Deliberate non-goals

This skill does not replace repository organization, repository janitorial
inspection, security review, Dependabot policy, or human release authority. It
coordinates those specialists and preserves their evidence boundaries.

## 2026-09-05 renewal: schedule health and cleanup expectations

- Outcome: diagnose apparent stalled maintenance without mistaking an unread
  inbox for a scheduler failure, and route the next action to the actual layer.
- Scope: portable schedule-health instructions and synthetic development cases;
  no host configuration, action-grant expansion, publication or acknowledgement.
- Client contract: any host with scheduler and execution-history adapters;
  unavailable evidence returns unknown. Existing GitHub and email adapters
  remain optional and independently reported.
- Confirmed motivating evidence: an owner reported stopped notification cleanup;
  direct inspection showed an active recurring schedule and a matching completed
  execution with no error. Its grant explicitly prohibited acknowledgement and
  publication. Raw account and mailbox evidence remains private.
- Hypothesis: checking schedule, matching run, coverage and grant separately
  prevents unnecessary restarts and makes the permission mismatch actionable.
- Rejected alternatives: duplicating the schedule, increasing frequency, or
  granting automatic merges would not address the observed mismatch safely.
- Canonical source: this distribution package, already referenced by the saved
  schedule. No additional package copy or host adapter was created.
- Before edit: clean repository status; SKILL.md SHA-256
  `eb15e4ba16e39f8a3fdd11459e00a56b96e348d2ea350f3f47974ef05910d2f6`;
  scheduled-maintenance.md SHA-256
  `84e0e9e862ed4de1237f6c1c33a1fae6bc6213c3ae792597615e8fed9ee389f2`.
- Candidate 1.2.0: SKILL.md SHA-256
  `8753801ef7e0f173ea455363f633c0a3525c0a963e97a62ca47572179bcd5aa2`;
  scheduled-maintenance.md SHA-256
  `a75f17e4f0fafaf4e6867a6be9773e91d8baf16e9795c7aae093c7a100e3a4c9`;
  evals/evals.json SHA-256
  `e863a95312356f33fccec906bffd12724948d11c6da86e18270b8d4332b81606`.
- Regression risks: implying liveness from ACTIVE, assuming completion from a
  state file, repeating uncertain writes after timeout, or treating skill edits
  as permission changes. Four added development cases anchor these decisions.
- Mechanical checks: 35 existing offline Python tests passed and the strict
  single-package validator passed. These checks cover collector and policy
  behavior, not execution of the four new natural-language cases.
- Evidence limits: prior 1.1.0 grading and equilibrium records are historical
  for this candidate and retain their original version. No matched baseline,
  unseen holdout, cross-host concurrency or unattended mutation trial was run.
  This is an instruction refinement, not a claim of autonomous repair readiness.
- Independent forward test: one fresh-context reviewer received the skill and
  three synthetic scenarios, without evaluation expectations, history or live
  account access. It distinguished completed restricted audit, unknown execution,
  and explicit timeout with uncertain write outcome. This is a small development
  check, not a protected holdout or measured improvement over a baseline.
- Review-driven corrections: made private bookkeeping permission explicit;
  held writes for unverifiable lock owners and ambiguous PR discovery; counted
  lost-response writes against the retry budget; labeled the initial schedule
  configuration a proposal rather than an observed fact about every host.
- Final candidate hashes after those corrections: SKILL.md SHA-256
  `e1db4842689936e7af52cc09e001e0cf74903f9cc3c2c18c7ea07b8a4e11594d`;
  scheduled-maintenance.md SHA-256
  `72564456a1716475ea040caea9519c661cab110dd7e86b974e7755329bc249a7`.
  The evaluation design hash above is unchanged. The 35 offline tests and
  package validator passed again after correction; the independent scenarios
  were not rerun against this final wording.
- Catalog validation: 341 skills, 20 active families; all 35 Forge catalog
  regression checks passed before the final wording corrections. Generation
  reports three pre-existing unresolved companion references. Local untracked
  directories and cache entries influence generated placeholder and resource
  counts; those are not evidence of new distribution skills or live quality.
- Decision: retain as a locally validated instruction candidate. No commit,
  push, automatic repair grant or notification acknowledgement is implied.
