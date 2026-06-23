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
  version: "1.0.0"
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

If `.claude/commands/catalog-skills.md` is present in the project (included in
this skill package), then `/catalog-skills` is a named command in Claude Code
sessions for this project. Type it in the chat and press Enter.

```
/catalog-skills
```

This is Claude Code-specific. Other agent clients do not currently support
custom slash commands through the same mechanism.

### Built-in listing command: `/skills`

In VS Code with GitHub Copilot, `/skills` lists all available skills in the
current project. It does not run `okhp3-skill-cataloger` — it shows you a
menu of skills. Use it to confirm the cataloger is installed and visible.

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

### Step 1 — Find the project root

This skill lives at `.agents/skills/okhp3-skill-cataloger/SKILL.md`. The project
root is two directories up. All commands run from the project root, not from
inside the skill directory.

```bash
# Confirm you are at the project root
ls .agents/skills/
```

### Step 2 — Locate the generator script

Check in this order and use the first one found:

1. `scripts/gen-skills-readme.py` — canonical project-level copy (preferred)
2. `.agents/skills/okhp3-skill-cataloger/scripts/gen-skills-readme.py` — bundled fallback

Assign the found path to `SCRIPT`.

If neither exists, tell the user the script is missing. The bundled copy is in
this skill package at `scripts/gen-skills-readme.py`.

### Step 3 — Determine the catalog mode

| If `.agents/skills/` contains… | Use mode |
|---|---|
| Skill folders directly (`skill-name/SKILL.md`) | `project` (default) |
| Category subfolders (`category/skill-name/SKILL.md`) | `library` |

When in doubt: if a subdirectory inside `.agents/skills/` contains another
directory rather than a `SKILL.md` file, use `library` mode.

See `references/MODES.md` for the full decision guide.

### Step 4 — Run the generator

```bash
python3 ${SCRIPT} --skills-dir .agents/skills --mode {MODE}
```

If the script exits with errors: show the full output. Fatal errors (name
mismatches, missing descriptions, duplicate names) must be resolved before
the catalog is generated. Warnings can be shown and skipped.

### Step 5 — Report results

After a successful run, tell the user:
- How many skills were found and cataloged
- Whether `.agents/skills/README.md` was updated or already current
- Any validation warnings (name mismatches, missing versions)
- The updated timestamp now visible in the README

The generated section includes a visible last-updated line rendered as italic
text immediately above the catalog table:

```
*Catalog last updated: **June 23, 2026 at 16:36 UTC** · **5** skills indexed*
```

This line is human-readable in the rendered GitHub view. The HTML comment above
it carries the same information in machine-readable form for tooling:

```html
<!-- Generated: 2026-06-23 16:36 UTC | Skills: 5 -->
```

Both update on every run. The visible line updates even if no skills changed,
so the timestamp always reflects the last time the catalog was explicitly run.

---

## Gotchas

- **Run from the project root**, not from inside `.agents/skills/` or the
  skill directory. The script resolves `.agents/skills/` as a relative path.

- **This skill catalogs itself.** `okhp3-skill-cataloger` appears as a row
  in the generated table. This is correct — complete inventory includes the
  cataloger.

- **Missing README or markers causes an error.** If `.agents/skills/README.md`
  does not exist, or is missing the `<!-- SKILLS_CATALOG_START -->` and
  `<!-- SKILLS_CATALOG_END -->` markers, the script exits with an error. Tell
  the user to initialize the README from the project template first.

- **Python 3.9+ required. No external dependencies.** The script uses only
  the standard library.

- **Library mode is for categorized structures only.** Using `--mode library`
  on a flat structure produces an empty table. Use the mode detection guide
  in `references/MODES.md` when unsure.

---

## Available commands

```bash
# Standard: catalog and update README
python3 ${SCRIPT} --skills-dir .agents/skills

# Validate only — do not write README
python3 ${SCRIPT} --skills-dir .agents/skills --check

# JSON output — machine-readable skill list to stdout
python3 ${SCRIPT} --skills-dir .agents/skills --json

# Library mode — for skillz repo or categorized structures
python3 ${SCRIPT} --skills-dir .agents/skills --mode library

# Quiet — suppress output unless there are changes or errors
python3 ${SCRIPT} --skills-dir .agents/skills --quiet
```

---

## References

- `references/MODES.md` — when to use `project` vs `library` mode,
  how to detect which applies, and when to switch.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License — free to use, fork, and adapt. A nod to the source is appreciated.
