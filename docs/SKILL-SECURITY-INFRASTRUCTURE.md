# Skillz Shield security integration

Skillz uses [Skillz Shield](https://github.com/OKHP3/skillz-shield), its separate
security companion, to plan and run Cisco Skill Scanner and NVIDIA SkillSpector checks.
The consumer workflow is `.github/workflows/skill-security.yml`. This integration does not add
skill-quality, maturity, metadata-completeness, or SkillEvaluator gates. It does not change
branch protection or the Pages deployment dependency graph.

The companion repository was renamed from `skill-security-pipeline` to `skillz-shield`.
GitHub Action references must use the new name explicitly; repository web redirects
do not redirect Action calls. The consumer's allowed-action policy must include
`OKHP3/skillz-shield@*`. The repository and its history remain the same, with an
immutable commit pin in each workflow step.

## Scope

Every pull request and push to `main` starts a cheap plan against committed Git trees. The plan
uses the pull request's base commit or the push's previous commit, and the checked-out commit
as its head. Supporting-file changes select their containing package; added, renamed, and
deleted packages are reconciled across both trees. An app-only change selects no packages and
skips vendor resolution, installation, and scanning.

The full inventory includes distribution skills, project-local `.agents/skills` packages, and
`skills` export packages. The count is discovered from the selected revision and recorded in
each plan; it is not fixed in this workflow. Incomplete contracts and markerless draft folders
under a skill family remain eligible.
Family-level review, promotion, evaluation and known context workspaces, README-only migration
locators, archives, application code, dependencies, and tool directories are excluded. A direct
`SKILL.md` identifies an explicit package even when its family-child name is otherwise reserved.
Nested example or fixture contracts belong to their enclosing package.

Only selected committed package bytes are staged for analysis. Submitted scripts are not
executed, and their dependencies are not installed. Unsafe selected paths, symlinks and
submodules are rejected. Unrelated existing package problems do not turn app-only changes into
scans. Deletions are reported without executing historical content.

## Vendor updates and re-audits

The action's orchestration code is pinned to an immutable commit. Existing GitHub Actions
Dependabot updates propose changes to that control-code pin for review. Vendor releases follow
a different policy: each relevant run automatically resolves the latest supported stable
Cisco/NVIDIA release to immutable source, wheel, and dependency hashes, then verifies those
pins during installation. No review is required merely to adopt a supported stable vendor
release. An incompatible release produces an operational failure rather than a fabricated scan.

An hourly schedule at minute 17 checks current vendor identities and plans a full scan. The
cache key combines the vendor and controller-content fingerprint with an ISO week bucket.
Changed vendor identities, changed controller code, or a new week trigger a new full attempt;
the weekly attempt also refreshes live OSV
vulnerability intelligence. Schedules are best-effort, so this is not instant update detection.
Manual workflow runs always request a full scan, even when the attempt marker already exists.

Only a trusted `main` full scan that produced a terminal report may write an
**attempted-not-passed** cache marker. Findings and incomplete reports can create that marker;
their originating run still fails. This prevents the same known result from repeating every
hour. Installation failures, crashes, or missing reports do not create markers. Scheduled cache
hits skip installation and scanning, explicitly report that no new verdict was issued, and do
not convert an earlier finding or incomplete result into a pass. Changed-package PR/push scans
remain uncached. The cache stores only a small marker, never scanner environments or reports.

## Results and access

The reviewed Shield diagnostics revision also exposes bounded coverage reason
counts and analyzer completion states. Unresolved references and parser limits
remain incomplete analysis; these diagnostics do not waive findings or change
the pass criteria. Raw snippets, paths, and arbitrary vendor messages remain
excluded from the uploaded summary.

Both engines must return usable, complete security-analysis evidence for the selected package
set. High or critical findings produce `review-required`; incomplete security analysis produces
`incomplete`. Both make the scan job fail after evidence upload. Missing descriptive metadata
is not a skill-quality admission gate, and a completed scan is not a certification of safety.
No required branch check or automatic publication block is configured by this workflow.

The workflow has `contents: read`, checks out without persisted credentials, and gives the
read-only GitHub token only to vendor resolution. It provides no model credentials or secrets
to scanner subprocesses. The engines use static modes; controlled public network calls such as
OSV enrichment are possible, so this is not an offline sandbox.

Each run uploads only `plan.json`, immutable `pins.json` when resolved, and sanitized
`report.json` when available, retained for 14 days. Raw scanner diagnostics, vendor dependency
directories and installation logs are not uploaded as artifacts. Scanner subprocess output is
captured outside the repository and is not printed into Actions logs. Review findings and
coverage in the Actions summary and report artifact. For a skipped scheduled run, inspect the
preceding full-scan run; the skipped run makes no fresh security claim.

Execution is bounded by a 60-minute job timeout. A timeout or operational failure remains a
failure; no clean verdict is inferred from the absence of a report. No skill execution,
behavioral-quality evaluation, repository-settings mutation, or Pages deployment is performed.
