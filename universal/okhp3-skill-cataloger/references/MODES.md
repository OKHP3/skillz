# okhp3-skill-cataloger — Mode Reference

The `gen-skills-readme.py` script runs in one of two modes. The default is
`auto`, which detects the correct mode from the directory layout.
Manual override is available when auto-detection needs help.

---

## Mode overview

| Mode | Layout | Command flag |
|---|---|---|
| `project` | `skill-name/SKILL.md` directly under `.agents/skills/` | `--mode project` |
| `library` | `category/skill-name/SKILL.md` one level deeper | `--mode library` |
| `auto` | Detected from layout (default since v1.1.0) | _(omit flag)_ |

---

## project mode

**Use when:** `.agents/skills/` contains skill folders directly.

```
.agents/skills/
├── okhp3-skill-cataloger/      ← skill directory
│   └── SKILL.md
├── celestial-data/              ← skill directory
│   └── SKILL.md
└── gis-token-model/             ← skill directory
    └── SKILL.md
```

**How to identify:** List `.agents/skills/`. If every non-hidden subdirectory
contains a `SKILL.md` file, you are in project mode.

**Command:**
```bash
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills
```
_(project is auto-detected — no `--mode` flag needed in the standard case)_

**README output:** A single flat table with all skills listed together, plus
a Category column populated from each skill's `metadata.category` field.

---

## library mode

**Use when:** `.agents/skills/` contains category folders, each of which
contains skill folders.

```
.agents/skills/
├── universal/                    ← category folder
│   ├── vite-github-pages/
│   │   └── SKILL.md
│   └── gis-token-model/
│       └── SKILL.md
├── mermaid/                      ← category folder
│   ├── okhp3-mermaid-core/
│   │   └── SKILL.md
│   └── okhp3-mermaid-bpmn/
│       └── SKILL.md
└── glee-fully/                   ← category folder
    └── glee-recipe-planning/
        └── SKILL.md
```

**How to identify:** List `.agents/skills/`. If subdirectories do NOT contain
`SKILL.md` directly — they contain more subdirectories instead — you are in
library mode.

**Command:**
```bash
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills --mode library
```

**README output:** Skills grouped into H3 sections by category, with a count
per category.

---

## auto mode (default since v1.1.0)

The script examines the first non-hidden subdirectory of `.agents/skills/`:

- If it contains a `SKILL.md` file directly → **project mode**
- If it contains subdirectories that contain `SKILL.md` → **library mode**
- If neither applies (empty or unusual) → **project mode** (safe fallback)

The detected mode is printed unless `--quiet` is set:
```
Auto-detected mode: project
```

**Override when:** auto-detection gets it wrong (unusual first directory,
mixed layouts during migration). Pass `--mode project` or `--mode library`
explicitly to bypass detection.

---

## Which repos use which mode

| Repo | Mode | Reason |
|---|---|---|
| `kierans-lifetrkr` | project | Small, focused skill set (< 10 skills) |
| `mermaid-diagram-bpmn` | project | Skills are project-specific tools |
| `mermaid-theme-builder` | project | Skills are project-specific tools |
| `skillz` | library | Skills organized by category (`mermaid/`, `linkedin/`, etc.) |
| `Glee-fullyTools` | project → library | Starts flat; switches when categories added |
| Any single-purpose project | project | Default; stays project indefinitely |

---

## Switching from project to library

When a project's skill set grows and category organization becomes necessary:

1. Create category subfolders inside `.agents/skills/`
2. Move skill directories into the appropriate category folder
3. Verify auto-detection catches the new structure:
   ```bash
   python3 scripts/gen-skills-readme.py --dry-run
   # Should print: Auto-detected mode: library
   ```
4. Run the generator:
   ```bash
   python3 scripts/gen-skills-readme.py
   ```
5. Commit the restructured skills and updated README

---

## Edge cases

**Mixed layout (some skills flat, some categorized):**
Auto-detection reads the first subdirectory. If it contains a SKILL.md,
project mode is selected even if other subdirectories are category folders.
Resolution: finish the migration before committing, or use `--mode library`
explicitly until the migration is complete.

**Category folder that looks like a skill:**
If a category folder accidentally contains a `SKILL.md` at its root, auto-
detection will treat it as a skill directory (project mode) and miss the
skills nested inside it. Avoid placing SKILL.md files directly inside
category folders.

**Empty skills directory:**
Auto-detection falls back to project mode. Run `--check` to confirm markers
exist before the first catalog run.
