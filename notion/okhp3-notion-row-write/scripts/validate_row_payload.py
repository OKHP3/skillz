#!/usr/bin/env python3
"""
validate_row_payload.py - okhp3-notion-row-write tooling

Validate a candidate row-write property payload against a fetched schema and
the minimal property-type table in SKILL.md, before it is ever sent to
Notion. Catches the family's most emphasized failure modes: a field the
schema does not support, a wrong write-value shape, an over-limit array, and
a relation write that illegally includes database_id under API version
2025-09-03.

This script never calls Notion. Supply the schema (a list of {name, type}
dicts, or the raw shape of GET /v1/data_sources/:id's "properties" object)
and the payload you intend to send.

Prerequisites: Python 3.9+, standard library only. No network access.

Usage:
    python3 validate_row_payload.py --schema schema.json --payload payload.json
    python3 validate_row_payload.py --self-test

schema.json may be either:
    {"Name": "title", "Status": "status", "Tags": "multi_select"}
or the raw Notion data-source properties object:
    {"Name": {"type": "title", ...}, "Status": {"type": "status", ...}}

Exit status: 0 if the payload is valid, 1 if it has errors, 2 on a failing
self-test.
"""

import argparse
import json
import sys

KNOWN_TYPES = {
    "title", "rich_text", "select", "status", "multi_select", "date",
    "checkbox", "number", "url", "email", "phone_number", "people", "relation",
}

ARRAY_CAP_TYPES = {"multi_select": 100, "relation": 100, "people": 100}
STRING_LENGTH_CAPS = {"url": 2000, "email": 200, "phone_number": 200}


def _normalize_schema(schema: dict) -> dict:
    """Accept either {name: type} or the raw Notion properties object."""
    normalized = {}
    for name, value in schema.items():
        if isinstance(value, str):
            normalized[name] = value
        elif isinstance(value, dict) and "type" in value:
            normalized[name] = value["type"]
        else:
            normalized[name] = None  # unrecognized shape; flagged as unknown type
    return normalized


def validate_payload(schema: dict, payload: dict) -> list:
    """Return a list of error dicts. Empty list means the payload is valid."""
    errors = []
    schema = _normalize_schema(schema)

    for field, value in payload.items():
        if field not in schema:
            errors.append({
                "field": field,
                "error": "unknown_field",
                "detail": f"'{field}' is not in the fetched schema. Do not silently drop it or "
                          f"guess a property name that 'should' exist - stop and route to a "
                          f"schema-migration decision.",
            })
            continue

        prop_type = schema[field]
        if prop_type not in KNOWN_TYPES:
            errors.append({
                "field": field,
                "error": "unhandled_type",
                "detail": f"Schema reports type '{prop_type}', which this skill's minimal "
                          f"property-type table does not cover (formula/rollup/etc). Confirm "
                          f"whether direct writes are even accepted before attempting one.",
            })
            continue

        if not isinstance(value, dict) or prop_type not in value:
            errors.append({
                "field": field,
                "error": "wrong_shape",
                "detail": f"Expected a JSON object with a top-level '{prop_type}' key, e.g. "
                          f"{{\"{prop_type}\": ...}}. Got {type(value).__name__}: {value!r}",
            })
            continue

        inner = value[prop_type]

        # title / rich_text: inner value must be a list of rich-text objects,
        # not a bare string, and each element must carry a recognized
        # rich-text-object key (text, mention, or equation) - not just be
        # list-shaped.
        if prop_type in ("title", "rich_text"):
            if not isinstance(inner, list):
                errors.append({
                    "field": field,
                    "error": "wrong_shape",
                    "detail": f"'{prop_type}' must be a list of rich-text objects, e.g. "
                              f"{{\"{prop_type}\": [{{\"text\": {{\"content\": \"...\"}}}}]}}, "
                              f"not a bare {type(inner).__name__}.",
                })
            else:
                bad_elements = [
                    idx for idx, el in enumerate(inner)
                    if not (isinstance(el, dict) and
                            ("text" in el or "mention" in el or "equation" in el))
                ]
                if bad_elements:
                    errors.append({
                        "field": field,
                        "error": "wrong_shape",
                        "detail": f"'{prop_type}' element(s) at index {bad_elements} are not "
                                  f"valid rich-text objects. Each element must be a dict with "
                                  f"a 'text', 'mention', or 'equation' key, e.g. "
                                  f"{{\"text\": {{\"content\": \"...\"}}}}.",
                    })

        # Relation-specific: forbid database_id entirely under 2025-09-03.
        if prop_type == "relation":
            if not isinstance(inner, list):
                errors.append({"field": field, "error": "wrong_shape",
                                "detail": "relation value must be a list of {\"id\": ...} objects."})
            else:
                for item in inner:
                    if isinstance(item, dict) and "database_id" in item:
                        errors.append({
                            "field": field,
                            "error": "forbidden_database_id_in_relation",
                            "detail": "Relation writes must send only data_source_id-scoped "
                                      "targets. Sending database_id in a relation write is a "
                                      "validation error under API version 2025-09-03.",
                        })

        # Array cap checks (multi_select, relation, people): 100 per request.
        if prop_type in ARRAY_CAP_TYPES and isinstance(inner, list):
            cap = ARRAY_CAP_TYPES[prop_type]
            if len(inner) > cap:
                errors.append({
                    "field": field,
                    "error": "over_array_cap",
                    "detail": f"{len(inner)} items exceeds the {cap}-per-request cap for "
                              f"'{prop_type}'. This caps a single request, not the total the "
                              f"property can hold over time - split across sequential writes.",
                })

        # select / status: must be a {"name": "..."} object, not a bare string.
        if prop_type in ("select", "status"):
            if not (isinstance(inner, dict) and "name" in inner):
                errors.append({
                    "field": field,
                    "error": "wrong_shape",
                    "detail": f"'{prop_type}' must be {{\"name\": \"<exact existing option "
                              f"name>\"}}, not a bare string. Use the schema's exact option "
                              f"name, never an assumed one.",
                })

        # checkbox: must be a real bool, not "true"/"false" strings or __YES__/__NO__.
        if prop_type == "checkbox" and not isinstance(inner, bool):
            errors.append({
                "field": field,
                "error": "wrong_shape",
                "detail": "checkbox must be a JSON boolean (true/false), not a string. The "
                          "__YES__/__NO__ literal is a SQL-mode-only convention "
                          "(okhp3-notion-query) and does not apply here.",
            })

        # url/email/phone_number: length caps.
        if prop_type in STRING_LENGTH_CAPS and isinstance(inner, str):
            cap = STRING_LENGTH_CAPS[prop_type]
            if len(inner) > cap:
                errors.append({
                    "field": field,
                    "error": "over_length_cap",
                    "detail": f"{len(inner)} characters exceeds the {cap}-character cap for "
                              f"'{prop_type}'.",
                })

    return errors


