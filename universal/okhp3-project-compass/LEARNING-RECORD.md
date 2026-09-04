# Learning record: okhp3-project-compass

Append-only, per okhp3-skill-foundry Phase 8. Each entry is one circuit or
material change. Do not edit or delete a prior entry; add a new one.

---

## Entry 1: Foundry to Equilibrium Review to Foundry circuit, 1.1.0 to 1.2.0

**Pre-change package hash (SKILL.md, 1.1.0):** not recorded; this circuit is
the first time a hash was captured. Recorded going forward.

**Hypothesis:** The package installed at 1.1.0 was internally consistent
because it passed the repository's structural validator
(`validate-skill-suite.cjs`) and its own `validate_compass.py` on synthetic
fixtures. A structural pass does not prove the prose and the code agree with
each other, only that the frontmatter and file layout are well-formed.

**Source or failure evidence that triggered the change:** Jamie asked for the
skill to be run through okhp3-skill-foundry, then okhp3-equilibrium-review,
then okhp3-skill-foundry again, specifically to improve function and add
tooling for consistent behavior, not just to re-check portability.

**Process:**

1. **Foundry pass 1** loaded the live `okhp3-skill-foundry` v3.1.0 from
   `skillz/universal` (materially newer than the cached v2.2.0 this package
   was originally authored against: added adversarial eval requirements,
   holdout protection rules, and non-compensatory safety floors). Rewrote
   `evals/evals.json` to the current schema, added two critical adversarial
   cases (prompt injection in scanned content, a tempting request for blanket
   pre-authorization of future GitHub writes), added `evals/benchmark.json`
   honestly marked `evaluation_status: not-run`, and wrote
   `scripts/selftest.py`, a bundled smoke-test harness that builds synthetic
   fixtures and asserts the other five scripts' documented behavior. Version
   bumped 1.1.0 to 1.2.0 (new capability plus revised evaluation, per
   `references/brand-standard.md`'s versioning table).

2. **Equilibrium Review pass**, `evals/equilibrium-review-1.2.0.json`, ran the
   evidence, outcome, and safety/portability roles against the Agent Skills
   domain adapter's checklist (discovery precision, portability, script
   safety, untrusted input handling, output contract, evaluation design,
   holdout protection). It is recorded as `analytical`, not independent
   release evidence: all three initial roles and the disruptor ran in the same
   session on the same model, which is a correlated-agreement limitation
   stated explicitly in the record's `independence` block. It surfaced four
   claims where documentation and shipped code disagreed:
   - **CLM-01 (high):** `github_sync.py push` never calls the GitHub API in
     this build, even with `--apply --authorized` both set; it only prints
     the commands. SKILL.md, `references/github-mode.md`, and the standalone
     prompt were worded as though authorized push executes the write.
   - **CLM-02 (medium):** `references/file-mode.md` documented RUN-HISTORY.md
     trend columns (objectives, done, in progress, blocked, drift open,
     score) that `compass_state.py`'s writer never actually rendered; only a
     4-column table was appended and the `--counts` argument was captured in
     the JSON run record but discarded for the human-readable file.
   - **CLM-03 (low):** the standalone prompt's V9 rubric row claimed the
     validator checks "nothing pushed on a schedule," which
     `references/quality-rubric.md` correctly does not claim, since a static
     validator cannot observe runtime scheduling behavior.
   - **CLM-04 (medium):** `validate_compass.py`'s V3 check required every
     task to carry its own `objective_id` or `orphan: true`, with no
     exception for a task whose `parent_id` chain reaches an ancestor task
     that does have one. This contradicted `tracking-schema.md`'s own
     hierarchy model and would have failed the validator on exactly the
     nested-subtask structure Mode B is documented to support.
   The disruptor tried to falsify each claim and could not: CLM-01 stands
   because no sentence in the source documents disclosed the plan-only
   behavior; CLM-02 stands because RUN-HISTORY.md is append-only with no
   supported path for the calling agent to add the missing columns later;
   CLM-04 stands because the schema's own stated hierarchy model routinely
   produces the shape the validator was rejecting. Decision:
   `approve-with-limits`, conditioned on fixing all four in the next pass.

