# Skillz Maturity Reforging PRD

**Status:** Ready for Replit implementation
**Date:** 2026-07-28
**Repository:** `OKHP3/skillz`
**Public surfaces:** `https://overkillhill.com/projects/skillz/` and `https://okhp3.github.io/skillz/`
**Primary implementation surface:** `forge/`

## 1. Decision summary

The current Forge is honest about incompleteness, but its maturity view is too
coarse for the evidence already present in the repository. The next release
should not bulk-promote every skill to `validated`. It should separate three
questions that are currently collapsed into one badge:

1. Is the contract structurally usable?
2. What evidence exists for the current version?
3. Has the skill cleared the release gate for its stated scope?

The first release of this PRD should add evidence-aware catalog fields and
upgrade the 13 skeleton contracts to draftable where their contract gaps are
closed. Skills with evaluation designs or historical benchmarks should display
their evidence without inheriting a maturity claim that the current version has
not earned. Current-version matched runs, safety checks, and an Equilibrium
Review are the gate for `usable`, `validated`, and `published` promotions.

This is the central product decision: make the catalog look more mature by
making its evidence legible, not by relabeling unsupported claims.

## 2. Evidence and method

This audit used:

- The repository `AGENTS.md` routing guide.
- `okhp3-skill-cataloger` 1.6.1 instructions and the Forge catalog builder.
- `okhp3-skill-foundry` 3.1.0, including its recursive renewal and versioned
  evidence rules.
- `okhp3-equilibrium-review` 1.0.0 and its Agent Skill domain adapter.
- A Foundry-brand metadata normalization and structural presentation audit of
  every non-Community distribution package.
- The local generated catalog at `forge/src/data/catalog.json`.
- Git history for each public `SKILL.md`, using the oldest and newest commit
  dates available through `git log --follow`.
- Read-only inspection of both public web surfaces in the requested in-app
  Browser.

The Python cataloger command could not execute in this environment because
`python3`, `python`, and `py` are unavailable. The inventory was independently
cross-checked against the generated catalog, the repository walker used by the
Forge builder, Git history, and the live SPA. Re-run the canonical cataloger
check in CI or a Python-enabled environment before merging generated catalog
changes.

## 3. Current state

The local generated catalog and live Forge data agree on 70 public distribution
skills across 11 active families. The repository filesystem currently contains
one additional untracked public-path candidate,
`universal/okhp3-equilibrium-review/`, which is not in the generated catalog or
the live SPA yet. The OverKill Hill project page still says 68 public skills as
of July 24, 2026. These count surfaces need a separate copy refresh after the
Forge data contract is corrected and the pending package is intentionally
included or excluded.

| Signal | Current result |
|---|---:|
| Public distribution skills | 70 |
| Additional untracked public-path candidate | 1 |
| Active families | 11 |
| Placeholder family directories | 2 |
| Project-local support skills under `.agents/skills/` | 19 |
| Current `draftable` cards | 57 |
| Current `skeleton` cards | 13 |
| Public skills with a declared version | 60 |
| Public skills missing a declared version | 10 |
| Packages with `evals/` | 25 |
| Packages with `benchmarks/` | 8 |
| Packages with tests or evaluation workspaces | 18 |
| Packages with references | 50 |
| Packages with scripts | 37 |

The additional candidate is byte-identical to the project-local
`.agents/skills/okhp3-equilibrium-review/SKILL.md` copy at the time of this
audit, with SHA-256
`24aad5cce75ca4b41e60b556b7903e4f1d0e384e0f1755ad81e5b7a9014b6ffe`. It has no
tracked creation or update date yet. Replit must not show it as a public Forge
skill until the repository owner decides whether to commit and catalog it.

The current maturity derivation in `forge/scripts/build-catalog.js` is largely
body-length and heading based. That means a long imported guide can become
`draftable` without an output contract or test, while a heavily evaluated skill
can remain `draftable` because it has no explicit maturity metadata. Replit
should replace this implicit signal with explicit, auditable fields.