SELF_TEST_SCHEMA = {
    "Name": "title",
    "Status": "status",
    "Tags": "multi_select",
    "Related": "relation",
    "Done": "checkbox",
    "Site": "url",
    "Score": "number",
}


def self_test() -> int:
    failures = []

    valid_payload = {
        "Name": {"title": [{"text": {"content": "Ship the docs"}}]},
        "Status": {"status": {"name": "In progress"}},
        "Tags": {"multi_select": [{"name": "docs"}, {"name": "urgent"}]},
        "Done": {"checkbox": False},
        "Score": {"number": 3},
    }
    errors = validate_payload(SELF_TEST_SCHEMA, valid_payload)
    if errors:
        failures.append(f"valid_payload should have 0 errors, got {errors}")

    unknown_field_payload = {"NotInSchema": {"rich_text": [{"text": {"content": "x"}}]}}
    errors = validate_payload(SELF_TEST_SCHEMA, unknown_field_payload)
    if not any(e["error"] == "unknown_field" for e in errors):
        failures.append("unknown_field case should be flagged")

    bad_select_payload = {"Status": {"status": "In progress"}}
    errors = validate_payload(SELF_TEST_SCHEMA, bad_select_payload)
    if not any(e["error"] == "wrong_shape" for e in errors):
        failures.append("bare-string select/status should be flagged as wrong_shape")

    over_cap_payload = {"Tags": {"multi_select": [{"name": f"t{i}"} for i in range(101)]}}
    errors = validate_payload(SELF_TEST_SCHEMA, over_cap_payload)
    if not any(e["error"] == "over_array_cap" for e in errors):
        failures.append("101-item multi_select should be flagged as over_array_cap")

    forbidden_relation_payload = {"Related": {"relation": [{"id": "x", "database_id": "y"}]}}
    errors = validate_payload(SELF_TEST_SCHEMA, forbidden_relation_payload)
    if not any(e["error"] == "forbidden_database_id_in_relation" for e in errors):
        failures.append("database_id in a relation write should be flagged")

    bad_checkbox_payload = {"Done": {"checkbox": "__YES__"}}
    errors = validate_payload(SELF_TEST_SCHEMA, bad_checkbox_payload)
    if not any(e["error"] == "wrong_shape" for e in errors):
        failures.append("string checkbox value should be flagged as wrong_shape")

    raw_notion_schema = {"Name": {"type": "title", "id": "title"},
                          "Status": {"type": "status", "id": "abc"}}
    errors = validate_payload(raw_notion_schema, {"Name": {"title": [{"text": {"content": "x"}}]}})
    if errors:
        failures.append(f"raw Notion schema shape should normalize cleanly, got {errors}")

    bare_string_title_payload = {"Name": {"title": "just a string, not a list"}}
    errors = validate_payload(SELF_TEST_SCHEMA, bare_string_title_payload)
    if not any(e["error"] == "wrong_shape" for e in errors):
        failures.append("bare-string title value should be flagged as wrong_shape")

    malformed_element_payload = {"Name": {"title": ["not an object"]}}
    errors = validate_payload(SELF_TEST_SCHEMA, malformed_element_payload)
    if not any(e["error"] == "wrong_shape" for e in errors):
        failures.append("a title list containing a bare string element should be flagged as wrong_shape")

    mention_element_payload = {"Name": {"title": [{"mention": {"page": {"id": "x"}}}]}}
    errors = validate_payload(SELF_TEST_SCHEMA, mention_element_payload)
    if errors:
        failures.append(f"a valid mention-shaped rich-text element should not be flagged, got {errors}")

    total = 10
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a row-write payload against a fetched schema.")
    parser.add_argument("--schema", help="Path to a JSON file with the fetched schema.")
    parser.add_argument("--payload", help="Path to a JSON file with the candidate write payload.")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if not args.schema or not args.payload:
        parser.error("--schema and --payload are required (or use --self-test)")
        return 1

    try:
        with open(args.schema, "r", encoding="utf-8") as fh:
            schema = json.load(fh)
        with open(args.payload, "r", encoding="utf-8") as fh:
            payload = json.load(fh)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Could not read --schema or --payload: {exc}", file=sys.stderr)
        return 1

    errors = validate_payload(schema, payload)
    if errors:
        print(json.dumps({"valid": False, "errors": errors}, indent=2))
        return 1
    print(json.dumps({"valid": True, "errors": []}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
