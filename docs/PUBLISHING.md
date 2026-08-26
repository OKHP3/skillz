# Publishing and Promotion Workflow

This checklist controls when `OKHP3/skillz` is ready for public promotion, registry crawling, marketplace submission, or release tagging.

## Publishing principle

Do not promote a skill because a folder exists. Promote a skill when it can be used by an agent without Jamie in the loop explaining what the skill meant.

A `SKILL.md` is a delegation contract. Publishing weak contracts creates support burden and brand debt.

## Required before public promotion

- [ ] Every active skill has a valid `SKILL.md`.
- [ ] Required frontmatter exists: `name`, `description`.
- [ ] Description includes both capability and trigger language.
- [ ] Skill name matches folder name.
- [ ] No employer references, internal system names, codenames, ticket identifiers, or proprietary examples.
- [ ] No credentials, tokens, private URLs, API keys, or copied private content.
- [ ] License declared at repo level.
- [ ] `README.md` explains the family and usage model.
- [ ] `AGENTS.md` routing table is current.
- [ ] `SKILLS.md` catalog is current.
- [ ] At least one worked example exists for every promoted skill.
- [ ] Validation checklist exists for every promoted skill.
- [ ] First release tag exists before registry-oriented promotion.

## GitHub hygiene

Recommended topic tags:

```text
agent-skills
claude-skills
skill-md
skills-sh
openclaw-skills
mermaid
social-posting
```

Recommended root files:

```text
README.md
AGENTS.md
SKILLS.md
PUBLIC_SURFACES.md
PUBLISHING.md
SECURITY.md
CHANGELOG.md
LICENSE
skillz.manifest.json
```

## Skill maturity gates

| Gate | Requirement |
|---|---|
| Skeleton | `SKILL.md` exists with valid frontmatter and basic sections. |
| Draftable | The workflow can be followed by an agent from instructions alone. |
| Usable | One real task has been completed successfully using the skill. |
| Validated | Worked examples, validation checklist, and known failure modes exist. |
| Published | Release-tagged, cataloged, and safe for public surface promotion. |

## Evidence and maturity vocabulary policy

**Decision (2026-08-06):** maturity and evidence are two separate axes and
must stay visibly separate. UI copy for one must never assert a claim that
belongs to the other, and a skill's own displayed fields must never
contradict each other. This was written after a sampled skill (Mermaid Core)
showed a `usable` maturity label paired with "Evidence-backed and exercised"
copy while its evidence status was `none` and its own promotion blocker said
no evaluation exists for the package at all -- the copy claimed something the
skill's own data denied.

### The two axes

- **Maturity** (`placeholder` / `skeleton` / `draftable` / `usable` /
  `validated` / `published`) is a claim about the **contract itself** --
  mostly self-declared in `SKILL.md` frontmatter (`maturitySource:
  explicit-frontmatter`), only ever held back (never promoted) by the
  build-time evidence policy in `build-catalog.js`.
- **Evidence status v2** (`live` / `analytical` / `historical` / `not-run` /
  `none`) is a claim about **what has actually been recorded** for the
  current package version -- eval cases, benchmark runs, and their
  version-match state. It is computed independently of maturity.
- **Release readiness** (`needs-contract-work` / `needs-live-evidence` /
  `ready-for-supervised-use` / `ready-for-peer-review` / `published`) is a
  derived, UI-only bucket combining the two (see `deriveReleaseReadiness` in
  `build-catalog.js`). It never overrides either source field.
- **Promotion blockers** are the literal, machine-generated reason(s) a
  skill's evidence status isn't higher. They are the most specific field on
  the page and other copy must not read as if the blocker weren't there.

### What each maturity level may and may not claim about evidence

