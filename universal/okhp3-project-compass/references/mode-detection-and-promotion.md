# Mode detection and the promotion path

Every run begins with detection. Detection decides which tracking machinery
Compass uses, and detection is conservative: ambiguity resolves to Mode B,
which is additive, local, and makes no external calls.

Run it with `python3 scripts/detect_mode.py --root <path> [--check-gh]`.

## Signals, in descending confidence

| Signal | Weight | What it means |
|---|---|---|
| `.git/` directory | high | The folder is a working tree |
| Remote `origin` points at github.com | high | The canonical home is GitHub |
| Any github.com remote | high | GitHub is involved, but may not be canonical |
| `.github/` directory | medium | GitHub conventions are in use |
| `.github/workflows/*.yml` | medium | GitHub Actions runs against this repo |
| `.github/ISSUE_TEMPLATE/` | medium | Issues are the intended intake channel |
| `CODEOWNERS` | medium | Review routing is configured on GitHub |
| Pull request template | medium | PR flow is in use |
| github.com links in README | low | Weak; a README can link to anything |

Detection parses `.git/config` directly, so it works even when the `git` binary
is missing.

## Sub-cases and verdicts

| Sub-case | Condition | Mode | Handling |
|---|---|---|---|
| `github-origin` | `.git` plus `origin` on github.com | A | Full Mode A. Use GitHub primitives, keep the file mirror |
| `github-non-origin` | A github remote exists, but `origin` is elsewhere | B | Ambiguous by design. Stay local, log an open question naming both remotes, ask which is authoritative |
| `git-non-github` | `.git` with a non-GitHub remote | B | Git evidence is available and used for commits, tags, and history. GitHub primitives are not. Say so explicitly |
| `git-no-remote` | `.git` with no remote | B | Local-only repository. Git history is strong evidence. Promotable the moment a GitHub remote is added |
| `github-artifacts` | `.github/` scaffolding but no `.git` | B | Likely a copy, export, or template. Log an open question, make no external calls |
| `plain-folder` | No `.git` at all | B | File-first tracking. See `file-mode.md` |

Three of these are explicitly not Mode A even though GitHub appears somewhere
in the evidence. That is deliberate. Falling into Mode A on weak evidence risks
external writes against a repository the owner did not mean to target.

## Mode A with no working API

Detection can return Mode A while `gh` is missing, unauthenticated, or rate
limited. That is not a failure and not a demotion. Record `mode: A` with
`github_api.usable: false`, operate file-only for the run, and say plainly in
the report that GitHub primitives were neither read nor written. The next run
picks up where this one left off, because the mirror carried the identifiers.

## Recording the verdict

Every run writes the verdict into `.compass/objectives.json` under `mode`:

```json
"mode": {
  "detected": "A",
  "sub_case": "github-origin",
  "confidence": "high",
  "locked": false,
  "evidence": [ { "signal": "origin-is-github", "found": true, "weight": "high" } ],
  "history": [ { "at": "<ISO8601Z>", "from": null, "to": "B", "run": "run-...", "reason": "initial detection" },
               { "at": "<ISO8601Z>", "from": "B", "to": "A", "run": "run-...", "reason": "github remote added" } ]
}
```

`locked: true` pins the mode. A detection that disagrees with a locked mode is
reported as an event rather than acted on. Use it when a repository has an
unusual remote layout that keeps tripping detection.

## Mode changes are events

A mode change is never silent. It produces:

1. A `history` entry with `from`, `to`, `run`, and `reason`.
2. A `mode_change` drift item with `resolution: open`.
3. A dedicated line at the top of the delta report, above the executive
   summary.

Validator check V11 fails when history and the current verdict disagree, and
warns when a mode changed across runs without a `mode_change` drift item.

## Promotion, Mode B to Mode A

This is the case the shared data model exists for. Nothing is renumbered and no
history is lost, because identifiers are minted from project key, kind, and
normalized title, never from a GitHub number.

1. Detect. Confirm the sub-case is now `github-origin`.
2. Confirm the identifier set is intact: `python3 scripts/compass_ids.py verify
   --state .compass/objectives.json`. Fix any V2 error before going further.
3. Set `github.owner_repo` and `github.enabled` in `.compass/config.json`.
   Leave `write_authorization` at `per-run`.
4. Pull first: `python3 scripts/github_sync.py pull --root . --repo <owner/name>`.
   The repository may already have issues and milestones. Matching happens on
   the `compass-id` marker, so anything unmarked lands in `unmatched_remote`
   for a human to adopt or ignore.
5. Plan: `github_sync.py plan`. Review the create, update, close, and
   adopt-or-ignore actions as a table.
6. Run `github_sync.py push --repo <owner/name> --apply --authorized` to get
   the exact `gh` commands for the approved plan; the script itself never
   calls GitHub. Run only the commands the owner approves, by hand, in one
   batch, and record which ones actually ran (and their result) in the run
   record's `--summary` so the run log matches what really happened, not just
   what was proposed.
7. Write the `mode_change` drift item, the history entry, and the mirror index.
8. Thin the Mode B artifacts. The generated roadmap view becomes a pointer to
   GitHub, not a second tracker. The charter stays; it has no GitHub equivalent.
9. Validate. V11 now expects `github-index.json` and a matching `owner_repo`.

Existing local statuses win at promotion time. GitHub starts as a projection of
what Compass already knows, not the other way round.

## Demotion, Mode A to Mode B

Happens when a remote is removed, a repository is made local-only, or GitHub
access is permanently lost. The mirror is exactly what makes this survivable.

1. Record the `mode_change` and the reason.
2. Keep `github-index.json` as a historical record; mark it stale in the run
   report rather than deleting it.
3. Rebuild the Mode B roadmap view from `objectives.json`, which never depended
   on GitHub for anything except rollup percentages.
4. Recompute percent-complete from children instead of milestones. Set
   `percent_source` to `computed-children`.
5. Set `github.enabled` to false so V11 stops expecting a live mirror.

## Adjacent skills

Repository structure, naming, and file moves belong to
`okhp3-repository-organizer`. Branch hygiene, stale branches, and merging
finished pull requests belong to `okhp3-repository-janitor`. Compass reads the
repository and tracks intent; it does not reorganize or clean it.
