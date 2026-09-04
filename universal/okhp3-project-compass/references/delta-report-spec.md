# Delta report specification

One report per reassessment run, written to
`.compass/reports/delta-<YYYYMMDD>.md`. Decision-memo tone. Every line carries
its evidence. No filler.

## Required structure

```markdown
# Compass delta: <project key> <YYYY-MM-DD>

Run <run-id> - reassess - since <previous run date>
Tracking mode: <A github-backed | B file-first> (<sub-case>, confidence <high|medium|low>)
Validation: score <n>/100, band <A|B|C|D>, gate <PASS|HOLD>

## Mode change
Only when the mode changed this run. One paragraph above everything else:
what it was, what it is, the signal that flipped it, and what changed as a
result. Omit the section entirely when the mode held.

## Executive summary
5 to 8 bullets. Movement first, risk second, drift third.

## Moved
| ID | Title | From | To | Evidence |

## Stalled
| ID | Title | Status | Days since evidence | Threshold |

## New
| ID | Title | Origin | Confidence | Proposed status |

## At risk
| ID | Title | Risk | Signal | Suggested action |

## Drift
| ID | Kind | Summary | Refs | Resolution |

## Orphaned work
| Evidence | Why it has no home | Candidate objective |

## Unchanged
One line with a count and the notable exceptions. Do not list everything.

## Open questions
| ID | Question | Why it matters | What Compass assumed |

## Artifacts written
Exact paths, or "No files changed."
```

## Evidence line format

Every evidence reference is `type:ref` with enough context to verify it by
hand:

- `commit:a1b2c3d4e5f6 "feat: pack emitter skeleton"`
- `file_changed:src/parse.py`
- `pr:#42 merged 2026-08-30`
- `absence:no commits touching parser/ since 2026-03-14 (172 days)`
- `doc_change:README.md#goals`
- `issue:#42 closed 2026-08-31` and `release:v0.3.0 2026-08-28` in Mode A

Never write "appears complete," "seems active," or "looks abandoned." Write the
observation and let the status carry the judgment.

## Section rules

- **Executive summary** leads with what moved and what it means, not with
  process. If nothing moved, say that in the first bullet.
- **Moved** includes regressions. A `done` reverting to `in_progress` is the
  most important row in the table when it happens.
- **Stalled** shows the threshold alongside the age so the reader can judge
  whether the threshold is wrong rather than the project.
- **New** items stay `proposed`. The report proposes; the human accepts.
- **At risk** is forward-looking: a blocked task on the critical path, a
  dependency with no activity, a success criterion with no observable signal.
- **Drift** is never empty because it is uncomfortable. An empty drift table
  with a one-line "no drift detected against <n> objectives" is a real finding.
- **Unchanged** is a count, not an inventory. Listing forty unchanged rows
  buries the seven that matter.
- **Open questions** always names the assumption Compass used in the absence of
  an answer.

## First run

A discovery run emits `.compass/reports/baseline-<YYYYMMDD>.md` with the same
header, then the intent summary, tracking inventory, decomposition, and the
line `Delta: not applicable, baseline run.` Do not fabricate movement on a run
that has nothing to compare against.

## Length discipline

The report earns its space. A quiet week is half a page. A month of heavy
activity is two pages. If a section would be pure ceremony, write the one-line
null result instead of a table with no rows.

## Mode-specific lines

| Mode | Extra reporting duty |
|---|---|
| A | State whether the GitHub API was usable this run. If it was not, say `GitHub primitives not read or written this run` and note the mirror is unchanged |
| A | Report `sink_divergence` findings separately from drift, including any remote item closed while local is open |
| A | Report GitHub issues carrying no compass marker as adopt-or-ignore candidates, with a count, not a full list |
| B | State the evidence base plainly: git history available, or filesystem timestamps only |
| B | Include the recomputed rollup and the denominators, since no milestone bar exists to check against |

A mode change is the single most consequential thing a run can report. It goes
above the executive summary, never buried in a table.
