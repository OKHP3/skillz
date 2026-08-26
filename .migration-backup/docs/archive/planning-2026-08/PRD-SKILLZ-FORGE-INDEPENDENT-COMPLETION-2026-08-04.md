# PRD: Skillz Forge independent completion directive

**Status:** Proposed build directive following independent review  
**Date:** 2026-08-04  
**Product:** Skillz Forge, its generated distribution assets, and the OverKill Hill project dossier  
**Canonical repository:** `OKHP3/skillz`  
**Forge:** `https://okhp3.github.io/skillz/`  
**Dossier:** `https://overkillhill.com/projects/skillz/`

## 1. Executive verdict

**Decision: approve the Forge foundation with material limits; do not restart or
redesign it.**

The current Forge is a credible, distinctive discovery application, and it is
meaningfully more than a static single-page brochure. It has a generated
113-skill, 15-family catalog; task search; family pages; maturity, evidence,
and release-readiness filtering; detail pages; curated stacks; comparison;
local saving; source and raw-file handoff; and a build-time GitHub activity
snapshot. Its visual system is coherent, the responsive Explore surface works
at 390px in this review, and the local build and tests pass.

It is not yet complete as a trustworthy **distribution center**. The gap is
not visual polish. The gap is the visitor's decision journey:

```text
Need an outcome
  -> find a candidate capability
  -> understand its actual contract and current evidence
  -> compare or compose a small, compatible set
  -> install or contribute through GitHub with correct provenance
```

Discovery is strong. Inspection, public truth, and composition are incomplete.
The next work must repair those layers before adding speculative integrations
or another visual treatment.

## 2. Review scope and evidence posture

This directive reviewed:

- the repository's public-surface, publishing, maturity, and prior Forge PRDs;
- the linked Notion `skillz` page and its historical roadmap entries;
- current Forge source under `forge/` and its Pages workflow;
- the live Forge and OverKill Hill dossier;
- the live `data/catalog.json` and `data/activity.json` assets;
- current catalog, structural-validator, test, type-check, and production-build
  results.

Evidence categories used here:

| Tier | Meaning in this directive |
|---|---|
| Confirmed | Directly observed in current source, a local check, or a deployed surface. |
| Inferred | Strong conclusion from confirmed evidence; test again if the implementation changes. |
| Proposal | An intentional product choice for the next implementation cycle. |
| Unknown | Not tested in this review. Do not report as complete. |

### Confirmed baseline

| Claim | Evidence | Consequence |
|---|---|---|
| Forge is a real discovery product, not a mockup. | Live routes and source implement Explore, family detail, stacks, compare, FAQ, contribution, and activity. | Preserve these capabilities; do not replace them with a simpler landing page. |
| The live Forge catalog has 113 skills across 15 families. | Live home page and `data/catalog.json` at source commit `98515ec`. | Any public count that differs is stale. |
| The dossier is stale. | Live dossier says “75 public distribution skills across 12 active families” and labels Compare planned; live Forge has 113/15 and Compare. | The public story is internally contradictory. |
| Per-skill live provenance is false. | All 113 deployed entries have `createdAt` and `lastModified` equal to `2026-08-04T18:33:01Z`. | Detail, sort, evidence-freshness, and recent-skill claims cannot be trusted. |
| Full contracts are not readable inside Forge. | A representative live skill page has structured panels and raw/GitHub exits, but no Full Contract panel. | “Inspect before relying” currently requires leaving the product. |
| The catalog index carries the whole flattened contract corpus. | Current generated catalog is about 1.11 MB and includes `bodyText` for every skill. | First catalog load transfers data the list experience does not display. |
| Existing mechanical checks pass. | Catalog check, recursive 131-package validator, 19 catalog tests, 5 unit tests, TypeScript compilation, and Vite production build passed in this review. | The product is mechanically stable, but this is not proof of product completeness. |
| Build-time commit activity is now real. | Live `data/activity.json` lists actual commits with SHA, author, date, and GitHub URL. | Preserve it as a snapshot, clearly distinguished from live activity. |

### Important limits

- No end-user installation was exercised against every supported agent runtime.
- No full keyboard-only pass or cross-browser matrix was run.
- No user research or conversion data was available.
- No authenticated GitHub workflow, account model, backend, or client secret is
  authorized by this directive.

## 3. Product definition to preserve

