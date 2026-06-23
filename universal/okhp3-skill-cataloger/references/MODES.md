# okhp3-skill-cataloger — Mode Reference

The `gen-skills-readme.py` script runs in one of two modes. Choosing the wrong
mode produces an empty table or a structure error.

---

## project mode (default)

**Use when:** `.agents/skills/` contains skill folders directly.

```
.agents/skills/
├── okhp3-skill-cataloger/       ← skill directory
│   └── SKILL.md
├── celestial-data/       ← skill directory
│   └── SKILL.md
└── gis-token-model/      ← skill directory
    └── SKILL.md
```

**How to identify:** List `.agents/skills/`. If every subdirectory contains
a `SKILL.md`, you are in project mode.

**Command:**
```bash
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills
```
*(project is the default — no `--mode` flag needed)*

**README output:** A single flat table, all skills listed together.

---

## library mode

**Use when:** `.agents/skills/` contains category folders, each of which
contains skill folders.

```
.agents/skills/
├── universal/             ← category folder
│   ├── vite-github-pages/
│   │   └── SKILL.md
│   └── gis-token-model/
│       └── SKILL.md
├── mermaid/               ← category folder
│   └── okhp3-mermaid-core/
│       └── SKILL.md
└── glee-fully/            ← category folder
    └── glee-recipe-planning/
        └── SKILL.md
```

**How to identify:** List `.agents/skills/`. If subdirectories do NOT contain
`SKILL.md` directly (they contain more subdirectories instead), you are in
library mode.

**Command:**
```bash
python3 scripts/gen-skills-readme.py --skills-dir .agents/skills --mode library
```

**README output:** Skills grouped into sections by category, with a count
per category.

---

## When repos switch modes

| Repo | Starts as | Switches to | When |
|---|---|---|---|
| Any project repo | project | (stays project) | Most repos never switch |
| `Glee-fullyTools` | project | library | When skills exceed ~50 and category folders are added |
| `skillz` | library | (stays library) | Always — it's the library |
| `kierans-lifetrkr` | project | (stays project) | Small, focused skill set |

**Switching from project to library:**
1. Create category subfolders inside `.agents/skills/`
2. Move skill directories into the appropriate category folder
3. Set `SKILLS_MODE=library` in GitHub repo Settings → Variables → Actions
4. Run: `python3 scripts/gen-skills-readme.py --mode library`
5. Commit the restructured skills and updated README

---

## Auto-detection (future)

The generator could detect mode automatically by checking whether the first
subdirectory of `.agents/skills/` contains a `SKILL.md`. If it does: project
mode. If it contains more directories: library mode.

This is not implemented in v1.0.0 to keep the script simple and explicit.
Add `--mode auto` detection in v1.1.0 if manual mode selection becomes
a source of errors across repos.
