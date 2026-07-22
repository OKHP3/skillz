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
67 reusable SKILL.md delegation contracts across 11 active families for Claude, OpenClaw, Codex, and compatible AI agents.
```

Current inventory snapshot, indexed July 21, 2026: 67 public distribution skills across 11 active families. The repository also contains two placeholder family directories and 18 project-local support skills. The placeholders and local support skills are not public distribution entries.

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
| Abrahamic | Scripture lookup, observance calendars, tradition reference, and cross-tradition comparison | Draftable (Level 2) |
| Agent Foundry | Custom GPT construction, readiness, and conversion planning | Draftable (Level 2) |
| Community | General-purpose UI, MCP, authoring, social, and engineering guidance | Mixed, mostly Draftable (Levels 1-2) |
| Context Extraction | Cross-platform AI-thread extraction, provenance preservation, and ChatGPT project migration | Draftable (Level 2) |
| LifeTrkr | Offline celestial data and daily oracle workflows | Draftable (Level 2) |
| LinkedIn | Turn finished work into postable angles and voice-consistent posts | Mixed, mostly Skeleton (Levels 1-2) |
| Mermaid | Governed diagram authoring, theming, publishing, updating, and repair | Mixed, mostly Draftable (Levels 1-2) |
| Notion Capture | Route AI conversations into Notion with deduplication and GitHub reconciliation | Draftable (Level 2) |
| Process Capture | Document, validate, govern, and package recurring organizational processes | Mixed, mostly Draftable (Levels 1-2) |
| ReFolDec | Transform artifacts across representation types, including fold, unfold, refold, and semantic-loss tracking | Draftable (Level 2) |
| Universal | Cross-project builders, cataloging, API proxy, OAuth, and deployment skills | Mixed, mostly Draftable (Levels 1-2) |
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