Skillz is the portable execution-contract layer of the OverKill Hill Visual
Language Stack.

| Surface | Job | Source of truth |
|---|---|---|
| GitHub repository | Installable files, commit history, issues, pull requests, releases | GitHub |
| Skillz Forge | Generated discovery, inspection, decision support, and handoff | Generated repository data |
| OverKill Hill dossier | Narrative positioning, strategy, and current capability summary | Generated Forge project summary plus maintained narrative |
| Notion | Strategy, decision history, working roadmap, and contextual rationale | Notion, but not current inventory facts |

Forge remains static, read-only, browser-first, and repository-backed. It must
not become a shadow GitHub, a generic chatbot, or a marketplace with claims
that outstrip the evidence.

## 4. What Replit has already achieved

Do not spend the next budget redoing these shipped pieces.

1. **Generated catalog foundation.** The app reads a static JSON asset at
   runtime rather than shipping the catalog as a JavaScript module.
2. **Discovery.** Explore supports free-text task search, family, maturity,
   evidence, and release-readiness filters; relevant sorts; shareable filter
   URLs; result cards; and source handoff.
3. **Evidence-aware presentation.** The UI visibly separates maturity from
   evidence and warns when evidence evaluates a prior package version.
4. **Product-level navigation.** Individual skill routes, family pages,
   curated stacks, comparison, FAQ, contribution handoff, theme controls, and
   activity all exist as coherent routes.
5. **Presentation quality.** The visual identity is distinctive and legible;
   the 390px Explore review showed a functioning mobile drawer and no console
   warnings/errors in the inspected routes.
6. **Build hygiene.** The build script, catalog tests, unit tests, and Pages
   workflow are materially more mature than a typical first SPA pass.
7. **Read-only activity.** Build-time GitHub commit data is a useful bounded
   step toward repository transparency without requiring a client credential.

## 5. Material gaps and their priority

| Priority | Gap | Why it matters | Required outcome |
|---|---|---|---|
| P0 | Per-skill Git provenance is fabricated by a shallow Pages checkout. | It makes real history look like deployment time and corrupts trust signals. | Source-backed dates/commits or explicit Unavailable values. |
| P0 | Dossier and Forge contradict one another. | A visitor cannot know which surface represents current capability. | One generated summary contract feeds public counts and capability flags. |
| P0 | The product promises inspection but does not render the complete contract. | The visitor must leave Forge to evaluate a skill safely. | Safe in-app Full Contract reading on every detail page. |
| P1 | The list index includes all flattened contract text. | It imposes unnecessary transfer/parse cost without enabling full inspection. | Compact index plus per-skill lazy detail assets. |
| P1 | Evidence v2 calls 83 items `not-run`, including items with no evaluation design. | “No evidence” is materially different from “an evaluation has not run.” | Explicit `none`/`unknown`, or a separate design flag with honest copy. |
| P1 | Maturity policy tests are weaker than public definitions. | Future metadata could inflate validated/published claims. | Enforced capability matrix and held-back effective maturity. |
| P1 | Compare is a metadata table, not yet a confident choice tool. | It hides important evidence and shows too many empty fields. | Decision-focused comparison with full-contract exits. |
| P2 | Forge begins with search, not guided selection. | New visitors may not know the family vocabulary or how to start. | Optional, explainable “Start with the work” aid. |
| P2 | Curated stacks exist but visitors cannot make and export their own. | Composition is part of the product promise. | Local-only stack composer and Markdown/JSON handoff. |
| P2 | Family context is partially authored. | Several family pages fall back to generic auto-summary. | Source-authored family orientation or an explicitly generated fallback. |
| P2 | Deployment triggers use a manual family list. | A new family can be added without automatically deploying Forge updates. | Path-independent trigger policy and a test for it. |

## 6. Non-goals

This directive explicitly does **not** authorize:

- an application rewrite, framework migration, or new visual identity;
- a backend, account system, database, serverless function, OAuth flow, or
  write-scoped GitHub credential;
- a benchmark executor in the static SPA;
- an automatic maturity or evidence promotion for any skill;
- a second hand-maintained catalog;
- replacing GitHub issues, pull requests, or discussions with custom forms;
- client-side scraping, credential storage, or unreviewed external content.

## 7. Release 0 — restore public truth (P0)