### 3.1 Metadata baseline completed

The Foundry metadata and presentation baseline is now complete for all 58
non-Community distribution packages. This covers the 57 cataloged
non-Community skills plus the untracked `okhp3-equilibrium-review` candidate;
the 13 Community imports are intentionally excluded.

| Baseline requirement | Result |
|---|---:|
| Non-Community packages audited | 58 |
| Packages fully compliant after remediation | 58 |
| Packages normalized in this remediation | 56 |
| Packages already compliant | 2 |
| Process Capture packages given an explicit H1 title | 15 |
| Package H1 titles normalized exactly to their directory names | 22 |

Each in-scope package now has a directory-matched `name`, non-empty
`description`, license, semantic `metadata.version`, author, category, origin,
homepage, author GitHub URL, and concise scalar `in_scope` and `out_of_scope`
boundaries. Each also has an H1 that exactly matches its package name, the
standard OverKill Hill header immediately after that H1, and the standard About
footer. Actual `compatibility` declarations were preserved where present; none
were invented.

This is a metadata and presentation normalization only. It does not alter a
skill's operational method, bump a version, or promote a maturity level. A
future behavioral change must follow Foundry versioning rules and receive
current-version evaluation evidence. The normalized version, scope, provenance,
and Git history now make it possible for the Forge to show whether a package
has evolved without treating formatting alone as evidence of maturity.

## 4. Maturity model for the Forge

Keep the existing maturity values for compatibility, but add evidence state and
promotion blockers.

| Maturity | Meaning | Minimum evidence |
|---|---|---|
| `placeholder` | Reserved slot with no usable contract | Name and intended scope only |
| `skeleton` | Contract has a recognizable shape but material sections are missing | Frontmatter, purpose, and partial method |
| `draftable` | Reviewable contract suitable for supervised use and PR feedback | Inputs, outputs, boundaries, failure handling, and anchored eval design |
| `usable` | Exercised in real or live comparable workflows with documented limits | Current-version runs, edge case, safety case, and no critical failure |
| `validated` | Peer-reviewed and verified against the stated contract | Current-version evidence, holdout or external check, and Equilibrium Review |
| `published` | Stable dependency surface with formal provenance | Validated evidence, release record, synchronized mirrors, and maintenance owner |

Evidence state is independent:

- `not-run`: evaluation design exists or is planned, but no execution occurred.
- `analytical`: static, fixture, structural, or manual review only.
- `historical`: completed evidence targets an older version or superseded setup.
- `live`: comparable current-version execution occurred.

The UI must never translate `historical` or `analytical` evidence into a
`validated` or `published` claim.

## 5. Product requirements for Replit

### 5.1 Catalog data contract

Extend `forge/src/types/catalog.ts` and `forge/scripts/build-catalog.js` with:

```ts
type EvidenceStatus = 'live' | 'analytical' | 'historical' | 'not-run';

interface SkillEvidence {
  status: EvidenceStatus;
  evaluatedSkillVersion: string | null;
  evalCount: number;
  benchmarkCount: number;
  testCount: number;
  referenceCount: number;
  scriptCount: number;
  lastEvidenceDate: string | null;
  reviewDecision: 'approve' | 'approve-with-limits' | 'defer-for-evidence' | 'reject' | null;
  blockers: string[];
}

interface SkillPackageMetadata {
  author: string | null;
  category: string | null;
  origin: string | null;
  homepage: string | null;
  authorGithub: string | null;
  inScope: string | null;
  outOfScope: string | null;
}
```

Add these fields to each catalog skill:

- `createdAt`: oldest tracked `SKILL.md` commit date.
- `lastModified`: newest tracked `SKILL.md` commit date.
- `version`: frontmatter version, or `null` with a visible missing-version flag.
- `packageMetadata`: the normalized provenance and scope fields above.
- `evidence`: the object above.
- `maturitySource`: `explicit-frontmatter`, `evidence-policy`, or
  `fallback-structure`.