| Maturity | What it structurally requires | Evidence claim permitted in copy |
|---|---|---|
| Placeholder / Skeleton | Nothing beyond directory/structure existing. | None. |
| Draftable | A written, reviewable contract an agent can follow under supervision. | None -- copy must point to "Evidence state" rather than assert anything about proof. |
| Usable | A workflow has been exercised on one real task, with limits documented -- a **self-declared track record**, not an indexed artifact. Enforced: nothing (build never checks evidence counts to grant this level). | Copy must **not** say "evidence-backed," "proven," or "validated." It may say a workflow has been exercised; it must not imply that exercise produced a recorded eval/benchmark. |
| Validated | Enforced by `applyEvidencePolicy`: at least one eval case or benchmark run must exist (`hasSubstantiveEvidenceArtifact`), or the build downgrades the claim to `usable`. That artifact is **not** required to be current-version or graded as `live` -- it can be `historical` or `analytical`. | Copy may say a recorded eval/benchmark artifact exists. It must **not** say "passed live benchmarks" or "current evidence" unless the skill's own `evidence.status` is actually `live` -- defer the specific state to the Evidence section. |
| Published | Enforced by `applyEvidencePolicy`: `evidence.status` must be `live`, or the build downgrades the claim to `validated`. | Copy may assert live, version-matched evidence backs the release -- this is the one level where that specific claim is always true. |

### Rules for every surface (generator output, Explore, Detail, Compare, FAQ)

1. Never use evidence-implying language ("evidence-backed," "proven,"
   "passed benchmarks," "validated by testing") for a maturity level below
   what that language requires per the table above.