Release 0 is a release gate. Do not begin functional expansion until it is
deployed and confirmed from the live URLs.

### 7.1 Correct per-skill provenance

**Problem.** The catalog builder uses Git history, but Pages currently checks
out a shallow repository. The deployed catalog therefore assigns the same
deployment timestamp and commit to every skill.

**Build directive.**

1. Set `fetch-depth: 0` for the Pages checkout.
2. Before catalog generation, fail if the repository is shallow and the build
   is about to publish per-file history.
3. Keep `git log --follow` for `createdAt`; use the newest path-specific commit
   for `lastModified` and `commitSha`.
4. Remove the fallback that replaces a missing per-file commit with the
   repository source commit. Output `null`; render `Unavailable`.
5. Add deterministic fixtures for at least five historically distinct
   `SKILL.md` paths. Compare builder output to direct Git commands for date and
   SHA in the same checkout.
6. Add a deployed-artifact assertion: at least one established skill must have
   a creation date earlier than the deployment commit. Do not require every
   date to be unique.

**Acceptance.** The live `okhp3-cross-tradition-compare` detail route does not
claim creation/modification on the deployment timestamp, and an unavailable
history state is visibly honest.

### 7.2 Generate one project-summary contract

Create `forge/public/data/project-summary.json` from the same catalog build.
It must contain:

```json
{
  "sourceRepository": "…",
  "sourceCommit": "…",
  "generatedAt": "…",
  "skillCount": 113,
  "familyCount": 15,
  "maturityCounts": {},
  "evidenceCounts": {},
  "capabilities": {
    "search": true,
    "familyPages": true,
    "compare": true,
    "curatedStacks": true,
    "localStackComposer": false,
    "buildTimeActivity": true,
    "fullContractReading": false
  },
  "forgeUrl": "…",
  "reviewUrl": "…"
}
```

Definitions are mandatory:

- `generatedAt` is a build snapshot time, never an activity time.
- `sourceCommit` is the repository input to that snapshot.
- capability flags describe deployed behavior, not roadmap intent.

Update the dossier to consume the summary during its own build, or place a
dated snapshot plus source-commit link under a hard stale-check. Do not
manually retype inventory numbers. Mark Compare and build-time activity
shipped. Keep stack composition and authenticated collaboration planned until
they exist.

**External dependency.** If the dossier is maintained in another repository,
generate this artifact and a documented consumption contract first. Do not
silently edit another repository without its owner-approved workflow.

### 7.3 Correct the deploy trigger policy

Replace the per-family allowlist with a path-independent policy covering:

```text
forge/**
**/SKILL.md
**/FAMILY.md
skillz.manifest.json
AGENTS.md
.github/workflows/deploy-pages.yml
```

Use narrower exclusions only with a demonstrated false-positive cost. Add a
test describing the intended policy so a sixteenth family deploys without a
workflow edit.

## 8. Release 1 — complete contract inspection and integrity (P1)

### 8.1 Split the catalog into an index and lazy detail assets

Generate:

```text
data/catalog-index.json
data/skills/<family>/<skill>.json
data/project-summary.json
data/activity.json
```

The index carries only what Home, Explore, family pages, filters, sorting,
stacks, comparison summaries, and search require. It must exclude `bodyText`
and complete source Markdown.

Each skill detail asset must contain:

- normalized frontmatter and source paths;
- source-backed provenance;
- section index;
- structured extraction for progressively enhanced summary panels;
- full raw `SKILL.md` source;
- source and raw GitHub URLs.

Detail routes fetch their asset only after routing to a skill. Preserve an
obvious loading and error state. If full-text body search is kept, create an
explicit compact search index; do not retain the full body corpus in the list
payload as an accidental side effect.

### 8.2 Render the complete contract safely

Every detail route needs a clearly labelled **Full contract** section:

- safe Markdown subset only;
- raw HTML disabled;
- outbound links rendered visibly and safely;
- section anchors and a stable table of contents where headings exist;
- unknown headings preserved rather than dropped;
- a raw-source and GitHub exit retained as the canonical source-of-truth path.

The structured panels remain useful summaries, not a substitute for a contract.
The completed product must let a visitor read the full
`okhp3-celestial-data` contract without leaving Forge.

### 8.3 Reconcile evidence vocabulary honestly

Owner decision required before implementation:

**Recommended:** expand the v2 status to include `none`.

