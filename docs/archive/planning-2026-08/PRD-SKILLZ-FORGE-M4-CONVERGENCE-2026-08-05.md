# PRD: Skillz Forge, M4 Convergence Directive

**Status:** Authoritative. Supersedes and reconciles `PRD-SKILLZ-FORGE-EXECUTION-RESET-2026-08-04.md`, `PRD-SKILLZ-FORGE-INDEPENDENT-COMPLETION-2026-08-04.md`, `SKILLZ-FORGE-CAPABILITY-MATURITY-AUDIT-2026-08-04.md`, and my own `PRD-SKILLZ-FORGE-V2-EVIDENCE-AND-INTEGRITY-REPLIT-2026-08-04.md`.
**Author:** Claude, acting as independent second opinion, per direct instruction from Jamie Hill.
**Date:** 2026-08-05.
**Baseline verified against:** live `okhp3.github.io/skillz` and `overkillhill.com/projects/skillz/`, fetched directly on 2026-08-04, plus direct git/file inspection of the local mirror at HEAD `98515ec` (matches live `sourceCommit`).

## 0. Why this document exists, and why it's the only one that should

As of yesterday there were four documents claiming authority over this project's next steps, three of them self-authored by the implementing agent. That's a governance defect in its own right: an agent auditing its own work and writing its own next directive is a structural conflict of interest, regardless of how honest the audit turned out to be (and to its credit, the capability audit was honest about both P0 items below).

**This document is the single source of truth going forward.** It was built by independently re-fetching the live app and dossier, not by trusting any of the four prior documents' self-reported completion claims. Where those documents were right, this one says so and credits them. Where they were wrong or incomplete, this one corrects them.

**Standing instruction to Replit, effective immediately: do not author new PRDs, audits, or scorecards of this project's own completion state. Implement against this document. Jamie and Claude own the next directive, not the implementing session.**

## 1. Executive summary

- Original vision: Skillz Forge is not a static catalog, it's a distribution center. The bar is that a visitor can discover, trust, inspect, and act on a skill without Jamie in the loop.
- Current state, independently verified: **M3 decision workbench.** Discovery, curation, and the entire evidence-contract-v2 data model (previously completely unshipped) are genuinely done. Two things stand between here and M4, and both are confirmed broken in production today, not inferred from docs.
- **P0-1: per-skill provenance is fabricated.** Every one of 113 live catalog entries shows the same `createdAt`/`lastModified` (`2026-08-04T18:33:01Z`, the deploy timestamp) and the same `commitSha`. The app claims to know individual skill history and is wrong for all of them.
- **P0-2: the public dossier lies about the product.** `overkillhill.com/projects/skillz/` still says "75 public distribution skills across 12 active families" (actual: 113/15) and labels Compare and live GitHub Activity as "Planned" when both are shipped and live.
- A fix for P0-2's numbers already exists, written, uncommitted, sitting in the local repo at `docs/PUBLIC_SURFACES.md`. It has never been pushed, and even pushed it won't touch the live page by itself, since that page renders from somewhere else. Land it and figure out the propagation path.
- Everything else outstanding (in-app full-contract reading, the evidence "not-run" semantic collapse, a release tag, adaptive stack composition) is real and worth doing, but it is P1/P2. Do not let it dilute the session against the two things currently making the public product say false things about itself.
- This directive is scoped so every acceptance criterion is checkable by fetching the live artifact, not by reading a self-authored summary of what changed.

## 2. Confirmed baseline (do not re-litigate this table; verify against it)

