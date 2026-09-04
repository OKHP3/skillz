#!/usr/bin/env python3
"""
check_markdown_fidelity.py - okhp3-notion-page-read tooling

Scan extracted page markdown for common extraction-failure signatures before
presenting it as a faithful read, per SKILL.md's "Validation loop". This is
a lint, not proof of correctness - it catches signatures of known failure
modes, not every possible fidelity loss.

Checks:
  - a bare 32-hex or dashed-UUID token outside a code fence (often an
    unresolved mention that should have been rendered as display text)
  - the literal "[object Object]" (a common serialization bug signature)
  - empty or near-empty output for a nonzero source
  - unbalanced code fences (odd number of ``` lines)
  - a heading level that jumps by more than one (H1 straight to H3)

Prerequisites: Python 3.9+, standard library only. No network access.

Usage:
    python3 check_markdown_fidelity.py --file extracted.md
    python3 check_markdown_fidelity.py --stdin < extracted.md
    python3 check_markdown_fidelity.py --self-test

Exit status: 0 if clean, 1 if findings exist, 2 on a failing self-test.
"""

import argparse
import re
import sys

RE_UUID_TOKEN = re.compile(
    r"\b[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}\b"
)
RE_CODE_FENCE = re.compile(r"^```", re.MULTILINE)
RE_HEADING = re.compile(r"^(#{1,6})\s+\S", re.MULTILINE)


def _strip_code_fences(text: str) -> str:
    """Remove fenced code block contents so their tokens aren't false positives."""
    return re.sub(r"```.*?```", "", text, flags=re.DOTALL)


def check(markdown: str) -> list:
    findings = []

    if not markdown or not markdown.strip():
        findings.append({
            "rule": "empty_output",
            "severity": "error",
            "detail": "Extracted markdown is empty or whitespace-only. State explicitly "
                      "that nothing was retrieved rather than presenting this as a complete read.",
        })
        return findings  # further checks are meaningless on empty input

    if "[object Object]" in markdown:
        findings.append({
            "rule": "object_object_literal",
            "severity": "error",
            "detail": "Literal '[object Object]' found - a common serialization bug signature, "
                      "not real page content.",
        })

    stripped = _strip_code_fences(markdown)
    bare_uuids = RE_UUID_TOKEN.findall(stripped)
    if bare_uuids:
        findings.append({
            "rule": "unresolved_mention_id",
            "severity": "warning",
            "detail": f"{len(bare_uuids)} bare UUID-shaped token(s) found outside code fences "
                      f"(e.g. {bare_uuids[0]!r}). Page and user mentions should render as "
                      f"resolved display text plus the underlying reference, not a raw ID. "
                      f"Verify these are not unresolved mentions.",
        })

    fence_count = len(RE_CODE_FENCE.findall(markdown))
    if fence_count % 2 != 0:
        findings.append({
            "rule": "unbalanced_code_fence",
            "severity": "error",
            "detail": f"{fence_count} '```' fence markers found (odd count). A code block "
                      f"was likely truncated or merged with adjacent content.",
        })

    heading_levels = [len(m.group(1)) for m in RE_HEADING.finditer(markdown)]
    prev = None
    for level in heading_levels:
        if prev is not None and level - prev > 1:
            findings.append({
                "rule": "heading_level_jump",
                "severity": "warning",
                "detail": f"Heading level jumped from H{prev} to H{level} with no intermediate "
                          f"level. May indicate a dropped heading during extraction, or may be "
                          f"a genuine structure - confirm rather than assume.",
            })
            break  # one flag is enough; don't spam for a genuinely deep document
        prev = level

    return findings


def self_test() -> int:
    failures = []

    cases = [
        ("# Title\n\nSome clean paragraph text.\n\n## Section\n\nMore text.", 0),
        ("", 1),  # empty
        ("Result: [object Object]", 1),
        ("Owner: 215d872b-594c-81bd-bea2-0002d0d66c12 handled this.", 1),
        ("```\nunclosed fence\ncontent here", 1),
        ("# Title\n\n### Deep section with no H2", 1),
        ("```\nfenced content with a fake 215d872b-594c-81bd-bea2-0002d0d66c12 uuid\n```", 0),
    ]
    for markdown, expected_count in cases:
        findings = check(markdown)
        if len(findings) != expected_count:
            failures.append(
                f"check({markdown!r}) -> {len(findings)} findings {findings}, want {expected_count}"
            )

    total = len(cases)
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint extracted Notion page markdown for fidelity issues.")
    parser.add_argument("--file", help="Path to a markdown file to check.")
    parser.add_argument("--stdin", action="store_true", help="Read markdown from stdin.")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if args.file:
        with open(args.file, "r", encoding="utf-8") as fh:
            markdown = fh.read()
    elif args.stdin:
        markdown = sys.stdin.read()
    else:
        parser.error("--file, --stdin, or --self-test is required")
        return 1

    findings = check(markdown)
    import json
    print(json.dumps({"findings": findings, "clean": not findings}, indent=2))
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
