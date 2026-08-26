# Mermaid Handoff

How the interrogation layer's output becomes a diagram, without any ER-diagram-specific library in between.

## Why decoupled

The obvious approach -- a single library that connects to a database *and* draws its ER diagram -- couples two jobs with very different maintenance realities. Database reflection (SQLAlchemy) is core infrastructure with a large user base and predictable releases. Database-to-diagram libraries are a much smaller niche; the best-known Python option in this space carries an ambiguous "deprecated but the code still works" maintenance signal. Depending on it would mean the diagram half of this skill could silently break on a future SQLAlchemy release with no one watching the fix.

Decoupling removes that risk. The interrogation layer's job ends at a plain data structure. Turning that data structure into Mermaid text is a small enough problem to own directly -- about 20 lines, no dependency, nothing to go stale.

## The schema-inventory shape

This is the contract between interrogation and diagramming. Anything that produces this shape can feed the diagram step, regardless of which engine or adapter produced it.

```json
{
  "entities": [
    {
      "name": "TABLE_NAME",
      "columns": [
        {"name": "col_name", "type": "int", "constraints": ["PK"], "note": "optional annotation"},
        {"name": "other_col", "type": "string", "constraints": [], "note": ""}
      ]
    }
  ],
  "relationships": [
    {"from": "TABLE_A", "to": "TABLE_B", "cardinality": "||--o{", "label": "relationship verb"},
    {"from": "TABLE_A", "to": "TABLE_C", "fk_nullable": false, "fk_unique": true, "label": "relationship verb"}
  ]
}
```

`constraints` is a list so a column can carry more than one (`["PK", "FK"]` for a natural key that's also a foreign key). Multiple constraints on one column render comma-joined (`FK, UK`) -- Mermaid's `erDiagram` grammar rejects a space-joined `FK UK` outright, confirmed via a live parse failure during v1.1.0 testing.

A relationship can supply cardinality one of two ways. Either give `cardinality` directly, using Mermaid's own operator strings (`||--o{`, `|o--o{`, `}o--o{`, etc.) so no translation layer is needed. Or, since v1.1.0, omit `cardinality` and supply `fk_nullable`/`fk_unique` instead -- the converter infers it (see below). An explicit `cardinality` always wins if both are present.

## The converter

`scripts/schema_to_mermaid.py` exports two functions:

- `to_mermaid_erdiagram(inventory: dict) -> str` -- the main entry point. Pure string templating against the shape above -- no Graphviz, no third-party ER library. Output matches the syntax documented in the `mermaid-diagrams` skill's own `references/erd-diagrams.md` (entity blocks with `type name constraint "note"` attribute lines, standard cardinality operators), so anything it produces is immediately usable by that skill or by direct Mermaid rendering.
- `infer_cardinality(fk_nullable: bool, fk_unique: bool) -> str` -- added in v1.1.0, ported from a marketplace comparison against mermerd (github.com/KarnerTh/mermerd; see `references/competitive-landscape.md`). Derives the Mermaid cardinality operator from FK column metadata instead of requiring it hand-specified. The parent side of a relationship is always `||` (a referenced row is exactly one); the child side is `|{`/`o{` for a plain FK (required/optional many) or `||`/`|o` when the FK also carries a unique constraint (required/optional one-to-one). Both `fk_nullable` and `fk_unique` are already sitting in what SQLAlchemy's `inspect()` returns per column -- `nullable` from `get_columns()`, unique-constraint membership from `get_unique_constraints()` -- so no extra query is needed beyond what the interrogation step already collects.

## Validating output

Before treating generated Mermaid as final, validate it renders. If a live Mermaid-rendering tool is available in the session, use it directly. Otherwise hand the text to `mermaid-diagrams`/`okhp3-mermaid-*` and let that skill's own rendering path confirm it. Don't hand-wave "this should render" without checking -- Mermaid's `erDiagram` syntax fails silently on some malformed input rather than raising a clear error.

## Known limits, honestly stated

The converter is intentionally small and matched to what the proof-of-concept needed, not to every Mermaid ER feature. It has not been exercised against composite primary keys, many-to-many junction tables represented as a third entity, or very wide entities (30+ columns) where Mermaid's own rendering gets visually crowded regardless of input correctness. Extend it when a real schema needs one of these, rather than building it out preemptively.