| Area | Status | Evidence |
|---|---|---|
| Discovery, search, filters, sort, shareable state | Shipped | Capability audit, corroborated by earlier independent review |
| Curated stacks, family narrative pages, skill pathways | Shipped | `FamilyDetail.tsx`, `SkillPathway.tsx`, `narrativeBody` field confirmed present; capability audit confirms live |
| Evidence-contract v2 (full 2026-07-31 spec: evalCount, benchmarkCount, testCount, referenceCount, scriptCount, blockers, reviewDecision, authorGithub, inScope/outOfScope, maturitySource, releaseReadiness) | **Shipped and populated with real data** | `catalog.ts` type contract read in full; live `catalog.json` sampled, fields carry varied non-null values, not placeholders |
| Runtime catalog fetch from `public/data/catalog.json` (not bundled JS) | Shipped | Confirmed by fetching the live URL directly |
| Manifest count integrity + generated-not-hand-edited guard | Shipped | `skillz.manifest.json` read directly; counts sum correctly, `countsGeneratedFrom` guard present |
| Dead `forge/src/main.ts` | Removed | Confirmed absent |
| Accessibility fixes, topics/tags population | Shipped | Commit history + populated `tags`/`topics` fields |
| Deploy-trigger allowlist, per-family instance | Patched | `deploy-pages.yml` read directly, all 15 current families present |
| Deploy-trigger allowlist, root cause (path-independent trigger) | **Not fixed** | Still a hand-maintained list; same bug recurs at family 16 |
| Per-skill Git provenance in the deployed catalog | **Not fixed** | Live fetch: 100% of sampled entries share one timestamp and one commit SHA |
| Public dossier accuracy | **Not fixed** | Live fetch: still 75/12, Compare and Activity mislabeled as planned |
| Fix for dossier's source-of-truth doc | **Written, uncommitted, unpushed, unpropagated** | `docs/PUBLIC_SURFACES.md` diffed locally, correct 113/15 content sitting in working tree |
| Full `SKILL.md` contract readable in-app | Not shipped | Capability audit's own confirmed-tier finding; visitor must leave Forge |
| Evidence `not-run` semantic collapse (never-attempted vs. attempted-and-failed) | Not fixed | Flagged by EXECUTION-RESET; not independently verified at scale by Claude |
| Release tag | None exists | `git tag -l` on local mirror returns nothing |
| Custom local stack composer | Not shipped | Confirmed absent by capability audit |

## 3. Section A: P0, restore public truth

Nothing below this line ships until both items here are live-verified. This is not negotiable against P1/P2 scope.

### A1. Fix per-skill provenance at the root

The Pages deploy checkout is shallow, so `git log --follow` per-file lookups fail and silently fall back to the deploy timestamp. Silent fallback is the actual defect, more than the shallow checkout itself.

Required:
1. In `.github/workflows/deploy-pages.yml`, use `actions/checkout` with `fetch-depth: 0` for the build job that runs `build-catalog.js`.
2. In `build-catalog.js`, remove the silent fallback. If `git log --follow` cannot establish a real `createdAt`/`lastModified`/`commitSha` for a skill, the build must fail loudly (non-zero exit, explicit error naming the skill), not substitute the deploy timestamp.
3. Add a build-time assertion: fail if any two skills in the same family share an identical `createdAt` unless their git history genuinely proves simultaneous creation (e.g. both added in one commit, which is legitimate and should be allowed, just not the current universal collapse).
4. Do not hand-wave this as "best effort." A distribution center that fabricates dates when it can't find them is worse than one that admits it doesn't know.

### A2. Fix the deploy-trigger allowlist at the root, not per-instance

The current fix (all 15 families hand-listed in the `paths:` filter) is correct today and wrong by construction. Replace the manual family list with a path-independent trigger: either trigger on `forge/**` plus a top-level glob that doesn't require enumerating families (e.g. `*/FAMILY.md` or `*/SKILL.md` equivalent), or drop path filtering for this workflow and let it run on every push to `main` (catalog rebuild is not expensive enough to justify the current fragility). Either resolves the bug class permanently. The current allowlist does not.

### A3. Land the dossier fix and make it self-defending

1. Commit and push the three pending local changes (`README.md`, `docs/CHANGELOG.md`, `docs/PUBLIC_SURFACES.md`) as-is. They are correct.
2. Identify what actually renders `overkillhill.com/projects/skillz/` (Notion export, static site generator, CMS, hand-maintained HTML, whatever it is) and update it to match. `PUBLIC_SURFACES.md` is a specification, not the live page's source. Pushing it alone does not fix the dossier. This step has no code-only solution; name the actual publish path in the PR description.
3. Once the propagation path exists, make it structural: the dossier's skill/family counts and feature-status labels should be generated from the same `skillz.manifest.json`/`catalog.json` source of truth the app uses, not hand-typed prose that can drift again. If the dossier is genuinely outside this repo's build (e.g. a separate Notion-published site), add a documented manual sync step to `PUBLISHING.md` with an owner and a trigger condition ("update within 48 hours of any change to `distributionSkillCount` or `distributionFamilyCount`"), since full automation may be out of scope for this repo alone.
4. Until A3.2 lands, the dossier must not claim a specific skill/family count at all. A wrong specific number is worse than an honest "see the live catalog for current counts" with a link.

## 4. Section B: P1, make Forge inspectable and honest about its own maturity

Do not start this section until Section A is live-verified.

