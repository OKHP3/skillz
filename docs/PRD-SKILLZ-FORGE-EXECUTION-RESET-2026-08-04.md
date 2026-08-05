# PRD: Skillz Forge execution reset and distribution-center completion

**Status:** Authorized implementation directive

**Date:** 2026-08-04

**Product:** Skillz Forge and its OverKill Hill project dossier

**Canonical repository:** `OKHP3/skillz`

**Forge:** `https://okhp3.github.io/skillz/`

**Project dossier:** `https://overkillhill.com/projects/skillz/`

## 1. Executive decision

Skillz Forge is already a real discovery application, not a mockup. It has a
generated 113-skill, 15-family catalog; task search; family pages; maturity and
evidence filters; individual skill pages; comparison; curated stacks; source
links; local saving; sharing; and a build-time commit activity snapshot. The
foundation should be preserved and extended.

The next implementation cycle must not begin with another visual redesign,
repository self-audit, metadata sweep, or new unrelated feature. It must first
repair the product's public truth contract:

1. Per-skill Git provenance displayed by the deployed Forge is currently
   incorrect.
2. The OverKill Hill project dossier tells a stale and partly contradictory
   story about the catalog and shipped capabilities.
3. Forge says visitors can inspect a full contract, but its structured detail
   extraction covers only a minority of packages and it does not render the
   full `SKILL.md` in the app.

After those repairs, the cycle should complete the distribution-center promise:
help a visitor decide what to use, understand a contract before relying on it,
compose compatible skills, and hand off to GitHub for source and contribution.

## 2. Product position and non-negotiable principles

Skillz is the execution-contract layer of the OKHP3 Visual Language Stack.
GitHub is the installable source of truth. Forge is the generated discovery,
inspection, and handoff surface. The OverKill Hill project page is the
narrative project dossier. It is not a second manually maintained catalog.

The desired journey is:

```text
Need an outcome
  -> discover a relevant skill or family
  -> inspect the actual contract, boundaries, maturity, and evidence
  -> compare or compose a small stack when appropriate
  -> copy an installable source URL or continue on GitHub
  -> contribute through GitHub, not through a shadow collaboration system
```

The implementation must preserve these constraints:

- Keep GitHub as the source of truth for source files, history, issues, pull
  requests, and discussions.
- Keep Forge static, read-only, and browser-first. No account, backend,
  write-scoped GitHub token, or client-side secret is authorized.
- Maintain the separation between contract maturity and evidence. Do not
  promote a skill because this product work was completed.
- Never present a missing evidence record as an executed evaluation.
- Use generated catalog data and a published summary snapshot. Do not create a
  second catalog or hand-maintain counts in either public surface.
- Preserve hash routes, raw GitHub installation URLs, source links, saved
  favorites, sharing, and current comparison behavior.

## 3. Evidence baseline for this directive

The following observations were made directly on 2026-08-04. “Confirmed” means
observed in source, a validator, a successful GitHub workflow, or the deployed
page. “Proposal” is a requested product decision.

