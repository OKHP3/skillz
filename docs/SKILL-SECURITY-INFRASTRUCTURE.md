# Skill security infrastructure evaluation

Status: proposed architecture, not an activated security control.
Research and repository inspection: September 19, 2026.
Repository baseline: `651da7a1622f41ce8729772f27c83761e436f50e`.

## Recommendation

Keep Skillz Forge on GitHub Pages. Run security analysis in GitHub Actions and publish a small, validated security summary alongside the static catalog. Use Cisco Skill Scanner and NVIDIA SkillSpector as separate engines behind an OKHP3-owned adapter. Add NVIDIA SkillEvaluator for selected quality, overlap, and behavioral evaluations.

Externalize the orchestration, policy, report schema, and regression fixtures when implementation begins. An illustrative repository name is `OKHP3/skill-security-pipeline`; this repository has not been created. Consume pinned upstream engines rather than maintaining source forks initially. Forking is possible, but does not itself provide an update feed or keep a fork current.

Automatically discover upstream changes, test candidate versions, and scan the entire library under new definitions. Promote the new scanner lock through a reviewed change. This separates automatic learning about new risks from silently replacing the code that decides whether contributions may ship.

## Confirmed starting point

| Observation | Evidence | Design implication |
|---|---|---|
| Current distribution is 326 skills in 21 active families. | Read-only cataloger discovery and full structural check; live `data/catalog.json` reports source `651da7a`. | Use a generated inventory, never a fixed count or hand-maintained family list. |
| Pages deploys `artifacts/forge/dist/public`. | `.github/workflows/deploy-pages.yml`. | Scanner execution belongs in Actions; browsers only read generated files. |
| The Forge catalog already records source provenance. | `artifacts/forge/scripts/build-catalog.js`. | Bind security evidence to that source and complete package content. |
| Maturity and evidence are separate concepts. | `artifacts/forge/src/types/catalog.ts`, `docs/PUBLISHING.md`. | Security becomes another explicit field; a clean scan must not promote maturity or claim task effectiveness. |
| Current deployment filters include `SKILL.md` and `FAMILY.md`, but do not generally cover every supporting file in every skill package. | `.github/workflows/deploy-pages.yml`. | A script-only or reference-only change must still trigger security assessment and invalidate affected evidence. |
| There is no current catalog-wide integration with these scanners. | Workflows, catalog schema, security policy, and supporting scripts inspected. | Existing structural checks are retained and supplemented. |
| GitHub returned classic branch protection 404, no effective branch rules, and no repository rulesets for this repository. | Read-only API checks on the inspection date. | Required security checks must be configured for admission enforcement; adding a workflow alone does not prevent merging. Settings were not changed. |

The open browser initially held older catalog data; refreshing showed the current family inventory. The checked-in generated catalog also carries an older build provenance value. Neither is a substitute for inspecting the exact source revision and the newly built publication artifact.

The local AskJamie Concierge implementation provides a useful existing pattern: a pinned Cisco adapter rejects unexpected scanner identity and incomplete reports, with a scheduled re-audit. Its source was read for comparison only. Skillz needs stronger inventory coverage, dual-engine evidence, and explicit definition-update handling; that implementation should not be copied blindly.

## Tool assessment

Release identifiers below are observations, not claims that these versions have passed a Skillz pilot.