### B1. In-app full contract reading

A visitor should be able to read the complete `SKILL.md` without leaving Forge. Lazy-load the raw contract on the existing detail route (the fast summary index stays as-is for list/search performance) and render it in place, with a persistent link out to the GitHub source for anyone who wants blame/history.

### B2. Split the evidence "not-run" bucket

`not-run` currently conflates "an evaluation was designed and attempted but hasn't produced a result" with "no evaluation was ever designed for this skill." Those are different trust signals and should not share a label. Add a fifth `EvidenceStatusV2` value or a boolean `evaluationDesigned` flag distinguishing the two, and update Explore/Compare/detail copy accordingly. Before implementing, run a one-time audit: for every skill currently at `not-run`, check whether `evalCount`/`benchmarkCount`/`scriptCount` are all zero (never attempted) or non-zero (attempted, no live result). Report the split counts before writing UI copy that depends on it.

### B3. First release tag

Define one usable-path release gate (a specific, checkable bar, e.g. "every `usable`-maturity skill has non-fabricated provenance, a passing evidence record, and no open blockers") and cut `v0.1.0` once it passes. No tag exists today. A distribution center that has never released anything is asking for trust it hasn't earned yet.

### B4. Compare upgrade

Extend Compare to surface the v2 evidence fields (evalCount, blockers, reviewDecision) and `releaseReadiness`, not just the v1 fields it currently shows. This is additive to already-shipped work, not a rebuild.

## 5. Section C: P2, adaptive curation (do not start before A and B are live)

1. Local-only stack composer: let a visitor assemble a custom stack in-browser, with order/prerequisite/conflict explanation, no persistence or backend required.
2. "Start with my work" guidance: turn a stated intent into a transparent, inspectable recommended path through existing skills, not a black-box recommendation.
3. Export/share for a composed stack, gated behind B2's evidence-wording determinism landing first, so a shared stack doesn't carry ambiguous evidence claims downstream.

## 6. Non-goals

- No backend. Forge stays a static site consuming a generated catalog. Nothing in this directive requires a server.
- No redesign of the maturity/evidence data model. `Maturity` and `EvidenceStatus`/`EvidenceStatusV2` stay as specified; B2 is a refinement, not a new model.
- No new competing PRD, roadmap, or self-audit authored by the implementing session. See §0.
- No marketplace/registry submission work. `PUBLISHING.md`'s registry-readiness checklist is out of scope until M4 is reached and Jamie explicitly greenlights it.

## 7. Acceptance criteria (all independently checkable, not self-reported)

| # | Criterion | How Jamie or Claude verifies it |
|---|---|---|
| 1 | Fetch `okhp3.github.io/skillz/data/catalog.json`, sample 10 skills across at least 4 families: `createdAt`/`lastModified`/`commitSha` are not all identical, and at least some differ meaningfully from the deploy timestamp | Live fetch, no local trust required |
| 2 | Trigger a real edit to a 16th-family-equivalent path (or simulate by editing a file the current allowlist would miss) and confirm the deploy workflow fires without a manual `workflow_dispatch` | Push test + Actions log |
| 3 | Fetch `overkillhill.com/projects/skillz/`: states 113 skills / 15 families (or a live-linked count, per A3.4), and does not label Compare or Activity as "Planned" | Live fetch |
| 4 | `git tag -l` on `main` after B3 returns at least `v0.1.0` | Direct git check |
| 5 | Open any skill detail page in Forge and read the full `SKILL.md` body without navigating to GitHub | Manual click-through |
| 6 | Query the live catalog for `evidence.status` and confirm no single value conflates zero-artifact and attempted-nonzero-artifact skills | Live fetch + field inspection |

## 8. Implementation sequence

1. **Phase 0 (same day):** land the three pending local commits (§A3.1). Zero risk, already correct.
2. **Phase A (P0):** A1, A2, A3.2-A3.4. Do not proceed past this phase until acceptance criteria 1-3 pass on the live site.
3. **Phase B (P1):** B1 through B4, in that order. B2's audit step happens before any UI work depending on it.
4. **Phase C (P2):** only after Phase B's acceptance criteria pass.

## 9. Handoff note

Replit: work Phase A first, and report back with the live URLs re-fetched showing the acceptance criteria passing, not a written summary claiming they pass. Jamie and Claude will independently re-verify by fetching the same live artifacts checked for this directive before treating any phase as closed. If something in this directive turns out to be wrong once you're in the code, flag it back to Jamie rather than writing a superseding document.
