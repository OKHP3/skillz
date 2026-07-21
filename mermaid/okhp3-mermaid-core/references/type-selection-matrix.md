# Mermaid Type Selection Matrix

This is a repository routing snapshot, not a version guarantee. Verify the selected syntax against the target Mermaid renderer and current Mermaid release notes whenever a row is marked confirm, beta, newer, or separate package. Do not infer support from this table alone.

| Type | Mermaid status | OKHP3 disposition |
|---|---|---|
| Flowchart | Stable | Core. Default for fan-out/convergence/general process |
| Sequence | Stable | Core, also bpmn-relevant for interaction-heavy processes |
| Class | Stable | Routed → `okhp3-mermaid-data` |
| State | Stable | Core. State machines, lifecycle, also bpmn-relevant |
| ER (Entity Relationship) | Stable | Routed → `okhp3-mermaid-data` |
| Gantt | Stable | Core. NOT excluded — legitimate for process timelines despite some community skills excluding it |
| Pie | Stable | **Excluded.** No structural argument capability |
| Git Graph | Stable | **Excluded.** Out of scope for enterprise process work |
| User Journey | Stable | Core/bpmn. NOT excluded — has real enterprise service-design use cases |
| C4 | Stable (confirm exact version) | Routed → `okhp3-mermaid-architecture` |
| Mindmap | Stable | Core. Hierarchy/tree pattern |
| Timeline | Stable | Core. Ordered events |
| Quadrant | Stable (confirm) | Core after renderer verification; audience and axis semantics still need an explicit project rule |
| Requirement | Stable (confirm) | Review required before routing; use a plain flowchart if the target renderer lacks the required syntax |
| Sankey | Beta (confirm current status) | Core. Flow volumes / resource allocation |
| XY Chart | Beta (`xychart-beta`) | **Excluded.** Quantitative charting, not structural diagramming |
| Block | Beta (`block-beta`) | Routed → `okhp3-mermaid-architecture` |
| Architecture | Beta (`architecture-beta`, v11.1.0+) | Routed → `okhp3-mermaid-architecture` |
| Packet | Beta (`packet-beta`, v11.0.0+) | Routed → `okhp3-mermaid-architecture`. Protocol/network detail |
| Kanban | Stable (confirm) | Review required; route to BPMN only when the request is workflow semantics rather than a board view |
| ZenUML | Stable (separate package, confirm) | Use only when the required package is installed and the renderer is verified; otherwise use sequence diagrams |
| Treemap | Newer (confirm status) | Review required; route to data only when hierarchy is the actual subject |
| Ishikawa | Beta (`ishikawa-beta`, version-sensitive) | Use only after renderer verification; process root-cause work may be paired with BPMN, but the syntax choice remains explicit |
| Venn | Beta (`venn-beta`, v11.13.0) | Core. General comparison/overlap |
| Radar | Newer (confirm status) | Review required; use only for a comparison request that cannot be answered with a table |
| TreeView | Newer (confirm status) | Review required; use only after confirming renderer support and the requested hierarchy semantics |
| Wardley Maps | Newer (confirm status) | Review required; use only when the user explicitly requests a strategic value-chain view |

## Maintenance

This table is a living artifact. As Mermaid ships new versions, re-check support and routing. Keep unresolved rows labeled as review-required until the repository owner makes and tests a decision.
