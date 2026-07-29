# PRD: Skillz Forge maturity and provenance reconciliation

## Directive status

This is a long-form implementation directive for the Replit maintainer of the
Skillz Forge public surfaces. It is the current companion to the earlier Forge
directives. It does not replace the SPA with a mockup, create a second catalog,
or promote skills without evidence.

Target product: Skillz Forge

Canonical source repository: `https://github.com/OKHP3/skillz`

Canonical installable source: `main` branch of `OKHP3/skillz`

Live SPA: `https://okhp3.github.io/skillz/`

Canonical project dossier: `https://overkillhill.com/projects/skillz/`

Current source audit: [`SKILL-MATURITY-AUDIT-2026-07-29.md`](SKILL-MATURITY-AUDIT-2026-07-29.md)

## Why this work is required

The current public Forge correctly reports 75 skills across 12 active families,
but the maturity surface is too coarse. The catalog contains 62 `draftable`
skills and 13 `skeleton` skills, while the evidence behind those packages ranges
from no package evaluation record to current local checks and a small number of
live historical runs. Showing only the maturity badge hides the difference.

The parent OverKill Hill project surface also contains historical copy describing
68 skills across 11 active families. That copy must not be hand-edited to a new
number without a source-derived synchronization rule.

The product should answer two separate questions:

1. What state is the contract in?
2. What evidence exists for the current version?

The first is maturity. The second is evidence status. They must not be merged.

## Current verified baseline

The repository baseline at audit time is:

- 75 distribution skills.
- 12 active families.
- 2 placeholder family directories: `askjamie` and `glee-fully`.
- 18 project-local support skills under `.agents/skills/`, excluded from the
  public catalog.
- 62 `draftable`, 13 `skeleton`, and no `usable`, `validated`, or `published`
  records.
- Evidence states: 2 live, 17 analytical, 19 local-checks, 5 not-run, 6
  historical, and 26 none.
- GitHub `main` commit verified during the audit: `6b1025f0960395c3f4fbbd4ee971816eefba322e`.
- Local checkout tree matched that cloud commit before this PRD and audit work.

These are a dated baseline, not constants. Replit must regenerate the catalog
from the current checkout before implementation and use the generated values.

## Product principle

Skillz Forge is a read-friendly discovery and handoff surface over GitHub source.
It is not an execution runtime, a benchmark server, a marketplace, or a claim
that every package is production-ready.

The public journey remains:

```text
Need an outcome
  -> discover a skill
  -> inspect its contract and boundaries
  -> inspect maturity and evidence separately
  -> copy the source or install URL
  -> compose, compare, or contribute through GitHub
```

## Required source-of-truth model

### Repository inputs

The build must read:

- `SKILL.md` frontmatter and body.
- `benchmarks/benchmark.json` when present.
- `evals/evals.json` when present.
- package `tests/` and `scripts/` presence.
- per-file Git date and commit provenance.

Do not inspect or publish `.agents/skills/` as distribution entries unless the
repository catalog rules change explicitly.

### Generated catalog fields

Every skill record should preserve the current fields and add:

```ts
type EvidenceStatus =
  | 'none'
  | 'local-checks'
  | 'designed'
  | 'analytical'
  | 'not-run'
  | 'historical'
  | 'live';

interface Skill {
  maturity: 'placeholder' | 'skeleton' | 'draftable' | 'usable' | 'validated' | 'published';
  evidenceStatus: EvidenceStatus;
  evidenceNote: string;
  lastModified: string | null;
  commitSha: string | null;
}
```

The builder must:

1. Preserve an explicit `metadata.maturity` value when one exists.
2. Preserve `usable` as `usable`; never map it to `validated`.
3. Mark a benchmark as `historical` when its evaluated version differs from the
   current package version.
4. Mark a design-only evaluation as `analytical` or `not-run`, according to its
   record, without calling it live.
5. Mark scripts and tests as `local-checks` only when no stronger evidence record
   exists.
6. Mark a package `live` only when a version-matched executor record is present.
7. Use `none` when no package evidence record or executable check exists.
8. Include a short explanation that can be displayed to a visitor.

### Maturity policy

Use these definitions in the FAQ, detail view, and project dossier:

| Label | Meaning | Minimum evidence |
|---|---|---|
| Placeholder | Reserved directory or future slot | No contract requirement |
| Skeleton | Basic contract shape exists but important behavior is incomplete | Valid frontmatter and minimum sections |
| Draftable | An agent can follow the written workflow under supervision | Clear trigger, method, boundaries, output, and failure handling |
| Usable | A defined workflow has been exercised and its limits are documented | Version-matched local or real-task evidence, with an explicit scope |
| Validated | Current benchmark demonstrates the contract and a measurable gap | Version-matched with/without evaluation plus protected holdout |
| Published | Stable public release with formal provenance and downstream-ready docs | Validated evidence, release record, catalog sync, and security gate |

Do not automatically promote a package from the existence of a `tests/` folder.
Do not infer live production use from a version number. Do not inherit a prior
benchmark across a material version change.

## Required UX changes

### 1. Detail page

On every skill detail page, display the following as separate, labeled metadata:

- Maturity.
- Evidence state.
- Evidence note.
- Version.
- Last modified date.
- Commit link.
- Package path.

Use plain language. For example:

> Draftable. Analytical evaluation design exists, but live release evidence is
> not established.

For `historical`, show the evaluated version in the note. For `not-run`, say
that the current evaluation design has not been executed. For `none`, say that
the package has no indexed evidence record, not that the skill is unsafe.

### 2. Explore and compare

