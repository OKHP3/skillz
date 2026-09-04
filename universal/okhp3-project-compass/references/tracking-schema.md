# Tracking schema and status lifecycle

Machine truth is `.compass/objectives.json`, validated against
`assets/objectives.schema.json`. Human surfaces are projections of it.

**One model, both modes.** The schema below is identical in Mode A and Mode B.
Mode A populates the `github` block and takes `percent_complete` from the
milestone rollup; Mode B leaves `github` null and computes the same field from
children. Nothing else differs, which is what makes promotion lossless. See
`mode-detection-and-promotion.md`.

## Record shape

```json
{
  "id": "OBJ-1A2B3C4D",
  "title": "Emit a printable pack",
  "title_hash": "1A2B3C4D",
  "status": "in_progress",
  "confidence": "declared",
  "source": "README.md#goals",
  "created_at": "2026-09-02T14:00:00Z",
  "updated_at": "2026-09-02T14:00:00Z",
  "last_evidence_at": "2026-09-02T14:00:00Z",
  "success_criteria": ["A sample DXF round-trips without loss"],
  "evidence": [
    { "type": "commit", "ref": "f6e5d4c3b2a1", "observed_at": "2026-09-02T14:00:00Z",
      "note": "pack emitter skeleton" }
  ],
  "labels": ["area:parser"],
  "parent_id": null,
  "percent_complete": 75,
  "percent_source": "github-milestone",
  "github": {
    "milestone_number": 3,
    "issue_number": null,
    "url": "https://github.com/owner/name/milestone/3",
    "state": "open",
    "last_synced_at": "<ISO8601Z>"
  }
}
```

Tasks add `objective_id`, `parent_id` for sub-issue style nesting, `kind`
(epic, feature, bug, chore, spike), and `blocked_by`, or `orphan`. Questions add `blocking`, `why_it_matters`,
and `answer`. Drift items add `kind`, `refs`, `first_seen_run`, `resolution`.

## Status lifecycle

```text
proposed -> active -> in_progress -> done
                 \-> blocked -> in_progress
                 \-> abandoned
any      -> superseded
```

| From | To | Required evidence |
|---|---|---|
| `proposed` | `active` | Human acceptance, or `doc_change` adding it to a declared goal list |
| `active` | `in_progress` | A `commit`, `pr`, `file_added`, or `file_changed` touching the objective's area |
| `in_progress` | `done` | A completion signal: merged PR, closed issue, release or tag, a `test_signal`, or a `doc_change` recording completion. A file existing is not completion |
| any | `blocked` | An explicit blocker: a document, issue, comment, or an unanswered blocking question |
| `blocked` | `in_progress` | Evidence the blocker cleared, plus new activity |
| any | `abandoned` | `absence` evidence naming the window, past `abandoned_objective_days`, and no contradicting signal |
| any | `superseded` | A replacement identifier in `refs` |

Rules:

- No evidence, no transition. Leaving an item unchanged is a valid outcome and
  belongs in the "unchanged" section of the delta report.
- Transitions append evidence; they never replace it. The evidence array is a
  history, and `last_evidence_at` is the newest entry.
- `done` is never inferred from a filename. A file named `pack-emitter.py` is
  `file_added` evidence for `in_progress`, nothing more.
- Regression is legal. `done` back to `in_progress` requires evidence and is
  reported as a delta, not hidden.

## Identifier stability

Identifiers are minted once by `compass_ids.py` and persist forever.

| Event | Correct handling |
|---|---|
| Title reworded | Keep `id`, update `title` and `title_hash`, append to `renamed_from` |
| Objective split in two | Keep the original identifier for the closer successor, mint one new identifier, mark neither `superseded` unless the original stops existing |
| Objective merged into another | Mark the absorbed one `superseded` with `refs` pointing at the survivor |
| Duplicate discovered | Keep the older identifier, `superseded` the newer, record both in the drift log |
| Project renamed | Keep every existing identifier. Changing `project_key` re-hashes future mints only |

`validate_compass.py` V2 warns on a `title_hash` that no longer matches its
title, which is exactly the rename case. Record the rename and the warning
clears.

## Staleness thresholds

Configured in `.compass/config.json`:

| Key | Default | Effect |
|---|---|---|
| `stale_objective_days` | 60 | Open objective with no evidence gets `flagged_stale` and a `stale_objective` drift item |
| `abandoned_objective_days` | 180 | Gets `flagged_abandoned` and an `abandoned_work` drift item; still never deleted |
| `stale_doc_days` | 120 | Governance document older than this is reported as stale in the tracking inventory |

Thresholds are a prompt for a human decision, not an automatic status change.
Compass flags; the owner decides.

## Adoption of existing artifacts

When the repository already tracks work, adopt rather than compete:

| Found | Action |
|---|---|
| `BACKLOG.md` or `TODO.md` | Point `human_artifacts.backlog` at it, add one managed block, leave existing lines untouched |
| `ROADMAP.md` | Treat its entries as declared objectives; mint identifiers; add a managed block mapping identifiers to entries |
| GitHub issue templates or a linked Project | Mode A: use them. Mode B: record and leave alone |
| ADR directory | Treat each accepted ADR as declared constraint evidence, not as an objective |
| A charter or vision document | Use it as the charter; add managed blocks; never restructure it |
| Existing GitHub issues and milestones without a compass marker | Never adopt automatically. List them for a human to adopt or ignore |
| Links to Notion, Linear, Jira | Record them and raise an open question about which tracker is authoritative. Compass does not write to them |

## Hierarchy and rollup

`objective_id` links a task to its objective. `parent_id` nests a task under
another task, at any depth, and V3 rejects cycles.

| Mode | Hierarchy carrier | Percent source |
|---|---|---|
| A | GitHub sub-issues, mirrored as `parent_id` | `github-milestone`, taken as given |
| B | `parent_id` alone | `computed-children`, recomputed each run |

Report the denominator alongside the percentage. "4 of 7 done, 2 blocked" says
something "57 percent" does not. An objective with no children reports `null`,
never zero.

## Labels

A `labels` registry at the state root keeps the vocabulary controlled:

```json
"labels": [{ "name": "area:parser", "description": "DXF parsing",
             "github_synced": false }]
```

Labels are cross-cutting slices, not status. Status lives in `status`. In Mode
A they map one to one onto GitHub labels; `github_synced` flips on promotion.

## Mode block

`state.mode` records the detection verdict, its evidence, and a history of
changes. A mode change produces a history entry, a `mode_change` drift item,
and a line above the executive summary in the delta report. V11 enforces this.