2. Any maturity description must be true regardless of which evidence status
   a skill in that maturity level happens to have. If a description can only
   be true for a subset of skills at that maturity level (e.g. "passed live
   eval benchmarks" is only true when `evidence.status === 'live'`), it must
   defer to the Evidence section/trust summary instead of asserting it
   inline.
3. A skill's promotion blockers are the ground truth for "why isn't this
   further along" -- no other copy on the same page or list row may imply a
   more advanced state than the blockers describe.
4. Every skill detail page carries one generated (not hand-authored) plain-
   language trust summary synthesizing contract state (maturity), current
   evidence, release readiness, blockers, and source freshness, so the
   summary can never drift from the underlying fields it summarizes.

## Registry readiness

Before pursuing automatic or manual marketplace/listing channels:

- [ ] Topic tags are set.
- [ ] `SKILL.md` files are spec-compliant.
- [ ] Root `AGENTS.md` points to every active skill.
- [ ] `SKILLS.md` is current.
- [ ] `SECURITY.md` is present.
- [ ] README has install guidance.
- [ ] The repo has at least one release tag.

## Public surface readiness

Before adding or promoting `overkillhill.com/projects/skillz/`:

- [ ] GitHub repo has public-surface documentation.
- [ ] Notion strategy page is current.
- [ ] Skill families have clear public descriptions.
- [ ] At least Mermaid Core, BPMN, and Publish have reached usable maturity.
- [ ] Glee-fully and AskJamie references are framed as contextual touchpoints, not primary homes.

## Syncing the overkillhill.com dossier

`overkillhill.com/projects/skillz/` is **not** generated from this repository --
it lives in the separate `OKHP3/OverKill-Hill` repo as hand-authored static
HTML, so nothing in this codebase or its CI can push an update to it directly.
Confirmed live on 2026-08-05, the dossier still read "75 public distribution
skills across 12 active families" and labeled Compare and Activity as
"Planned," while this repo's own docs already carried the correct current
numbers and feature state. It was hand-corrected on 2026-08-06, but a
hand-corrected page can drift again the same way with no warning.

**Decision (2026-08-06): hybrid sync.** The two fields that actually drifted
(skill count, family count) are simple numbers with one unambiguous source
(`project-summary.json`), so the dossier now fetches and displays them live
instead of relying on a human to notice and re-type them. The richer
shipped-feature roadmap section (Compare/Activity/Composer/etc., with curated
descriptive prose per feature) is not similarly automated -- mapping a
`capabilities` boolean onto the right prose block is a judgment call each
time a feature ships, not a safe blind substitution, so it stays
hand-maintained behind an explicit manual-sync checklist instead.

### Live-synced when reachable (fallback review required)

`projects/skillz/index.html` in `OKHP3/OverKill-Hill` carries an inline
`<script>` (added 2026-08-06) that fetches
`https://okhp3.github.io/skillz/data/project-summary.json` on every page load
and rewrites:

- the "Hot off the FORGE" banner's skill/family count,
- the "Current Inventory" heading's skill/family count,
- the inventory paragraph's "as of" date.

This is progressive enhancement, not a hard dependency: the HTML already
carries the last-known-good numbers as static text, and the script only
overwrites them on a successful fetch. If `project-summary.json` is
unreachable (CORS change, endpoint move, visitor offline), the page silently
keeps showing the last hand-synced numbers rather than breaking or showing a
blank state -- check the browser console for a `[skillz dossier]` warning if
the live numbers ever look stale; that's the signal the fetch is failing and
this mechanism needs attention (endpoint moved, response shape changed,
etc.), not that a human forgot to type new numbers.

When the generated inventory changes, update every static fallback in
`projects/skillz/index.html` in the same OverKill Hill change: the banner, the
inventory heading's `data-fallback` values, any summary cards, and the
last-synced date. This preserves truthful offline and fetch-failure behavior;
the live fetch is a convergence check, not permission to leave stale fallback
copy behind.

### Still manual (documented trigger + checklist)

The "Brand Alignment" progress/roadmap list (Compare, Activity, Custom Local
Stack Composition, Issue/PR Context Panels, Authenticated Collaboration, and
any future entries) stays hand-authored. Re-sync it whenever:

1. `artifacts/forge/public/data/project-summary.json`'s `capabilities` object gains,
   loses, or flips a flag (see `artifacts/forge/scripts/capabilities.mjs` for the
   current flag list and what each one means), or
2. `docs/PUBLIC_SURFACES.md`'s "Current public-state rule" section changes.

When either happens, whoever has edit access to `OKHP3/OverKill-Hill` should:

- [ ] Compare each `capabilities.*` flag (or the "Current public-state rule"
      prose) against the dossier's roadmap list.
- [ ] Update any list item whose `phase-pill` (Shipped/Active/Planned) no
      longer matches, and its description if the feature scope changed.
- [ ] Update the "Recommended positioning" one-liner in
      `docs/PUBLIC_SURFACES.md` if it changed, then paste the new copy in.
- [ ] Refresh the static count and date fallbacks described above, even though
      the live page will replace them after a successful fetch.

There is no automated trigger for this half -- it remains a manual step, owned
by whoever maintains `OKHP3/OverKill-Hill`, same as before this decision.

## Release gate

**Decision (2026-08-06, written retroactively):** `v0.1.0` was tagged on
2026-08-06 without a written release-gate policy existing beforehand -- the
tag message and the `docs/CHANGELOG.md` entry described what was checked at
the time, but there was no owner-approved, reusable definition of "what must
pass before any tag is cut." This section is that definition, written after
the fact. It also serves as the acceptance checklist for every future tag.
See "Reconciling `v0.1.0` against this gate" below for an honest accounting
of which criteria the existing tag met and which were still open when it was
cut -- the gate is not retroactively rewritten to make `v0.1.0` look like it
passed criteria it did not actually satisfy.

Before cutting any release tag, all of the following must hold:

- [ ] **Build pipeline passes.** `artifacts/forge/scripts/build-catalog.js` and
      `artifacts/forge/scripts/build-activity.mjs` run to completion without error
      against the current skill inventory.
- [ ] **Deterministic regression suite passes.**
      `artifacts/forge/scripts/test-catalog.mjs` and `vitest run` (in `artifacts/forge/`) both
      pass with no failing tests.
- [ ] **Deploy trigger regression guard passes.**
      `artifacts/forge/scripts/verify-deploy-trigger.mjs` passes, confirming the Pages
      deploy workflow's trigger paths stay family-agnostic (adding or
      renaming a family does not silently stop deploys from firing).
- [ ] **Doc counts agree.** `README.md`, `docs/PUBLIC_SURFACES.md`, and
      `docs/CHANGELOG.md` all state the same skill count and family count as
      the generated `artifacts/forge/public/data/catalog.json` / `skillz.manifest.json`
      at tag time.
