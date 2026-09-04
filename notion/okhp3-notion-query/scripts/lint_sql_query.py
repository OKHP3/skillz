#!/usr/bin/env python3
"""
lint_sql_query.py - okhp3-notion-query tooling

Pre-flight lint for a SQL-mode query before it is sent, catching the traps
documented in SKILL.md's "SQL mode caveats" section: string-interpolated
values instead of parameterized placeholders, a placeholder/params count
mismatch, boolean literals used where the __YES__/__NO__ checkbox
convention applies, and an unbounded SELECT with no LIMIT.

This is a heuristic lint, not a SQL parser. It cannot know column types, so
the checkbox-literal check is a warning, not a hard failure. It never calls
Notion.

Prerequisites: Python 3.9+, standard library only.

Usage:
    python3 lint_sql_query.py --sql "SELECT * FROM ds WHERE status = ?" --params '["Open"]'
    python3 lint_sql_query.py --sql "SELECT * FROM ds WHERE status = 'Open'"
    python3 lint_sql_query.py --self-test

Exit status: 0 if the query has no findings, 1 if it has findings, 2 on a
failing self-test.
"""

import argparse
import json
import re
import sys

RE_PLACEHOLDER = re.compile(r"\?")
RE_QUOTED_LITERAL_IN_COMPARISON = re.compile(r"(=|!=|<>|LIKE)\s*'[^']*'", re.IGNORECASE)
RE_BOOL_LITERAL = re.compile(r"\b(TRUE|FALSE)\b", re.IGNORECASE)
RE_SELECT_STAR = re.compile(r"SELECT\s+\*", re.IGNORECASE)
RE_LIMIT = re.compile(r"\bLIMIT\s+\d+", re.IGNORECASE)


def lint(sql: str, params: list = None) -> list:
    findings = []
    params = params if params is not None else []

    placeholder_count = len(RE_PLACEHOLDER.findall(sql))
    if placeholder_count != len(params):
        findings.append({
            "rule": "placeholder_params_mismatch",
            "severity": "error",
            "detail": f"{placeholder_count} '?' placeholder(s) in the query but "
                      f"{len(params)} value(s) in params. Always use parameterized "
                      f"queries with a matching params array.",
        })

    if placeholder_count == 0 and RE_QUOTED_LITERAL_IN_COMPARISON.search(sql):
        findings.append({
            "rule": "possible_string_interpolation",
            "severity": "warning",
            "detail": "A quoted literal appears in a comparison with no '?' placeholders "
                      "anywhere in the query. If this literal came from user input, it "
                      "should be a parameterized value instead of interpolated text.",
        })

    if RE_BOOL_LITERAL.search(sql):
        findings.append({
            "rule": "bare_boolean_literal",
            "severity": "warning",
            "detail": "TRUE/FALSE literal found. If this compares against a checkbox "
                      "property, SQL mode uses the literal strings __YES__ and __NO__, "
                      "not boolean true/false. Confirm the column type before trusting "
                      "this comparison to work.",
        })

    if RE_SELECT_STAR.search(sql) and not RE_LIMIT.search(sql):
        findings.append({
            "rule": "unbounded_select_star",
            "severity": "warning",
            "detail": "SELECT * with no LIMIT. A query resolving more than 1,000 distinct "
                      "mention targets errors outright rather than returning partial rich "
                      "text - narrow the query or add an explicit LIMIT/OFFSET.",
        })

    return findings


SELF_TEST_CASES = [
    ("SELECT * FROM ds WHERE status = ?", ["Open"], 1),  # clean query, but SELECT * with no LIMIT
    ("SELECT * FROM ds WHERE status = 'Open'", None, 2),  # interpolation + no LIMIT
    ("SELECT * FROM ds WHERE status = ?", ["Open", "extra"], 2),  # mismatch + no LIMIT
    ("SELECT * FROM ds WHERE done = TRUE", None, 2),  # bool literal + no LIMIT
    ("SELECT id, name FROM ds WHERE status = ? LIMIT 50", ["Open"], 0),
]


def self_test() -> int:
    failures = []
    for sql, params, expected_count in SELF_TEST_CASES:
        findings = lint(sql, params)
        if len(findings) != expected_count:
            failures.append(
                f"lint({sql!r}, {params!r}) -> {len(findings)} findings "
                f"{findings}, want {expected_count}"
            )

    total = len(SELF_TEST_CASES)
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint a Notion SQL-mode query before sending it.")
    parser.add_argument("--sql", help="The SQL-mode query text.")
    parser.add_argument("--params", help="JSON array of parameter values, e.g. '[\"Open\"]'.")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if not args.sql:
        parser.error("--sql is required (or use --self-test)")
        return 1

    if args.params:
        try:
            params = json.loads(args.params)
        except json.JSONDecodeError as exc:
            print(f"Invalid --params: {exc}", file=sys.stderr)
            return 1
    else:
        params = []
    findings = lint(args.sql, params)
    print(json.dumps({"findings": findings, "clean": not findings}, indent=2))
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
