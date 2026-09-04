# Repository shapes

Load when the target is not an ordinary single-language codebase with git
history. Shape changes what counts as evidence and what tracking is worth
scaffolding.

**Shape is not mode.** Mode A versus Mode B is decided by GitHub indicators
only, in `mode-detection-and-promotion.md`. Shape is orthogonal: a content-first
repository can be Mode A, and a conventional codebase with no remote is Mode B.
Detect the mode first, then apply the shape guidance below within it.

## Detection

| Shape | Detection signal | Primary risk |
|---|---|---|
| Conventional codebase | One manifest, one source tree, CI present | None specific |
| Monorepo | Multiple manifests at sibling depth, `packages/`, `apps/`, workspace fields | One charter flattening several projects |
| Content-first | Documents, prompts, research, office files dominate by count and bytes | Application-template assumptions |
| Skill or capability library | Many `SKILL.md` files under a family structure | Treating each skill as a project objective |
| No git history | No `.git`, or one initial commit | Timestamp-only activity evidence |
| Archive | Last activity far past thresholds, no CI, no releases | Reporting abandonment as failure |
| Empty or pre-intent | Under roughly ten files, no README with intent | Manufacturing a mission |

## Monorepo

Scaffold one root charter plus one objective namespace per package that has its
own manifest and its own README.

- Keep a single `.compass/` at the root. Do not scatter state.
- Set `project_key` to the repository. Prefix nothing; identifiers already
  include the normalized title, so cross-package collisions resolve on their own.
- Add a `component` field to objectives and tasks holding the package path.
- Attribute commits to components by changed path. A commit touching three
  packages is evidence for all three.
- The root charter states the shared purpose. If there is no shared purpose,
  that is a finding worth raising: the repository may be a folder of unrelated
  projects.

## Content-first repositories

Prompts, notes, research, spreadsheets, PDFs, images, and mixed knowledge
assets. Route structural work to `okhp3-repository-organizer`; Compass handles
intent and tracking only.

- Objectives are usually collection-shaped: "cover topic X to depth Y,"
  "maintain a current reference for Z."
- Success criteria are coverage and currency, not tests and builds.
- Evidence families shift: `doc_change` and `file_added` carry the weight;
  `test_signal` and `dep_change` are usually `NOT RUN`.
- Do not scaffold `docs/`, CI, or issue templates that the repository has no
  use for. An empty directory is not governance.
- Duplicates and version variants are common. Report them; never deduplicate.

## Skill or capability libraries

- Each skill package is an asset, not an objective. Objectives sit above:
  "reach release quality across the mermaid family."
- Read each `SKILL.md` frontmatter for declared scope and version. Version
  bumps are strong `release` evidence.
- Route authoring, evals, and benchmarking to `okhp3-skill-foundry`. Compass
  tracks whether the work is happening, not whether the skill is good.

## No git history

Sub-cases `git-no-remote` and `plain-folder` both land in Mode B, but they are
not the same. A folder with git and no remote still yields commits, tags, and
merge history; a plain folder yields none. Never blur them.

- Say so in the preconditions section and in every affected finding.
- Fall back to filesystem `mtime`, and label the age source `mtime` everywhere.
  A fresh clone or a bulk copy resets every timestamp; treat uniform timestamps
  as an explicit limitation.
- Drift detection still works: `baseline.json` checksums are independent of git.
- Offer, once, to note that initializing git would raise evidence quality. Do
  not initialize it.

## Archives and pre-intent folders

- An archive gets a charter that states its lifecycle as archival, records what
  it holds, and stops. Do not open objectives against work nobody intends to do.
- A pre-intent folder gets a charter with `unknown` intent, a short evidence
  ledger, and one open question: what is this for. Scaffold `.compass/` so the
  next run has a baseline, and write nothing else.

## Nested repositories and vendored trees

- Detect nested `.git` directories and report them. Do not scan into them by
  default.
- Vendored dependencies, build output, and lockfile-heavy directories are
  excluded by the scan defaults. If a vendored tree is genuinely part of the
  project, add it explicitly and say why in the report.
