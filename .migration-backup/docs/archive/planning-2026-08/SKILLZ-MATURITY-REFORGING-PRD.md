# Skillz Maturity Reforging PRD

**Status:** Ready for Replit implementation
**Date:** 2026-07-31
**Repository:** `OKHP3/skillz`
**Public surfaces:** `https://overkillhill.com/projects/skillz/` and `https://okhp3.github.io/skillz/`
**Primary implementation surface:** `forge/`

## 1. Decision summary

The Forge should make skill evolution and maturity legible without claiming that
metadata formatting is equivalent to behavioral validation. GitHub remains the
source of truth for installable files and history. Forge is the generated
discovery surface.

This release has two completed repository actions and one requested product
action:

1. Audit every distribution `SKILL.md` outside `community/` against the current
   Skill Foundry metadata and presentation baseline.
2. Repair missing metadata, scalar scope fields, package-matched headings, and
   canonical presentation where required.
3. Give Replit a current PRD for a catalog that exposes version, provenance,
   creation date, last update, evidence state, and promotion blockers.

The catalog must continue to distinguish:

1. Structural usability of the contract.
2. Evidence available for the current package version.
3. Release readiness for the stated scope.

No skill is promoted to `usable`, `validated`, or `published` merely because
its frontmatter, title, or footer is now complete.

## 2. Evidence and method

This review used:

- The repository `AGENTS.md` routing guide.
- `okhp3-skill-foundry` 3.1.0 and its brand, evaluation, grading, and
  Equilibrium Review references.
- `okhp3-equilibrium-review` 1.0.0 and its Agent Skill adapter.
- `okhp3-skill-cataloger` 1.6.1 in full-index check mode.
- The Foundry recursive structural validator.
- The filesystem inventory of distribution and project-local packages.
- Git history, which Replit must use for per-skill creation and last-modified
  dates.

The canonical catalog check passed with `py` and found 105 distribution skills.
It reports missing versions only for the 13 intentionally excluded Community
imports. The recursive Foundry validator passed 124 packages, consisting of
105 distribution packages and 19 project-local support packages. Its advisory
warnings remain relevant to future contract hardening, but are not structural
errors.

## 3. Current inventory

The repository currently contains 105 distribution skills in 15 active
families. Community contains 13 imported or community-oriented packages and is
excluded from the metadata remediation described in this PRD. The remaining 92
packages are the in-scope non-Community audit set.

| Family | Distribution skills | In scope for this remediation |
|---|---:|---:|
| Abrahamic | 4 | Yes |
| Agent Foundry | 3 | Yes |
| AskJamie | 9 | Yes |
| Community | 13 | No |
| Context Extraction | 10 | Yes |
| Glee-fully | 10 | Yes |
| Knowledge Operations | 7 | Yes |
| LifeTrkr | 2 | Yes |
| LinkedIn | 3 | Yes |
| Mermaid | 9 | Yes |
| Notion | 1 | Yes |
| Outcome Modeling | 5 | Yes |
| Process Capture | 16 | Yes |
| ReFolDec | 1 | Yes |
| Universal | 12 | Yes |
| **Total** | **105** | **92** |

The repository also contains 19 project-local support skills under
`.agents/skills/`. They are included in the recursive validator but are not
part of the public 105-skill catalog.

## 4. Completed Foundry metadata remediation

The 92 non-Community distribution packages now pass the required metadata and
presentation baseline. The 13 Community packages were not changed.

| Remediation signal | Result |
|---|---:|
| Non-Community packages audited | 92 |
| Fully compliant after remediation | 92 |
| Packages repaired in this pass | 25 |
| Packages already compliant | 67 |
| Scope lists converted to scalar strings | 24 |
| Packages with missing-field repairs | 15 |
| Package title or canonical header repairs | 19 |
| Canonical footer repairs | 9 |
| New baseline version assigned | 1 |
| Behavioral method changes | 0 |
| Maturity promotions | 0 |

