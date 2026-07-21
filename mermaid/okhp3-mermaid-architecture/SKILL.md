---
name: okhp3-mermaid-architecture
description: OverKill Hill P³ architecture modeling in Mermaid. Use when the user wants a software or solution architecture, C4 context/container/component view, infrastructure or deployment topology, service relationship map, integration flow, block diagram, or packet/protocol view. Load okhp3-mermaid-core first for audience, type, naming, theming, and validation, then use this skill for architecture vocabulary and cross-diagram coherence.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-mermaid-architecture

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

System/solution architecture vocabulary, loaded after `okhp3-mermaid-core`.

## C4 Layering

Context → Container → Component → Code. Each layer is typically a separate diagram (per core's splitting guidance), cross-referenced in `DIAGRAMS.md`. The same system at multiple zoom levels is a feature, not duplication — see `references/c4-patterns.md` for layer-by-layer guidance and what belongs at each zoom level.

## Architecture-beta Diagrams

The newer Mermaid architecture syntax (`architecture-beta`) for cloud/infrastructure: groups, services, edges with directional sides (L/R/T/B), junctions for layout control. See `references/architecture-beta.md` for syntax and the known layout limitations (siblings sharing logical position, fcose layout tuning via `idealEdgeLengthMultiplier`).

## Solution Patterns

Integration flows, service topology, data flow diagrams. See `references/solution-patterns.md`.

## Block & Packet Diagrams

For high-level system overviews (`block-beta`) and protocol/network-level detail (`packet-beta`), use the routing rules in `references/architecture-beta.md` and `references/solution-patterns.md`. Keep block diagrams at the boundary-and-responsibility level. Use packet diagrams only when message fields, protocol direction, or network boundaries are part of the request. If the target renderer does not support the selected beta syntax, offer a stable flowchart or sequence-diagram equivalent and state the semantic tradeoff.

## Cross-diagram zoom coherence

When the same system appears at multiple C4 layers, each diagram should be independently valid (passes all 3 gates on its own) AND collectively coherent (container names match between Context and Container layers, etc.). This is a Gate 2 (semantic) check that spans multiple files — flag inconsistencies even though each individual diagram might pass its own Gate 2.

## Output contract

Return the selected architecture level or diagram family, system boundary, named actors, services, and stores, directional relationships, renderer caveats, and validation status. For a C4 set, include a cross-diagram name map so labels remain stable across zoom levels.

## References

- `references/c4-patterns.md` - C4 layer boundaries and naming.
- `references/architecture-beta.md` - architecture syntax and fallback rules.
- `references/solution-patterns.md` - integration, topology, and data-flow selection.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