| Claim | Tier | Evidence | Consequence if false |
|---|---|---|---|
| Forge is deployed from `main` commit `98515ec564a8d81b3163bdf917ed22ef0c016278`. | Confirmed | Live `data/catalog.json` reports `sourceCommit: 98515ec`; GitHub Actions run `30939293432` succeeded for that SHA. | The deployment comparison would need to be repeated. |
| The live catalog contains 113 skills across 15 families. | Confirmed | Live Forge home, live `data/catalog.json`, local catalog validation. | Public inventory copy must be regenerated from the actual source. |
| The Forge foundation includes search, family pages, evidence filters, release-readiness filters, skill details, compare, stacks, source links, and activity. | Confirmed | Live route inspection and `forge/src/` implementation. | Do not remove or rebuild this work without a specific defect. |
| The catalog, Foundry structural validator, catalog tests, Forge unit tests, and TypeScript type check pass. | Confirmed | Local checks completed on 2026-08-04: catalog check, 131-package validator, 19 catalog tests, 5 unit tests, and `tsc --noEmit`. | Passing mechanics alone do not establish product correctness. |
| The Pages job assigns one created date, modified date, and commit SHA to every public skill. | Confirmed | Live `catalog.json`: all 113 records contain `2026-08-04T18:33:01Z` and `98515ec5`. | Per-skill provenance must not be trusted until repaired. |
| The immediate cause is shallow Git history in the Pages build. | Inferred, strongly supported | `deploy-pages.yml` uses `actions/checkout` without `fetch-depth: 0`; the local generated catalog has varied historical dates for the same skill files. | Confirm by logging shallow-repository state in the repaired workflow. |
| The project dossier is stale and contradicts the live Forge. | Confirmed | The live dossier says 75 skills and 12 families, describes Compare and live activity as planned, and says maturity is not inferred; live Forge says 113 and 15, ships Compare and activity, and exposes `fallback-structure` maturity. | The narrative surface cannot be used as an authoritative product description. |
| Current structured extraction is incomplete. | Confirmed | Only 22/113 skills populate triggers, 16/113 avoid, 9/113 outputs, and 2/113 boundaries. The catalog nevertheless carries about 748K characters of flattened `bodyText`. | A visitor cannot reliably inspect an actual contract inside Forge. |
| A complete 390px visual and keyboard test has passed. | Unknown | The browser viewport override did not take effect in this audit environment. | Replit must perform and record this acceptance test. |

## 4. Work already completed: preserve it

Do not spend the next budget reimplementing these completed features:

- Runtime fetch of `public/data/catalog.json`, rather than a catalog bundled as
  the main JavaScript payload.
- Generated catalog count and family count on Forge.
- The original seven-value evidence vocabulary and its visible evidence notes.
- The evidence-contract-v2 object, evidence chips, stale-evidence warnings,
  package metadata, release-readiness filter, sort options, and detail section.
- Generated manifest maturity and evidence counts.
- Current Pages triggers for the 15 existing family directories.
- Family detail routes, narrative extraction where a narrative exists, and
  companion-pathway presentation.
- Read-only, build-time commit activity with clear non-live framing.
- Explicit image dimensions, focus-visible styling, current theme controls,
  GitHub navigation, and the current visual language.

The prior 2026-08-04 v2 directive should be treated as mostly implemented,
with its remaining acceptance criteria reconciled through this document rather
than re-opened wholesale.

## 5. Release 0: public-truth repair

Release 0 is P0 work. Do it before functional expansion. It is complete only
when live deployment, not merely a local build, proves each result.

### 5.1 Correct Git provenance in the generated catalog

**Problem.** The catalog builder calls `git log` to determine `createdAt`,
`lastModified`, and `commitSha`. GitHub Pages checks out only the triggering
commit, so every `SKILL.md` appears to have been created and modified by the
deployment commit. This is false public provenance and corrupts the Activity,
detail, sort, and evidence-freshness experience.

**Required implementation.**

1. Set `fetch-depth: 0` on the Pages checkout step in
   `.github/workflows/deploy-pages.yml`.
2. Before catalog generation, fail the Pages build if Git reports a shallow
   repository. The error must say that per-file provenance cannot be generated
   from a shallow clone.
3. Remove the builder's fallback that substitutes the current source commit
   when a per-file commit cannot be found. Report `null` and render
   “Unavailable” instead. A plausible wrong commit is worse than an explicit
   unknown.
4. Keep `git log --follow` for `createdAt`; use the newest path-specific commit
   for `lastModified` and `commitSha`.
5. Add deterministic checks that compare five fixed, historically distinct
   `SKILL.md` paths against direct `git log` output in the same checkout.
   The test must compare both dates and commit SHA, not merely test for a
   non-null value.