The one assigned baseline version is `universal/okhp3-repository-janitor`,
which received `metadata.version: "0.1.0"` because it had no prior declared
version. Existing versions were preserved everywhere else. This is a baseline
version declaration, not evidence of a behavioral release.

Each in-scope package now has, at minimum:

- Directory-matched `name`.
- Non-empty `description`.
- `license`.
- Semantic `metadata.version`.
- `metadata.author`.
- `metadata.category`.
- `metadata.origin`.
- `metadata.homepage`.
- `metadata.author-github`.
- Scalar-string `metadata.in_scope` and `metadata.out_of_scope`.
- An H1 matching the package name.
- The standard OverKill Hill header immediately after the H1.
- The standard About footer.

Existing compatibility declarations and additional package metadata were
preserved. No compatibility claim was invented. Scope list entries were joined
with semicolons so their content remains visible while satisfying the Foundry
scalar-field requirement.

This remediation makes evolution inspectable. It does not prove that a skill
works, that an old benchmark applies to its current version, or that a maturity
label should be promoted.

## 5. Maturity and evidence model

Keep the existing maturity values for compatibility, but expose evidence as a
separate state.

| Maturity | Meaning | Minimum evidence |
|---|---|---|
| `placeholder` | Reserved slot with no usable contract | Name and intended scope |
| `skeleton` | Recognizable shape with material sections missing | Frontmatter, purpose, and partial method |
| `draftable` | Reviewable contract suitable for supervised use and feedback | Inputs, outputs, boundaries, failure handling, and anchored eval design |
| `usable` | Exercised in comparable workflows with documented limits | Current-version runs, edge case, safety case, and no critical failure |
| `validated` | Peer-reviewed against the stated contract | Current-version evidence, protected or external check, and Equilibrium Review |
| `published` | Stable dependency surface with formal provenance | Validated evidence, release record, synchronized mirrors, and owner |

Evidence state is independent:

- `not-run`: an evaluation design exists or is planned, but no execution is
  recorded.
- `analytical`: static, fixture, structural, or manual review only.
- `historical`: evidence targets an older version or superseded setup.
- `live`: comparable current-version execution occurred.

The UI must never translate `historical` or `analytical` evidence into a
`validated` or `published` claim.

## 6. Product requirements for Replit

### 6.1 Catalog data contract

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

Add these fields to every catalog item:

- `createdAt`: oldest tracked `SKILL.md` commit date from `git log --follow`.
- `lastModified`: newest tracked `SKILL.md` commit date from `git log --follow`.
- `version`: frontmatter version, or `null` with a visible missing-version flag.
- `packageMetadata`: the normalized provenance and scope fields above.
- `evidence`: the evidence object above.
- `maturitySource`: `explicit-frontmatter`, `evidence-policy`, or
  `fallback-structure`.
- `maturityReviewedAt`: date of the latest review record.

Parsing and build rules:

1. Prefer explicit `metadata.maturity` only when it is in the allowed enum.
2. Do not infer `usable`, `validated`, or `published` from body length.
3. If an evidence record evaluates a different version, mark it `historical`.
4. If an eval design has no graded run, mark it `not-run`.
5. Structural or fixture review alone is `analytical`.
6. Structural fallback may derive only `placeholder`, `skeleton`, or
   `draftable`.
7. A declared `live` record must include evaluated version, expectation
   evidence, and provenance or the build fails.
8. A non-Community package missing any completed Foundry baseline field fails
   the build.
9. Community gaps may remain `null`, but must render as missing metadata rather
   than silently inheriting a value.

### 6.2 Explore page

Add:

- Evidence filter: Any, Live, Analytical, Historical, Not run.
- Release-readiness filter: Needs contract work, Needs live evidence, Ready for
  supervised use, Ready for peer review, Published.
- Evidence chips such as `25 evals`, `historical`, and `no version`.
- Sort by last updated, evidence freshness, maturity, and version.
- Summary counts for total skills, maturity, evidence state, and metadata
  completeness.
