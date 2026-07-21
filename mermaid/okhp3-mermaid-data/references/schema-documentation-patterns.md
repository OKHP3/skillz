# Schema Documentation Patterns

## Documenting vs. designing

For an existing schema, identify the source of truth, capture the extraction date or version, and preserve actual names and types. For a proposed schema, label assumptions and design intent. Never present an inferred field or relationship as an existing fact.

## Drift management

The registry entry must record the source of truth, whether the diagram is generated or hand-maintained, the last verified version, and the next review trigger. A schema diagram with no provenance is incomplete.

## Large schema splitting

Split by domain or bounded context when labels, edges, or audience limits make one view unreadable. Add a small context map showing how the split views relate; do not duplicate every entity in every view.
