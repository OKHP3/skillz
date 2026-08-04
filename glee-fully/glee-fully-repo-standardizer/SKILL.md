---
name: glee-fully-repo-standardizer
description: >
  Scaffold and standardize any Glee-fully child repository (Toolbox, Tool, or
  Tool-ette tier). When run from within a child repo, spawns the canonical
  folder/file structure with pre-populated Glee-fully brand payload, tone
  overlays, persona data, and governance stubs — ready to fill with entity-
  specific content. Use when creating a new child repo, auditing an existing
  one for missing structure, or migrating content from ChatGPT or Notion into
  the repo. Triggers on: "scaffold this repo", "standardize this repo",
  "create the folder structure", "set up the glee-fully structure",
  "run the repo standardizer", "apply the glee-fully template".
metadata:
  version: "1.1.0"
  author: "OverKill Hill P³"
  category: gleefully
  origin: OKHP3/Glee-fullyTools-FoundRy
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  parent_foundry: OKHP3/Glee-fullyTools-FoundRy
  in_scope: "Scaffolding and auditing Glee-fully child repository folder/file structure, brand payload, and governance stubs."
  out_of_scope: "Writing entity-specific tone, persona, or content — only the structural scaffold and stubs."
---

# glee-fully-repo-standardizer

Scaffold and standardize any Glee-fully child repository against the canonical
structure defined in `OKHP3/Glee-fullyTools-FoundRy`.

---

## When to Activate

Use this skill when the user is working inside (or about to set up) a
`glee-fully-gpt*` child repository and wants to:

- Create the canonical folder/file structure from scratch
- Audit an existing repo for missing folders or files
- Pre-populate files with Glee-fully brand payload (tone, persona, governance)
- Prepare a repo to receive content migrated from ChatGPT threads or Notion

---

## Core Concepts

Every Glee-fully child repo belongs to one of three tiers:

| Tier | Pattern | Emoji | Role |
|------|---------|-------|------|
| **Toolbox** | `glee-fully-gpt00-*` | 🧰 | Trunk — suite concierge, routing only |
| **Tool** | `glee-fully-gpt01-*` through `glee-fully-gpt07-*` | 🪚 | Branch — category hub, routing only |
| **Tool-ette** | `glee-fully-gpt01a-*` through `glee-fully-gpt07g-*` | 🔩 | Twig — specialized task executor |

Tier determines the folder structure and default tone overlay.

---

## Step 1 — Confirm Project Root

Verify you are at the root of the target child repo:

```bash
ls manifest.yaml AGENTS.md README.md 2>/dev/null || echo "Starting fresh"
pwd
```

---

## Step 2 — Gather Entity Details

Before running the scaffold, collect:

| Field | Example | Source |
|-------|---------|--------|
| `--tier` | `toolette` | Repo name pattern (01a = toolette, 01 = tool, 00 = toolbox) |
| `--name` | `"Resume Builder"` | Inventory file or GPT Builder |
| `--id` | `01a` | Repo name suffix |
| `--parent` | `"Discovered Careers"` | Parent repo README or inventory |
| `--parent-url` | `https://chatgpt.com/g/g-...` | Inventory or ChatGPT |
| `--chatgpt-url` | `https://chatgpt.com/g/g-...` | Inventory or ChatGPT |
| `--tone` | `GleeLite` | Tier default or explicit override |

Tier defaults if `--tone` is omitted:
- `toolbox` → `BledsGLEE`
- `tool` → `GleeRich`
- `toolette` → `GleeLite`

**Auto-detection:** If `manifest.yaml` already exists in the repo, the script
reads `name`, `type`, and `chatgpt_url` from it automatically.

---

## Step 3 — Locate the Script

```bash
# Preferred: canonical project-level copy
ls scripts/glee-fully-scaffold.py 2>/dev/null && SCRIPT=scripts/glee-fully-scaffold.py

# Fallback: bundled inside the skill package
SCRIPT=$(python3 -c "
import os, sys
skill_dir = [d for d in [
  '.agents/skills/glee-fully-repo-standardizer/scripts/scaffold.py',
] if os.path.exists(d)]
print(skill_dir[0] if skill_dir else 'NOT FOUND')
")
echo "Script: $SCRIPT"
```

---

## Step 4 — Run the Scaffold

**Full scaffold (new repo):**

```bash
python3 $SCRIPT \
  --tier toolette \
  --name "Resume Builder" \
  --id 01a \
  --parent "Discovered Careers" \
  --parent-url "https://chatgpt.com/g/g-68578aa0c7d48191b02d8078fd26b9e2-discovered-careers-by-glee-fully" \
  --chatgpt-url "https://chatgpt.com/g/g-6855e58bf8d48191bf27795f6d5ec23c-resume-builder-by-glee-fully"
```

**Preview only (dry run):**

```bash
python3 $SCRIPT --tier toolette --name "Resume Builder" --id 01a --dry-run
```

**Audit existing repo (show missing files/folders):**

```bash
python3 $SCRIPT --audit
```

**Overwrite specific files (use sparingly):**

