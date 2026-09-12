---
name: okhp3-openclaw-skillz-sync
description: Run the skillz repo's own cataloger/integrity scripts on demand and summarize what changed. Use when asked to "refresh the skill catalog", "check skillz integrity", or after adding/editing a skill in the skillz repo.
metadata:
  openclaw:
    requires:
      bins: [git, node]
---

# Skillz Catalog Sync

The `OKHP3/skillz` repo already carries its own cataloger and integrity
tooling (`okhp3-skill-cataloger`, `catalog-integrity`, `validation-smoke`
under `.agents/skills/` in that repo). This skill just makes that tooling
reachable from a chat message instead of requiring Jamie to remember which
script lives where.

## Location

Default repo path: `/Volumes/OKH-Local/04_GitHub_Mirrors/skillz`. Confirm it
exists before doing anything; if not, ask for the correct path.

## What to do

1. `git --no-optional-locks -C <repo> status --porcelain=v1` first, and tell
   Jamie if there are uncommitted changes before you run anything that
   regenerates generated files (FAMILY.md inventories, `.catalog-meta.json`)
   -- he should know a regen is about to touch tracked files.
2. Look for a runnable entry point under `.agents/skills/okhp3-skill-cataloger/`
   and `.agents/skills/catalog-integrity/` (a `run.mjs` or documented CLI
   command in that skill's own `SKILL.md`) and run it against the repo root.
3. After it runs, `git --no-optional-locks -C <repo> diff --stat` to show
   exactly what the catalog run changed.

## Output

What ran, what it found (skill count, any integrity failures it flagged),
and a `git diff --stat` of what's now different in the working tree. Stop
there -- do not commit. Committing the catalog refresh is Jamie's call, not
this skill's.

## What this skill never does

Never commits or pushes on its own. Never edits a `SKILL.md` by hand to
"fix" something the integrity check flagged; report the flag and let Jamie
or a follow-up conversation decide the fix.
