# Quality rubric

`python3 scripts/validate_compass.py --root <path>` scores ten checks out of
100. This file explains what each check is really testing and what to do when
it fails.

| Check | Weight | Tests | Common cause of failure |
|---|---|---|---|
| V1 state files present and parseable | 10 | `config.json`, `objectives.json`, `baseline.json` exist and parse; `project_key` set | Discovery never completed, or a partial write |
| V2 identifier integrity | 12 | Uniqueness, prefix correctness, format, rename detection via `title_hash` | Re-minting on rename, or minting by hand |
| V3 referential integrity | 11 | Every task links to a real objective directly, or inherits one through its `parent_id` chain, or is flagged orphan; `parent_id` resolves; no hierarchy cycles; drift refs resolve | Objective superseded without repointing its tasks, or a nested subtask wrongly flagged orphan because only its ancestor carries `objective_id` |
| V4 status and evidence discipline | 13 | Valid statuses; every non-proposed item carries typed evidence with a ref | Status changed on impression rather than observation |
| V5 charter completeness | 11 | Purpose, vision, mission, goals, non-goals, success criteria all present | Sections dropped because the evidence was thin, instead of marked unknown |
| V6 confidence discipline | 7 | Every tagged claim uses a legal tier; `declared` claims cite a source | Inference promoted to declaration |
| V7 scope firewall | 9 | No confidentiality markers, ticket keys, internal hostnames, credential shapes, or deny terms in generated artifacts | Text copied from a source that was not generic |
| V8 style and managed blocks | 5 | No em dashes; block markers balanced and unique | Generated prose picked up an em dash, or a block was hand-edited |
| V9 unattended-run safety | 6 | Open-questions file exists; run records have history rows; blocking questions surfaced | Run record written without a history append |
| V10 staleness surfaced | 6 | Objectives past thresholds carry the matching flag | Reassessment skipped the staleness pass |
| V11 mode and mirror integrity | 10 | Mode recorded with evidence; history agrees with the verdict; Mode A has `owner_repo` and a pointer-only mirror matching it; Mode B has no live mirror or enabled GitHub config | Mode never recorded, a mode change with no `mode_change` drift item, or issue bodies copied into the mirror |

## Bands

| Band | Score | Meaning |
|---|---|---|
| A | 90 to 100 | Release quality. Safe to rely on and to schedule |
| B | 75 to 89 | Usable with named gaps. Fix before the next scheduled run |
| C | 60 to 74 | Structurally sound, substantively thin. Do not act on the delta alone |
| D | below 60 | Rebuild the failing artifact. Treat conclusions as unsupported |

Gate passes at band A or B with zero `FAIL` results. A `NOT RUN` check scores
zero and is never converted into a pass.

## Judgment checks the script cannot prove

Run these by hand before calling a run complete:

- Would a reader who has never seen the repository understand what it is for
  after reading the charter alone?
- Is every `declared` claim actually a quote or close paraphrase of a real
  sentence, or did it drift into interpretation?
- Does the delta report lead with the most consequential change, or with the
  easiest one to describe?
- Does any status change rest on a filename rather than a completion signal?
- Is the drift section empty because nothing drifted, or because drift was
  quietly folded in?
- Would the owner recognize their own project, or a generic description of a
  project shaped like it?
- Does anything in the output imply an employer, client, or internal system?
- Was the mode verdict conservative? Ambiguous evidence should have produced
  Mode B and an open question, not a confident Mode A.
- In Mode A, could the project be reconstructed from the repository alone if
  GitHub vanished tomorrow?

For a formal pass before handoff or reliance, hand the artifacts to
`okhp3-artifact-validation`. Its verdict is independent of this rubric, and a
Compass band A is a mechanical floor, not a publication verdict.

## Reading a low score

A V11 failure with everything else green usually means the run worked and the
next one will not, because the mode verdict or the mirror will no longer line
up. Treat it as urgent even though the current report looks fine.

A low V4 with a high V1 means the state file is well-formed and the reasoning
inside it is not. That is worse than a missing file, because it looks credible.
Prioritize V4, V2, and V5 failures over everything else; they are the checks
that decide whether the next run's diff means anything.
