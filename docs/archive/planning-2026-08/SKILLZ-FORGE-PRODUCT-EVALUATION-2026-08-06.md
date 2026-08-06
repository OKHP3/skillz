# Skillz Forge Product Evaluation

**Status:** Evidence-based second-opinion review. Not a release approval.

**Date:** 2026-08-06

**Review scope:** Skillz Forge source, its deployed GitHub Pages application,
the OverKill Hill Skillz project highlight page, and the linked public GitHub
project-page source. The Replit project URLs required authentication and were
not inspected beyond their login redirect.

**Decision:** The product is a capable M3 decision workbench, but it is not
yet a trustworthy distribution center or a release-ready v1 public product.

## 1. Evidence and limits

### Confirmed this review

- The Forge catalog contains 113 distribution skills in 15 active families.
- The deployed Forge supports discovery, filtering, sorting, family pages,
  comparison, curated stacks, full in-app contract reading, GitHub handoff,
  local stack composition, and local Markdown or JSON export.
- The local build, type check, catalog checks, and unit tests passed on
  2026-08-06.
- The deployed Forge loaded full-contract content on demand for a sampled
  detail page, and the local composer added, reordered, removed, and suggested
  declared companions during a live browser review.
- The live `overkillhill.com/projects/skillz/` page was byte-identical to
  `OKHP3/OverKill-Hill` `projects/skillz/index.html` when retrieved.

### Not confirmed

- Replit's private project/file state. The supplied URLs redirected to login.
- Production behavior outside the exercised browser journeys.
- A public release tag or owner-approved release gate.
- Legal sufficiency of the analytics and privacy posture.

## 2. Reconstructed product vision

Skillz Forge is intended to be a public, source-backed distribution and
decision hub for reusable `SKILL.md` delegation contracts. It should let a
visitor begin with an outcome, locate a relevant skill or curated workflow,
inspect its scope and evidence, compose a bounded local stack if useful, and
move to the appropriate next action in a compatible agent runtime or GitHub.

Forge is not intended to be a hosted agent runtime, a marketplace, a backend
service, or a replacement for GitHub. GitHub is the canonical source for
installable artifacts, history, issues, pull requests, and discussion. Forge
is the generated, user-facing discovery and decision layer.

## 3. Current product assessment

### What works

1. **Discovery and inspection.** Search, family browsing, maturity/evidence
   filters, sorting, curated stacks, and compare give the library a useful
   decision surface.
2. **Full-contract reading.** Detail pages fetch the complete skill contract
   only when opened, render a safe Markdown subset, retain raw/source links,
   and expose provenance and release fields.
3. **Local composition.** The browser-only composer can collect up to eight
   skills, preserve order and notes, mark optional items, expose declared
   companions, and export a handoff without a backend or account.
4. **Technical shape.** The static React/Vite architecture is appropriate.
   Catalog, search, activity, and detail artifacts are generated from the
   repository rather than hand-maintained in the UI.
5. **Usability foundation.** The application has semantic controls, a skip
   link, visible focus styling, reduced-motion handling, responsive navigation,
   and no observed horizontal overflow at a narrow mobile viewport.

### Product strengths to preserve

- The static, GitHub-native model.
- The evidence-first data model.
- Curated stacks as the default orientation mechanism.
- Full-contract reading before action.
- Local-only composition and GitHub handoff.
- The visual identity and clear non-marketplace boundary.

## 4. Material gaps and misalignment

### P0: public product truth is inconsistent

The live Forge offers local stack composition and guided discovery, while its
generated `project-summary.json` declares both capabilities false. The public
OverKill Hill project page still claims 75 skills across 12 families, says all
skills are skeleton or draftable, and lists Compare and custom local stack
composition as planned. Current Forge data is 113 skills across 15 families
with 87 draftable, 25 skeleton, and 1 usable skill.

