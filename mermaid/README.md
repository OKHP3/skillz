# Mermaid family

Seven skills. One foundation, four domains, one publish layer, one update skill, one repair skill.

`okhp3-mermaid-core` loads first on every Mermaid task. It owns audience declaration, type selection, the OKHP3 design system, naming/registry, and the three validation gates. The domain skills (`bpmn`, `architecture`, `data`) are vocabulary and pattern libraries that core routes into. `publish` handles render and MCP output. `update` applies changes to existing diagrams while preserving style. `repair` fixes broken syntax with minimum intervention.

See repo-root `AGENTS.md` for trigger conditions.

## Why this exists

Reviewed against the four most prominent community Mermaid skills (mgranberry, WH-2099, softaworks, Agents365). None cover BPMN, swim lanes, audience adaptation, multi-diagram coherence, MCP publish integration, style-preserving updates, or syntax repair. Full teardown in `docs/mermaid/okhp3-mermaid-skill-prd.md`; this family fills those gaps.

## Diagram output contract

All skills in this family follow the shared output rules in `okhp3-mermaid-core/references/diagram-output-contract.md`:

- One Mermaid block per response
- No stray prose inside the fenced block
- Stable short IDs; quoted labels with spaces or special characters
- No semicolons; no `end` as a node ID
- No HTML unless the renderer explicitly supports it
- No invented classDef names
- Every classDef sets `fill`, `stroke`, AND `color`
- Preserve existing style on update; repair minimally
- Never delete rendered output

## Mermaid Theme Builder

`okhp3-mermaid-core` pulls its four palettes (Ocean Depth, Forest Sage, Slate Ember, Violet Mist) from [Mermaid Theme Builder](https://github.com/OKHP3/mermaid-theme-builder) as `classDef` recipes. That repo is the visual-governance layer for this family. See `docs/governance-profile-concept.md` for the governance profile pattern.

## Skill map

| Skill | Role | Loads after |
|---|---|---|
| `okhp3-mermaid-core` | Foundation — always first | (entry point) |
| `okhp3-mermaid-bpmn` | BPMN process vocabulary | core |
| `okhp3-mermaid-architecture` | C4, solution arch, infra | core |
| `okhp3-mermaid-data` | ERD, class diagrams, schema | core |
| `okhp3-mermaid-publish` | Render, MCP publish, output formats | core |
| `okhp3-mermaid-update` | Style-preserving content changes to existing diagrams | core |
| `okhp3-mermaid-repair` | Minimum syntax repair on broken diagrams | core |
