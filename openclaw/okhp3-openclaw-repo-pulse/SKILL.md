---
name: okhp3-openclaw-repo-pulse
description: Sweep the OKHP3 GitHub mirrors for uncommitted changes, unpushed commits, and stale .git locks; self-clean locks with the documented rename pattern. Use when asked "how are my repos doing", "any dirty repos", or "check for git locks".
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: openclaw
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Report local repository status and inspect Git lock state."
  out_of_scope: "Committing, pushing, stashing, resetting, or deleting repository work."
  openclaw:
    requires:
      bins: [git, find]
---

# Repo Pulse

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Give Jamie a single, honest status sweep across his OKHP3 GitHub mirrors
without touching anything he hasn't approved.

## Scope

Default root: `/Volumes/OKH-Local/04_GitHub_Mirrors`. If that path doesn't
exist on this machine, say so and ask for the correct mirror root instead of
guessing.

## What to do

1. Use `exec` to list every immediate subdirectory of the root that contains
   a `.git` folder (one level deep is enough; these mirrors are flat, not
   nested).
2. For each repo, run, with `--no-optional-locks` on every read command so
   you never create a `.git/index.lock` yourself:
   - `git --no-optional-locks -C <repo> status --porcelain=v1 --branch`
   - `git --no-optional-locks -C <repo> log @{u}.. --oneline 2>/dev/null` (unpushed commits, if a tracking branch exists)
   - `git --no-optional-locks -C <repo> log ..@{u} --oneline 2>/dev/null` (behind-remote commits)
3. Separately, check for stale lock files: `find <repo>/.git -maxdepth 1 -name "*.lock"`.
   - If you find `index.lock` and no git process is actually running against
     that repo, self-clean it by renaming it onto one fixed reused filename
     rather than deleting it outright or minting a new unique name each
     time: `mv <repo>/.git/index.lock <repo>/.git/index.lock.openclaw-parked`
     (if that target already exists, overwrite it — it's disposable park
     space, not history).
   - Never run `git checkout --` to revert anything you find dirty; that's
     explicitly off-limits. Report dirty files, don't touch them.

## Output

One table: repo name, clean/dirty, ahead/behind counts, lock status
(none / found-and-parked / found-and-left-because-a-process-looked-active).
Then a one-line summary: how many repos need Jamie's attention and why.
Keep it to the facts; no recommendations beyond "worth a look" for anything
dirty or far behind.

## What this skill never does

Never commit, push, stash, reset, or delete anything. Never touch a lock
file if there's any sign a git process might currently be using it (a
recent mtime, under a minute old, is reason enough to leave it alone and
just report it).

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
