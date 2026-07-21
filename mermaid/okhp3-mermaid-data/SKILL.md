---
name: okhp3-mermaid-data
description: OverKill Hill P³ data-model diagrams in Mermaid. Use when the user wants an entity-relationship diagram, class diagram, database schema view, object structure, class hierarchy, or relationship diagram with cardinality. Load okhp3-mermaid-core first for audience, type, naming, theming, and validation, then use this skill for schema and relationship conventions.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.1.0"
  category: developer-tooling
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
---

# okhp3-mermaid-data

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Data modeling vocabulary, loaded after `okhp3-mermaid-core`.

## ER Diagrams

Entity-relationship modeling with cardinality notation. See `references/erd-syntax.md` for entity/attribute syntax and cardinality conventions (one-to-one, one-to-many, many-to-many — exact notation and when PK/FK annotations are included vs. omitted for Executive/Analyst audiences).

## Class Diagrams

Object structure, relationships, methods. See `references/class-diagram-syntax.md`.

## Schema Documentation Patterns

When a diagram is documenting an existing schema (vs. designing a new one), see `references/schema-documentation-patterns.md` for how much of the real schema to surface at each audience tier — Technical gets full field lists and types, Analyst gets entity names and relationships only, Executive rarely needs this diagram type at all (flag if an Executive-tier ER diagram is requested; it may be the wrong type per core's type matrix).

## Cardinality Conventions

Consistent notation across all OKHP3 ER diagrams — defined once in `references/erd-syntax.md`, referenced rather than re-decided per diagram.

## Output contract

State whether the diagram documents an existing schema or proposes a design. Preserve supplied entity and field names, label inferred relationships as assumptions, and include cardinality notation only when supported by evidence. Run the core syntax, semantic, and audience-fit gates.

## References

- `references/erd-syntax.md` - ER syntax and cardinality conventions.
- `references/class-diagram-syntax.md` - class and object structure patterns.
- `references/schema-documentation-patterns.md` - audience-specific schema detail.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://github.com/OKHP3)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