- A stale-evidence warning when evaluated version differs from package version.

Preserve install, GitHub, share, compare, and favorites actions.

### 6.3 Skill detail page

Add an Evidence and release state section containing:

- Current package version.
- Creation date and last modified date.
- Package provenance, category, homepage, and scope boundaries.
- Current maturity and its source.
- Evidence state and evaluated version.
- Counts and links for evals, benchmarks, tests, references, and scripts.
- Promotion blockers in plain language.
- Review decision and review date.
- Raw skill and repository path links.

Use wording such as “historical benchmark for version 1.1.0” when the live
package is version 1.2.0.

### 6.4 Home, FAQ, and project-page copy

State clearly that GitHub is the source of truth for files and history, while
Forge is the generated discovery surface. Derive the public count from the
catalog rather than hardcoding 105. Document the six maturity levels and four
evidence states. Explain that `usable` and above are scoped release claims, not
universal guarantees.

Community packages may retain visible metadata gaps. Non-Community packages
must not be presented as lacking a version, provenance, or scope when the
repository contains those fields.

### 6.5 Build and QA

Add deterministic tests for:

1. Explicit maturity winning over structural fallback.
2. Historical evidence failing to promote a newer package version.
3. Missing version rendering safely and remaining sortable.
4. A live record without provenance failing the catalog build.
5. Evidence filters and URL state surviving reload.
6. A zero-eval card not displaying a fabricated evidence badge.
7. Generated counts rendering 105 skills and 15 families from data, not
   hardcoded constants.
8. Every cataloged non-Community package exposing the Foundry baseline.
9. Community metadata gaps rendering honestly.
10. Accessibility names remaining unique for maturity and evidence controls.

The canonical cataloger check, recursive Foundry validator, Forge build, and
accessibility tests remain release prerequisites.

## 7. Foundry improvement program for 92 non-Community skills

Metadata compliance is complete. Behavioral maturity remains a per-skill
program. Apply the eight Foundry phases to each package:

1. Freeze the current package and record its hash and version.
2. Declare outcome, inputs, outputs, boundaries, client assumptions, and the
   exact knowledge advantage.
3. Preserve the portable core and isolate optional host adapters.
4. Add three anchored eval cases: normal, edge or constraint, and safety or
   out-of-scope behavior.
5. Mark old benchmark records historical when the evaluated version differs.
6. Run current-version development cases, then a protected or external holdout.
7. Run independent evidence, outcome, and safety-portability reviews. Use a
   falsifiable disruptor when the reviews materially agree, and a negotiator
   when they disagree.
8. Promote only when acceptance criteria and critical safety gates pass.

### Family workstreams

| Family | Count | Immediate improvement focus |
|---|---:|---|
| Abrahamic | 4 | Source dates, translation claims, neutral comparison fixtures, and attribution checks. |
| Agent Foundry | 3 | Platform-fact retrieval, capability checks, and conversion/readiness holdouts. |
| AskJamie | 9 | GPT-specific scope, provenance, portability, and current-version builder/readiness cases. |
| Community | 13 | Future workstream only. Imported packages remain outside this remediation. |
| Context Extraction | 10 | Rich fixture preservation, current-version graded runs, and untrusted source handling. |
| Glee-fully | 10 | Hierarchy, Persona Density, sibling awareness, leaf logic, and canon-seal evidence. |
| Knowledge Operations | 7 | Lifecycle dispositions, evidence classification, authorization, and no-unapproved-move cases. |
| LifeTrkr | 2 | Deterministic date and API cases with clear historical evidence separation. |
| LinkedIn | 3 | Voice, employer-context, public-link, and no-em-dash regression cases. |
| Mermaid | 9 | Core-first routing, parser and render fixtures, and distinct publish/update/repair responsibilities. |
| Notion | 1 | Destination authorization, deduplication, provenance, and no-write review cases. |
| Outcome Modeling | 5 | Calibration, feature compression, objective separation, and constrained-decision holdouts. |
| Process Capture | 16 | Shared process fixture matrix across intake, narrative, modeling, controls, governance, validation, and handoff. |
| ReFolDec | 1 | Semantic-loss ledgers and reversible fold, unfold, and refold regressions. |
| Universal | 12 | Safety and authorization holdouts for proxy, OAuth, repositories, cataloging, Foundry, and organization workflows. |

