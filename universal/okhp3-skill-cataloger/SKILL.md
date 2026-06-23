---
name: okhp3-skill-cataloger
description: >
  OverKill Hill P³ skill cataloger. Discover, index, and catalog all Agent Skills
  in a repository's .agents/skills/ directory by scanning each SKILL.md file and
  generating a structured, maintained README.md that serves as a living table of
  contents for the skill ecosystem. Use when asked to catalog, list, inventory,
  or update skills; regenerate the skills readme or catalog; show what skills are
  installed; check skill versions; validate naming conventions; or refresh the
  skills list. Also activates on "what skills does this project have" or
  "is the skills catalog current".
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-skill-cataloger

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

`okhp3-skill-cataloger` is an OverKill Hill P³–branded Agent Skill designed to
automatically discover, index, and catalog all Agent Skills contained within a
repository's `.agents/skills/` directory. Its primary function is to generate
and maintain a clean, structured `README.md` that serves as a living table of
contents for the skill ecosystem.

The skill scans each skill folder, extracts metadata, normalizes naming, and
produces an organized, human-readable catalog that reflects the current state of
the repo. This ensures that any Agent Skill–enabled project remains
self-documenting, navigable, and audit-friendly as it grows.

---

## How to activate this skill

### Natural language (all compliant agents)

Any of these phrases triggers `okhp3-skill-cataloger`:

```
catalog the skills
catalog all skills
catalog all agent skills
reindex the skills
index the skills
update the skills readme
update the skills catalog
refresh the skills list
refresh the skills catalog
show installed skills
show what skills are installed
what skills does this project have
are the skills up to date
okhp3-skill-cataloger
```

These work in Claude Code, GitHub Copilot, OpenAI Codex, Cursor, Gemini CLI,
and any other agent client that implements the Agent Skills standard.

### Slash command in Claude Code: `/catalog-skills`

If `.claude/commands/catalog-skills.md` is present at the **project root**,
then `/catalog-skills` is a named command in Claude Code sessions.

This file is bundled with this skill package at
`.agents/skills/okhp3-skill-cataloger/.claude/commands/catalog-skills.md`.

**Installation required** — the file must be copied to the project root to work:

```bash
mkdir -p .claude/commands
cp .agents/skills/okhp3-skill-cataloger/.claude/commands/catalog-skills.md \
   .claude/commands/catalog-skills.md
git add .claude/commands/catalog-skills.md
git commit -m "feat: add /catalog-skills slash command"
```

Then type `/catalog-skills` in any Claude Code session for this project.

### Built-in listing command: `/skills`

In VS Code with GitHub Copilot, `/skills` lists all available skills in the
current project. It does not run `okhp3-skill-cataloger` — it shows a menu.
Use it to confirm the cataloger is installed and visible.

---

## When to use this skill

Activate when the user or context requires any of:

- Cataloging, listing, or inventorying the skills in this project
- Regenerating or updating `.agents/skills/README.md`
- Checking what skills are installed and their current versions
- Validating that every skill's `name` field matches its directory name
- Getting a machine-readable JSON summary of all skills
- Showing the user what capabilities are available to agents in this repo

---

## Core instructions

### Step 1 — Confirm the working directory

This skill lives at `.agents/skills/okhp3-skill-cataloger/SKILL.md`. All
commands run from the **project root** — two directories above this file.

```bash
# Confirm you are at the project root
ls .agents/skills/
```

### Step 2 — Locate the generator script

Check in this order and use the first one found:

1. `scripts/gen-skills-readme.py` — canonical project-level copy (preferred)
2. `.agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py` — bundled fallback

Assign the found path to `SCRIPT`.

If neither exists, tell the user the script is missing and that the bundled
copy ships inside this skill package.

### Step 3 — Mode is auto-detected (no flag needed)

The script auto-detects whether the skills directory uses a flat layout
(project mode) or a categorized layout (library mode). No `--mode` flag is
required in the standard case.