6. Add an integration assertion in the deployed-build report: at least one
   known older package must have an older `createdAt` than the deployment
   commit. Do not use a blanket “all dates are distinct” assertion because a
   legitimate batch commit may change many files together.

**Acceptance evidence.** The live detail for
`okhp3-cross-tradition-compare` must no longer claim that it was created and
last modified by `98515ec`. The current catalog must contain source-backed
per-file dates and commits, or null values where Git history is truly absent.

### 5.2 Make contract inspection complete and efficient

**Problem.** The detail view uses a narrow heading parser. Many good skills,
including `okhp3-celestial-data`, organize their contract under headings such
as Scope, Workflow, Correctness notes, Security and boundaries, Bundled
resources, and Output contract. Those headings are not reliably surfaced in
the current detail and compare views. The catalog already ships a large,
flattened, non-displayable `bodyText` field, so Forge pays the payload cost
without delivering the promised inspection experience.

**Required implementation.**

1. Split catalog output into two generated static layers:

   - `data/catalog-index.json`: concise metadata required for Home, Explore,
     family pages, filtering, sorting, stacks, and basic cards.
   - `data/skills/<family>/<skill>.json`: the canonical normalized frontmatter,
     source path and provenance, section index, and full source Markdown for
     a single skill.

2. Fetch the detail payload only on a skill-detail route. Remove `bodyText`
   from the index after confirming search still uses a purposely chosen index
   field. If full-text body search remains a product requirement, generate a
   compact token index or a separate search asset; do not retain 748K of
   flattened prose by accident.
3. Render the full `SKILL.md` within a clearly labelled “Full contract” panel
   on every detail page. Render a safe Markdown subset, disable raw HTML, keep
   outbound links visible, and do not use `dangerouslySetInnerHTML` on source
   text.
4. Continue to render useful structured summary panels, but make them
   progressively enhanced rather than the sole view. Build the section map
   from common headings and preserve unknown headings in the full contract.
5. Add a stable in-page table of contents for sections that exist. Deep links
   may target a section but must retain the source skill route.
6. In Compare, suppress rows that are empty for every selected skill. Add a
   “Read full contracts” action for each compared skill. Do not present a long
   table of “Metadata pending” as though it were a meaningful comparison.

**Acceptance evidence.** A visitor can read the complete celestial-data
contract in Forge without leaving the page, while Explore's first render does
not download the full contract corpus. A detail page still exposes raw and
GitHub source links as source-of-truth exits.

### 5.3 Synchronize the project dossier from the same source

**Problem.** The live OverKill Hill page is part of the distribution center,
but currently has a 75-skill/12-family snapshot, a roadmap that calls shipped
capabilities “planned,” and maturity copy that contradicts the implementation.

**Required implementation.**

1. Generate a small public `data/project-summary.json` alongside the Forge
   catalog. Include source repository, source commit, generated timestamp,
   distribution skill count, family count, maturity counts, evidence counts,
   capability flags, Forge URL, and the current PRD/audit URL.
2. Give every field an explicit semantic meaning. `generatedAt` is a build
   snapshot time, not a live activity time. `sourceCommit` is the repository
   commit used for the snapshot.
3. Update the project dossier to consume this summary at its build time or
   runtime. If it cannot consume the summary, show a dated snapshot with a
   source-commit link and add a failing or prominent stale check to its own
   release process. Hand-typed inventory numbers are prohibited.
4. Replace the “75 public distribution skills across 12 active families” block
   with the generated current value. Do not list placeholder handling from an
   obsolete snapshot.
5. Mark Compare and build-time activity as shipped. Keep custom stack export,
   pull-request context panels, and authenticated collaboration as planned
   until they actually exist.
6. Align maturity copy: it may be explicitly declared, held back by evidence
   policy, or inferred from documented structure. The detail page exposes that
   source; the dossier must not say that inference never occurs.
7. Link family demonstrations directly to the relevant Forge family routes,
   not only to the Forge home page.