```ts
type EvidenceStatusV2 =
  | 'none'
  | 'not-run'
  | 'analytical'
  | 'historical'
  | 'live';
```

Rules:

- `none`: no evaluation design or executable evidence artifact exists.
- `not-run`: an actual evaluation design exists but no relevant run is
  recorded.
- `analytical`: static, structural, fixture, script, or manual review only.
- `historical`: an executed result evaluates an older package version.
- `live`: a current-version executed result with date and provenance.

Retain the existing seven-value evidence field until a separately approved
migration, because it is already visible in filtering and historical records.
Do not silently collapse, relabel, or retroactively improve evidence.

### 8.4 Enforce maturity gates in code

Implement the public capability matrix as executable policy:

| Effective maturity | Minimum requirement |
|---|---|
| Placeholder, skeleton, draftable | Contract structure only; no automatic promotion. |
| Usable | Documented comparable current-version use with explicit limits. |
| Validated | Current version-matched graded evidence, formal review decision, and protected or external check. |
| Published | Validated evidence, release record, synchronized catalog, and identified owner/provenance. |

When an asserted maturity lacks its gate, render the held-back effective
maturity, source of the original claim, and concrete blocker. Tests must prove
that a test file alone cannot satisfy `validated` or `published`.

### 8.5 Turn Compare into a decision surface

Keep the two-to-four skill constraint and shareable URL. Add:

- evidence note, evaluated-version freshness, release readiness, and promotion
  blockers beside maturity;
- suppression of rows empty for every selected skill;
- mobile card rendering instead of an unreadably horizontal table;
- explicit links to each full contract;
- actual last-modifying commit links after Release 0;
- a concise "how to choose" summary that states the observable differences,
  never an unsupported recommendation.

## 9. Release 2 — make discovery and composition feel intentional (P2)

### 9.1 Start with the work

Add an optional decision aid above ordinary filters. It must be explainable,
skippable, and deterministic:

1. Outcome: create, analyze, document, transform, validate, publish, or
   maintain.
2. Working context: artifact, process, repository, data, diagram, AI-thread
   context, or domain-specific work.
3. Return a compact recommended set using existing categories, triggers,
   routing rules, and curated stacks.
4. State why each candidate matched and offer the normal Explore result path.

This is not a chat assistant and must not fabricate compatibility, evidence,
or maturity.

### 9.2 Local stack composer

Build a browser-only stack composer, stored in versioned local storage.

It must let a visitor:

- add one to eight skills from Explore, detail, family, stacks, or Compare;
- order skills and mark an entry optional;
- add a short local purpose note;
- surface declared companions/prerequisites, unresolved companion names,
  duplicates, and evident ordering guidance;
- export a Markdown brief and JSON manifest with names, raw URLs, commit/source
  context, optional flags, and the local note;
- clear all local data explicitly.

It must not claim that it installs anything, validates a workflow, or resolves
dependencies the repository has not declared.

### 9.3 Family orientation

Extend family source data with author-controlled purpose, common outcomes,
first skill, composition notes, and maintained-stack references. When no
authored narrative exists, render a deliberately labelled generated summary;
do not invent marketing prose. Link skill breadcrumbs to their family page and
retain a separate filtered Explore action.

### 9.4 Contribution handoff

Improve the existing GitHub exit without creating an internal issue tracker:

- from a skill: source, raw source, commit history, issue prefill, and a
  contribution expectation;
- from a stack: a generated Markdown context brief suitable for a GitHub issue
  or discussion;
- from activity: current snapshot provenance and direct native GitHub links.

## 10. Experience, accessibility, and performance requirements

- Keep the current visual language, theme controls, distinct typography, and
  responsive drawer behavior.
- Add a skip link and preserve heading hierarchy.
- Use `:focus-visible` for the input's enhanced keyboard ring; do not rely on
  a mouse-focus state as the accessibility signal.
- Ensure every search field has an associated name and `autocomplete="off"`.
- Keep explicit image dimensions and reduced-motion behavior.
- Render large lists with `content-visibility: auto`, pagination, or
  virtualization once detail-rich card content makes 113 list items costly.
- Test text wrapping for long skill names, package paths, URLs, evidence notes,
  and brand names.
- Preserve URL state for filters, sorts, comparison, and any future composer
  state that a visitor might reasonably want to share.
