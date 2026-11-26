# Project Audit & Doc-Seed Prompt (reusable — paste as-is into each project thread)

Run this against the current repository only. Don't touch anything outside its root.

## 1. Recon

- Read root-level files: `README*`, `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` / `*.csproj`, `docker-compose*`, `Makefile`, `.env.example`, `LICENSE`.
- Check root for existing `AGENTS.md` and `CLAUDE.md`. Note if either exists elsewhere (nested, `docs/`, etc.) instead of root.
- Skim the directory tree 2-3 levels deep. Identify entry points, main modules, tests dir, CI config (`.github/workflows`).
- Check `git log` (last ~30 commits) and any `CHANGELOG`. Establish last-activity date and whether this reads as active, dormant/reboot, prototype, or archived.
- Note the stack: languages, frameworks, key deps, deployment target if evident.

## 2. Synthesize understanding

Post this as your response (not a file) — decision-memo tone, no filler:

- **Purpose & reason** — why this exists, what problem it solves, for whom.
- **What it does** — core functionality, plain language, no marketing copy.
- **Meaning / context** — why it matters, how it fits any broader initiative if inferable, current lifecycle stage (active / paused / reboot-in-progress / dead).
- **Architecture snapshot** — key components and how they relate. Short list, not prose padding.
- **Clarity verdict** — state explicitly: **CLEAR** or **AMBIGUOUS**. If ambiguous, name exactly what's missing or contradictory (e.g., "README describes X, code does Y" or "no stated purpose anywhere, inferred from file names only").

## 3. Audit existing docs

For `AGENTS.md` and `CLAUDE.md` independently:

- **Missing** — flag it.
- **Present but weak** — boilerplate, stale, under ~15 substantive lines, no build/test/run commands, no directory map, or contradicts what the code actually does. Name the specific gaps.
- **Present and solid** — say so and leave it alone.

## 4. Seed / patch

Default convention (call it out if you deviate for a good reason):

- `AGENTS.md` is canonical — purpose, setup, build/lint/test/run commands, directory map, coding conventions, known gotchas, and reboot-specific notes (what was paused, why, what's next) if applicable.
- `CLAUDE.md` is a short pointer — one paragraph plus "See AGENTS.md for full project instructions," and only add Claude-Code-specific notes (skills, subagents, hooks) if genuinely relevant to this repo.

If both files exist and are decent, patch only the weak sections, preserve everything else, and call out exactly what changed. If missing, create them from the Section 2 synthesis. Don't blow away anything a human clearly wrote on purpose.

## 5. Report back

Close with:

- One-line verdict: purpose **CLEAR** or **NEEDS INPUT** (with the exact question, if any).
- List of files created/edited.
- Anything you flagged in Section 2/3 that you could *not* fix from the repo alone (e.g., a business goal only Jamie knows) — call it out, don't invent it.

Don't invent facts about business purpose, ownership, or intended audience. If it's not in the repo and not reasonably inferable, mark it `TBD` and ask rather than guess.