```bash
python3 $SCRIPT --tier toolette --name "Resume Builder" --id 01a --overwrite
```

---

## Step 5 — Report Results

After running, tell the user:

- How many folders were created
- How many files were written (new) vs skipped (already existed)
- Which files contain `[TODO]` placeholders that need filling
- What the recommended next action is (fill `gpt/instructions.md` first)
- That `assets/glee-fully-brand.json` was written with shared brand payload
  that all files in this repo reference for tone/persona consistency

---

## Folder Structure by Tier

### Tool-ette (most common — 42 repos)

```
AGENTS.md                    ← AI agent navigation (Glee-fully branded)
README.md                    ← Entity overview
CHANGELOG.md                 ← Version history
LICENSE.md                   ← Proprietary license
manifest.yaml                ← Repo metadata + Glee-fully fields

gpt/                         ← The Custom GPT artifact
  instructions.md            ← Full instruction payload (~8,000 chars)
  description.md             ← GPT Builder description (300 chars max)
  starters.md                ← Conversation starters (4 starters)
  knowledge/                 ← Knowledge files attached to the GPT
    .gitkeep

pulsebook/                   ← Quality evaluation (required before 1.0)
  pulsebook-v1-7.md          ← Filled PulseBook (run at PROMPT05)

docs/                        ← Human-readable documentation
  overview.md                ← Plain-language summary
  functions.md               ← All functions/capabilities documented

canon/                       ← Canon compliance
  registry-entry.md          ← !CLAUSE declaration for this entity

origin/                      ← Source migration content (read-only)
  chatgpt-exports/           ← Raw ChatGPT thread extracts
    .gitkeep
  notion-exports/            ← Notion page exports
    .gitkeep

assets/                      ← Shared brand payload + visual identity
  glee-fully-brand.json      ← Canonical tone/persona/vernacular data
  icon.png                   ← Retro butterfly icon (add manually)

archive/                     ← Retired or superseded content
  .gitkeep
```

### Tool (7 repos — routing GPTs, no task execution)

Same structure, except:
- `gpt/knowledge/` is omitted (Tools route, they do not hold knowledge files)
- `gpt/instructions.md` uses the router/branch instruction pattern

### Toolbox (1 repo — trunk)

Same as Tool structure, with `gpt/instructions.md` using the trunk/concierge pattern.

---

## Available Commands

```bash
# Full scaffold with all options
python3 $SCRIPT --tier toolette|tool|toolbox --name NAME --id ID \
  [--parent NAME] [--parent-url URL] [--chatgpt-url URL] \
  [--tone OVERLAY] [--dry-run] [--overwrite] [--quiet]

# Audit only — show missing structure, do not write
python3 $SCRIPT --audit

# JSON report of what would be created
python3 $SCRIPT --tier toolette --name NAME --id ID --json
```

---

## Gotchas

- **Run from the repo root.** The script writes relative to `cwd`. Running
  from inside a subfolder will create structure in the wrong place.

- **Existing files are skipped by default.** Pass `--overwrite` only when you
  want to reset a stub. Content you have already added will be lost.

- **`assets/glee-fully-brand.json` is always written (or updated).** It is
  the shared payload source. All other template files reference its content
  by comment — they do not import it at runtime (that is the GPT Builder's job).

- **`origin/` is read-only by convention.** Drop ChatGPT exports and Notion
  exports there. Never edit files in `origin/` — always copy content out to
  `gpt/` or `docs/` for refinement.

- **`gpt/instructions.md` is the most important file.** It becomes the actual
  ChatGPT Builder instruction payload. Fill it first after scaffolding.

- **`pulsebook/pulsebook-v1-7.md` gates 1.0.** A repo is not 1.0 until the
  PulseBook is filled and `manifest.yaml` has `pme_ready: true`.

---

## After Scaffolding — Recommended Fill Order

1. `gpt/instructions.md` — paste and refine the instruction payload
2. `gpt/description.md` — 300-char GPT Builder description
3. `gpt/starters.md` — 4 conversation starters
4. `docs/overview.md` — plain-language explanation
5. `docs/functions.md` — list all functions with descriptions
6. `canon/registry-entry.md` — fill the !CLAUSE block
7. `pulsebook/pulsebook-v1-7.md` — run evaluation, fill results
8. Update `manifest.yaml` — set `lifecycle_status: active` and `pme_ready: true`

---

## References

- `assets/glee-fully-brand.json` — canonical brand/tone/persona payload
- `OKHP3/Glee-fullyTools-FoundRy/vernacular/` — full vernacular reference
- `OKHP3/Glee-fullyTools-FoundRy/evaluation/gpt-pulsebook-evaluation-v1-7.md` — PulseBook
- `OKHP3/Glee-fullyTools-FoundRy/governance/glee-fully_project_governance_v3-0-1.md` — Governance Directive

---

## About

Built for the Glee-fully Personalizable Tools™ ecosystem.
OverKill Hill P³ — [overkillhill.com](https://overkillhill.com)
Parent FoundRy: `OKHP3/Glee-fullyTools-FoundRy`