8. Keep the dossier narrative. Do not embed a second catalog or make the
   iframe the only way to discover the product.

**Acceptance evidence.** The dossier and Forge report the same source commit,
113 current skills and 15 current families for this baseline, and the same
shipped/planned capability state. The next inventory change updates both
surfaces without manual copy editing.

### 5.4 Eliminate future deploy-trigger drift

**Problem.** The current explicit 15-family path allowlist is complete today,
but it remains a manual list that can drift when a sixteenth family is added.

**Required implementation.** Replace the family allowlist with a safe,
path-independent trigger set covering `**/SKILL.md` and `**/FAMILY.md`, plus
`forge/**`, manifest, `AGENTS.md`, and the workflow itself. Exclude irrelevant
generated or private paths only when there is a demonstrated need. Add a test
that documents the intended trigger policy rather than checking a manually
duplicated list.

**Acceptance evidence.** A new top-level family with a `FAMILY.md` and a
`SKILL.md` would trigger Pages without a workflow edit.

## 6. Release 1: semantic integrity and decision-quality UX

Release 1 starts after Release 0 is live.

### 6.1 Repair the evidence-v2 fallback semantics

The current fine-grained evidence field correctly distinguishes `none` from
`not-run`. The v2 field maps 83 skills to `not-run`, including packages with
no evaluation design. That makes “no evidence record” look like “an
evaluation exists but was not executed,” which is not the documented meaning
of `not-run`.

Before changing code, record an owner-approved vocabulary decision. The
recommended decision is to add `none` or `unknown` to v2 and retain the
original seven-value field unchanged for compatibility. If the four-value v2
union must remain, add a separate `hasEvaluationDesign` boolean and render the
absence of a design plainly. In either case:

- `not-run` requires an actual evaluation design.
- `historical` requires a version-mismatched executed run.
- `live` requires a current version, run provenance, and evaluation date.
- `analytical` means structural, fixture, or design evidence only.
- no evidence record must never be made to sound like an unexecuted test.

Update the types, builder, detail copy, filters, FAQ, project-summary
definitions, and tests together. Do not silently relabel old data.

### 6.2 Make the maturity policy enforce its own public definitions

The current synthetic test allows a `validated` claim to stand if only a test
artifact exists. This conflicts with the published definition that validation
requires current version-matched benchmark evidence and a protected or
external check. The risk is future maturity inflation, even though no current
skill is affected.

Define an explicit capability matrix and test it:

| Maturity claim | Minimum evidence policy |
|---|---|
| placeholder, skeleton, draftable | Structure only; no automatic promotion. |
| usable | Documented comparable run with scoped limits. |
| validated | Current version-matched graded evidence, required review decision, and protected or external check. |
| published | Validated evidence plus release record, catalog synchronization, and owner/provenance requirements. |

If an asserted maturity fails its gate, show the held-back effective maturity,
the source of the claim, and a plain promotion blocker. It must never be
silently upgraded. Replace tests that codify the weaker behavior.

### 6.3 Improve selection before search

Add a “Start with the work” entry point to Explore. It should be a compact,
optional decision aid, not an artificial chatbot:

1. Ask for outcome type: create, analyze, document, transform, validate,
   publish, or maintain.
2. Ask for working context: individual artifact, process, repository,
   data, visual diagram, AI-thread context, or domain-specific work.
3. Return a small, explainable recommended set drawn from existing triggers,
   categories, family routing rules, and curated stacks.
4. State why each result matched and include the ordinary filters and search
   result path. The aid must never fabricate compatibility or maturity.

This turns the catalog from “a well-styled directory” into a distribution
center that helps a user make the first decision.

### 6.4 Upgrade family pages from partial narrative to useful orientation

Nine families currently have no narrative body to display. Do not invent
marketing prose from a directory name. Extend the family data contract with
optional source-authored fields such as purpose, first skill, common outcomes,
composition notes, and maintained stacks. Require a family page to render an
honest generated summary when no authored narrative exists.

