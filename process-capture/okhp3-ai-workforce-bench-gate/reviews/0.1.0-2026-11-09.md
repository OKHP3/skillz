# Equilibrium Review and Foundry Release Record

- Review date: 2026-11-09
- Artifact: `process-capture/okhp3-ai-workforce-bench-gate/SKILL.md` and companion reference/evaluations
- Requested decision: review the new portable skill for bounded publication as source code
- Decision: **approve-with-limits**
- Scope: synthetic examples, evidence-labeled decision support only
- Task ownership: [GitHub issue #235](https://github.com/OKHP3/skillz/issues/235)
- Versions: new skill 0.1.0; Foundry contract inspected at 3.1.1; Equilibrium Review inspected at 1.0.1
- Material source: current conversation and inspected repository contracts, 2026-11-09
- Release evidence status: **analytical**. Structural checks were executed against branch files, but no isolated with/without-skill model benchmark, unseen holdout, installed client test, or fully independent multi-reviewer process was executed.
- Reviewer independence: single connected-model analysis with shared context. Evidence/outcome/safety lenses below are not independent agent reviews.
- Package checks: frontmatter present; name equals directory; concise body under 500 lines; reference present; four visible synthetic development cases; explicit external-required holdout; no BFS-specific examples in public package; no live-performance claim.
- Repository-level validation: **NOT RUN**. GitHub CI results must be reviewed before merge; current connector session cannot execute the repository's local Node/Python verification commands.

## Evidence lens

**Finding:** `approve-with-limits`. The package has a distinctive task contract and field-specific decision rules, not only generic prompting. Repository routing was inspected to avoid copying existing career evidence, process modeling, or Notion capture skills. All research or forecasting claims must remain supported by run-time sources.

## Outcome lens

**Finding:** `approve-with-limits`. A defined input-output contract and fixture cases make the behavior inspectable. No claim of better task performance than a no-skill baseline can yet be made. Deploy only as supervised guidance.

## Safety and portability lens

**Finding:** `approve-with-limits`. No authorized employee/personnel actions, credential fabrication, protected-class inference, public employer data, or hidden external writes. Generic clients must supply their own source access. Metadata and reference paths require CI validation.

## Adversarial objection and test

**Strongest objection:** A polished decision schema can create a false feeling of empirical certainty, and training-path proposals may not be economically or practically viable.

**Falsification test:** Run the published synthetic missing-evidence and adversarial fixtures, and add an unseen independent case with contradictory workforce/career evidence. Require the agent to preserve unknowns, avoid prohibited action, and choose a conditional decision. Inspect whether user outcomes improve over an equal-tool, no-skill baseline. The test has **not run**.

## Adjudication

Task-to-role distinction and P1–P5 decision gate are explicit. The actual ability to preserve or replace a feeder pipeline requires company-specific evidence and an accountable owner; this package makes no staffing decision.

Decision limited to reviewable proposal source. No merge, production readiness, external publication, employer use, or quantitative predictive accuracy is established by this record.

## Follow-up

1. Run repository package/manifest validators and GitHub PR CI.
2. Run isolated model comparison and an external unseen holdout using frozen prompts and graders.
3. Have an independent reviewer check evidence/outcome/safety differences; preserve the objection record.
4. Only after approval, reconcile catalog indexes and promote according to the owning repository's release process.