This is a product-integrity failure rather than merely stale copy. A
distribution center must accurately describe what it distributes and what it
can do.

### P0: deployment policy is fragile

The Pages workflow still lists each top-level family manually. A newly added
family can miss deployment without any workflow failure. Replace the allowlist
with a path-independent policy covering `**/SKILL.md` and `**/FAMILY.md`.

### P1: trust language conflicts in the interface

The sampled Mermaid Core detail page is marked `usable`, but its evidence
state is `none` and its promotion blocker says no evaluation design or
executable check exists. The repository may intentionally permit that state,
but a visitor sees a contradiction between "evidence-backed and exercised" and
"no evidence record." Reconcile maturity, evidence, readiness, blocker, FAQ,
and detail copy through one owner-approved vocabulary policy.

### P1: catalog governance is not complete

- The local build reports one unresolved companion reference.
- Ten families fall back to generated display names because their `FAMILY.md`
  files lack an explicit display name.
- Capability flags are manually maintained booleans, which caused the current
  false public summary.

### P1: interaction and accessibility refinement

The composer has `role="dialog"`, focus restoration, and Escape close, but it
does not yet behave as a full modal: no backdrop, modal isolation, focus trap,
or inert background. Add a polite live region for copy, save, compose, and
clear results. These are contained fixes, not a redesign.

### P2: performance and journey refinement

- Explore renders 113 rich cards at once. Add pagination, virtualization, or
  `content-visibility` before the library grows further.
- The hero image is roughly 1.9 MB and should become responsive WebP or AVIF.
- Home redirects a visitor to Explore after a three-second search pause. Keep
  explicit submit and use optional suggestions instead of surprise navigation.
- "Install" should be qualified as "get skill URL" or a verified
  runtime-specific use flow where no actual package installation occurs.

### Public highlight-page review

The project page's core story is strong: it explains why reusable contracts
matter, correctly distinguishes Forge from a marketplace or hosted runtime,
links to GitHub, and embeds the working application. The embedded application
is useful as an interactive preview, but it produces a page-within-a-page
experience with duplicate navigation. Keep the preview, make full-screen Forge
the primary serious-use action, and label the preview clearly.

The project page must update the inventory, current maturity snapshot, Compare
and composer roadmap statuses, and the FAQ claim that the catalog JSON is the
only external request. Forge includes GA4 and external font requests. It may
truthfully state that raw search text is not sent if that behavior remains
verified, but it must not claim that no other external requests occur.

## 5. Verdict

Forge is not a throwaway SPA and has not drifted into a collection of unrelated
features. Its core journey is coherent:

```text
Outcome -> discover -> inspect -> compare or compose -> use or contribute
```

The product should not broaden into accounts, a database, custom collaboration,
or an agent runner. The next work is trust convergence: correct public facts,
unify evidence language, harden delivery, and remove avoidable interaction
friction. Only after those gates pass should the team consider broader intent
routing or adaptive curation.

## 6. Validation record

| Check | Status | Evidence or limitation |
|---|---|---|
| Local catalog/unit/type/build checks | PASS | `pnpm test` and `pnpm build` passed in `forge/`. |
| Live Forge discovery/detail/composer/compare | PASS | Exercised in the deployed application. |
| Public-page source matches live page | PASS | Retrieved source and live page had the same SHA-256 digest. |
| Public narrative matches deployed Forge | FAIL | Counts and roadmap status are materially stale. |
| Generated summary matches deployed Forge | FAIL | Composer and guided discovery are live but declared false. |
| Replit private project state | BLOCKED | Login redirect; no authenticated inspection was attempted. |
| Privacy/legal compliance | NOT RUN | Requires an owner-approved legal and analytics review. |

## 7. Next action

Adopt or amend `docs/PRD-SKILLZ-FORGE-NEXT-PHASE-2026-08-06.md` before treating
it as the active delivery directive. Phase 0 of that document must be
live-verified before any feature expansion.
