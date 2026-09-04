#!/usr/bin/env python3
"""
blast_radius_report.py - okhp3-notion-destructive-ops tooling

Format the confirmation message this skill's Step 3 requires, from a
structured description of the target and its children, so the blast-radius
statement and archive/permanent-delete distinction are worded consistently
every time instead of freehand per call. This is a formatter, not a
decision-maker: it never decides whether to proceed, and it never calls
Notion. It fails loudly if a required field is missing, since Step 2 is
explicit that scope must be surfaced before the confirmation is asked for.

Prerequisites: Python 3.9+, standard library only. No network access.

Usage:
    python3 blast_radius_report.py --file target.json
    python3 blast_radius_report.py --self-test

target.json shape:
    {
      "entity_type": "page",           // page | database | data_source | block
      "title": "Q3 Planning",
      "operation": "archive",          // archive | restore | permanent_delete
      "child_pages": 3,
      "child_blocks": 40,
      "row_count": 0,
      "relations_in": 2
    }

Exit status: 0 on success, 1 on missing/invalid input, 2 on a failing self-test.
"""

import argparse
import json
import sys

REQUIRED_FIELDS = ["entity_type", "title", "operation"]
VALID_ENTITY_TYPES = {"page", "database", "data_source", "block"}
VALID_OPERATIONS = {"archive", "restore", "permanent_delete"}

OPERATION_LANGUAGE = {
    "archive": "ARCHIVE (recoverable) - moves to Notion's trash, restorable through the UI "
               "or the restore operation, subject to the workspace's retention window.",
    "restore": "RESTORE - reverses a prior archive/trash action.",
    "permanent_delete": "PERMANENTLY DELETE (NOT recoverable through this skill or the API) - "
                         "this is a stronger action than archive. Confirm the user actually "
                         "means permanent deletion, because casual language like 'delete' "
                         "usually means archive, not this.",
}


def build_report(target: dict) -> dict:
    missing = [f for f in REQUIRED_FIELDS if f not in target]
    if missing:
        raise ValueError(f"target is missing required field(s): {missing}. Blast radius must be "
                          f"estimated before a confirmation is requested - do not fill these in "
                          f"with a guess.")

    entity_type = target["entity_type"]
    if entity_type not in VALID_ENTITY_TYPES:
        raise ValueError(f"entity_type {entity_type!r} is not one of {sorted(VALID_ENTITY_TYPES)}")

    operation = target["operation"]
    if operation not in VALID_OPERATIONS:
        raise ValueError(f"operation {operation!r} is not one of {sorted(VALID_OPERATIONS)}")

    child_pages = target.get("child_pages", 0)
    child_blocks = target.get("child_blocks", 0)
    row_count = target.get("row_count", 0)
    relations_in = target.get("relations_in", 0)

    scope_lines = []
    if child_pages:
        scope_lines.append(f"{child_pages} child page(s)")
    if child_blocks:
        scope_lines.append(f"{child_blocks} block(s)")
    if row_count:
        scope_lines.append(f"{row_count} row(s)")
    if relations_in:
        scope_lines.append(f"{relations_in} incoming relation(s) from elsewhere that will "
                            f"dangle or break")

    scope_statement = (
        "This will also remove " + ", ".join(scope_lines) + "."
        if scope_lines else
        "No child pages, blocks, rows, or incoming relations were found - this appears to be a "
        "leaf entity with no downstream scope."
    )

    message = (
        f"Target: {entity_type} \"{target['title']}\"\n"
        f"Operation: {OPERATION_LANGUAGE[operation]}\n"
        f"Blast radius: {scope_statement}\n"
        f"Proceeding requires explicit confirmation naming this exact target."
    )

    return {
        "entity_type": entity_type,
        "title": target["title"],
        "operation": operation,
        "scope_statement": scope_statement,
        "has_downstream_scope": bool(scope_lines),
        "confirmation_message": message,
    }


def self_test() -> int:
    failures = []

    leaf = build_report({"entity_type": "page", "title": "Scratch note", "operation": "archive"})
    if leaf["has_downstream_scope"]:
        failures.append(f"leaf target should report no downstream scope, got {leaf}")

    heavy = build_report({
        "entity_type": "database", "title": "Tasks", "operation": "permanent_delete",
        "child_pages": 0, "row_count": 340, "relations_in": 2,
    })
    if not heavy["has_downstream_scope"] or "340" not in heavy["scope_statement"]:
        failures.append(f"heavy target should surface row/relation counts, got {heavy}")
    if "NOT recoverable" not in heavy["confirmation_message"]:
        failures.append("permanent_delete confirmation must state it is not recoverable")

    archive = build_report({"entity_type": "page", "title": "X", "operation": "archive"})
    if "recoverable" not in archive["confirmation_message"] or \
       "NOT recoverable" in archive["confirmation_message"]:
        failures.append("archive confirmation must state it IS recoverable, distinctly from permanent_delete")

    try:
        build_report({"entity_type": "page", "operation": "archive"})  # missing title
        failures.append("missing required field should raise ValueError")
    except ValueError:
        pass

    try:
        build_report({"entity_type": "spreadsheet", "title": "X", "operation": "archive"})
        failures.append("invalid entity_type should raise ValueError")
    except ValueError:
        pass

    total = 5
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Format a blast-radius confirmation message.")
    parser.add_argument("--file", help="Path to a JSON file describing the target.")
    parser.add_argument("--json", help="Inline JSON object describing the target.")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if args.file:
        try:
            with open(args.file, "r", encoding="utf-8") as fh:
                target = json.load(fh)
        except (OSError, json.JSONDecodeError) as exc:
            print(f"Could not read --file: {exc}", file=sys.stderr)
            return 1
    elif args.json:
        try:
            target = json.loads(args.json)
        except json.JSONDecodeError as exc:
            print(f"Invalid --json: {exc}", file=sys.stderr)
            return 1
    else:
        parser.error("--file, --json, or --self-test is required")
        return 1

    try:
        report = build_report(target)
    except ValueError as exc:
        print(f"Invalid target: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
