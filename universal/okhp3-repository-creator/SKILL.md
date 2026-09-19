---
name: okhp3-repository-creator
description: Create governed FoundRy child repositories from Custom GPTs, Gemini Gems, Copilot agents, prompt bundles, Notion concepts, research notes, or prototype ideas. Use whenever the user wants to migrate an AI capability into GitHub, standardize a repo, create a child repo scaffold, or convert platform-specific AI work into a reusable capability package.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.2.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Creating a governed FoundRy child-repository plan and package from an approved reusable workflow source."
  out_of_scope: "Autonomous repository publication, implicit source ownership, or inclusion of private material."
---

# okhp3-repository-creator

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


## Optional brand profiles

When the user or verified target repository identifies an AskJamie or Glee-fully
workflow, load only its bundled profile before applying this shared procedure:

- AskJamie: [workflow profile](references/brand-profiles/askjamie.md).
- Glee-fully: [workflow profile](references/brand-profiles/glee-fully.md).

For a neutral or unidentified target, use the shared procedure without a brand
profile. An alias or previous package name alone does not establish the target
brand. If the requested brand conflicts with the target evidence, resolve that
conflict before applying a profile. Do not blend profiles or treat positioning
as approved product canon. Profiles cannot weaken evidence, privacy, scope, or
authorization requirements. Record the selected profile in the handoff.

### Consolidation evidence

Version 1.2.0 bundles the former brand overlays as optional profiles as of
2026-09-19. Earlier evaluation designs and benchmark/results files retain their
original versions and bytes as historical records; they do not validate this
version or its profile selection. Profile regression cases are defined in
[the evaluation design](evals/brand-profile-cases.json) and are not live runs.
Structural validation is separate from behavioral or performance evidence.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