- Verify desktop and 390px views, keyboard navigation, focus visibility, and
  error/loading states for Home, Explore, detail, Compare, stacks, Activity,
  and contribution.

## 11. Implementation order

### Phase 0 — preflight and freeze

1. Compare Replit checkout, local `main`, GitHub `main`, and live Pages source
   commit. Report differences before editing.
2. Preserve unrelated work and do not overwrite unmerged branches.
3. Record current baseline URLs, catalog counts, payload size, and screenshots.
4. Run existing validators before modification.

### Phase 1 — Release 0: truth

1. Full-history checkout plus provenance fail-closed behavior.
2. Deterministic provenance tests.
3. `project-summary.json` and dossier consumption contract.
4. Path-independent deployment trigger policy.
5. Deploy, then verify the **live** assets and dossier.

### Phase 2 — Release 1: inspection and integrity

1. Index/detail asset split.
2. Full-contract renderer and table of contents.
3. Evidence-vocabulary decision and data-model migration.
4. Maturity-policy capability matrix and tests.
5. Compare decision experience.
6. Deploy and validate live payload size, lazy loading, and contract reading.

### Phase 3 — Release 2: decision support and composition

1. Start-with-the-work aid.
2. Local stack composer and export.
3. Family orientation improvements.
4. Contribution handoff refinements.
5. End-to-end browser QA.

## 12. Required validation and delivery evidence

Run the repository's defined checks, then add the Forge-specific checks below.

```text
py .agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py --full --check
node universal/okhp3-skill-foundry/scripts/validate-skill-suite.cjs --root .
cd forge && pnpm test
cd forge && pnpm build
```

Also provide:

1. A deployed-source proof: live `catalog-index.json`, a sampled detail asset,
   activity asset, and project summary cite the expected source commit.
2. A provenance proof: five sampled skills match direct Git history, including
   one older skill and one recent skill.
3. A payload proof: index transfer size before/after and confirmation that a
   detail asset is not requested on Home/Explore first render.
4. A truth proof: dossier count, Forge count, summary count, and capability
   flags agree.
5. A browser QA matrix for desktop and 390px widths with screenshots of:
   Home; filtered Explore; Full Contract; Compare with two skills; local stack
   composer; Activity; and a keyboard-visible focus state.
6. No relevant browser console errors or warnings in the tested journeys.
7. An evidence ledger labelling each acceptance item as Confirmed, Inferred,
   Proposal, Unknown, or Blocked.

## 13. Release gates

### Release 0 gate

- [ ] Live per-skill provenance is source-backed or explicitly unavailable.
- [ ] Live dossier and Forge agree on count, commit, and shipped/planned state.
- [ ] New family files automatically trigger Pages without manual allowlisting.

### Release 1 gate

- [ ] Explore no longer downloads complete contract text by default.
- [ ] Every skill page renders a safe full contract inside Forge.
- [ ] `none` versus `not-run` is truthful and test-covered.
- [ ] Maturity gates cannot be satisfied by insufficient artifacts.
- [ ] Compare helps choose between two skills at mobile and desktop widths.

### Release 2 gate

- [ ] A first-time visitor can receive an explainable starting set without
  knowing family names.
- [ ] A visitor can compose and export a local stack without an account.
- [ ] Family and contribution paths preserve the GitHub-first architecture.

## 14. Owner decisions needed before Phase 2

1. Approve `none` as a fifth v2 evidence state, or choose the alternative
   `hasEvaluationDesign` model.
2. Confirm the approved source/build path for the OverKill Hill dossier.
3. Select a safe Markdown renderer and sanitization posture for bundled skill
   source. Raw HTML must remain disabled.
4. Confirm whether full-text search is a product requirement. If yes, approve
   a compact explicit search index; if no, limit search to intentional metadata
   and summaries.
5. Confirm whether the local composer should export Markdown only, or both
   Markdown and JSON as specified here.

## 15. Final instruction to the implementer

Treat the existing Forge as valuable product work. Preserve the distinctive
visual system and working catalog flows. Spend the next effort on making each
visitor-facing claim inspectable and true, then make discovery and composition
feel as deliberate as the repository's skill contracts themselves.

Do not report a local build as a deployed fix. Do not report a structural
artifact as evidence of a skill's behavioral maturity. Do not fill missing
provenance, contracts, or evidence with plausible defaults.
