# Mode A: GitHub-backed repository

In Mode A, GitHub already provides most of a tracking system. Compass uses
those primitives instead of rebuilding them, and keeps a thin file mirror so
the project survives losing API access.

## What each GitHub primitive is for

Short definitions, because leaning on a primitive you have not used before is
how a tracker ends up misshapen.

| Primitive | What it is | Compass uses it for |
|---|---|---|
| Repository description | The one-line summary under the repo name | Declared purpose, one sentence |
| Topics | Tag chips on the repo home page | Domain vocabulary and audience signals |
| Website field | A URL slot next to the description | Where the project is published, if anywhere |
| README | The rendered front page | Declared purpose, goals, non-goals |
| Milestone | A named bucket of issues with an optional due date, showing a percent-complete bar computed from open versus closed issues | One objective. The rollup is free, so do not recompute it |
| Issue | A single unit of work with a body, labels, assignee, and open or closed state | One task |
| Sub-issue | An issue nested under a parent issue, giving native parent and child rollup | Task hierarchy under an objective or a larger task |
| Issue type | A repository-level classification such as epic, feature, or bug, where the org has it enabled | Distinguishing an epic from a feature from a bug without burning a label |
| Label | A colored tag applied across issues and pull requests | Cross-cutting slices: area, risk, blocked, compass |
| Project | A separate table, board, or roadmap view over issues, with custom fields | The view layer. Never the source of truth |
| Release and tag | A named, dated snapshot of the repository | The historical record of the journey, and strong `release` evidence |
| Discussion | Threaded conversation separate from issues | Optional home for longer-form vision material |
| Wiki | A separate documentation space attached to the repo | Optional home for a charter that outgrows a single file |
| Issue template or form | A prefilled body or a structured form in `.github/ISSUE_TEMPLATE` | Enforcing shape on anything Compass files |
| CODEOWNERS | A file routing review by path | Ownership evidence, not a tracking primitive |

Mapping summary: objective to milestone, task to issue, hierarchy to
sub-issues, cross-cutting slices to labels, views to Projects, history to
releases and tags.

## The gh CLI

All GitHub reads and writes go through `gh`. Useful shapes:

```text
gh repo view <owner/name> --json name,description,topics,homepageUrl,updatedAt
gh issue list --repo <owner/name> --state all --limit 500 \
    --json number,title,body,state,labels,milestone,url
gh api repos/<owner/name>/milestones?state=all&per_page=100
gh release list --repo <owner/name> --limit 30
gh issue create --repo <owner/name> --title "<title>" \
    --body "<body>

<!-- compass-id: TSK-9F8E7D6C -->" --label compass
gh issue close <number> --repo <owner/name> \
    --comment "Compass: status done, evidence commit:<sha>"
gh api repos/<owner/name>/milestones -f title='<title>' \
    -f description='<!-- compass-id: OBJ-1A2B3C4D -->'
```

Degradation is a first-class path, not an error:

| Condition | Behavior |
|---|---|
| `gh` not on PATH | Report `degraded: file-only`, continue the run, mirror unchanged |
| `gh` present, not authenticated | Same, plus a one-line note that `gh auth login` would restore the GitHub layer |
| Rate limited | Same, and do not retry in a loop. Report the limit and the run continues |
| Repository not found or no access | Report it as a finding. Do not fall back to a different repository |
| Any failure mid-push | Stop. Local state is unchanged. Report what did and did not get written |

A scheduled run never fails because GitHub was unreachable.

## The file mirror

Mode A keeps three things in the repository and nothing more:

1. `.compass/objectives.json`, the state file, holding identifiers, statuses,
   evidence, and a `github` reference block per item.
2. `docs/CHARTER.md`, the charter, which has no GitHub equivalent.
3. `.compass/github-index.json`, the pointer index.

The index is pointers plus context, never a copy of the tracker:

```json
{
  "schema": "okhp3.compass.github-index/1",
  "owner_repo": "owner/name",
  "synced_at": "<ISO8601Z>",
  "policy": "pointers-plus-context; issue bodies are never mirrored",
  "milestones": {
    "OBJ-1A2B3C4D": { "number": 3, "title": "Parse DXF exports", "state": "open",
                      "open_issues": 1, "closed_issues": 3,
                      "percent_complete": 75, "due_on": null, "url": "..." }
  },
  "issues": {
    "TSK-9F8E7D6C": { "number": 42, "title": "Handle R10 variants",
                      "state": "OPEN", "labels": ["compass"],
                      "milestone_number": 3, "url": "..." }
  },
  "unmatched_remote": { "issues": [], "milestones": [] },
  "unmatched_local": [],
  "anomalies": {}
}
```

Rules:

- Never mirror issue bodies, comments, or descriptions. V11 fails on any
  mirrored field longer than 2000 characters.
- The index is regenerable. Deleting it loses nothing except a round trip.
- The identifiers are what matter. They live in `objectives.json`, which is the
  artifact that makes demotion to Mode B lossless.

## Matching by marker, never by title

Every Compass-created issue carries `<!-- compass-id: TSK-XXXXXXXX -->` in its
body, and every Compass-created milestone carries the same marker in its
description. Titles get edited by humans, which is precisely the case
identifiers exist to survive.

A GitHub issue with no marker is not adopted automatically. It appears in
`unmatched_remote` with an `adopt-or-ignore` action for a human.

## Write discipline

| Rule | Reason |
|---|---|
| `pull` and `plan` never mutate | The default must be safe |
| `push` is plan-only in this build. With both `--apply` and `--authorized` set it prints the exact `gh` commands for the approved plan and calls GitHub for nothing | The human runs the printed command by hand, so the run log always matches an action a person actually took |
| No script in this package ever calls `gh issue create`, `gh issue close`, or the milestone API | There is nothing in the codebase capable of pushing on a schedule, not just a policy against it |
| Close, never delete | The printed example commands close, they never delete |
| Every command `push` prints is also echoed verbatim into the run log | The run log records what was proposed, whether or not the human ran it |
| A remote item closed while local is open is a `sink_divergence` finding | A human closed it for a reason worth capturing. Never auto-reopen |

If a future version implements real execution behind these gates, that is a
breaking behavior change and gets a major version bump plus a fresh adversarial
eval run, not a silent capability upgrade.

## Percent-complete

In Mode A, take the milestone rollup as given: `closed / (open + closed)`. Set
`percent_source` to `github-milestone`. Do not recompute it locally and do not
argue with it in the report. If the milestone contains issues Compass does not
know about, that is a finding about coverage, not a reason to compute a
different number.

## What Compass still does that GitHub does not

GitHub tracks work. It does not infer intent, tag confidence, detect scope
drift against stated non-goals, notice that an objective has gone quiet for six
months, or keep a run history of how the project's shape changed. That is the
part Compass adds in both modes.