3. **Foundry pass 2** applied every fix:
   - Rewrote the push-discipline language in SKILL.md,
     `references/github-mode.md`, `references/mode-detection-and-promotion.md`,
     and the standalone prompt to state plainly that `push` prints commands
     and a human runs them; nothing in the package calls a GitHub-mutating
     endpoint. Applied the same plan-only stance to the standalone prompt's
     own operating rules for parity between the two deliverables, since the
     prompt-only agent has no script-level guardrail and needed an equivalent
     behavioral one.
   - Implemented the documented trend columns: `compass_state.py`'s
     `cmd_init` now writes a 9-column RUN-HISTORY.md header, and
     `cmd_record_run` renders `--counts` into the row, with a blank cell (not
     zero) when a count was not supplied for that run.
   - Loosened `validate_compass.py`'s V3 check to walk a task's `parent_id`
     chain and accept transitive objective inheritance, while still failing a
     genuine orphan with no chain to any objective.
   - Corrected the standalone prompt's V9 rubric row and its "Ten checks"
     header text (it was already showing eleven rows).
   - Converted CLM-02 and CLM-04 into permanent regression cases inside
     `scripts/selftest.py` (`record-run-header-has-nine-columns`,
     `record-run-row-renders-supplied-counts`,
     `record-run-blank-counts-render-as-empty-not-zero`,
     `v3-nested-subtask-inherits-objective-transitively`,
     `v3-still-catches-a-real-orphan`), per Foundry Phase 6's rule that a real
     failure becomes a regression case rather than a one-time fix.

**Affected behavior:** `github_sync.py` behavior is unchanged (it already
refused to write); only its documentation changed, which is the safe direction
of correction. `compass_state.py` and `validate_compass.py` behavior changed
for real: RUN-HISTORY.md now has a wider header and populated trend cells, and
V3 accepts a previously-rejected valid hierarchy shape.

**Expected benefit:** Documentation now matches shipped behavior on the
highest-consequence path (GitHub writes) and on the validator's own
correctness. Mode B's core promise, that the file layer reproduces what
GitHub gives Mode A for free, is now actually met for run history rather than
partially met.

**Regression risk:** Low. The V3 change only widens what passes; it cannot
newly fail a case that passed before (verified by the
`v3-still-catches-a-real-orphan` regression case). The RUN-HISTORY.md header
change is additive to a previously 4-column table; a config that had already
appended old-format rows will have a ragged table until fully rewritten, which
is a cosmetic Markdown-rendering concern, not a data-loss one, since the
underlying JSON run records were never affected.

**Evaluation result:** `scripts/selftest.py` was 35/35 before this pass and is
40/40 after, with the 5 new assertions specifically targeting CLM-02 and
CLM-04. `node validate-skill-suite.cjs --skills-dir universal` reports zero
findings against `okhp3-project-compass`. No live with/without-skill benchmark
exists; `evals/benchmark.json` remains `evaluation_status: not-run` and this
entry does not claim otherwise.

**Decision:** Synchronized the corrected package from the authoring scratch
copy to `skillz/universal/okhp3-project-compass`, file for file, and confirmed
`diff -rq` shows no divergence between the two. Version stays 1.2.0; this
circuit is the release evidence for that version, not a separate bump, since
Foundry pass 1 and pass 2 both landed before any external use of 1.2.0.

**Applicability limits:** This whole circuit is self-review. Equilibrium
Review's own release gate calls for "a fresh live benchmark and unseen holdout
... before making outcome or uplift claims," which this entry does not
provide. Treat this release as structurally and documentarily sound, not as
proven effective at the task it performs.

**Known artifact, not part of this record's scope:** an empty file at
`skillz/universal/.write-test` and a `scripts/__pycache__/` directory under
the installed package are both leftover from this session's inability to
delete files in the mounted workspace folder. Neither affects skill function;
delete them with normal filesystem access when convenient.
