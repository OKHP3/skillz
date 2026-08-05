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
113 reusable SKILL.md delegation contracts across 15 active families for Claude, OpenClaw, Codex, and compatible AI agents.
```

Current inventory snapshot, assessed August 4, 2026: 113 public distribution
skills across 15 active families. The repository also contains 16 project-local
support skills, which are not public distribution entries. Forge itself is an
M3 decision workbench, not yet a released or fully trustworthy distribution
center. See
[`docs/SKILLZ-FORGE-CAPABILITY-MATURITY-AUDIT-2026-08-04.md`](SKILLZ-FORGE-CAPABILITY-MATURITY-AUDIT-2026-08-04.md)
for the observed capability score and M4 gates.

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

| Family | Public angle | Current public status |
|---|---|---|
| Abrahamic | Scripture lookup, observance calendars, tradition reference, and cross-tradition comparison | Active distribution family |
| Agent Foundry | AI-agent creation, readiness, portability, comparison, and lifecycle | Active distribution family |
| AskJamie | AskJamie-specific Custom GPT and professional-support capabilities | Active distribution family |
| Community | General-purpose UI, MCP, authoring, social, and engineering guidance | Active distribution family |
| Context Extraction | Cross-platform AI-thread extraction, provenance preservation, and migration | Active distribution family |
| Glee-fully | Tool and Tool-ette architecture, persona density, and future consumer-skill conversion | Active distribution family |
| Knowledge Operations | Capture, classify, research, validate, and promote information work | Active distribution family |
| LifeTrkr | Offline celestial data and daily oracle workflows | Active distribution family |
| LinkedIn | Turn finished work into postable angles and voice-consistent posts | Active distribution family |
| Mermaid | Governed diagram authoring, theming, publishing, updating, and repair | Active distribution family |
| Notion | Route AI conversations into Notion with deduplication and GitHub reconciliation | Active distribution family |
| Outcome Modeling | Event-to-state forecasting and constrained decision adapters | Active distribution family |
| Process Capture | Document, validate, govern, and package recurring organizational processes | Active distribution family |
| ReFolDec | Transform artifacts across representations while tracking semantic loss | Active distribution family |
| Universal | Cross-project builders, cataloging, database, API proxy, OAuth, and deployment skills | Active distribution family |

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

## Current public-state rule

Public surfaces must use the generated repository inventory for counts and
describe Forge by observed capability, not planned features. As of 2026-08-04,
Forge supports catalog discovery, detail inspection, family narratives,
curated stacks, Compare, build-time activity, source/install links, and
GitHub contribution handoff. It must not be described as a released or fully
trustworthy distribution center until the M4 gates in the capability audit
pass.
