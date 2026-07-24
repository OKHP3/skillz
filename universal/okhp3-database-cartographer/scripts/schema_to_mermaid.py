#!/usr/bin/env python3
"""
schema_to_mermaid.py -- convert a normalized schema-inventory dict into
Mermaid `erDiagram` text.

This is the entire diagramming half of okhp3-database-cartographer. It has
no dependency on any database driver, on SQLAlchemy, or on any third-party
ER-diagram library -- it is pure string templating against the schema shape
documented in references/mermaid-handoff.md. That shape is close enough to
what sqlalchemy.inspect() already returns that the normalization step
upstream of this script is thin.

Validated against a live Mermaid renderer during design (2026-07-24) using
two real entities pulled from an actual production schema, including a
self-referential foreign key -- confirmed valid, diagramType: er.

v1.1.0: added infer_cardinality(), ported from a marketplace comparison
against mermerd (github.com/KarnerTh/mermerd) -- a mature Go CLI that does
the same DB-to-Mermaid job for Postgres/MySQL/MSSQL/SQLite. Its standout
capability was deriving relationship cardinality from FK nullability/
uniqueness automatically rather than requiring it hand-specified. This
brings that same intelligence into the converter without adopting the
external tool or any new dependency -- see references/competitive-landscape.md.

Usage:
    from schema_to_mermaid import to_mermaid_erdiagram
    mermaid_text = to_mermaid_erdiagram(schema_inventory)

Or as a CLI, reading a JSON inventory from stdin or a file:
    python3 schema_to_mermaid.py inventory.json
    cat inventory.json | python3 schema_to_mermaid.py
"""

import json
import sys


def infer_cardinality(fk_nullable: bool, fk_unique: bool) -> str:
    """
    Derive a Mermaid erDiagram cardinality operator from FK column metadata,
    instead of requiring the caller to hand-specify it.

    fk_nullable: whether the foreign-key column allows NULL (an optional
        relationship on the child side) vs. NOT NULL (required).
    fk_unique: whether the foreign-key column carries a unique constraint
        (a one-to-one relationship) vs. an ordinary index (one-to-many).

    Both values come straight off what SQLAlchemy's inspect() already
    returns per column (the "nullable" field from get_columns(), and
    whether the column appears in get_unique_constraints()) -- no extra
    query is needed beyond what the interrogation step already collects.

    Returns the "from" side of a parent--child edge, read as:
    "parent CARDINALITY child" -- e.g. ORGANIZATIONS ||--o{ ITEMS.
    """
    parent_side = "||"  # a referenced parent row is always exactly one
    if fk_unique:
        child_side = "||" if not fk_nullable else "|o"
    else:
        child_side = "|{" if not fk_nullable else "o{"
    return f"{parent_side}--{child_side}"


def to_mermaid_erdiagram(inventory: dict) -> str:
    """
    Convert a schema-inventory dict (see references/mermaid-handoff.md for
    the exact shape) into Mermaid erDiagram syntax.

    Expected shape:
        {
          "entities": [
            {"name": str, "columns": [
                {"name": str, "type": str, "constraints": [str, ...], "note": str}
            ]}
          ],
          "relationships": [
            {"from": str, "to": str, "label": str,
             # EITHER a literal Mermaid cardinality operator:
             "cardinality": str,
             # OR raw FK metadata for infer_cardinality() to resolve:
             "fk_nullable": bool, "fk_unique": bool}
          ]
        }

    A relationship missing "cardinality" but carrying "fk_nullable"/
    "fk_unique" gets its cardinality inferred automatically. Explicit
    "cardinality" always wins if present -- inference is a convenience,
    not a requirement.

    Raises KeyError if an entity is missing "name", or a relationship is
    missing "from"/"to"/"label" and cannot be resolved to a cardinality
    either explicitly or via inference -- fail loudly rather than emit a
    silently-broken diagram.
    """
    lines = ["erDiagram", ""]

    for entity in inventory.get("entities", []):
        name = entity["name"]
        lines.append(f"    {name} {{")
        for col in entity.get("columns", []):
            col_type = col.get("type", "string")
            col_name = col["name"]
            # Mermaid's erDiagram grammar only accepts a single ATTRIBUTE_WORD
            # per key slot; a space-joined "FK UK" fails to parse (confirmed
            # via live render during v1.1.0 testing). Comma-joining ("FK, UK")
            # is the syntax Mermaid actually accepts for a column carrying
            # more than one constraint keyword.
            constraints = ", ".join(col.get("constraints", []))
            note = col.get("note", "")

            piece = f"        {col_type} {col_name}"
            if constraints:
                piece += f" {constraints}"
            if note:
                # Mermaid attribute notes are double-quoted; escape any
                # embedded double quotes so the diagram doesn't break.
                safe_note = note.replace('"', "'")
                piece += f' "{safe_note}"'
            lines.append(piece)
        lines.append("    }")
        lines.append("")

    for rel in inventory.get("relationships", []):
        cardinality = rel.get("cardinality")
        if cardinality is None:
            cardinality = infer_cardinality(
                fk_nullable=rel["fk_nullable"], fk_unique=rel["fk_unique"]
            )
        safe_label = rel.get("label", "").replace('"', "'")
        lines.append(f'    {rel["from"]} {cardinality} {rel["to"]} : "{safe_label}"')

    return "\n".join(lines).rstrip() + "\n"


def _main() -> int:
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            inventory = json.load(f)
    else:
        inventory = json.load(sys.stdin)

    print(to_mermaid_erdiagram(inventory))
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
