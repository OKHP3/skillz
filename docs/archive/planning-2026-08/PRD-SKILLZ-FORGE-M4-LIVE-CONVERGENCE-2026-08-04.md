# PRD: Skillz Forge M4 live convergence and release-readiness

**Status:** Implementation and live-verification directive  
**Date:** 2026-08-04  
**Product:** Skillz Forge, generated distribution assets, and the OverKill Hill Skillz dossier  
**Canonical repository:** `OKHP3/skillz`  
**Forge:** <https://okhp3.github.io/skillz/>  
**Dossier:** <https://overkillhill.com/projects/skillz/>

## 1. Executive decision

The original objective remains unchanged: make Skillz a reliable public
distribution center for portable agent skills, not only a browseable catalog.

The current published application is an **M3 decision workbench, 67/100**. It
has already surpassed catalog-stage requirements through task discovery,
filtering, detail routes, family pages, five curated stacks, comparison,
source/install handoff, activity, and contribution routing. Do not redesign or
rebuild those capabilities.

Replit has reported the prior PRD as complete. That statement is **unverified
for the current public release**: the published Forge still reports source
commit `98515ec`, and its catalog assigns the same modified time to every one
of the 113 skills. The Replit connector required reauthentication, so the
workspace state could not be independently inspected.

This PRD therefore changes the work model from feature construction to **live
convergence**:

1. establish exactly which completed Replit changes exist and which Git commit
   contains them;
2. deploy that candidate through the repository's Pages pipeline;
3. prove from live public assets and real user journeys that the M4 gates pass;
4. correct every public surface from the same generated source facts; and
5. hold back any claim of M4 or release readiness if the evidence is absent.

No source change, local preview, or Replit status message is an acceptance
substitute for a verified live deployment.

## 2. Product position

Skillz is the reusable execution-contract layer of the OverKill Hill Visual
Language Stack.

| Surface | Responsibility | Source of truth |
|---|---|---|
| GitHub repository | Installable `SKILL.md` files, Git history, issues, releases, pull requests | GitHub |
| Skillz Forge | Generated discovery, inspection, comparison, composition, and source handoff | Generated repository data |
| OverKill Hill dossier | Narrative positioning and current public capability summary | Generated project summary plus maintained narrative |
| Notion | Strategy, history, roadmap, and decisions | Notion, never live inventory facts |

Forge must stay static, read-only, browser-first, and repository-backed. It
must not become a shadow GitHub, a credential-bearing app, a generic chatbot,
or a manually maintained second catalog.

## 3. Evidence baseline and uncertainty

| Claim | Tier | Evidence | Required next check |
|---|---|---|---|
| The live Forge contains 113 skills across 15 families. | Confirmed | Live home and deployed `data/catalog.json`. | Recheck after the candidate deploy. |
| The live Forge contains real discovery, stacks, Compare, activity, source links, and contribution routes. | Confirmed | Live route inspection. | Preserve these routes during release validation. |
| The live catalog gives all skills one shared modified timestamp. | Confirmed | Current deployed catalog: one unique `lastModified` value across 113 entries. | Inspect the candidate's deployed catalog after Pages completes. |
| The live Forge is still built from `98515ec`. | Confirmed | Current deployed catalog's `sourceCommit`. | Compare with the intended release commit. |
| Replit completed the prior implementation PRD. | Unknown | User report; Replit app connection needs reauthentication. | Inspect the app/workspace and the resulting repository commit. |
| The prior PRD's P0 and P1 code changes are in `main`. | Unknown | No current source/deployment evidence establishes this. | Inspect `main`, action logs, and generated output. |
| The public dossier has converged. | Unknown for candidate; currently not true on live public page. | The currently observed dossier is stale. | Validate against the generated project summary after deployment. |

## 4. Success definition

The program achieves M4 only when all of the following are true in the
published public experience:

1. A visitor can discover relevant skills and inspect the complete contract
   without leaving Forge.
2. Provenance, dates, evidence, maturity, counts, and capability labels are
   source-backed or explicitly unavailable. No plausible fallback data may be
   shown as fact.
3. Forge and the OverKill Hill dossier report the same generated inventory,
   source commit, and shipped-versus-planned state.
4. Compare and curated stacks help a visitor make a bounded selection decision
   without overstating compatibility or evaluation quality.
5. A release candidate passes documented local, CI, deployed-artifact,
   responsive, keyboard, and route-level checks.

M5, a released ecosystem, is explicitly out of scope for this PRD. It requires
a separately approved usable-path quality gate and the first versioned Git
release.

## 5. Non-goals

This PRD does not authorize:

- a visual redesign, framework migration, or complete SPA rewrite;
- a backend, database, account system, OAuth flow, or write-scoped GitHub
  token;
- automatic evidence or maturity promotion for any skill;
- a custom issue tracker, pull-request system, or another manually maintained
  inventory;
- client-side credential storage, scraping, or hidden network calls; or
- an M5 release tag before the separate release-quality gate is approved.

## 6. Required delivery sequence

### Phase 0: reconcile Replit, GitHub, and deployment state

This phase is mandatory. It prevents duplicated work and establishes the
actual candidate release.

1. Reauthenticate the Replit connection and identify the exact Skillz Forge
   project, branch, and latest implementation revision.
2. Produce a reconciliation table containing, for every prior PRD requirement:
   requirement, source files changed, test added or run, Git commit, local
   result, CI result, live URL result, and status. A Replit-only result is
   `implemented locally`, not `complete`.
3. Compare the Replit revision with `origin/main`. If Replit contains work not
   in Git, move it through a reviewable Git commit. Do not copy files blindly
   and do not overwrite unrelated repository work.
4. Identify the exact source commit intended for deployment and record it in
   the release evidence artifact described in Phase 1.
5. If the public site still serves `98515ec` after the intended commit is on
   `main`, diagnose the Pages trigger or action result before starting any new
   feature work.

**Acceptance:** there is one named candidate commit and no ambiguity about
whether a PRD requirement is merely in Replit, committed to Git, built in CI,
or publicly deployed.

### Phase 1: make deployment truth self-verifying

#### 6.1 Authoritative release summary

Generate `forge/public/data/project-summary.json` during the same build that
generates the catalog. It must contain:

- `sourceRepository`, `sourceRef`, `sourceCommit`, and `generatedAt`;
- distribution `skillCount` and `familyCount`;
- maturity and evidence counts using the exact vocabulary Forge displays;
- capability flags for discovery, full-contract inspection, comparison,
  curated stacks, local composition, activity, and contribution handoff;
- the canonical Forge and repository URLs; and
- a `schemaVersion` for forward compatibility.

`generatedAt` means build snapshot time only. It is never a per-skill creation
or modification time and must be labelled accordingly in the UI.

#### 6.2 Provenance must be complete or visibly unavailable

1. Configure Pages checkout with full history using `fetch-depth: 0`.
2. Fail catalog generation if the checkout is shallow and the build would
   otherwise publish per-file Git provenance.
3. Resolve `createdAt` with file-following history and resolve `lastModified`
   plus `commitSha` from the newest path-specific commit.
4. Remove any fallback that replaces missing per-file history with the build
   commit or current clock. Emit `null` and render `Unavailable` instead.
5. Add deterministic test cases for at least five historically distinct skill
   paths. Compare generated date and SHA values to direct Git output in the
   same checkout.
6. Add a deployed-artifact check requiring a known older skill to have a
   creation date earlier than the candidate deployment commit.

#### 6.3 Make Pages triggers future-safe

Replace the manually duplicated family-directory allowlist with a safe
path-independent policy that includes all distribution `SKILL.md` and
`FAMILY.md` changes, `forge/**`, the manifest, `AGENTS.md`, and the workflow.
Document and test the policy. A future family must not require a workflow edit
simply to trigger Forge deployment.

**Acceptance:** the deployed catalog names the candidate commit, includes
real per-skill history or explicit nulls, and no longer has one synthetic date
across all skills.

### Phase 2: complete the inspect-before-rely journey

#### 6.4 Split the fast catalog from contract payloads

Keep Explore fast by creating:

- `data/catalog-index.json` for cards, filters, sorts, family pages, related
  skill routing, stacks, and intentional search fields; and
- `data/skills/<family>/<skill>.json` for one normalized contract, its section
  index, provenance, and full source Markdown.

Do not retain the entire flattened `bodyText` corpus in the Explore index by
accident. If body-level search is required, ship a deliberately designed
search index and test its behavior.

#### 6.5 Render the full contract safely

1. Add a clearly labelled **Full contract** panel to every skill detail page.
2. Lazy-load the contract only on its detail route.
3. Render a safe Markdown subset with raw HTML disabled. Do not use
   `dangerouslySetInnerHTML` for repository source text.
4. Keep existing structured summaries as an enhancement, not as a replacement
   for complete inspection.
5. Generate a section table of contents where headings exist, preserve unknown
   headings in the full contract, and support stable in-page anchors.
6. Retain raw-file and GitHub links as the canonical source exits.

**Acceptance:** a visitor can read the complete
`okhp3-celestial-data` contract in Forge without leaving the detail route, and
the initial Explore request does not download every contract.

### Phase 3: make decision support honest and useful

