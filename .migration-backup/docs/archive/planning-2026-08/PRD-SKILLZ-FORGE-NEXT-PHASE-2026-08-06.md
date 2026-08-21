# PRD: Skillz Forge Next Phase

**Status:** Proposed. Requires owner approval before it supersedes any prior
delivery directive.

**Date:** 2026-08-06

**Primary implementation surface:** `forge/`

**Product:** Static, generated distribution and decision hub for portable Agent
Skills.

## 1. Product vision

Skillz Forge lets a visitor discover, assess, compose, and act on reusable
`SKILL.md` contracts without a maintainer translating the library manually.

It is a public decision-to-action layer over a GitHub source repository:

```text
Need or outcome
-> discover a skill or curated path
-> inspect scope, limits, evidence, and source
-> compare or compose deliberately
-> use in a compatible agent runtime or continue in GitHub
```

Forge is not a hosted agent runtime, package registry, marketplace, GitHub
replacement, or authenticated collaboration platform.

## 2. Goals

1. Restore public truth across Forge, generated metadata, and the OverKill Hill
   project page.
2. Make selection criteria and evidence intelligible without overclaiming.
3. Preserve full-contract inspection and source handoff.
4. Make local stack composition transparent and accessible.
5. Keep the product static, fast, source-backed, and privacy-conscious.
6. Establish a verifiable release gate before assigning a v1 release tag.

## 3. Target users

- AI builders selecting reusable agent capabilities.
- Technical knowledge workers choosing a governed workflow.
- Developers checking a skill's source, evidence, and boundaries.
- Maintainers and contributors who need a clear GitHub handoff.
- Visitors with a task but no familiarity with the family taxonomy.

## 4. Product requirements

### 4.1 Public truth and publishing integrity

1. `project-summary.json` must be generated from the same build as the catalog
   and accurately reflect all shipped capability flags.
2. Define capability flags in one typed or declarative source and add a test
   that catches disagreement between the summary and the shipped feature set.
3. Replace the manual Pages family allowlist with a path-independent trigger
   that includes:
   - `forge/**`
   - `**/SKILL.md`
   - `**/FAMILY.md`
   - `skillz.manifest.json`
   - `AGENTS.md`
   - deployment workflow files
4. Add a test proving a hypothetical new family would trigger deployment.
5. Identify the actual build or publishing path for
   `overkillhill.com/projects/skillz/`.
6. Have the project page consume the generated summary or follow a documented,
   owner-assigned manual synchronization gate.
7. No public release claim is permitted until Forge, catalog, summary, and
   public project page agree.

### 4.2 Discovery and decision support

1. Preserve Explore search, URL-based filters, sorting, family pages, Compare,
   curated stacks, and GitHub handoff.
2. Remove Home's automatic three-second redirect after typing.
3. Retain explicit Search submit. Suggestions may be added only when they
   explain their relevance and remain skippable.
4. Treat curated stacks as the primary recommendation layer until transparent
   intent routing can provide source-backed explanations.
5. Persist a visitor's dismissal of guided discovery locally and provide an
   obvious way to reopen it.

### 4.3 Inspection and evidence

1. Retain on-demand full-contract loading and safe Markdown rendering.
2. Retain raw GitHub and repository links for every skill.
3. Write one owner-approved policy defining the relationship among maturity,
   evidence status, release readiness, and promotion blockers.
4. Ensure no visible maturity description contradicts its evidence state or
   blocker text.
5. If `usable` does not require executed evidence, revise any UI copy that
   says evidence-backed or exercised.
6. Add a single plain-language trust summary on detail pages: contract state,
   current evidence, release readiness, blockers, and source freshness.
7. Validate unresolved companion references. Either fail the build or classify
   them explicitly as known unresolved relationships.

### 4.4 Composition and handoff

1. Keep composition browser-local, account-free, and exportable.
2. Preserve order, notes, optional flags, and unresolved-item handling.
3. Explain companion suggestions only when they are declared in source.
4. Do not infer compatibility, prerequisites, or conflicts from names or
   family membership.
5. Add a local stack-integrity panel showing missing declared companions,
   unresolved references, and maturity/evidence warnings without declaring a
   stack validated.
6. Include source URL, export timestamp, caveats, and unresolved relationships
   in exported handoffs.

### 4.5 Accessibility, responsiveness, and performance