| Layout | Detected as |
|---|---|
| `skill-name/SKILL.md` directly under `.agents/skills/` | `project` |
| `category/skill-name/SKILL.md` nested one level deeper | `library` |

Override only when auto-detection gets it wrong:
```bash
python3 ${SCRIPT} --skills-dir .agents/skills --mode library
```

See `references/MODES.md` for the full decision guide.

### Step 4 — Run the generator

```bash
python3 ${SCRIPT} --skills-dir .agents/skills
```

If the script exits with errors: show the full output. Fatal errors (name
mismatches, duplicate names, missing descriptions) must be resolved before
the catalog is generated. Warnings (missing version) can be noted and skipped.

### Step 5 — Report results

After a successful run, tell the user:

- How many skills were found and cataloged
- The detected or specified mode (project or library)
- Whether `.agents/skills/README.md` was updated or already current
- Any validation warnings
- The updated timestamp now visible in the README
- Whether `.agents/skills/.catalog-meta.json` was written

The generated section shows a visible timestamp line:

```
*Catalog last updated: **June 23, 2026 at 16:36 UTC** · **5** skills indexed*
```

A machine-readable HTML comment carries the same information:

```html
<!-- Generated: 2026-06-23 16:36 UTC | Skills: 5 | Mode: project -->
```

Both update on every run. A `.catalog-meta.json` file is also written
alongside the README for programmatic consumption.

---

## Gotchas

- **Run from the project root**, not from inside `.agents/skills/` or the
  skill directory. The script resolves `.agents/skills/` as a relative path.

- **This skill catalogs itself.** `okhp3-skill-cataloger` appears as a row
  in the generated table. This is correct — complete inventory includes the
  cataloger.

- **Missing README or markers causes an error.** If `.agents/skills/README.md`
  does not exist, or is missing the `<!-- SKILLS_CATALOG_START -->` and
  `<!-- SKILLS_CATALOG_END -->` markers, the script exits with an error.
  Initialize the README manually and add the markers before first run.

- **Python 3.9+ required. No external dependencies.** The script uses only
  the standard library.

- **The slash command file needs installation.** The `.claude/commands/`
  directory must be at the project root, not inside `.agents/skills/`. Copy
  the bundled file per the installation step above.

- **Library mode is for categorized structures only.** Using `--mode library`
  on a flat structure produces an empty table. Auto-detection handles this
  correctly in most cases; override only if needed.

- **Auto-detection reads the first non-hidden subdirectory.** If your first
  skill directory is unusual (missing SKILL.md, only has scripts), auto-
  detection may misfire. Override with `--mode project` or `--mode library`.

---

## Available commands

```bash
# Standard: auto-detect mode, catalog, update README
python3 ${SCRIPT} --skills-dir .agents/skills

# Preview without writing any files
python3 ${SCRIPT} --skills-dir .agents/skills --dry-run

# Validate only — do not write README or meta file
python3 ${SCRIPT} --skills-dir .agents/skills --check

# JSON output — machine-readable skill list to stdout
python3 ${SCRIPT} --skills-dir .agents/skills --json

# Explicit library mode — for skillz repo or categorized structures
python3 ${SCRIPT} --skills-dir .agents/skills --mode library

# Quiet — suppress output unless there are changes or errors
python3 ${SCRIPT} --skills-dir .agents/skills --quiet
```

---

## Output files

| File | Written when |
|---|---|
| `.agents/skills/README.md` | Always (must pre-exist with markers) |
| `.agents/skills/.catalog-meta.json` | Always (creates or overwrites) |

---

## References

- `references/MODES.md` — when to use `project` vs `library` mode,
  how auto-detection works, and how to switch between modes.
- `assets/catalog-meta-schema.json` — JSON schema for `.catalog-meta.json`
  for tooling that reads the machine-readable output.

---

## Changelog

| Version | Changes |
|---|---|
| 1.1.0 | Auto-mode detection (default). `--dry-run` flag. `.catalog-meta.json` output. Slash command installation documented. |
| 1.0.0 | Initial release. Marker injection, project/library modes, `--check`, `--json`, `--quiet`, validation. |

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