- `maturityReviewedAt`: date of the latest review record.

Parsing rules:

1. Prefer explicit `metadata.maturity` only when the value is in the allowed
   enum.
2. Do not infer `usable`, `validated`, or `published` from body length.
3. If a benchmark's `evaluated_skill_version` differs from the package version,
   mark that evidence `historical`.
4. If a package has an eval design but no graded run, mark it `not-run`.
5. If a package has only structural or fixture review, mark it `analytical`.
6. Keep the fallback structural derivation only for `placeholder`, `skeleton`,
   and `draftable`.
7. Fail the build when a declared current-version `live` record has no
   evaluated version, expectation evidence, or provenance.
8. Fail the build when a non-Community package lacks one of the completed
   Foundry metadata-baseline fields. Community imports may retain `null` fields
   and must render those gaps honestly.

### 5.2 Explore page

Add:

- Evidence-status filter: Any, Live, Analytical, Historical, Not run.
- A separate "Release readiness" filter: Needs contract work, Needs live
  evidence, Ready for supervised use, Ready for peer review, Published.
- Evidence chips on each card: `25 evals`, `historical`, `no version`, and similar
  concise signals.
- Sort options for last updated, evidence freshness, and maturity.
- A catalog summary that reports both maturity counts and evidence counts.
- A stale-evidence warning when evidence is older than the package version or
  the declared evaluation version differs.

Do not change the existing install, GitHub, share, compare, or favorites
actions.

### 5.3 Skill detail page

Add an "Evidence and release state" section containing:

- Current package version and last modified date.
- Creation date when Git history is available.
- Package provenance, category, homepage, and in-scope and out-of-scope
  boundaries.
- Current maturity and its source.
- Evidence status and evaluated version.
- Counts and links for evals, benchmarks, tests, references, and scripts.
- Promotion blockers written in plain language.
- Review decision and review date.
- A link to the raw skill and repository path.

Use wording such as "historical benchmark for version 1.1.0" rather than
"validated" when the live package is version 1.2.0.

### 5.4 Home, FAQ, and project page copy

Replace claims that the SPA is the only authoritative source with a clearer
relationship: GitHub is the source of truth for files and history; the Forge is
the generated discovery surface. Update the project page from 68 to the
generated 70 only after the catalog build passes.

Document the six-level maturity model and four evidence states in the FAQ.
Explain that `usable` and above are scoped release claims, not universal
guarantees.

### 5.5 Build and QA

Add deterministic tests for:

1. Explicit maturity wins over fallback structure.
2. A historical benchmark cannot promote a newer package version.
3. A missing version is visible and does not crash sorting or detail views.
4. A declared live record without provenance fails the catalog build.
5. Evidence filters and URL state survive reload.
6. A card with zero evals does not display a fabricated evidence badge.
7. 70 skills and 11 families render from generated data without hardcoded counts.
8. Every cataloged non-Community package exposes its Foundry metadata baseline;
   Community gaps render as explicit missing metadata rather than placeholders.
9. Accessibility names remain unique for maturity and evidence controls.

The existing cataloger check and Forge build remain release prerequisites. The
canonical Python check must run in CI where Python is available.

## 6. Foundry improvement program for the 70 public skills

Each skill gets the same eight-phase treatment, adapted to its domain:

1. Freeze the current package and hash it.
2. Declare outcome, inputs, outputs, boundaries, client assumptions, and the
   exact knowledge advantage.
3. Preserve the portable core and isolate optional host adapters.
4. Add three anchored eval cases: normal, edge or constraint, and safety or
   out-of-scope behavior.
5. Mark all old benchmark records historical when the evaluated version differs.
6. Run the current-version development set, then a protected or external
   holdout for promotion claims.