Add evidence as a visible secondary filter or sortable column without making it
compete visually with the task, family, or maturity filters.

The compare view must show both maturity and evidence. A user comparing two
draftable skills should be able to see that one has local checks and the other
has no package evidence record.

### 3. FAQ and explanatory copy

Update the FAQ answer for maturity so it explains the two-dimensional model.
It must explicitly say that:

- `draftable` does not mean validated.
- `usable` does not mean production-safe in every environment.
- `validated` requires current version-matched evaluation evidence.
- an evidence note can be historical or not-run.

### 4. Home and activity surfaces

Keep the home page focused on discovery. Add one concise trust statement such as:

> Read the contract, maturity, and evidence note before relying on a skill.

The activity page must distinguish the generated catalog snapshot from live
GitHub activity. Do not present a static catalog date as a live event feed.

## Required OverKill Hill project-page changes

The parent page is a narrative dossier, not an embedded catalog. Replit must:

1. Replace the stale 68-skill and 11-family claim with a source-derived value.
2. Identify the 75 and 12 values as an audit-time snapshot if a static build
   cannot ingest the repository dynamically.
3. Link to the dated audit and to the live Forge.
4. Explain that maturity and evidence are separate.
5. Preserve the distinction between GitHub source, Skillz Forge discovery, and
   OverKill Hill project narrative.
6. Keep `askjamie` and `glee-fully` framed as placeholder family directories,
   not public distribution skills.
7. Avoid listing every skill on the parent page. Use the Forge for exploration.

If the parent site cannot consume generated repository data, the build should
write a dated content snapshot and fail or warn when its inventory checksum no
longer matches the declared source snapshot. A manually typed count without a
date and source reference is not acceptable.

## Implementation sequence

### Phase A: preflight

Before editing:

- Inspect the live SPA at desktop and mobile widths.
- Inspect the live OverKill Hill project page at desktop and mobile widths.
- Record title, route, visible count, family count, sample skill, and maturity
  behavior.
- Record whether live copy agrees with the current generated catalog.
- Read `AGENTS.md`, `docs/PUBLISHING.md`, `docs/SECURITY.md`, and the current
  catalog builder.
- Preserve unrelated local changes and report any source divergence.

### Phase B: catalog and data model

- Regenerate the repository catalog.
- Build evidence states from package records and version comparison.
- Type-check the catalog model.
- Confirm no evidence state can be mistaken for a maturity promotion.

### Phase C: interface

- Add evidence state to detail pages and compare view.
- Add the plain-language FAQ explanation.
- Make badges accessible without relying on color alone.
- Keep the current hash routes and raw GitHub source links.
- Make historical, not-run, and no-evidence notes legible on mobile.

### Phase D: parent surface

- Update the project dossier from the current source snapshot.
- Remove or label 68-skill historical copy.
- Link to the audit and Forge.
- Preserve shared OverKill Hill shell and typography.

### Phase E: verification

Run:

```bash
python3 .agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py \
  --full --no-absorb-readme --check
node forge/scripts/build-catalog.js
python3 scripts/audit-skill-maturity.py --markdown
node universal/okhp3-skill-foundry/scripts/validate-skill-suite.cjs --root .
cd forge && npm run build
```

Then perform browser QA for:

- Home.
- Explore with family and maturity filters.
- Explore with evidence filter or evidence sort.
- One `historical` skill.
- One `not-run` skill.
- One `local-checks` skill.
- One `none` skill.
- One `live` skill.
- Compare view.
- Activity view.
- Mobile layout and keyboard navigation.

## Acceptance criteria

### Data integrity

- [ ] The SPA reports the generated catalog count, not a hard-coded count.
- [ ] The catalog reports 75 skills and 12 active families for this baseline.
- [ ] `.agents/skills/` remains excluded from the public catalog.
- [ ] Every skill has a maturity value and an evidence state.
- [ ] Every evidence note is derived from an indexed repository fact.
- [ ] Historical records identify the evaluated version when available.
- [ ] `usable` and `validated` remain distinct in JSON, filters, and copy.

### Honesty and safety

- [ ] No skill is promoted to validated solely because it has references,
  scripts, tests, or a benchmark design.
- [ ] No stale benchmark validates a newer version.
- [ ] No private data, credentials, tokens, cookies, or hidden network calls are
  introduced.
- [ ] No public copy claims that the Forge executes skills or guarantees their
  outputs.

### UX and accessibility

- [ ] Evidence state is visible in detail and compare views.
- [ ] Status is communicated by text and not color alone.
- [ ] Historical and not-run notes fit at 390px without horizontal overflow.
- [ ] Existing hash routes and GitHub source links continue to work.
- [ ] Search, filters, copy, share, save, and compare retain their current
  behavior.

### Delivery evidence

- [ ] Replit records live preflight evidence separately from local verification.
- [ ] The final report identifies the deployed source commit.
- [ ] The final report includes catalog counts, evidence-state counts, tests,
  screenshots, and known limitations.
- [ ] The parent project page and SPA are checked after deployment for count and
  copy drift.

## Non-goals

- Do not claim all 75 skills are production-ready.
- Do not fabricate live with/without runs or a protected holdout.
- Do not build a benchmark executor into the static SPA.
- Do not add account login, private GitHub collaboration, or server-side secrets.
- Do not replace the current application with a screenshot or a static landing
  page.
- Do not create a second manually maintained catalog.

## Handoff note

The local Replit connector was not available during this preparation. This PRD
is therefore the authorized handoff artifact rather than a direct mutation of a
Replit project. The implementation owner must complete the live preflight and
report any difference between the deployed app, Replit checkout, and current
GitHub `main` before editing.