Fix the detail breadcrumb so its family segment links to
`/families/:family`, while preserving a separate “browse this family” action
that opens the filtered Explore route.

### 6.5 Make comparison a decision tool

Keep the two-to-four-skill limit and shareable URL. Improve the result by:

- showing evidence note, evaluation/version freshness, release readiness, and
  promotion blockers beside maturity;
- hiding rows empty for all selected skills;
- using a responsive card layout below the table breakpoint;
- allowing a visitor to compare specific full-contract sections side by side;
- making provenance links point to the skill's actual last modifying commit
  after Release 0, not the deploy commit.

## 7. Release 2: composition and repository handoff

### 7.1 Local stack composer

The catalog already supports favorites, curated stacks, companions, and
comparison. Deliver the next logical capability: a local-only stack composer.

It must let a visitor:

- add one to eight skills from a result, detail, family, or compare view;
- order the skills and mark a step optional;
- show declared prerequisite and companion relationships, unresolved names,
  duplicate skills, and evident ordering guidance;
- add a short local purpose note stored only in browser storage;
- export a Markdown brief and JSON manifest containing skill names, raw URLs,
  source commit snapshot, order, and warnings;
- copy an installation-oriented handoff without claiming the resulting stack
  has been runtime-tested.

It must not execute skills, combine their instructions into a fabricated
super-prompt, upload a workspace, or imply that co-listed skills are
automatically compatible.

### 7.2 Repository activity that answers real questions

Current activity provides a useful build-time commit snapshot. Extend it, still
read-only and build-time, to include bounded public GitHub issue and pull
request metadata: title, state, URL, labels, updated date, and scope if one is
available. The UI must label it “Snapshot generated at [time] from [commit]”
and provide a GitHub exit for live status. If GitHub API retrieval fails, show
the failure state and direct link rather than stale cached data presented as
fresh.

Do not add authentication or write operations in this release.

### 7.3 Contribution handoff with context

On a detail page, generate a prefilled GitHub issue URL that includes the
skill path, deployed source commit, maturity, evidence state, and a concise
template for expected versus observed behavior. It must remain an external
GitHub action. Do not send data automatically or create an issue in Forge.

## 8. Experience, accessibility, and performance requirements

Every release must preserve the current branded editorial visual language.
The design should gain clarity and calm, not more dashboard density.

- Test Home, Explore, filter drawer, detail, full contract, family, Compare,
  Stacks, Activity, FAQ, Contribute, and composer at 390px, 768px, and a
  desktop viewport.
- Complete a keyboard-only path through navigation, filters, sort, search,
  card actions, detail table of contents, comparison, and composer. Focus must
  remain visible and never be obscured by fixed navigation.
- Do not rely on color for evidence, maturity, stale-warning, or validation
  state.
- Keep `aria-live` result counts and provide clear loading, no-results, and
  catalog-fetch failure states.
- Validate clipboard actions with a visible success or failure message.
- Set a performance budget for the catalog index and detail payload. Report
  compressed sizes and first meaningful content timing before and after the
  split. The full contract corpus must not be a first-route requirement.
- Preserve source URLs and static caching. Use cache-busting or immutable
  content hashes only when they are compatible with the Pages deployment
  model.

## 9. Implementation order

### Phase 0: preflight and baseline

1. Read `AGENTS.md`, `docs/SECURITY.md`, `docs/PUBLISHING.md`, this PRD, and
   the two earlier Forge PRDs.
2. Record branch, clean/dirty state, `main` SHA, and any Replit checkpoint or
   worktree divergence. Do not merge or delete Replit branches without owner
   authorization.
3. Capture live Forge and project-dossier baseline evidence, including the
   visible counts, one historical skill, one live skill, Compare, and Activity.
4. Run the existing catalog check, Foundry structural validator, Forge tests,
   TypeScript check, and production build.