The target column in future release plans means the next evidence-backed target,
not a current promotion claim. Promotion is individual, never inherited by
family association.

## 8. Equilibrium Review decision

**Decision question:** Is the current repository ready to promote all non-
Community skills based on metadata normalization alone?

**Evidence status:** `analytical`

- Evidence review: all 92 in-scope packages now have the required metadata and
  presentation baseline, but current-version execution is not uniform.
- Outcome review: the Forge needs version, date, provenance, scope, evidence,
  and blocker fields to explain what a maturity badge means.
- Safety and portability review: bulk promotion could make untested packages
  appear validated. Version-aware evidence and explicit blockers are required.
- Concordance: approve the catalog and UI contract with limits.
- Disruptor hypothesis: existing eval or benchmark files may be mistaken for
  current release evidence. Compare evaluated versions with package versions;
  mismatches remain historical.
- Negotiator decision: `defer-for-evidence` for bulk maturity promotion;
  `approve-with-limits` for the catalog schema and UI work.

The review authorizes catalog visibility and contract hardening. It does not
authorize a claim that all 92 non-Community skills are validated.

## 9. Delivery sequence

### Release A: honest visibility

- Add catalog fields and parser tests.
- Add evidence and freshness badges.
- Derive counts from the current 105-skill catalog.
- Preserve maturity values until explicit evidence records exist.

### Release B: contract hardening

- Keep the completed metadata baseline for all 92 non-Community packages.
- Leave Community gaps visible and outside this remediation.
- Add three anchored evals to every package without an eval design.
- Add safety and portability boundaries for writes, network access, publication,
  and platform-specific side effects.

### Release C: evidence promotion

- Run current-version development cases and matched baselines.
- Protect a release holdout for each family.
- Run the three independent review roles and conditional disruptor or
  negotiator.
- Promote individual skills only after their own evidence passes.

### Release D: published dependency surface

- Synchronize source, evidence, and mirror records.
- Add owners and review-expiry triggers.
- Promote only skills with stable outputs and documented change policy to
  `published`.

## 10. Acceptance criteria

The Replit implementation is complete when:

- All 105 distribution skills render from generated catalog data.
- All 92 non-Community packages retain the completed Foundry metadata and
  presentation baseline.
- Community remains explicitly excluded from this remediation and its gaps are
  rendered honestly.
- Every catalog item exposes version, creation date, last modified date,
  provenance, scope, evidence state, and promotion blockers.
- No `usable`, `validated`, or `published` value is inferred from length alone.
- Historical and analytical evidence are distinct from live evidence.
- The app filters by maturity, evidence status, and freshness.
- Detail pages show the exact evaluated version and blocker.
- Generated counts are derived from the catalog.
- Build, cataloger, Foundry, and accessibility checks pass.
- Release notes state that maturity promotions remain deferred until
  current-version execution and review are recorded.

## 11. Machine-readable review record

Use [`docs/skill-maturity-review-2026-07-28.json`](skill-maturity-review-2026-07-28.json)
as the current review record until a dated replacement is introduced. Its
metadata-normalization block must remain synchronized with this PRD. The record
must preserve the analytical status, the `approve-with-limits` release
decision, and the deferred bulk-promotion scope.

## 12. Project-local support surface

The 19 project-local support packages under `.agents/skills/` are excluded from
the public Forge catalog, although they are included in recursive structural
validation. They should continue to be audited through the same method when
their support role changes, without silently changing the public distribution
boundary.
