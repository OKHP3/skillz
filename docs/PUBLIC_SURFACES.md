# Public Surface Strategy — `skillz`

This document captures the public information architecture for `OKHP3/skillz`: where the project should be explained, advertised, cross-linked, and supported without turning the OKHP3 brand system into duplicate content sprawl.

## Decision

Create one canonical public landing page for `skillz` under OverKill Hill, then add lightweight contextual touchpoints on Glee-fully and AskJamie.

```text
overkillhill.com/projects/skillz/
```

Contextual touchpoints:

```text
glee-fully.tools/toolbox/
askjamie.bot/lens-system/
```

The GitHub repository remains the installable source of truth. Notion remains the strategy, architecture, roadmap, and decision-history layer.

## Brand routing model

| Surface | Role | Depth | Primary CTA |
|---|---|---:|---|
| OverKill Hill `/projects/skillz/` | Canonical public landing page | High | View repo, browse skill families, install/use |
| GitHub `OKHP3/skillz` | Source of truth and installable artifact | Highest | Clone, inspect, contribute, install |
| Notion `skillz` page | Strategy, decision log, roadmap | Highest but operational | Planning and long-form context |
| Glee-fully Toolbox | Consumer-friendly mention of future Glee skills | Low to medium | Learn about OKHP3 `skillz` |
| AskJamie Lens System | Professional lens-oriented support note | Low to medium | Learn about OKHP3 `skillz` |

## Why OverKill Hill is canonical

`skillz` is an OKHP3 infrastructure project. It is not primarily a Glee-fully consumer tool and not primarily an AskJamie lens.

The correct canonical home is:

```text
overkillhill.com/projects/skillz/
```

OverKill Hill is the forge, project hub, and protocol surface. `skillz` belongs there because Agent Skills are reusable delegation contracts, not end-user tool pages.

## What not to do

Do not create three separate full marketing pages with overlapping explanations.

That would create:

- duplicate claims
- outdated status drift
- competing CTAs
- unclear source of truth
- brand confusion between tools, lenses, and skills

## Recommended OverKill Hill project page

Recommended title:

```text
skillz: Agent Skills by OverKill Hill
```

Recommended positioning:

```text
75 reusable SKILL.md delegation contracts across 12 active families for Claude, OpenClaw, Codex, and compatible AI agents.
```

Current inventory snapshot, indexed July 29, 2026: 75 public distribution skills across 12 active families. The repository also contains two placeholder family directories and 18 project-local support skills. The placeholders and local support skills are not public distribution entries. See [`docs/SKILL-MATURITY-AUDIT-2026-07-29.md`](SKILL-MATURITY-AUDIT-2026-07-29.md) for per-skill version, Git date, maturity, and evidence records.

Recommended sections:

1. What Agent Skills are
2. Why OKHP3 is building `skillz`
3. Skill families
4. How to use them
5. Current maturity status
6. Relationship to GitHub, Notion, Glee-fully, and AskJamie
7. Roadmap
8. Links

## Skill family cards

| Family | Public angle | Status |
|---|---|---|
| Abrahamic | Scripture lookup, observance calendars, tradition reference, and cross-tradition comparison | 4 Draftable; historical evidence |
| Agent Foundry | Custom GPT construction, readiness, and conversion planning | 3 Draftable; analytical evidence |
| Community | General-purpose UI, MCP, authoring, social, and engineering guidance | 6 Draftable, 7 Skeleton; mixed evidence |
| Context Extraction | Cross-platform AI-thread extraction, provenance preservation, and ChatGPT project migration | 9 Draftable; analytical evidence |
| LifeTrkr | Offline celestial data and daily oracle workflows | 2 Draftable; live evidence records |
| LinkedIn | Turn finished work into postable angles and voice-consistent posts | 1 Draftable, 2 Skeleton; no indexed evidence |
| Mermaid | Governed diagram authoring, theming, publishing, updating, and repair | 7 Draftable, 2 Skeleton; local-check evidence in one package |
| Notion Capture | Route AI conversations into Notion with deduplication and GitHub reconciliation | 1 Draftable; no indexed evidence |
| Outcome Modeling | Compress event histories into calibrated forecasts and constrained decisions | 5 Draftable; current evaluation designs not run |
| Process Capture | Document, validate, govern, and package recurring organizational processes | 15 Draftable, 1 Skeleton; local-check evidence |
| ReFolDec | Transform artifacts across representation types, including fold, unfold, refold, and semantic-loss tracking | 1 Draftable; no indexed evidence |
| Universal | Cross-project builders, cataloging, API proxy, OAuth, and deployment skills | 8 Draftable, 1 Skeleton; mixed evidence |
| Glee-fully | Future conversion path for personalizable tools | Placeholder (Level 0) |
| AskJamie | Future lens-oriented professional support skills | Placeholder (Level 0) |

## Glee-fully Toolbox touchpoint

Recommended section title:

```text
Behind the Toolbox: Agent Skills
```

Suggested copy:

> Some Glee-fully Tools may eventually become portable Agent Skills, allowing the same reusable structure and workflows to run outside a single GPT surface. The public skill library lives under OKHP3's `skillz` project.

CTA:

```text
Learn about OKHP3 skillz → overkillhill.com/projects/skillz/
```

## AskJamie Lens System touchpoint

Recommended section title:

```text
Lens Support Skills
```

Suggested copy:

> Some AskJamie lenses may eventually gain portable Agent Skill support. The goal is not to collapse the lens model into a single ecosystem, but to make durable lens behaviors reusable across compatible agent runtimes.

CTA:

```text
See the OKHP3 skillz project → overkillhill.com/projects/skillz/
```

## Operating rule

GitHub is the source of truth for file state and installable artifacts.

Notion is the source of truth for strategy, architecture, maturity assessment, roadmap, and decision history.

OverKill Hill is the canonical public landing surface.

Glee-fully and AskJamie are contextual side doors only.
