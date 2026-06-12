# Mermaid family

Five skills. One foundation, four domains, one publish layer.

`okhp3-mermaid-core` loads first on every Mermaid task. It owns audience declaration, type selection, the OKHP3 design system, naming/registry, and the three validation gates. The domain skills (`bpmn`, `architecture`, `data`) are vocabulary and pattern libraries that core routes into. `publish` handles render and MCP output.

See repo-root `AGENTS.md` for trigger conditions.

## Why this exists

Reviewed against the four most prominent community Mermaid skills (mgranberry, WH-2099, softaworks, Agents365). None cover BPMN, swim lanes, audience adaptation, multi-diagram coherence, or MCP publish integration. Full teardown in project history; this family fills that gap.
