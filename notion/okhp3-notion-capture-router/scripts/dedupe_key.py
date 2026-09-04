#!/usr/bin/env python3
"""
dedupe_key.py - okhp3-notion-capture-router tooling

Compute the stable idempotency key described in
references/destination-contract.md ("a stable matching key composed from
the source link or file identifier, normalized title, source date, and
destination scope") deterministically, so two runs of this skill against
the same source always produce the same key instead of an ad hoc one
invented per call.

This script never calls Notion. It only normalizes inputs into a key you
then search/query for before creating a record.

Prerequisites: Python 3.9+, standard library only. No network access.

Usage:
    python3 dedupe_key.py --title "Q3 Planning Notes" --source-date 2026-07-01 \\
        --destination-scope "Thread Index" --source-link "https://chat.openai.com/share/abc123"

    python3 dedupe_key.py --self-test

Exit status: 0 on success or a passing self-test, 2 on a failing self-test.
"""

import argparse
import hashlib
import json
import re
import sys

RE_WHITESPACE = re.compile(r"\s+")
RE_NON_ALNUM = re.compile(r"[^a-z0-9 ]")


def normalize_title(title: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace - stable across minor edits."""
    lowered = title.strip().lower()
    stripped = RE_NON_ALNUM.sub("", lowered)
    return RE_WHITESPACE.sub(" ", stripped).strip()


def compute_key(title: str, source_date: str = "", destination_scope: str = "",
                 source_link: str = "", file_identifier: str = "") -> dict:
    if not title:
        raise ValueError("title is required - a key cannot be built from nothing")

    normalized_title = normalize_title(title)
    stable_source = source_link.strip() if source_link else file_identifier.strip()

    parts = [
        stable_source or "(no-stable-source)",
        normalized_title,
        source_date.strip() if source_date else "(no-source-date)",
        destination_scope.strip().lower() if destination_scope else "(no-scope)",
    ]
    raw_key = "|".join(parts)
    digest = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()[:16]

    return {
        "normalized_title": normalized_title,
        "raw_key": raw_key,
        "key": digest,
        "has_stable_source": bool(stable_source),
        "note": (
            "No source link or file identifier was supplied - this key is weaker and should "
            "be paired with a title + source-date search rather than trusted as a unique match "
            "on its own, per the fallback in destination-contract.md."
            if not stable_source else
            "Search or query the destination for this key (or its constituent parts) before "
            "creating a record."
        ),
    }


def self_test() -> int:
    failures = []

    a = compute_key("Q3 Planning Notes", "2026-07-01", "Thread Index",
                     source_link="https://chat.openai.com/share/abc123")
    b = compute_key("q3   planning notes!!", "2026-07-01", "thread index",
                     source_link="https://chat.openai.com/share/abc123")
    if a["key"] != b["key"]:
        failures.append(f"minor title punctuation/case/whitespace differences should not "
                         f"change the key: {a['key']} != {b['key']}")

    c = compute_key("Q3 Planning Notes", "2026-07-01", "Thread Index",
                     source_link="https://chat.openai.com/share/DIFFERENT")
    if a["key"] == c["key"]:
        failures.append("a different source link should produce a different key")

    weak = compute_key("Untitled capture", "2026-07-01", "Thread Index")
    if weak["has_stable_source"]:
        failures.append("no source link or file identifier should report has_stable_source=False")

    try:
        compute_key("")
        failures.append("empty title should raise ValueError")
    except ValueError:
        pass

    total = 4
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Compute a stable dedupe key for a capture-router source.")
    parser.add_argument("--title")
    parser.add_argument("--source-date", default="")
    parser.add_argument("--destination-scope", default="")
    parser.add_argument("--source-link", default="")
    parser.add_argument("--file-identifier", default="")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if not args.title:
        parser.error("--title is required (or use --self-test)")
        return 1

    try:
        result = compute_key(args.title, args.source_date, args.destination_scope,
                              args.source_link, args.file_identifier)
    except ValueError as exc:
        print(f"Invalid input: {exc}", file=sys.stderr)
        return 1

    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
