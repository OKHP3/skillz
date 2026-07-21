---
name: okhp3-foundry-repo-creator
description: Create governed FoundRy child repositories from Custom GPTs, Gemini Gems, Copilot agents, prompt bundles, Notion concepts, research notes, or prototype ideas. Use whenever the user wants to migrate an AI capability into GitHub, standardize a repo, create a child repo scaffold, or convert platform-specific AI work into a reusable capability package.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-foundry-repo-creator

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Create a governed child repository package from an AI capability, prompt artifact, research concept, or product idea.

## Scope

| In scope | Out of scope |
|---|---|
| Repository planning, safe scaffold generation, provenance preservation, governance overlays, manifest planning, and graduation checks | Publishing, pushing, creating remote repositories, copying secrets/private data, or selecting a parent FoundRy without evidence |

## Trigger When

Use this skill when the user wants to:

- migrate a Custom GPT, Gem, Copilot agent, or prompt bundle into GitHub
- create a new FoundRy child repository
- standardize a repository against FoundRy governance
- convert a platform-specific AI artifact into a reusable capability package
- generate scaffold files for `AGENTS.md`, `README.md`, `CHANGELOG.md`, `manifest.yaml`, `docs/`, `origin/`, `skill/`, `research/`, `tests/`, `schemas/`, `assets/`, `exports/`, and `archive/`

## Required Output

Produce a repo package containing:

```text
AGENTS.md
README.md
CHANGELOG.md
LICENSE.md
manifest.yaml
docs/
origin/
skill/
prompts/
research/
tests/
schemas/
assets/
exports/
archive/
```

## Process

1. Identify the parent FoundRy.
2. Select the correct naming pattern.
3. Preserve original platform artifacts in `origin/`.
4. Convert refined deployable behavior into `skill/`.
5. Put rationale and architecture in `docs/` and `research/`.
6. Generate `manifest.yaml` from the repo manifest schema.
7. Add the repo to the FoundRy registry.
8. Flag private, client, employer, or public-source-only constraints.

## Parent FoundRy Decision

- Use `OverKill-Hill-FoundRy` for systems, promptcraft, research, writing, local AI, apps, Mermaid, and FoundRy prototypes.
- Use `AskJamie-FoundRy` for AskJamie, BrandGuard, Enterprise Sleuth, RAG, identity, and conversation behavior.
- Use `Glee-fullyTools-FoundRy` for Glee-fully Tools, Tool-ettes, consumer utilities, tone systems, and life/productivity tools.

## Graduation Gate

Do not mark a repository as public-ready until PII, employer references, licensed material, source rights, and manifest visibility fields have been reviewed.

## Output contract

Return the chosen parent FoundRy with evidence, target path, proposed tree, files created or skipped, provenance and privacy decisions, unresolved blockers, and a graduation disposition. Require explicit approval before remote creation, commit, push, or publication. Write only inside a user-confirmed target directory.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