### Phase 1: Release 0

1. Fix full-history checkout and provenance builder behavior.
2. Add provenance tests and deploy to Pages.
3. Verify the live generated catalog before continuing.
4. Split catalog index and per-skill detail payloads.
5. Implement safe full-contract rendering and comparison cleanup.
6. Publish `project-summary.json` and synchronize the project dossier.
7. Replace the manual deploy family allowlist with the path-independent
   policy and test it.

### Phase 2: Release 1

1. Make and document the evidence-v2 vocabulary decision.
2. Correct maturity-policy gates and all related tests.
3. Implement outcome-first discovery.
4. Complete family orientation and breadcrumb routing.
5. Upgrade responsive comparison.

### Phase 3: Release 2

1. Build local stack composition and export.
2. Add bounded activity context and contribution handoff.
3. Perform accessibility, mobile, performance, and live deployment QA.

## 10. Required validation and delivery evidence

Run the repository validators appropriate to the changed scope. At minimum,
from the repository root:

```powershell
py .agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py --full --no-absorb-readme --check
node universal/okhp3-skill-foundry/scripts/validate-skill-suite.cjs --root .
pnpm --dir forge test
pnpm --dir forge exec tsc --noEmit
pnpm --dir forge run build
```

Add focused tests for:

- exact per-file provenance against Git history in the same checkout;
- failure on shallow Pages history;
- catalog-index/detail-payload schema and safe failure handling;
- complete full-contract availability for every catalog item;
- no-evidence versus not-run semantics;
- maturity-policy downgrade conditions;
- project-summary count and commit equality with the catalog;
- source-independent Pages triggering for a new family fixture or policy
  assertion;
- responsive Compare behavior and stack-export contents.

The final implementation report must include:

1. Deployed commit SHA, Pages run URL, and live Forge `sourceCommit`.
2. The project-dossier summary commit and count, or the reason that surface
   was out of scope.
3. A release-by-release table of completed, deferred, and blocked requirements.
4. Validator and browser QA results, including 390px and keyboard testing.
5. A small claim ledger separating confirmed facts, inferences, proposals, and
   remaining unknowns.
6. Known limitations. A passing structural build is not a claim that all 113
   skills are validated or production-ready.

## 11. Release gates

Release 0 may ship only when all conditions are true:

- live per-skill provenance is correct or transparently unavailable;
- every skill has an in-app full-contract path;
- the project dossier no longer has stale count or shipped/planned drift;
- a future family edit cannot silently miss a Pages deployment;
- no maturity or evidence label was inflated.

Release 1 may ship only after Release 0 and a documented evidence-v2
vocabulary decision.

Release 2 may ship only after mobile, keyboard, and no-client-secret checks
pass on the live application.

## 12. Explicit non-goals

- Do not create a benchmark executor in Forge.
- Do not declare skills usable, validated, published, or production-safe as a
  side effect of UI work.
- Do not build user accounts, private repository access, client-side tokens,
  or GitHub write flows.
- Do not replace Forge with a landing page, screenshot, or generic marketplace.
- Do not hand-edit catalog counts or duplicate repository content in the
  project dossier.
- Do not add employer-specific, confidential, or personal information to the
  public surfaces or test fixtures.

## 13. Owner decisions required before Phase 2

These choices are intentionally not inferred by the implementer:

1. Approve the recommended v2 `none` or `unknown` evidence state, or approve
   a different compatibility design that preserves the meaning of `not-run`.
2. Confirm whether the OverKill Hill project-page source is in the current
   Replit scope. If not, deliver `project-summary.json`, a precise integration
   guide, and the required replacement copy as a separately reviewable
   handoff.
3. Decide whether full-contract search should index all source prose or stay
   focused on normalized metadata, descriptions, headings, and curated terms.
   The recommended default is focused search plus full contract reading, to
   preserve relevance and initial-load performance.