1. Upgrade the composer to a true modal dialog with a backdrop, `aria-modal`,
   focus trap, Escape/backdrop dismissal, and background inertness.
2. Announce copy, save, add, remove, and clear outcomes through a polite live
   region.
3. Maintain visible focus, semantic controls, skip links, and reduced-motion
   behavior.
4. Test the main journeys at desktop and 375 px widths.
5. Add virtualization, pagination, or `content-visibility` for rich Explore
   result cards.
6. Replace the large hero asset with responsive WebP or AVIF derivatives.

### 4.6 Privacy and analytics

1. Add a public Privacy link in Forge's footer.
2. Disclose GA4 use, the aggregate-only event model, browser-local favorites,
   composer storage, and clear-local-data instructions.
3. Verify applicable consent requirements before publishing compliance claims.
4. Do not add session replay, raw-query analytics, user profiling, accounts,
   or third-party write integrations.

## 5. Technical architecture

Maintain the current static architecture:

```text
Git source repository
-> catalog generator
-> catalog index + search index + per-skill detail JSON + activity + summary
-> GitHub Pages Forge
-> optional GitHub/runtime handoff
```

Requirements:

- GitHub remains canonical for source and collaboration.
- Catalog data remains reproducible from repository files and Git history.
- Full skill contracts remain lazy detail assets.
- The main catalog must not contain every raw contract body.
- Any new metadata field must originate in source or a documented generator
  rule, not manually authored UI data.
- Build failure is preferred to fabricated per-skill provenance or unsupported
  live-evidence claims.

## 6. Non-goals

- Backend service, account system, database, OAuth, or write-scoped GitHub
  integration.
- Agent execution inside Forge.
- A replacement for GitHub issues, pull requests, or discussions.
- A manually maintained second catalog.
- A visual identity redesign or framework migration.
- A claim that a composed stack is a validated end-to-end solution.

## 7. Acceptance criteria

| Area | Acceptance criterion |
|---|---|
| Public state | Live Forge, summary JSON, catalog counts, and public project page agree. |
| Deployment | A new family path triggers Pages without a workflow-file edit. |
| Provenance | Sampled dates and commits match direct Git history and no deployment timestamp is substituted. |
| Trust language | Every visible maturity, evidence, readiness, and blocker combination has non-contradictory copy. |
| Full contract | A visitor can read a complete skill contract without leaving Forge. |
| Composer | Users can add, order, annotate, remove, and export a local stack by keyboard and pointer. |
| Mobile | No horizontal overflow at 375 px; navigation, filters, detail actions, and composer remain usable. |
| Performance | Hero imagery is responsive and Explore has a scalable large-list strategy. |
| Privacy | Analytics and local storage are disclosed in a public notice. |

## 8. Delivery sequence

### Release 0: restore public truth

1. Correct generated capability flags.
2. Replace the manual deploy trigger policy.
3. Correct the OverKill Hill project page inventory, maturity snapshot, and
   roadmap statuses.
4. Correct the analytics/request wording.
5. Re-fetch all public surfaces and verify they agree.

### Release 1: reconcile trust and product language

1. Approve the evidence/maturity vocabulary.
2. Apply it to generator, types, Explore, Detail, Compare, FAQ, and public
   page copy.
3. Resolve the known companion and family-metadata warnings.
4. Clarify use/install actions by compatible runtime.

### Release 2: remove user-experience friction

1. Remove automatic Home search navigation.
2. Harden composer accessibility.
3. Add status announcements and mobile regression coverage.
4. Improve large-list rendering and hero-asset delivery.

### Release 3: release discipline and measured iteration

1. Publish privacy disclosure after approval.
2. Define the `v0.1.0` release gate.
3. Create a tag only after Releases 0 through 2 pass live verification.
4. Use privacy-approved aggregate signals to choose any later intent-routing or
   adaptive-curation work.

## 9. Replit implementation directive

Work in delivery order. Do not broaden scope to a backend, accounts, or a
runtime executor. Do not create a competing self-authored completion report.

For each release:

1. Inspect the relevant current source and generated output.
2. Implement the smallest coherent change.
3. Run the targeted tests plus `pnpm test` and `pnpm build` from `forge/`.
4. Deploy through the approved repository workflow.
5. Re-fetch the live Forge, its summary/catalog assets, and the public project
   page.
6. Report the exact acceptance criteria that pass, fail, or remain blocked.

Do not claim a phase complete from a local build alone.