- [ ] **No fabricated provenance.** Every catalogued skill's
      `createdAt`/`lastModified`/`commitSha` is derived from real Git
      history for the checkout being tagged, not a placeholder or
      shallow-checkout fallback value. (A shallow checkout is allowed to
      warn and fall back to "Unknown" in local dev; it must never fabricate
      a synthetic date, and CI must fail closed rather than tag from a
      shallow checkout -- see `forge-shallow-checkout-provenance` decision.)
- [ ] **Public-truth convergence, if the tag will be described publicly.**
      If the release notes or any public surface (e.g. the
      `overkillhill.com/projects/skillz/` dossier) will describe this tag's
      state, that public description must already match what the tag
      actually contains -- not what it is planned to contain next.
- [ ] **Live verification, when the deploy target is reachable.** If the tag
      corresponds to a live deployment (e.g. GitHub Pages), fetch the live
      app/catalog and confirm it reflects the tagged commit's inventory
      before treating the release as verified -- a passing local build is
      necessary but not sufficient proof the public artifact matches.

A tag may still be cut with some criteria open, but only if the release
notes say so explicitly (which criteria passed, which did not, and why it
was still tagged) rather than implying every criterion passed.

### Reconciling `v0.1.0` against this gate

`v0.1.0` was tagged 2026-08-06 before this policy was written. Checked
against it retroactively, using the tag message and the corresponding
`docs/CHANGELOG.md` entry as the source of truth for what was actually
verified at tag time:

| Gate criterion | Status at `v0.1.0` tag time |
|---|---|
| Build pipeline passes | Met -- `build-catalog.js` and `build-activity.mjs` ran clean against the 113-skill/15-family inventory. |
| Deterministic regression suite passes | Met -- `test-catalog.mjs` and `vitest run` both passed. |
| Deploy trigger regression guard passes | Met -- `verify-deploy-trigger.mjs` passed. |
| Doc counts agree | Met -- `README.md`, `docs/PUBLIC_SURFACES.md`, and `docs/CHANGELOG.md` all carried the same 113/15 count at tag time. |
| No fabricated provenance | Met -- provenance was verified against direct `git log` output rather than assumed. |
| Public-truth convergence | **Open at tag time.** The `overkillhill.com/projects/skillz/` dossier still read "75 public distribution skills across 12 active families" and mislabeled Compare/Activity as "Planned" when `v0.1.0` was cut; it was only hand-corrected the same day, after the tag. |
| Live verification against the deployed app | **Not documented as performed** at tag time -- the tag record does not show a live fetch of the deployed Pages site confirming it matched the tagged commit. |

`v0.1.0`'s own tag message and CHANGELOG entry were honest about scope: it
explicitly claims only "working, honest infrastructure and documentation,"
not usable skill content or public-surface convergence, and says no skill
had reached `usable` maturity yet. That framing is consistent with the two
open criteria above -- the tag did not claim public-truth convergence or
live verification, and in fact neither had happened yet. This reconciliation
does not change or re-litigate that decision; it only makes the gate
criteria explicit going forward so future tags are checked against a
written bar instead of the ad hoc judgment call `v0.1.0` necessarily relied
on.

## Prestige path

The prestige path should be deliberate, not automatic.

Potential future moves:

1. Prepare a strong Mermaid/BPMN skill submission.
2. Run a security review.
3. Create a release.
4. Add public OverKill Hill documentation.
5. Submit to higher-trust skill registries or reviewed collections.

## Release note pattern

Use concise release notes:

```md
## v0.1.0 — Initial public scaffold

- Added root skill catalog.
- Added Mermaid skill family skeletons.
- Added LinkedIn skill family skeletons.
- Added process-capture meta-skill.
- Added public-surface strategy and publishing workflow.
```

## Final gate

If a skill cannot answer these three questions, it is not ready to promote:

1. When should an agent use this skill?
2. What does good output look like?
3. What must the agent avoid?