7. Run independent evidence, outcome, and safety-portability reviews. If they
   materially agree, run a falsifiable disruptor pass. If they disagree, use a
   negotiator instead. Record the result in a review ledger.
8. Promote only when acceptance criteria and critical safety gates pass.

The current audit is analytical and does not itself promote the 70 skills. The
recommended target column below means "next evidence-backed target after the
listed work," not a claim that the target has already been achieved.

### Family workstreams

| Family | Count | Immediate improvement focus |
|---|---:|---|
| Abrahamic | 4 | Freeze source dates, API and translation claims, and neutral comparison fixtures. Rerun current versions and retain attribution checks. |
| Agent Foundry | 3 | Add platform-fact retrieval records, current capability checks, and conversion/readiness holdouts. |
| Community | 13 | Convert imported guides into explicit contracts, add boundaries and outputs, declare versions, and add small domain-specific evals. |
| Context Extraction | 9 | Preserve the existing rich fixtures, add current-version graded runs, and keep source instructions untrusted. |
| LifeTrkr | 2 | Rerun deterministic date and API cases against current versions; separate historical benchmark evidence. |
| LinkedIn | 3 | Complete post and voice contracts, add employer-context and no-em-dash regression cases, and document public-link routing. |
| Mermaid | 9 | Preserve core-first routing, add parser/render fixtures where applicable, and keep publish/update/repair responsibilities distinct. |
| Notion | 1 | Add destination authorization, deduplication, and no-write review cases. |
| Process Capture | 16 | Add one shared process fixture matrix across intake, narrative, modeling, controls, governance, validation, and handoff. |
| ReFolDec | 1 | Add semantic-loss ledger examples and reversible fold/unfold regression cases. |
| Universal | 9 | Add safety and authorization holdouts for proxy, OAuth, repository, cataloger, Foundry, and organizer workflows. |

## 7. Per-skill audit and next target

Dates are ISO dates from `git log --follow`. "Usable candidate" means the
package has enough existing structure or evidence to enter the usable lane
after current-version execution and review. It does not mean the promotion is
complete.