| Tool | Current observed release | Proposed role | Integration considerations |
|---|---|---|---|
| [Cisco Skill Scanner](https://github.com/cisco-ai-defense/skill-scanner) | [2.1.0](https://github.com/cisco-ai-defense/skill-scanner/releases/tag/2.1.0) | Primary package-security engine with local detectors; optional semantic checks later. | Apache-2.0. CLI/JSON/SARIF fit Actions. Its supplied reusable workflow installs the scanner without an exact package pin. Collection scans may skip packages without a failing exit code. Own the installation lock and completeness adapter. |
| [NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector) | [v2.11.2](https://github.com/NVIDIA/SkillSpector/releases/tag/v2.11.2) | Second package-security engine with independently retained findings. | Apache-2.0. Use explicit package inputs and `--no-llm --fail-on-incomplete`. Collection discovery is bounded; do not assume one recursive invocation covers this library. Static mode can query OSV, so it is not inherently network-free. |
| [NVIDIA SkillEvaluator](https://docs.nvidia.com/skills/skillevaluator) | [v0.3.0](https://github.com/NVIDIA/SkillEvaluator/releases/tag/v0.3.0) | Structural/quality checks, semantic overlap, then selected with-skill versus without-skill trials. | Apache-2.0; documented experimental support. Full security coverage needs additional tools, including SkillSpector. Embedding/model-backed and live-agent tiers have provider, sandbox, and resource requirements. |

SkillEvaluator integrates SkillSpector. Running both does not create a third independent security opinion. Keep security results and measured usefulness separate. None of these tools establishes that every possible threat has been excluded.

Use separate pinned environments or container images for the two scanner engines. Validate their runtime requirements independently of Skillz's existing Node and Python pins. Scanner installation and image construction occur outside the untrusted-skill analysis container. Pin dependency hashes or immutable image digests as well as the top-level version.

The observed release commits are Cisco `a24df340ca6056a6446a239f4a7b114b11c6073a`, SkillSpector `69dcdfb74487d361ba4c811d088cfdea2ff3a9dc`, and SkillEvaluator `ac0a04905100acdafc6c95829311a9739c340ff6`. Resolve artifacts and verify provenance during the pilot; a package-publishing workflow commit is not necessarily its engine source commit.

### Findings that affect implementation

- Cisco's JSON must be checked for `analyzers_used`, `analyzers_failed`, and collection `skills_skipped`, alongside expected package identities. Its default local detectors and optional behavioral analysis need explicit configuration; network and model-backed analyzers remain separate. See the [released model](https://github.com/cisco-ai-defense/skill-scanner/blob/a24df340ca6056a6446a239f4a7b114b11c6073a/skill_scanner/core/models.py) and [analyzer factory](https://github.com/cisco-ai-defense/skill-scanner/blob/a24df340ca6056a6446a239f4a7b114b11c6073a/skill_scanner/core/analyzer_factory.py).
- SkillSpector's released recursive collection mode considers immediate child skills and caps the collection at 32. Its JSON exposes `execution_successful`, `analysis_completeness`, and `issues`. Exit 1 can indicate a risk-score threshold or incomplete analysis, while exit 2 indicates operational/input failure. Normalize the report rather than translating exit zero into clean. See the [released CLI](https://github.com/NVIDIA/SkillSpector/blob/69dcdfb74487d361ba4c811d088cfdea2ff3a9dc/src/skillspector/cli.py) and [report serializer](https://github.com/NVIDIA/SkillSpector/blob/69dcdfb74487d361ba4c811d088cfdea2ff3a9dc/src/skillspector/nodes/report.py).
- SkillEvaluator's selected Tier 1 checks can be keyless with deduplication disabled. Complete security coverage also needs external scanners such as Semgrep and Gitleaks. Its default attribution, naming, and placement conventions differ from Skillz; start quality/schema checks advisory and map policy explicitly rather than renaming legitimate packages to satisfy another catalog's defaults. Its security adapter does not expose all SkillSpector custom-rule options. See [Tier 1](https://github.com/NVIDIA/SkillEvaluator/blob/ac0a04905100acdafc6c95829311a9739c340ff6/docs/tier1-validation.mdx) and the [security adapter](https://github.com/NVIDIA/SkillEvaluator/blob/ac0a04905100acdafc6c95829311a9739c340ff6/src/skillevaluator/validators/security.py).
- Tier 2 similarity is a screening aid: full-body mode includes `SKILL.md`, not every supporting file. It must not automatically retire a skill whose scripts or resources are unique. Tier 3 paired trials need an agent harness, credentials and sandbox; a Tier 1 pass is not a live benchmark. See [deduplication](https://github.com/NVIDIA/SkillEvaluator/blob/ac0a04905100acdafc6c95829311a9739c340ff6/docs/tier2-deduplication.mdx) and [live evaluation](https://github.com/NVIDIA/SkillEvaluator/blob/ac0a04905100acdafc6c95829311a9739c340ff6/docs/tier3-live-evaluation.mdx).

## External integration versus source forks

| Approach | Assessment |
|---|---|
| Thin external reusable workflow and adapters, consuming pinned official engines | Recommended. Centralizes operating policy and update tests while following upstream releases. Skillz controls its adopted revision. Other OKHP3 catalogs can reuse the same contract later. |
| Separate local rule overlays | Useful where an engine supports them. Version these with the adapter and validate their provenance and compatibility. A rule pack can contain executable behavior and belongs to the trusted control layer. |
| Maintained forks of one or both engines | Reserve for an essential patch or detector extension unsupported upstream. Requires license/notice preservation, upstream synchronization, conflict handling, regression tests, and a named maintenance owner. Prefer upstream contributions and a small patch set. |
| Follow an upstream branch or install an unconstrained latest package during every admission scan | Reject as the production baseline. Results become difficult to reproduce and an upstream change can alter admission behavior without a reviewable Skillz change. |

Initially develop the adapter contract and tests in a contained implementation branch. Extract it into the external repository once a pilot proves the interfaces. The external workflow should be pinned by a full commit SHA and its engines by a lock file or image digest. A pinned workflow whose installation step fetches an unpinned engine is insufficient.

For local extensions, Cisco supports reviewed schema-v2 signature/YARA/CEL packs through `--trusted-rule-pack` and a rule validation command. Its `--custom-rules` option replaces the principal YARA directory, so it should not be mistaken for an additive overlay. SkillSpector supports extra YARA rules and reviewed finding baselines; broader detector changes require upstream code changes. Neither interface establishes a universal remotely updating risk-definition feed. See [Cisco rule loading](https://github.com/cisco-ai-defense/skill-scanner/blob/a24df340ca6056a6446a239f4a7b114b11c6073a/skill_scanner/core/rule_registry.py), [Cisco static analyzer](https://github.com/cisco-ai-defense/skill-scanner/blob/a24df340ca6056a6446a239f4a7b114b11c6073a/skill_scanner/core/analyzers/static.py), and [SkillSpector development guidance](https://github.com/NVIDIA/SkillSpector/blob/69dcdfb74487d361ba4c811d088cfdea2ff3a9dc/docs/DEVELOPMENT.md).

## Execution and publication boundaries

| Stage | Executes where | Output and authority |
|---|---|---|
| Discover and hash packages | Trusted Actions controller | Exact source revision, package inventory, dependencies, and content digests. |
| Analyze candidate package bytes | Restricted, disposable scanner jobs | Separate raw findings and completion evidence from each engine. No authority to modify skills or publish. |
| Validate and decide | Trusted aggregator | Schema-checked normalized results and admission decision under a versioned policy. |
| Build public summaries | Trusted main-branch publication job | Redacted static JSON containing evidence provenance and freshness. |
| Display evidence | Existing GitHub Pages SPA | Read-only status in Explore, Detail, Compare, and a collection summary. No scanner executable, API secret, or backend is required in the SPA. |

The current Pages job must explicitly depend on the accepted security decision for the same source revision. A separate scanner workflow running at the same time does not gate deployment. Prefer a reusable security job in the publication dependency graph, with artifact identity checked before build and deployment.

Use a distinct, tightly scoped publication path for scheduled security-status refreshes. A newly discovered concern about an already published skill must become visible; merely failing the next deploy would leave an old reassuring result on the live site. The status-refresh job can publish a warning or stale state without granting a new skill admission. Serialize it with normal Pages deployments and reject results for superseded source revisions.

GitHub continues to host repository files independently of the SPA. A catalog warning or disabled install button cannot revoke copies already downloaded or make Git history inaccessible.

## Complete inventory and change detection

The cataloger remains the authority for documentation indexing, and the Forge builder for public catalog membership. The security controller should obtain a read-only inventory from the same discovery rules and reconcile it against both the intended catalog and the manifest. A mismatch, malformed skill, duplicate identity, or unexplained missing package is a failed coverage check, not a smaller successful scan.

For every active skill, scan its entire package: instructions, scripts, references, assets, examples, and fixtures. Maintain a separate coverage record for unsupported file types, binaries, nested archives, truncation, and resource limits. Detect symlinks, submodules, path escapes, and ambiguous ownership before passing inputs to engines.

Unexplained coverage gaps hold admission. A reviewed exclusion or unsupported-content exception must remain visible, be tied to the exact content, and prevent a claim of complete file coverage. No timeout, unreadable file, or exceeded resource limit silently becomes an exclusion.

Do not recursively scan the entire repository and assume the resulting count is the distribution count. Archives, `.agents/skills`, export mirrors, dependency directories, and application code have different roles. Scan support skills and infrastructure in separately labelled jobs; keep ordinary dependency/secret/code scanning as additional controls. Archives stay outside active distribution admission, without being exempted from repository-wide secret and malware hygiene.

Map any changed file to its containing skill, using the union of base and proposed inventories so renames and deletions are accounted for. A new family must be discovered automatically. Shared referenced files, such as brand profiles, invalidate every dependent package; when dependency ownership is uncertain, scan the full distribution. Record external dependencies as unresolved or separately verified rather than claiming that repository scanning reviewed arbitrary remote content.

For an initial 326-skill baseline, prefer a full scan before every publication. Optimize pull-request scans to changed packages only after completeness and runtime evidence justify caching. An unchanged package result is reusable only when its complete content, shared dependencies, scanner definitions, policy, and freshness requirements still match.

## Trigger policy

| Event | Recommended evaluation |
|---|---|
| Pull request adds or changes a skill, including any supporting file | Both approved static scanners on affected packages; structural checks; explicit coverage reconciliation. |
| Pull request changes family/inventory rules, common dependencies, scanner configuration, policy, or exceptions | Full distribution scan. |
| Main-branch publication | Full approved-baseline scan initially, bound to the exact build source. |
| New upstream engine release or changed detector/rule bundle | Candidate full-library scan plus adapter regression fixtures; compare with approved results. |
| Adoption of a new scanner/rule/policy fingerprint | Full distribution scan before results become the active baseline. |
| Scheduled re-audit | Weekly full scan using the approved baseline, including explicitly configured vulnerability intelligence refresh. |
| Manual incident response | Full or scoped scan from an explicit revision; retain the incident and coverage record. |

Start the required PR workflow for every PR and make a trusted planning job decide its scope. Avoid narrow path filters that miss supporting files or leave required checks pending. A no-impact result must explicitly report why there was nothing to scan. If a merge queue is introduced, support its `merge_group` event too.

## How definitions evolve

Define a security fingerprint covering engine source/version, dependency or image digest, bundled detector data, custom rules, analyzer selection, thresholds, parser/normalizer version, exception policy, and optional model/prompt configuration. Record the identity and retrieval time of mutable intelligence such as OSV separately. Do not equate a model alias with a stable model version.

The proposed daily update watcher resolves official releases to immutable identities, inspects security-relevant changes, and opens or refreshes one update proposal per engine. New definitions run in a candidate lane against all active skills even while the previous reviewed version remains the required baseline. Unreleased upstream rule changes can be tracked in a separately labelled canary lane; they are not silently presented as a stable release.

Treat candidate engine code and its dependency build steps as unreviewed executable input. Run them on separate disposable workers without watcher write/dispatch credentials, model keys, or publication credentials. A small trusted controller alone opens proposals or publishes validated summaries. Candidate output cannot supply shell commands, workflow paths, or authority to change policy.

Any security-relevant fingerprint change triggers the full scan. A patch release can add a decisive risk rule, so a semantic-version major bump is not the right trigger. If a change cannot confidently be classified as documentation-only, treat it as requiring a rescan.

Promotion requires successful installation, adapter schema/completeness tests, known-malicious and difficult-benign fixtures, a reviewed findings delta, and a recorded owner decision. Automatic promotion of narrowly defined compatible updates could be added later under a written policy. Major runtime/schema changes, disabled detectors, expanded network access, weaker thresholds, and new exceptions require explicit review.

Do not assume upstream releases directly trigger workflows in Skillz. Use scheduled polling; an owned integration repository can optionally send authenticated dispatch events. The watcher should run candidate evaluation itself or dispatch it explicitly: automation-created PRs do not necessarily start CI unattended. GitHub currently documents approval-required runs for certain `GITHUB_TOKEN`-created PR events.

Schedules can be delayed, dropped, or disabled after inactivity. Record the last successful watch and re-audit, show stale evidence when overdue, and reuse the existing publish-health concept to detect a stalled security pipeline. An alert is deduplicated by incident/fingerprint; unchanged failures should not create an issue flood.

## Report and decision contract

Each result needs: schema version; repository and full source SHA; skill path/name and complete package digest; dependency digest; scanner identity and immutable version; definition fingerprint; policy version; requested/completed/failed analyzers; expected/scanned/skipped file coverage; start/completion timestamps; findings with engine/rule/severity/fingerprint; errors and limits; intelligence coverage; exceptions; and the producing workflow/run identity.

Reject missing, stale, truncated, malformed, mismatched, or incomplete reports. Zero findings and a successful process exit are insufficient. The normalized per-skill states should distinguish:

- `not-scanned`: no qualifying attempt.
- `incomplete`: an expected analyzer, package, or supported file was not successfully assessed.
- `findings`: completed checks reported concerns requiring disposition.
- `no-findings`: all required checks completed, no relevant finding was reported by any required engine, and no exception or suppression was applied.
- `accepted-with-exceptions`: scoped, recorded findings remain with an approved disposition.
- `stale`: prior evidence no longer matches current content, definitions, or freshness policy.

Show separate results from each engine. Do not average severity or allow one clean report to cancel the other engine's finding. High/critical findings should hold admission pending correction or a documented exception; tune lower-severity treatment during the pilot. Exceptions require an owner, reason, narrow finding/content scope, expiry, and revalidation when the relevant content or rule changes. Do not automatically suppress findings just because the baseline contains many of them.

Apply exceptions in the trusted aggregation layer where possible and retain the original findings. An engine-side baseline or suppression must be reported explicitly; it must never convert accepted findings into `no-findings`.

Skillz includes red-teaming instructions and legitimate examples of dangerous patterns. These require contextual review and deliberately difficult benign fixtures. Excluding an entire family or every example folder would hide the content users actually install.

Keep security status separate from structural validity, skill maturity, duplication, and measured usefulness. Public wording should say which checks completed and when, rather than claim a skill is certified safe. A selected SkillEvaluator live evaluation only applies to its recorded model, harness, task set, and package version.

## Contributor and credential boundaries

Analyze fork submissions as untrusted data. The controller, scanner lock, policies, and report validator come from a reviewed base revision or pinned integration release, not from the submission being evaluated. Never execute submitted skill scripts or install their dependencies as part of the static admission scan. Do not grant PR scans deployment credentials, model secrets, or repository write authority.

Use disposable GitHub-hosted workers with bounded CPU, memory, output, file counts, archive expansion, and execution time. Deny network access during package analysis where practical; separate OSV enrichment into an explicit controlled step, and report offline fallback coverage honestly. For a tool without an offline flag, validate behavior under the enforced network boundary in the pilot.

Avoid a privileged `pull_request_target` job that checks out or executes contributor code. Treat reports and logs as hostile input too: validate JSON, escape displayed text, enforce path bounds, and redact suspected secrets before any public output. Never trust a report committed by a contributor as scanner evidence.

Capture raw scanner stdout, stderr, and reports into temporary worker files rather than echoing them into public Actions logs. By default, destroy unsanitized evidence with the worker and upload only validated, redacted reports. Public repository Actions artifacts are not a private evidence vault. If an investigation needs retained raw material, use an explicitly approved private destination with named access and a deletion deadline; a proposed initial maximum retention is 14 days. Redaction failure blocks upload, not the recording of an incomplete assessment.

Optional LLM analysis and SkillEvaluator live-agent trials run separately after explicit eligibility review, with isolated synthetic resources and limited credentials. They are not default jobs on arbitrary fork PRs. Configure the security status check as required, protect changes to the control layer, and keep the solo-owner workflow workable without inventing a second-human approval requirement.

## Concrete implementation scope

Proposed integration components:

- An immutable scanner lock and versioned policy, plus safe exception records.
- Inventory and digest generation, Cisco/NVIDIA adapters, report validation, and aggregation.
- A reusable scan workflow, upstream-update watcher, full re-audit workflow, and bounded fixture suite.
- A redacted public report builder producing `data/security/index.json` and per-skill detail files.

Skillz integration points:

- Add always-started PR security checks and required-check configuration.
- Add the security job dependency to `.github/workflows/deploy-pages.yml`; extend supporting-file and policy triggers and their regression tests.
- Join security evidence in `artifacts/forge/scripts/build-catalog.js` only after source/digest validation, and extend `artifacts/forge/src/types/catalog.ts` with a separate security contract.
- Add evidence/freshness display to Explore, Detail, Compare, and collection status, with explicit error and unknown states.
- Pin install/download links or downloadable package manifests to the assessed revision so a displayed verdict does not accompany different bytes fetched from mutable `main`.
- Update security, contribution, publishing, and maintenance documentation. Reuse Review Desk for human disposition where appropriate, while keeping its service and credentials outside the public Pages artifact.

A prototype must prove: script-only changes invalidate results; new families cannot be skipped; renames/deletions reconcile; omitted skills fail coverage; incomplete analyzer output never becomes clean; changed definitions force a full scan; malicious findings from either engine remain visible; scoped exceptions expire; fork jobs receive no privileged credentials; PR edits cannot replace the trusted policy; stale/wrong-source reports are rejected; failed re-audits update public status without admitting new content; and only static, redacted assets reach Pages.

## Phased adoption and remaining unknowns

1. Build an isolated pilot using pinned released engines. Sample documentation-only, script-bearing, imported, multilingual, and red-teaming skills plus synthetic negative controls. Measure run time, coverage, and false positives; verify network behavior and every exit/report contract.
2. Run the full current distribution in report-only mode and review the baseline. Establish thresholds and narrow exceptions from evidence. This is not blanket acceptance of existing findings.
3. Make completed security assessment a required admission and publication check. Publish accurate static status and freshness information.
4. Enable the update watcher and weekly re-audit, proving a changed definition triggers full reevaluation and an actionable public-status refresh.
5. Add SkillEvaluator overlap and selected paired behavioral tests. Measure usefulness before changing promotion decisions or removing skills on an automated score.

Unverified: runtime and cost for this collection, detector accuracy on its multilingual and red-teaming content, current release compatibility under the chosen runner, and practical effectiveness of the combined engines. No scanner was installed or executed for this evaluation, and no workflow, repository setting, fork, secret, or deployed site was changed. The read-only catalog structural check passed; that result is not a vulnerability scan.

Recommended next action: implement and validate the isolated pilot and report contract, then decide promotion policy from its measured results.

## Source ledger

All sources retrieved September 19, 2026. Vendor repositories and documentation establish their own product interfaces; GitHub documentation establishes platform behavior. Scanner superiority is not inferred from vendor claims.

| Source / publisher | Supports |
|---|---|
| [Skill Scanner release 2.1.0, Cisco](https://github.com/cisco-ai-defense/skill-scanner/tree/2.1.0), including CLI, models, and reusable scan workflow | Released scanner capabilities, installation and report limitations. Main may differ from the release. |
| [SkillSpector release v2.11.2, NVIDIA](https://github.com/NVIDIA/SkillSpector/tree/v2.11.2), including CLI and OSV client | Per-skill scanning, completeness controls, bounded collection behavior, and network enrichment. |
| [SkillEvaluator documentation, NVIDIA](https://docs.nvidia.com/skills/skillevaluator) and [v0.3.0 source](https://github.com/NVIDIA/SkillEvaluator/tree/v0.3.0) | Tier separation, SkillSpector integration, resource requirements, experimental support. |
| [What is GitHub Pages?, GitHub](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) | Static hosting boundary. |
| [Events that trigger workflows, GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows) | PR, fork, dispatch and schedule behavior. |
| [Triggering a workflow, GitHub](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow) | Automation token recursion and approval constraints. |
| [Secure use reference, GitHub](https://docs.github.com/en/actions/reference/security/secure-use) | Immutable action pins, untrusted inputs and privileged trigger boundaries. |

## Claim and uncertainty register

| Claim | Tier | Evidence | Consequence if false | Next check |
|---|---|---|---|---|
| Security scanning can coexist with the current static SPA. | Confirmed architecture capability | Current Pages build boundary; GitHub Pages and Actions documentation. | A runtime service might become necessary. | Pilot static report consumption and deployment. |
| Both security engines can be used without LLM credentials. | Confirmed interface capability | Released vendor CLI/source. | Fork admission could require secrets. | Execute the credential-free pilot; verify network and completeness separately. |
| Combining engines improves practical coverage for Skillz. | Unknown | No comparative Skillz run performed. | Extra complexity may add little detection value or excessive noise. | Labelled fixture and real-package comparison. |
| A controlled external adapter is preferable to source forks. | Proposal | Reviewed integration surfaces and maintenance tradeoffs. | An unsupported requirement could force a fork. | Implement pilot adapters and identify necessary upstream changes. |
| Definition changes should trigger full scans independent of version-major labels. | Proposal | Rules and detector code can change at any release level. | Important new risks could go unevaluated. | Simulate rule, detector, policy, and dependency fingerprint changes. |
| No mandatory security admission check is currently configured. | Confirmed at inspection | GitHub protection/rules API responses described above. | The implementation plan could misstate existing protections. | Verify required-check settings during implementation acceptance. |
