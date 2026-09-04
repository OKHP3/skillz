#!/usr/bin/env python3
"""
classify_reference.py - okhp3-notion-identity-resolution tooling

Deterministically classify a raw Notion reference string against the
"Reference formats to recognize" table in SKILL.md, and extract the
underlying ID when the format makes that unambiguous. This replaces
freehand regex guessing with a single, testable classifier that every
caller gets the same answer from.

This script never calls Notion. It cannot resolve an ambiguous bare UUID
to a concrete entity type (page vs database vs data source vs block) - that step genuinely requires a fetch, per SKILL.md Step 3, and stays the
calling skill's job.

Prerequisites: Python 3.9+, standard library only.

Usage:
    python3 classify_reference.py "https://notion.so/workspace/Q3-Planning-215d872b594c81bdbea20002d0d66c12"
    python3 classify_reference.py "collection://215d872b-594c-81bd-bea2-0002d0d66c12"
    python3 classify_reference.py --stdin   # one reference per line, JSON per line out
    python3 classify_reference.py --self-test

Exit status: 0 on success or a passing self-test, 2 on a failing self-test.
"""

import argparse
import json
import re
import sys
from urllib.parse import urlparse, parse_qs

HEX32 = r"[0-9a-fA-F]{32}"
UUID_DASHED = r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"

RE_SCHEME = re.compile(r"^(collection|view|discussion)://(.+)$", re.IGNORECASE)
RE_BARE_UUID_DASHED = re.compile(rf"^{UUID_DASHED}$")
RE_BARE_UUID_NODASH = re.compile(rf"^{HEX32}$")
RE_TRAILING_ID = re.compile(rf"({UUID_DASHED}|{HEX32})\s*$")


def _normalize_id(raw_id: str) -> str:
    """Return the 32-char undashed lowercase form of a Notion ID."""
    return raw_id.replace("-", "").lower()


def classify(reference: str) -> dict:
    ref = reference.strip()
    if not ref:
        return {"input": reference, "format": "empty", "id": None,
                "resolves_to": None, "note": "Empty input is not a reference."}

    scheme_match = RE_SCHEME.match(ref)
    if scheme_match:
        scheme, rest = scheme_match.group(1).lower(), scheme_match.group(2)
        # Strip any trailing query/fragment noise, keep the hex/uuid core.
        id_match = RE_TRAILING_ID.search(rest) or re.search(rf"({UUID_DASHED}|{HEX32})", rest)
        extracted = _normalize_id(id_match.group(1)) if id_match else None
        resolves = {"collection": "data_source", "view": "view", "discussion": "discussion"}[scheme]
        note = {
            "collection": "Data source ID directly. Never pass this to an endpoint expecting a database_id.",
            "view": "A saved view's filters/sorts/display config, not the underlying rows. "
                    "Query with mode: \"view\" via okhp3-notion-query, or fetch the view:// "
                    "reference directly to inspect its configuration without running it.",
            "discussion": "A comment-thread anchor. Out of scope for this family until "
                          "okhp3-notion-comments-and-discussions (wave 2) ships.",
        }[scheme]
        return {"input": reference, "format": f"{scheme}://", "id": extracted,
                "resolves_to": resolves, "note": note}

    if RE_BARE_UUID_DASHED.match(ref) or RE_BARE_UUID_NODASH.match(ref):
        return {"input": reference, "format": "bare_uuid", "id": _normalize_id(ref),
                "resolves_to": "ambiguous", "note": "Ambiguous by itself. Requires a fetch to "
                "determine object type (page, database, data source, or block) per "
                "SKILL.md Step 3. Do not guess."}

    parsed = None
    try:
        parsed = urlparse(ref)
    except ValueError:
        parsed = None

    if parsed and parsed.scheme in ("http", "https") and parsed.netloc:
        host = parsed.netloc.lower()
        id_match = RE_TRAILING_ID.search(parsed.path)
        extracted = _normalize_id(id_match.group(1)) if id_match else None
        has_view_param = "v" in parse_qs(parsed.query)

        if host.endswith(".notion.site"):
            fmt = "notion_site_url"
            note = ("Notion Sites URL. Resolves via the same path as a standard URL once "
                    "the underlying ID is extracted.")
        elif host in ("notion.so", "www.notion.so") or host.endswith(".notion.so"):
            fmt = "standard_url"
            note = "Standard page/database URL."
        else:
            fmt = "unknown_url"
            note = "URL-shaped but not a recognized Notion host. Treat as an opaque external link."

        if has_view_param and extracted:
            note += (" Has a ?v= fragment: the base ID still resolves to the database, NOT the "
                      "view. Use notion-query-data-sources with mode: \"view\" to read what that "
                      "view shows.")

        if extracted is None:
            return {"input": reference, "format": fmt, "id": None, "resolves_to": "unresolved",
                    "note": note + " No trailing hex/UUID block found in the path; cannot extract an ID."}
        return {"input": reference, "format": fmt, "id": extracted,
                "resolves_to": "page_or_database", "note": note}

    return {"input": reference, "format": "plain_title", "id": None, "resolves_to": "unresolved",
            "note": "Not directly resolvable. Route to okhp3-notion-search-strategy to find "
                    "candidates, then confirm with the user before proceeding - unless exactly "
                    "one unambiguous match exists and the calling operation is read-only."}


SELF_TEST_CASES = [
    ("https://notion.so/workspace/Page-Title-215d872b594c81bdbea20002d0d66c12", "standard_url", "215d872b594c81bdbea20002d0d66c12"),
    ("https://acme.notion.site/Some-Page-215d872b594c81bdbea20002d0d66c12", "notion_site_url", "215d872b594c81bdbea20002d0d66c12"),
    ("215d872b-594c-81bd-bea2-0002d0d66c12", "bare_uuid", "215d872b594c81bdbea20002d0d66c12"),
    ("215d872b594c81bdbea20002d0d66c12", "bare_uuid", "215d872b594c81bdbea20002d0d66c12"),
    ("collection://215d872b-594c-81bd-bea2-0002d0d66c12", "collection://", "215d872b594c81bdbea20002d0d66c12"),
    ("view://215d872b-594c-81bd-bea2-0002d0d66c12", "view://", "215d872b594c81bdbea20002d0d66c12"),
    ("discussion://215d872b-594c-81bd-bea2-0002d0d66c12", "discussion://", "215d872b594c81bdbea20002d0d66c12"),
    ("the Tasks database", "plain_title", None),
    ("", "empty", None),
]


def self_test() -> int:
    failures = []
    for ref, expected_format, expected_id in SELF_TEST_CASES:
        result = classify(ref)
        if result["format"] != expected_format or result["id"] != expected_id:
            failures.append((ref, result, expected_format, expected_id))

    total = len(SELF_TEST_CASES)
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for ref, result, expected_format, expected_id in failures:
        print(f"  FAIL input={ref!r}")
        print(f"       got format={result['format']!r} id={result['id']!r}")
        print(f"       want format={expected_format!r} id={expected_id!r}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Classify a raw Notion reference string.")
    parser.add_argument("reference", nargs="?", help="The reference string to classify.")
    parser.add_argument("--stdin", action="store_true", help="Read one reference per line from stdin.")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if args.stdin:
        for line in sys.stdin:
            line = line.rstrip("\n")
            if line.strip():
                print(json.dumps(classify(line)))
        return 0

    if not args.reference:
        parser.error("a reference string, --stdin, or --self-test is required")
        return 1

    print(json.dumps(classify(args.reference), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