| Family | Skill | Version | Created | Last updated | Current | Existing signals | Next target |
|---|---|---|---|---|---|---|---|
| abrahamic | okhp3-cross-tradition-compare | 1.2.0 | 2026-06-25 | 2026-07-21 | draftable | evals, bench | usable candidate |
| abrahamic | okhp3-tradition-observance-calendar | 1.2.0 | 2026-06-25 | 2026-07-24 | draftable | evals, bench, refs, scripts | usable candidate |
| abrahamic | okhp3-tradition-reference | 1.2.0 | 2026-06-25 | 2026-07-21 | draftable | evals, bench | usable candidate |
| abrahamic | okhp3-verse-lookup | 1.2.0 | 2026-06-25 | 2026-07-24 | draftable | evals, bench, tests, refs, scripts | usable candidate |
| agent-foundry | okhp3-custom-gpt-builder | 1.3.0 | 2026-06-22 | 2026-07-24 | draftable | evals, refs | usable candidate |
| agent-foundry | okhp3-custom-gpt-readiness | 1.2.0 | 2026-07-20 | 2026-07-21 | draftable | evals, refs | usable candidate |
| agent-foundry | okhp3-gpt-skill-conversion-plan | 1.2.0 | 2026-07-20 | 2026-07-24 | draftable | evals, refs | usable candidate |
| community | ai-social-media-content | missing | 2026-06-22 | 2026-07-21 | draftable | none | usable candidate |
| community | architecture-decision-records | missing | 2026-06-22 | 2026-07-21 | draftable | none | usable candidate |
| community | brand-guidelines | missing | 2026-06-22 | 2026-07-21 | skeleton | none | draftable candidate |
| community | find-skills | missing | 2026-06-22 | 2026-07-21 | skeleton | none | draftable candidate |
| community | frontend-design | missing | 2026-06-22 | 2026-07-21 | skeleton | none | draftable candidate |
| community | mcp-builder | missing | 2026-06-22 | 2026-07-21 | skeleton | scripts | draftable candidate |
| community | mermaid-diagrams | missing | 2026-06-22 | 2026-07-21 | draftable | refs | usable candidate |
| community | skill-creator | missing | 2026-06-22 | 2026-07-21 | draftable | refs, scripts | usable candidate |
| community | theme-factory | missing | 2026-06-22 | 2026-07-21 | skeleton | none | draftable candidate |
| community | vercel-react-best-practices | 1.0.0 | 2026-06-22 | 2026-07-21 | draftable | none | usable candidate |
| community | vercel-react-native-skills | 1.0.0 | 2026-06-22 | 2026-07-21 | draftable | none | usable candidate |
| community | web-artifacts-builder | missing | 2026-06-22 | 2026-07-21 | skeleton | scripts | draftable candidate |
| community | web-design-guidelines | 1.0.0 | 2026-06-22 | 2026-07-21 | skeleton | none | draftable candidate |
| context-extraction | okhp3-chatgpt-project-migration | 1.0.0 | 2026-07-21 | 2026-07-22 | draftable | evals, refs | usable candidate |
| context-extraction | okhp3-thread-context-extraction | 2.0.0 | 2026-07-21 | 2026-07-22 | draftable | evals, refs, scripts | usable candidate |
| context-extraction | okhp3-thread-context-extraction-grok | 2.0.0 | 2026-07-21 | 2026-07-22 | draftable | evals, refs, scripts | usable candidate |
| context-extraction | okhp3-thread-extract-chatgpt | 2.0.0 | 2026-07-21 | 2026-07-24 | draftable | evals, refs, scripts | usable candidate |
| context-extraction | okhp3-thread-extract-claude | 2.0.0 | 2026-07-21 | 2026-07-24 | draftable | evals, refs, scripts | usable candidate |
| context-extraction | okhp3-thread-extract-copilot-m365 | 2.0.0 | 2026-07-21 | 2026-07-24 | draftable | evals, refs, scripts | usable candidate |
| context-extraction | okhp3-thread-extract-gemini | 2.0.0 | 2026-07-21 | 2026-07-24 | draftable | evals, refs, scripts | usable candidate |
| context-extraction | okhp3-thread-extract-mistral-vibe | 2.0.0 | 2026-07-21 | 2026-07-24 | draftable | evals, refs, scripts | usable candidate |
| context-extraction | okhp3-thread-extract-perplexity | 2.0.0 | 2026-07-21 | 2026-07-24 | draftable | evals, refs, scripts | usable candidate |
| lifetrkr | okhp3-celestial-data | 1.3.0 | 2026-06-22 | 2026-07-21 | draftable | evals, bench, refs, scripts | usable candidate |
| lifetrkr | okhp3-daily-oracle | 1.3.0 | 2026-06-22 | 2026-07-21 | draftable | evals, bench, refs, scripts | usable candidate |
| linkedin | okhp3-linkedin-angles | 1.1.0 | 2026-06-12 | 2026-07-21 | draftable | refs | usable candidate |
| linkedin | okhp3-linkedin-post | 1.1.0 | 2026-06-12 | 2026-07-21 | skeleton | refs | draftable candidate |
| linkedin | okhp3-linkedin-voice | 1.1.0 | 2026-06-12 | 2026-07-21 | skeleton | refs | draftable candidate |
| mermaid | okhp3-mermaid-architecture | 0.2.0 | 2026-06-12 | 2026-07-24 | skeleton | refs | draftable candidate |
| mermaid | okhp3-mermaid-bpmn | 0.2.0 | 2026-06-12 | 2026-07-24 | draftable | refs | usable candidate |
| mermaid | okhp3-mermaid-core | 0.2.0 | 2026-06-12 | 2026-07-24 | draftable | refs | usable candidate |
| mermaid | okhp3-mermaid-data | 0.2.0 | 2026-06-12 | 2026-07-24 | skeleton | refs | draftable candidate |
| mermaid | okhp3-mermaid-governance | 1.1.0 | 2026-06-24 | 2026-07-24 | draftable | refs | usable candidate |
| mermaid | okhp3-mermaid-publish | 0.2.0 | 2026-06-12 | 2026-07-24 | draftable | refs | usable candidate |
| mermaid | okhp3-mermaid-repair | 0.2.0 | 2026-06-20 | 2026-07-24 | draftable | none | usable candidate |
| mermaid | okhp3-mermaid-theme-builder | 0.5.1 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| mermaid | okhp3-mermaid-update | 0.2.0 | 2026-06-20 | 2026-07-24 | draftable | none | usable candidate |
| notion | okhp3-notion-capture-router | 0.3.0 | 2026-06-20 | 2026-07-21 | draftable | refs | usable candidate |
| process-capture | okhp3-as-is-process-capture | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-decision-model-authoring | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-elicitation-interviews | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-future-state-strategy | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-handoff-packaging | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-process-capture | 1.1.0 | 2026-06-12 | 2026-07-24 | skeleton | none | draftable candidate |
| process-capture | okhp3-process-controls-metrics | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-process-gap-analysis | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-process-intake-and-scope | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-process-narrative-authoring | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-process-quality-validation | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-raci-governance-matrix | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-sipoc-generation | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-sop-work-instructions | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-stakeholder-and-role-mapping | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| process-capture | okhp3-visual-process-modeling | 0.1.0 | 2026-06-22 | 2026-07-24 | draftable | tests, refs, scripts | usable candidate |
| refolddec | okhp3-refolddec-core | 1.1.0 | 2026-06-20 | 2026-07-24 | draftable | none | usable candidate |
| universal | okhp3-brand-style-registry | 1.1.0 | 2026-07-25 | 2026-07-27 | draftable | evals, refs, scripts | usable candidate |
| universal | okhp3-cloudflare-worker-api-proxy | 1.1.0 | 2026-06-22 | 2026-07-21 | draftable | none | usable candidate |
| universal | okhp3-database-cartographer | 1.1.0 | 2026-07-24 | 2026-07-24 | draftable | evals, refs, scripts | usable candidate |
| universal | okhp3-foundry-repo-creator | 1.1.0 | 2026-06-22 | 2026-07-24 | skeleton | none | draftable candidate |
| universal | okhp3-google-gis-client-auth | 1.2.0 | 2026-06-22 | 2026-07-21 | draftable | evals, bench, refs, scripts | usable candidate |
| universal | okhp3-repository-organizer | 1.1.1 | 2026-07-27 | 2026-07-27 | draftable | evals, refs, scripts | usable candidate |
| universal | okhp3-skill-cataloger | 1.6.1 | 2026-06-23 | 2026-07-24 | draftable | evals, refs, scripts | usable candidate |
| universal | okhp3-skill-foundry | 3.1.0 | 2026-06-25 | 2026-07-28 | draftable | evals, bench, tests, refs, scripts | usable candidate |
| universal | okhp3-vite-github-pages | 1.0.0 | 2026-06-22 | 2026-07-21 | draftable | evals | usable candidate |

