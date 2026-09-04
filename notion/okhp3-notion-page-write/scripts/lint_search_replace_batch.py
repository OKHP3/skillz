#!/usr/bin/env python3
"""
lint_search_replace_batch.py - okhp3-notion-page-write tooling

Lint a targeted search-and-replace batch before sending it, against the two
documented traps in SKILL.md's "Targeted search-and-replace semantics"
section: an operation whose old_str equals new_str (silently ignored, no
match check performed), and a duplicate old_str across the batch without
replace_all_matches set (ambiguous - the API requires old_str to match
exactly one location unless that flag is explicit).

This script only inspects the batch of operations; it does not have access
to live page content and cannot confirm old_str actually matches anything
on the page. That confirmation still requires re-fetching the page
immediately before constructing the batch, per SKILL.md.

Prerequisites: Python 3.9+, standard library only. No network access.

Usage:
    python3 lint_search_replace_batch.py --file batch.json
    python3 lint_search_replace_batch.py --self-test

batch.json shape:
    [{"old_str": "foo", "new_str": "bar"},
     {"old_str": "baz", "new_str": "qux", "replace_all_matches": true}]

Exit status: 0 if clean, 1 if findings exist, 2 on a failing self-test.
"""

import argparse
import json
import sys
from collections import Counter


def lint(operations: list) -> list:
    findings = []

    if not operations:
        findings.append({
            "rule": "empty_batch",
            "severity": "warning",
            "detail": "Batch has no operations.",
        })
        return findings

    no_op_indices = [
        i for i, op in enumerate(operations)
        if op.get("old_str") == op.get("new_str")
    ]
    if no_op_indices:
        findings.append({
            "rule": "identical_old_new",
            "severity": "info",
            "detail": f"Operation(s) at index {no_op_indices} have old_str == new_str. "
                      f"The API silently ignores these without a match check - harmless, "
                      f"but confirm they were intentional and not a copy-paste mistake.",
        })

    all_old_strs = [op.get("old_str") for op in operations if "old_str" in op]
    counts = Counter(all_old_strs)
    duplicates = [s for s, n in counts.items() if n > 1]
    if duplicates:
        findings.append({
            "rule": "duplicate_old_str_across_batch",
            "severity": "error",
            "detail": f"old_str value(s) {duplicates!r} appear in more than one operation in "
                      f"this batch. Each old_str must match exactly one location on the page "
                      f"unless replace_all_matches: true is set for that specific operation - "
                      f"and a flag on only one of two operations sharing the same old_str "
                      f"does not resolve the ambiguity of which operation should apply where. "
                      f"Split into separate sequential batches or consolidate into one "
                      f"operation with replace_all_matches: true.",
        })

    for i, op in enumerate(operations):
        if "old_str" not in op or "new_str" not in op:
            findings.append({
                "rule": "missing_field",
                "severity": "error",
                "detail": f"Operation at index {i} is missing 'old_str' or 'new_str': {op!r}",
            })

    return findings


def self_test() -> int:
    failures = []

    cases = [
        ([{"old_str": "a", "new_str": "b"}, {"old_str": "c", "new_str": "d"}], 0),
        ([{"old_str": "a", "new_str": "a"}], 1),  # identical, info-level
        ([{"old_str": "a", "new_str": "b"}, {"old_str": "a", "new_str": "c"}], 1),  # duplicate, error
        ([{"old_str": "a", "new_str": "b"}, {"old_str": "a", "new_str": "c",
           "replace_all_matches": True}], 1),  # duplicate but one has the flag - still 1
        ([], 1),  # empty batch
        ([{"old_str": "a"}], 1),  # missing new_str
    ]
    for operations, expected_count in cases:
        findings = lint(operations)
        if len(findings) != expected_count:
            failures.append(
                f"lint({operations!r}) -> {len(findings)} findings {findings}, want {expected_count}"
            )

    total = len(cases)
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint a search-and-replace batch before sending it.")
    parser.add_argument("--file", help="Path to a JSON file with the batch of operations.")
    parser.add_argument("--json", help="Inline JSON array of operations.")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if args.file:
        try:
            with open(args.file, "r", encoding="utf-8") as fh:
                operations = json.load(fh)
        except (OSError, json.JSONDecodeError) as exc:
            print(f"Could not read --file: {exc}", file=sys.stderr)
            return 1
    elif args.json:
        try:
            operations = json.loads(args.json)
        except json.JSONDecodeError as exc:
            print(f"Invalid --json: {exc}", file=sys.stderr)
            return 1
    else:
        parser.error("--file, --json, or --self-test is required")
        return 1

    findings = lint(operations)
    print(json.dumps({"findings": findings, "clean": not findings}, indent=2))
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
