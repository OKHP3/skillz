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
- **Limit:** the legacy profile copy is retained until the project package is
  validated and the active profile path can be archived without losing a
  recoverable copy.
