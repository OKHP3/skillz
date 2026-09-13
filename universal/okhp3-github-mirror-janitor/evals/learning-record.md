# Learning Record

## 2026-08-05 · Migrate and improve the mirror janitor

- **Pre-change source:** the unprefixed profile package at
  `github-mirror-janitor`, including its `SKILL.md`, notification audit
  script, mirror audit script, and OpenAI adapter.
- **Change hypothesis:** a project-local, prefixed package with explicit
  authorization gates, a separate decision rubric, and structural evaluations
  will reduce accidental merges, branch deletion, and notification-state
  confusion while remaining reusable for scheduled audits.
- **Observed source evidence:** the owner requires authored project skills to
  use the `okhp3-` prefix; prior maintenance exposed the important distinction
  between reading notifications and marking exact notification threads done.
- **Material changes:** renamed the package to
  `okhp3-github-mirror-janitor`, added OKHP3 metadata and footer, separated
  audit/reconcile/janitor modes, made notification dispositions explicit,
  added a branch and mutation decision rubric, and added four structural eval
  cases.
- **Staging constraint:** the project catalog requires project-local
  frontmatter to contain only `name` and `description`; license, version, and
  publication metadata remain in the body and evaluation record until a
  separate promotion pass.
- **Rejected alternative:** leave the unprefixed profile copy as the canonical
  authored skill. It conflicts with the project naming and location contract.
- **Evidence status:** analytical structural review only. No new live benchmark,
  isolated with/without-skill run, or unseen release holdout was available.
- **Promotion clarification:** the evaluation design is published with skill
  version `0.1.0`; `1.1.0` is retained only as the legacy source label and is
  not a claim of a live benchmark result.
- **Limit:** the legacy profile copy is retained until the project package is
  validated and the active profile path can be archived without losing a
  recoverable copy.

## 2026-09-12: Finish PR #86 ref-verification correction (0.1.2)

- Baseline: distribution commit `b7e44b125bd9124142c32acfcccfe7aebb9f5a80`.
- Failure evidence: PR #86's review identified that plain `git rev-parse`
  prints an unresolved ref to stdout on failure. The published helper discarded
  its exit status, making that literal look like a known `origin/main` SHA.
- Change: verify the ref as a commit with quiet failure; emit JSON null and
  leave comparison counts unknown when it cannot be resolved. A valid ref
  retains its actual SHA and comparison behavior.
- Regression protocol: three offline temporary-repository cases cover a
  missing ref, a valid commit ref, and a ref pointing to a blob. Run with
  `python -B -m unittest discover -s universal/okhp3-github-mirror-janitor/tests -v`.
- Evidence limit: these are deterministic helper regressions, not independent
  agent-quality benchmarks or unseen holdouts. The four existing structural
  evaluation cases are retained for 0.1.2 without inheriting performance claims.
- Provenance: preserve the original source hashes; refresh destination hashes
  for this distribution correction. Local-source reconciliation remains owned
  by the originating task, as recorded in this promotion task's history.