### Pending public-path candidate

| Family | Skill | Version | Created | Last updated | Current | Existing signals | Next target |
|---|---|---|---|---|---|---|---|
| universal | okhp3-equilibrium-review | 1.0.0 | untracked | untracked | not cataloged | local mirror, review references | catalog only after owner decision and provenance record |

## 8. Equilibrium Review record

**Decision question:** Is the repository ready to promote its public skill
maturity labels based on the current inventory and evidence?

**Evidence status:** `analytical`

- Evidence reviewer: the local catalog, Git history, package resources, and
  maturity derivation were checked. Finding: evidence is uneven and many
  current versions inherit historical or design-only records.
- Outcome reviewer: the Forge currently helps users discover skills, but a
  single maturity badge does not explain whether a skill is tested, current,
  or merely structurally long. Finding: the catalog needs evidence-aware UI.
- Safety and portability reviewer: promotion without version-aware evidence
  could cause users to treat an untested instruction package as validated.
  Finding: keep current labels conservative and expose blockers.
- Concordance: material agreement on the need for evidence-aware fields.
- Disruptor hypothesis: existing benchmark files may be mistaken for current
  release evidence. Test: compare benchmark evaluated versions with package
  versions. Result: at least the Google GIS benchmark explicitly records that
  it targets an older version; the hypothesis survives.