#### 6.6 Reconcile evidence and maturity semantics

Before modifying labels, write one owner-approved vocabulary decision for
`not run`, `no evidence record`, historical, analytical, local checks, and
live evidence. The UI, generator, filters, and Compare must use that exact
vocabulary. No evidence record must never appear as an evaluation that simply
did not run.

Encode public maturity definitions as tests. A visible `validated` or
`published` state must be supported by its required evidence, not inferred
from folder structure alone.

#### 6.7 Upgrade Compare without inventing certainty

Compare must:

- use the current evidence model and version/relevance context;
- suppress rows empty for every selected skill;
- show purpose, trigger, boundary, outputs, dependencies, evidence, maturity,
  and source links when present;
- include a direct full-contract exit for every selected skill; and
- avoid compatibility, quality, or evaluation claims the catalog cannot prove.

#### 6.8 Preserve curated stacks and make custom composition optional

The five curated stacks remain the default guidance. If the previous PRD's
local stack composer is actually implemented, verify it rather than rebuilding
it. If it is not implemented, defer it until P0 through P1 are live. Any
custom composer must be local-only, explain order and conflicts, and export a
transparent Markdown or JSON handoff. It must not claim that a generated stack
has been validated as a complete solution.

**Acceptance:** a visitor can make a better-bounded choice with Compare and
curated stacks, while every uncertain relationship remains visibly uncertain.

### Phase 4: converge the public narrative

1. Make the OverKill Hill dossier consume `project-summary.json` at build time
   or runtime. If that is technically impossible, its release process must
   fail or visibly flag stale inventory and capability data.
2. Replace manual inventory counts and planned-feature labels with generated
   summary facts.
3. Preserve the dossier's narrative role. It must link to Forge family routes,
   not duplicate Forge as a second catalog.
4. Update repository public documents and Notion only after the live release
   is verified. Historical notes may remain, but they must be clearly dated and
   superseded where necessary.

**Acceptance:** Forge and the dossier show the same candidate source commit,
the same count, the same family count, and the same shipped/planned capability
state.

## 7. Experience and quality requirements

- Preserve hash routes, deep links, Save/Share behavior, raw source URLs, and
  GitHub contribution handoff.
- Validate Home, Explore, one family, one skill, one full contract, one
  comparison, Stacks, Activity, Contribute, and FAQ at desktop and 390px.
- Validate keyboard navigation, visible focus, modal/drawer close behavior,
  and no horizontal scrolling at 390px.
- Keep static hosting. No secret, user account, or write path is permitted.
- Treat console errors, broken source links, false provenance, and public
  count divergence as release blockers.
- Do not report an unexecuted test, a local preview, or an implementation note
  as production evidence.

## 8. Required evidence package

Before declaring this PRD complete, provide a reviewable evidence package with:

1. candidate commit SHA and a link to the successful Pages run;
2. reconciliation matrix for every requirement of the prior PRD;
3. passing catalog, unit, type-check, and production-build results;
4. provenance test output and the deployed `catalog-index.json` or catalog
   excerpt showing non-synthetic history;
5. deployed `project-summary.json` and a dossier comparison screenshot or
   explicit field-by-field record;
6. route and responsive test record including the 390px keyboard pass;
7. before/after payload evidence for Explore and one detail route;
8. a list of known limitations and intentionally deferred P2 work; and
9. confirmation that no unrelated skill maturity or evidence value was
   promoted as part of this application release.

## 9. Release gates

| Gate | Required proof | Outcome if missing |
|---|---|---|
| G0: reconciliation | One candidate commit mapped to Replit, Git, CI, and live state | Do not start new feature work. |
| G1: provenance | Full-history build and live non-synthetic or explicit-null records | Remain M3. |
| G2: inspection | Lazy full-contract route works on representative skills | Remain M3. |
| G3: source convergence | Forge and dossier read the same generated facts | Do not claim trustworthy public distribution. |
| G4: decision integrity | Evidence/maturity and Compare checks pass without false claims | Hold decision-support expansion. |
| G5: experience | Desktop/mobile/keyboard validation passes without release-blocking errors | Fix before public promotion. |

M4 may be claimed only when G0 through G5 pass on the published surfaces.

## 10. Final instruction to Replit

Start by reconciling, not rewriting. If the former PRD is implemented in the
Replit workspace, make the smallest reviewable path that carries that work to
`main`, through Pages, and into live proof. If any requirement is incomplete,
repair only that requirement and its tests. Preserve working discovery,
curated stacks, comparison, source handoff, activity, and the existing visual
language.

The deliverable is not a statement that the task is done. The deliverable is a
publicly verifiable M4 candidate with an evidence package that makes the claim
auditable.
