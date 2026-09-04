# Mode B: plain folder, file-first tracking

No repository, no remote, no issue tracker. The file layer has to carry
everything Mode A gets from GitHub for free, so it is deliberately richer here
than the thin mirror Mode A keeps.

## What Mode B must reproduce

| GitHub gives Mode A | Mode B equivalent |
|---|---|
| Milestone | Objective record with `children` and computed `percent_complete` |
| Milestone percent bar | `percent_source: computed-children`, recomputed each run |
| Issue | Task record |
| Sub-issue | `parent_id` on a task, arbitrary depth, cycle-checked by V3 |
| Issue type | `kind` field: epic, feature, bug, chore, spike |
| Label | `labels` array on items, plus a `labels` registry at the state root |
| Project board or roadmap view | `docs/ROADMAP.md`, generated from state into managed blocks |
| Release history | Run history plus a milestone log in `.compass/RUN-HISTORY.md` |
| Repo description and topics | Charter purpose line and a `topics` list in config |

## Files Mode B owns

```text
docs/CHARTER.md      purpose, vision, mission, goals, non-goals, success criteria
docs/ROADMAP.md      generated view: objectives, progress bars, next actions
docs/BACKLOG.md      generated view: open tasks by objective, then orphans
.compass/objectives.json   source of truth
.compass/baseline.json     evidence manifest, the drift engine without git
.compass/RUN-HISTORY.md    append-only run log with trend columns
.compass/OPEN-QUESTIONS.md questions Compass would have asked
.compass/reports/          per-run delta reports
```

Generated views live entirely inside managed blocks. The prose around them is
the owner's and is never rewritten.

## Rollup computation

Recompute on every run, bottom up:

1. A leaf task's contribution is 1 when `status` is `done`, 0 when `abandoned`
   or `superseded` is excluded from the denominator entirely, and 0 otherwise.
2. A parent task's `percent_complete` is the mean of its children's
   contributions, rounded to a whole number.
3. An objective's `percent_complete` is the mean over its direct children,
   weighted equally unless a `weight` field says otherwise.
4. Objectives with no children report `null` and `percent_source: none`. Do not
   print a zero, which reads as failure rather than absence.
5. `blocked` counts as incomplete but is reported separately, because a
   milestone at 60 percent with every remaining task blocked is a different
   situation from one making steady progress.

Always show the denominator: "4 of 7 tasks done, 2 blocked" beats "57 percent."

## Generated roadmap view

`docs/ROADMAP.md`, inside `<!-- compass:begin:roadmap -->`:

```markdown
| Objective | ID | Status | Progress | Open | Blocked | Last evidence |
|---|---|---|---|---|---|---|
| Parse DXF exports | OBJ-1A2B3C4D | in_progress | 3/4 | 1 | 0 | 2026-08-30 |
| Emit a printable pack | OBJ-5E6F7A8B | active | 0/3 | 3 | 1 | 2026-08-12 |

Next actions
1. TSK-9F8E7D6C Handle R10 polyline variants (OBJ-1A2B3C4D)
2. TSK-2B3C4D5E Decide unit handling (OBJ-5E6F7A8B, blocked)
```

Next actions are capped at five and ordered by: unblocking work first, then
oldest in-progress, then newest proposed. A roadmap listing forty items is a
backlog wearing a roadmap costume.

## Trend data

`.compass/RUN-HISTORY.md` carries enough per run to see direction without
opening any report:

```markdown
| run | mode | objectives | done | in progress | blocked | drift open | score | summary |
|---|---|---|---|---|---|---|---|---|
| run-20260825T060000Z | B | 5 | 1 | 2 | 0 | 1 | 92 | parser landed |
| run-20260901T060000Z | B | 6 | 1 | 2 | 1 | 3 | 88 | new goal appeared, one blocker |
```

Three consecutive rows with identical counts and no drift is itself a finding:
report it and suggest a longer cadence.

## Drift without git

`baseline.json` is what makes Mode B work on a folder with no history. It
stores a truncated SHA-256 per file, so added, changed, and removed files are
detectable between any two runs regardless of timestamps or version control.

Where git exists but GitHub does not, the `git-non-github` and `git-no-remote`
sub-cases still get commit, tag, and merge evidence. Say so explicitly rather
than letting the reader assume the weaker evidence base.

## Labels in Mode B

Keep a registry at the state root so labels stay a controlled vocabulary rather
than free text:

```json
"labels": [
  { "name": "area:parser", "description": "DXF parsing", "github_synced": false },
  { "name": "risk:data-loss", "description": "Could lose user content" }
]
```

`github_synced` is pre-wired for promotion. On promotion, these become real
GitHub labels and the flag flips.

## Staying promotable

Everything in Mode B is designed to survive promotion to Mode A untouched:

- Identifiers are content-derived, never sequential positions in a file.
- Status vocabulary matches what Mode A maps onto open and closed.
- `parent_id` maps directly onto sub-issues.
- `labels` map directly onto GitHub labels.
- `percent_complete` swaps its source from `computed-children` to
  `github-milestone` without changing the field.

Do not invent Mode B fields that have no Mode A counterpart unless they carry
information GitHub cannot hold, such as confidence tiers and drift history.