- Negotiator result: `defer-for-evidence` for bulk maturity promotion;
  `approve-with-limits` for the catalog schema and UI work described here.

The missing step is independent current-version execution. The PRD therefore
authorizes implementation of the evidence model and contract hardening, but
not a claim that all 70 skills are validated.

## 9. Delivery sequence

### Release A: honest visibility

- Add catalog fields and parser tests.
- Add evidence and freshness badges.
- Correct the 70-skill count and stale project-page copy.
- Preserve current maturity values until explicit evidence records exist.

### Release B: contract hardening

- Upgrade the 13 skeleton packages to draftable or keep them explicitly
  skeleton with a blocker.
- Preserve the completed Foundry metadata baseline for all 58 non-Community
  packages. The 10 unversioned Community imports remain explicitly out of scope
  for this remediation and must display a visible missing-version state.
- Add three anchored evals to every package without an eval design.
- Add safety and portability boundaries to every package that can cause writes,
  network access, publication, or platform-specific side effects.

### Release C: evidence promotion

- Run current-version development cases and matched baselines.
- Protect a release holdout for each family.
- Run the three independent review roles and conditional disruptor or
  negotiator.
- Promote individual skills, never a whole family by association.

### Release D: published dependency surface

- Require synchronized source, evidence, and mirror records.
- Add owners and review-expiry triggers.
- Promote only skills with stable outputs and documented change policy to
  `published`.

## 10. Acceptance criteria

The Replit implementation is complete when:

- All 70 public skills render with evidence-aware data.
- All 58 non-Community distribution packages retain the completed Foundry
  metadata and presentation baseline.
- No maturity value is inferred from length for `usable` or higher.
- Historical and analytical evidence are visibly distinct from live evidence.
- The ten missing-version packages are visible as missing version, not silently
  treated as current.
- The app can filter by maturity, evidence status, and freshness.
- Detail pages show the exact evaluated version and promotion blocker.
- Generated counts are derived from the catalog, not hardcoded.
- Build and accessibility tests pass.
- The repository cataloger check passes in a Python-enabled CI environment.
- The release notes state that current maturity promotions remain deferred until
  current-version execution and review are recorded.

## 11. Project-local support surface

The repository also contains 19 project-local support packages under
`.agents/skills/`. They are excluded from the public 70-skill Forge catalog:

`find-skills`, `okhp3-chatgpt-project-migration`,
`okhp3-custom-gpt-builder`, `okhp3-custom-gpt-readiness`,
`okhp3-equilibrium-review`, `okhp3-foundry-repo-creator`,
`okhp3-gpt-skill-conversion-plan`, `okhp3-notion-capture-router`,
`okhp3-skill-cataloger`, `okhp3-skill-foundry`,
`okhp3-thread-context-extraction`, `okhp3-thread-context-extraction-grok`,
`okhp3-thread-extract-chatgpt`, `okhp3-thread-extract-claude`,
`okhp3-thread-extract-copilot-m365`, `okhp3-thread-extract-gemini`,
`okhp3-thread-extract-mistral-vibe`, `okhp3-thread-extract-perplexity`, and
`skill-creator`.

These support skills should be audited through the same method, but their
results should remain in the local catalog unless the repository explicitly
changes the public distribution boundary.
