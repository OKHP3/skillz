---
name: okhp3-database-cartographer
description: >
  OverKill Hill P³ database cartographer. Reverse-engineers and documents the
  live structure of Postgres, MySQL/MariaDB, MS SQL Server, SQLite, Oracle, and
  Microsoft Access databases via SQLAlchemy reflection or the right engine
  driver, producing a normalized schema inventory, a severity-classified
  (P1/P2/P3) diff against a locked design spec, and a Mermaid ER diagram handed
  to okhp3-mermaid-*/mermaid-diagrams for rendering. Use when asked to
  reverse-engineer, interrogate, document, or audit an existing database;
  verify a live build against a schema spec or data dictionary; generate an ER
  diagram from a real database connection; or check for schema drift. Also
  activate on "what does this database actually look like," "document this
  database," "audit against the spec," or "reflect this database's structure."
  Read-only by design -- not a data-quality profiler, not a migration
  generator, never writes to the target database.
license: MIT
compatibility: Requires Python 3.9+, SQLAlchemy 2.x, and network or file access to the target database. MS Access requires pyodbc + the Access ODBC driver (Windows) or COM/DAO.
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: universal
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope:
    - Reflecting live schema structure (tables, columns, types, PK/FK/UK, indexes) from any SQLAlchemy-supported engine
    - Reflecting Microsoft Access (.accdb/.mdb) via pyodbc or COM/DAO, flagged as the lower-reliability path
    - Diffing live structure against a locked design spec and classifying deviations P1/P2/P3
    - Generating a Mermaid ER diagram from the reflected schema, for rendering by okhp3-mermaid-*/mermaid-diagrams
    - Producing a normalized schema-inventory document (JSON/Markdown) as a durable artifact
  out_of_scope:
    - Data quality profiling or row-level data validation
    - Generating or running migration scripts
    - Firestore/Firebase or other schemaless NoSQL stores (deferred -- no mature Python tooling exists yet)
    - Writing to or modifying the target database in any way -- read-only interrogation only
---

# okhp3-database-cartographer

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Interrogates a live database of largely unknown or partially-documented structure and turns it into two things: a schema inventory with severity-classified findings against whatever spec you point it at, and a Mermaid ER diagram. It does the surveying and the cartography does not happen in the same tool -- interrogation and diagramming are deliberately decoupled (see "Architecture" below), because the best tool for connecting to a database and the best tool for drawing a diagram are never the same tool.

## Scope

| In scope | Out of scope |
|---|---|
| Reflecting live structure from Postgres, MySQL/MariaDB, MSSQL, SQLite, Oracle | Data quality / row-level profiling |
| Reflecting MS Access (.accdb/.mdb), flagged as the fragile path | Migration script generation |
| Diffing live structure against a locked spec, P1/P2/P3 findings | Firestore/NoSQL (deferred to a future version) |
| Generating a Mermaid ER diagram from the reflected schema | Writing to or modifying the target database |

If the task is "does this database's structure match what we documented" or "what does this database actually look like," this is the right skill. If the task is "is the data in this table clean" or "write me a migration," it is not.

## Architecture: two jobs, two tools, one handoff

**Interrogation** (engine-specific, produces a normalized schema-inventory) → **diagramming** (engine-agnostic, produces Mermaid text). Nothing about the diagram-generation step knows or cares which database engine the data came from. This split is why the skill doesn't depend on any single-purpose "database-to-ER-diagram" library -- those libraries (eralchemy2 and similar) couple the two jobs together and inherit the weaker of the two tools' maintenance status. Reflection tooling (SQLAlchemy) is rock solid; diagram-generation tooling that also does DB connections is not. Decoupling means each half can be swapped independently.

### Step 1 -- Interrogate

Pick the adapter for the target engine. Full driver table, INFORMATION_SCHEMA/sys.* fallback queries, and per-engine gotchas: `references/engine-adapters.md`.

- **Postgres, MySQL/MariaDB, MSSQL, SQLite, Oracle:** one code path. `sqlalchemy.inspect(engine)` returns tables, columns, types, PK/FK, indexes in one consistent shape regardless of engine. Use `sqlacodegen` if the deliverable should include generated ORM model code, not just an inventory.
- **MS Access (.accdb/.mdb):** `pyodbc` + the Access ODBC driver on Windows, or COM/DAO automation. Treat this path as fragile -- say so in the output, don't present it with the same confidence as the SQLAlchemy path.
- **Firestore/NoSQL:** out of scope for this version. No mature Python tooling exists to lean on; don't attempt a from-scratch sampling script under this skill without an explicit ask.

Normalize whatever comes back into one shape:

```json
{
  "entities": [
    {"name": "TABLE_NAME", "columns": [
      {"name": "col", "type": "int", "constraints": ["PK"], "note": "optional annotation"}
    ]}
  ],
  "relationships": [
    {"from": "A", "to": "B", "cardinality": "||--o{", "label": "relationship verb"}
  ]
}
```

This shape is what `scripts/schema_to_mermaid.py` expects as input. It is also close to what `sqlalchemy.inspect()` already returns -- the normalization step is thin. Relationships can skip `cardinality` and supply `fk_nullable`/`fk_unique` instead -- the diagram step infers the operator automatically (v1.1.0, see Step 3).

### Step 2 -- Diff against the locked spec

If the user points to a design spec (an ADR, a data dictionary, a migration file, a prior schema-inventory run), compare the live structure against it column by column. Classify every deviation:

- **P1** -- blocks data load, active corruption, or a live bug (e.g., wrong field type, a required relationship that doesn't exist).
- **P2** -- verify before broad use; not yet confirmed as correct or incorrect.
- **P3** -- future enhancement or cosmetic; non-blocking.

Full discipline and worked examples: `references/severity-classification.md`. This is inherited directly from a proven prior-art audit method -- don't loosen it.

### Step 3 -- Diagram

Run the schema-inventory JSON through `scripts/schema_to_mermaid.py`. It emits Mermaid `erDiagram` text with no external dependency -- no Graphviz, no ER-diagram-specific library. If a relationship's cardinality wasn't hand-specified, `infer_cardinality()` derives it from the FK's nullability and uniqueness -- no extra query needed, since that metadata already comes back from `inspector.get_columns()`/`get_unique_constraints()` in Step 1. Validate the output (Mermaid Chart tooling, or hand it to `okhp3-mermaid-*`/`mermaid-diagrams` for polish and rendering). Full syntax-mapping notes: `references/mermaid-handoff.md`; how this compares to the wider marketplace (mermerd, SchemaCrawler, and others) and what was learned from it: `references/competitive-landscape.md`.

## Security and safety

This skill connects to live databases, sometimes with real credentials, sometimes against production systems. Before running it:

- Confirm the user intends read access only. Never issue write, DDL, or DML statements against the target -- reflection and `SELECT`-only metadata queries are the entire footprint.
- Do not print or persist credentials found in connection strings. If a connection string is supplied inline, redact it in any saved output.
- If the target is explicitly described as production, prefer a read replica or a maintenance window if one is available; say so if the user hasn't mentioned one.
- Access via `pyodbc`/COM requires an installed driver and, for COM, an installed Access client -- both carry their own local-machine trust implications. Flag this rather than assuming it's fine.

## Output

A finished run produces three artifacts: the schema-inventory (JSON, and/or a Markdown table per entity), a findings list (severity-tagged, spec-referenced) if a spec was supplied, and a Mermaid ER diagram. Don't skip the findings list just because nothing was flagged -- "0 deviations found" is itself a useful, citable result, exactly like a clean audit pass.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
