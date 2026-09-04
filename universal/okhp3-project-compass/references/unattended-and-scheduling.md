# Unattended and scheduled runs

A scheduled Compass run must finish on its own, produce a record, and never
block. This file is the contract.

## Non-negotiables

1. **Never ask.** In unattended mode every question becomes a `QST-` item plus
   an entry in `.compass/OPEN-QUESTIONS.md`. The run continues.
2. **Label every assumption.** An assumption used in place of an answer is
   recorded next to the question that would have resolved it.
3. **Managed writes only.** Unattended runs write inside managed blocks and
   under `.compass/`. They never create a new human document, never move a
   file, never change repository structure, and never touch an external sink.
4. **Always produce a record.** Even a failed run writes a run record and a
   delta report with the failure at the top. A silent run is indistinguishable
   from a run that never happened.
5. **No destructive fallback.** If state is corrupt, write a repair-needed
   report and stop. Do not re-initialize over existing state.

## Open-questions protocol

Each entry carries four fields:

```markdown
### QST-7F3A2B10 Is the 3D preview non-goal still current?
- Status: open
- Blocking: no
- Why it matters: three commits in `render/` contradict a stated non-goal
- Compass assumed: the non-goal still holds; logged `scope_expansion` drift
- Raised: 2026-09-02 (run-20260902T060000Z)
```

Rules:

- A question is raised once. A later run updates `Raised` with a repeat count
  rather than adding a duplicate. Identifiers make this deterministic.
- `Blocking: yes` means Compass could not produce a defensible status for a
  specific item. Name the item.
- An answered question is marked `answered` with the answer inline. The next
  run promotes the answer to `declared` evidence and cites the question
  identifier as the source.
- Questions never expire on their own. An unanswered blocking question older
  than the stale threshold becomes a `contradiction` drift item.

## What always becomes a question rather than a decision

- Choosing between two conflicting statements of purpose.
- Accepting a `new_goal` into the charter.
- Marking anything `abandoned` when contradicting activity exists.
- Deciding which of several trackers is authoritative.
- Anything requiring knowledge of a person's plans rather than repository facts.
- Any scope firewall hit.

## Scheduling shape

A weekly cadence suits most personal projects; daily is noise unless the
project is in an active push. Suggested invocation:

```text
Run okhp3-project-compass in reassess mode, unattended, against <path>.
Write the delta report and run record. Do not ask questions; log them.
```

Cadence guidance:

| Project state | Cadence | Why |
|---|---|---|
| Active build | Weekly | Enough movement to make a delta meaningful |
| Slow burn | Monthly | Weekly runs would report "nothing moved" repeatedly |
| Archive | Quarterly, or on demand | Confirms it is still an archive |
| Pre-intent | On demand only | Nothing to reassess yet |

If three consecutive runs report no movement and no drift, the report should
say so in one line and suggest lengthening the cadence. Compass should notice
when it is wasting the owner's attention.

## Failure modes to guard

| Failure | Guard |
|---|---|
| Run hangs waiting for input | Unattended flag disables every prompt path |
| Partial write leaves state inconsistent | Write machine state last, after the report is composed |
| Two runs overlap | Run identifiers are timestamped; a second record for the same minute is a reportable anomaly |
| Repository is mid-rebase or dirty | Report the dirty state, proceed read-mostly, do not treat uncommitted work as evidence of completion |
| Scan times out on a huge tree | The scanner caps file counts and marker counts and reports truncation as a limitation |
