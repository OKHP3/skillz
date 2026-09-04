#!/usr/bin/env python3
"""
classify_notion_error.py - okhp3-notion-core tooling

Deterministically classify a Notion API/MCP error response against the error
taxonomy in SKILL.md Step 5, so every sibling skill branches on the same
table instead of re-deriving it from message text.

Prerequisites: Python 3.9+, standard library only. No network access.

Usage:
    # From a JSON file
    python3 classify_notion_error.py --file error.json

    # From an inline JSON string
    python3 classify_notion_error.py --json '{"code": "rate_limited", "status": 429}'

    # From stdin
    echo '{"code":"object_not_found"}' | python3 classify_notion_error.py --stdin

    # Verify this script's own logic against the documented taxonomy
    python3 classify_notion_error.py --self-test

Exit status: 0 on a successful classification or a passing self-test,
1 on malformed input, 2 on a failing self-test.
"""

import argparse
import json
import sys

# One row per SKILL.md Step 5 table entry. Order matters: restricted_resource
# is disambiguated by the presence of additional_data.block_limit before the
# generic 403 case is considered.
TAXONOMY = [
    {
        "match": lambda e: e.get("code") == "rate_limited",
        "category": "rate_limited",
        "retry": True,
        "action": "Respect Retry-After if present, else exponential backoff. "
                  "Route to okhp3-notion-limits-and-retry.",
        "note_fn": lambda e: (
            "additional_data.rate_limit_reason={!r} ({})".format(
                e.get("additional_data", {}).get("rate_limit_reason"),
                "per-connection" if e.get("additional_data", {}).get("rate_limit_reason")
                == "public_api_request_rate_limit" else
                "per-workspace, shared" if e.get("additional_data", {}).get("rate_limit_reason")
                == "public_api_space_request_rate_limit" else "unspecified"
            )
        ),
    },
    {
        "match": lambda e: e.get("code") == "service_overload",
        "category": "service_overload",
        "retry": True,
        "action": "Same backoff handling as rate_limited (429).",
        "note_fn": lambda e: "Notion temporarily overloaded (529).",
    },
    {
        "match": lambda e: e.get("code") == "restricted_resource"
        and "block_limit" in e.get("additional_data", {}),
        "category": "block_limit",
        "retry": False,
        "action": "Do not retry. This is a plan limit, not a transient failure. "
                  "Tell the user a workspace owner must upgrade the plan, or that "
                  "the operation works for single-member free workspaces.",
        "note_fn": lambda e: "additional_data.block_limit={!r}".format(
            e.get("additional_data", {}).get("block_limit")
        ),
    },
    {
        "match": lambda e: e.get("code") == "restricted_resource",
        "category": "permission_denied",
        "retry": False,
        "action": "Report the missing permission to the user. Do not retry.",
        "note_fn": lambda e: "Ordinary 403 without block_limit.",
    },
    {
        "match": lambda e: e.get("code") == "object_not_found",
        "category": "object_not_found",
        "retry": False,
        "action": "On a retry after a truncation recovery, treat as a permissions "
                  "signal, not proof the object was deleted. Do not silently "
                  "conclude the entity does not exist.",
        "note_fn": lambda e: "404.",
    },
    {
        "match": lambda e: e.get("code") == "validation_error",
        "category": "validation_error",
        "retry": False,
        "action": "Fix the request payload. Do not retry unchanged.",
        "note_fn": lambda e: "400.",
    },
    {
        "match": lambda e: e.get("code") == "conflict_error",
        "category": "conflict_error",
        "retry": "after-refetch",
        "action": "Re-fetch current state before retrying.",
        "note_fn": lambda e: "409.",
    },
]


def classify(error: dict) -> dict:
    """Return a classification dict for a Notion error payload."""
    if not isinstance(error, dict):
        raise ValueError("error payload must be a JSON object")

    for row in TAXONOMY:
        try:
            matched = row["match"](error)
        except Exception:
            matched = False
        if matched:
            return {
                "code": error.get("code"),
                "category": row["category"],
                "retry": row["retry"],
                "action": row["action"],
                "note": row["note_fn"](error),
            }

    return {
        "code": error.get("code"),
        "category": "unrecognized",
        "retry": False,
        "action": "Unknown error code. Treat conservatively: do not retry "
                  "automatically, surface the raw code and message to the user.",
        "note": "No taxonomy row matched this code. The taxonomy may need a new "
                "row, or this is a non-Notion error shape.",
    }


SELF_TEST_CASES = [
    ({"code": "rate_limited", "status": 429,
      "additional_data": {"rate_limit_reason": "public_api_request_rate_limit"}},
     "rate_limited", True),
    ({"code": "service_overload", "status": 529}, "service_overload", True),
    ({"code": "restricted_resource", "status": 403,
      "additional_data": {"block_limit": "block_creation"}},
     "block_limit", False),
    ({"code": "restricted_resource", "status": 403}, "permission_denied", False),
    ({"code": "object_not_found", "status": 404}, "object_not_found", False),
    ({"code": "validation_error", "status": 400}, "validation_error", False),
    ({"code": "conflict_error", "status": 409}, "conflict_error", "after-refetch"),
    ({"code": "something_notion_has_not_documented_yet"}, "unrecognized", False),
]


def self_test() -> int:
    failures = []
    for payload, expected_category, expected_retry in SELF_TEST_CASES:
        result = classify(payload)
        if result["category"] != expected_category or result["retry"] != expected_retry:
            failures.append((payload, result, expected_category, expected_retry))

    total = len(SELF_TEST_CASES)
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for payload, result, expected_category, expected_retry in failures:
        print(f"  FAIL input={payload!r}")
        print(f"       got category={result['category']!r} retry={result['retry']!r}")
        print(f"       want category={expected_category!r} retry={expected_retry!r}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[1] if __doc__ else "")
    src = parser.add_mutually_exclusive_group()
    src.add_argument("--file", help="Path to a JSON file containing the error payload.")
    src.add_argument("--json", help="Inline JSON string of the error payload.")
    src.add_argument("--stdin", action="store_true", help="Read the JSON payload from stdin.")
    parser.add_argument("--self-test", action="store_true",
                         help="Run built-in assertions against the documented taxonomy and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if args.file:
        with open(args.file, "r", encoding="utf-8") as fh:
            raw = fh.read()
    elif args.json:
        raw = args.json
    elif args.stdin:
        raw = sys.stdin.read()
    else:
        parser.error("one of --file, --json, --stdin, or --self-test is required")
        return 1

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"Invalid JSON: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(classify(payload), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
