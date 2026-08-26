# Skillz Forge Capability-Maturity Audit - 2026-08-04

## Verdict

**Forge is an M3 decision workbench, scored 67/100.** It is materially beyond
a static skill catalog, but it has not yet earned M4, a trustworthy distribution
center.

This is an assessment of the published Forge application and its distribution
behavior. It is deliberately not a rating of the maturity of every individual
`SKILL.md` package.

## Method

The application was exercised live on 2026-08-04 at
[`okhp3.github.io/skillz`](https://okhp3.github.io/skillz/), across Home,
Explore, detail, family, Stacks, Compare, Activity, Contribute, FAQ, and a
390px mobile Explore journey. Deployed static data and the repository
implementation were then inspected only to confirm observed behavior and
identify the cause of material discrepancies. Roadmap, changelog, and Notion
records were comparison frames, not proof of implementation.

Findings are classified as **confirmed** when observed in the deployed product
or deployable artifact, **inferred** when they are a reasoned explanation or
proposed next step, and **unknown** when they could not be safely established.

## Weighted scorecard

| Dimension | Weight | Score | Confirmed basis |
|---|---:|---:|---|
| Discovery | 20% | 90 | 113 skills across 15 families, text search, filters, sorting, and shareable URL state work. |
| Inspection and trust | 25% | 50 | Structured detail, evidence, relationships, and source links work; full contract rendering and truthful per-skill dates do not. |
| Decision and curation | 20% | 75 | Five curated stacks, pathways, family pages, Compare, Save, and Share are live; custom composition is absent. |
| Distribution and contribution | 15% | 65 | Raw install/source links and GitHub-native contribution handoff work; no versioned release or verified usable-path release exists. |
| Operational integrity | 15% | 50 | Static catalog and build-time activity work; published per-skill dates are deployment timestamps and the public dossier diverges. |
| Responsive baseline | 5% | 75 | The 390px Explore filter drawer and cards worked without observed console errors; this is not an accessibility certification. |
| **Weighted total** | **100%** | **67** | **66.5 rounded to the nearest whole point.** |

## Maturity model

| Band | Meaning | Assessment |
|---|---|---|
| M2 | Browseable catalog | Achieved and exceeded. |
| M3 | Decision workbench | Achieved. The application supports real discovery and selection decisions. |
| M4 | Trustworthy distribution center | Blocked by provenance, inspectability, release, and public-surface truth gaps. |
| M5 | Released ecosystem | Not achieved. The repository is unreleased and has no Git tag. |

## Confirmed capabilities

- Home search routes into Explore and carries the query in the URL.
- Explore supports family, maturity, evidence, and release-readiness filters,
  multiple sorts, result counts, and copyable state.
- Skill details expose purpose, topics, pathways, related skills, evidence and
  release context, raw/source links, Compare, Save, and Share.
- Family pages include authored narrative. Five curated stacks explain ordered
  work paths.
- Compare renders a two-skill table and a copyable comparison URL.
- Activity displays build-time GitHub activity while remaining a static site.
- Contribute routes visitors into GitHub issues, pull requests, and discussions.
- The mobile Explore filter drawer worked at a 390px viewport.

## Roadmap judgment

| Earlier milestone area | Result | Capability-first judgment |
|---|---|---|
| Public catalog and landing surface | Met and exceeded | Forge is a multi-route responsive catalog, not simply a landing page. |
| Discovery and routed selection | Exceeded | Search, filters, sorting, related skills, pathways, Save/Share, and curated stacks are live. |
| Compare and composition | Partial, with an exceeded branch | Compare and curated composition are shipped. A visitor cannot compose, validate, save, or export a custom stack. |
| Evidence and maturity presentation | Exceeded in surface area; blocked in integrity | Evidence controls and detail panels exist, but current dates are not trustworthy. |
| Full contract inspection | Partial | Rich summaries and raw links exist; the full `SKILL.md` is not available inside Forge. |
| Distribution readiness | Partial | Source/install links and contribution paths exist; no versioned release or verified usable-path gate exists. |
| Public-source convergence | Not met | The OverKill Hill project dossier still reports 75 skills and 12 families and labels live capabilities as planned. |

## Beyond the lower-stage roadmap

The live product contains several capabilities that go beyond its earlier
catalog-stage plan:

- real Compare rather than a future comparison concept;
- five curated, ordered stacks;
- build-time GitHub activity in a static deployment;
- authored family narrative pages and guided workflow pathways;
- evidence and release-readiness filters, Save/Share controls, and a mobile
  filter drawer; and
- a generated static catalog consumed at runtime rather than hand-authored UI
  inventory.

## Confirmed blockers to M4

1. **Per-skill provenance is false in the published catalog.** All 113 live
   entries carry the same created and modified date, matching the deployment
   window rather than individual Git history.
2. **The public OverKill Hill dossier is stale.** Its 75-skill/12-family count
   and feature labels disagree with the live application.
3. **Full contracts are not inspectable in-app.** A user must leave Forge to
   read the complete `SKILL.md` contract.
4. **Evidence labels do not yet constitute a release-quality gate.** The
   surface exists, but the underlying vocabulary, recency, and usable-path
   rules need stronger guarantees.
5. **No released ecosystem marker exists.** The repository has no Git tag and
   declares an unreleased state.

## Ordered build directive

### P0: restore public truth

1. Fetch full Git history in the Pages build, reject shallow-history
   provenance, and fail the build when actual per-skill dates cannot be
   established.
2. Add deployed-data assertions for source count, 113 skills, 15 families,
   and non-fallback per-skill provenance where Git history exists.
3. Make the OverKill Hill dossier consume a generated public summary or gate
   its counts and feature labels from the same source facts.
4. Describe the product publicly as M3 until M4 gates pass.

### P1: make Forge inspectable

1. Keep the fast detail index, then lazy-load and render the full `SKILL.md`
   contract on demand.
2. Separate `not run` from `no evidence record`, and use one evidence model in
   Explore, detail, and Compare.
3. Upgrade Compare to include current evidence fields and contract-level
   decision context.
4. Define and pass one usable-path release gate before creating the first
   versioned release.

### P2: make curation adaptive

1. Add a local-only stack composer that explains order, prerequisites, and
   conflicts.
2. Add Start-with-work guidance that turns user intent into a transparent,
   inspectable recommended path.
3. Permit export or sharing of a composed stack only after the selection logic
   and evidence wording are deterministic.

## Reference surfaces

- [Live Forge](https://okhp3.github.io/skillz/)
- [Live catalog payload](https://okhp3.github.io/skillz/data/catalog.json)
- [OverKill Hill Skillz dossier](https://overkillhill.com/projects/skillz/)
- [Repository](https://github.com/OKHP3/skillz)

