#!/usr/bin/env python3
"""
chunk_and_backoff.py - okhp3-notion-limits-and-retry tooling

Deterministic chunk planning and backoff math for the limits documented in
SKILL.md, so every caller in the family paces and batches calls the same
way instead of eyeballing it per task.

Prerequisites: Python 3.9+, standard library only. No network access - this script never calls Notion; it only computes the plan.

Usage:
    # Plan how to split N items into request-sized batches
    python3 chunk_and_backoff.py plan --items 347 --batch-size 100

    # Compute the wait before retry attempt N (1-indexed), honoring Retry-After
    python3 chunk_and_backoff.py backoff --attempt 3
    python3 chunk_and_backoff.py backoff --attempt 1 --retry-after 12

    # Verify this script's own math against the documented contract
    python3 chunk_and_backoff.py --self-test

Exit status: 0 on success or a passing self-test, 2 on a failing self-test.
"""

import argparse
import json
import random
import sys

MAX_BLOCK_ELEMENTS_PER_REQUEST = 1000
MAX_ARRAY_ELEMENTS_PER_REQUEST = 100  # blocks, rich-text objects, relation, people
MAX_MULTI_SELECT_OPTIONS = 100
MAX_PAYLOAD_BYTES = 500_000  # 500KB

BACKOFF_BASE_SECONDS = 1.0
BACKOFF_CAP_SECONDS = 30.0
BACKOFF_JITTER_MAX_MS = 250
MAX_RETRY_ATTEMPTS = 6


def plan_chunks(item_count: int, batch_size: int = MAX_ARRAY_ELEMENTS_PER_REQUEST) -> list:
    """Return a deterministic, fixed-size, sequential list of [start, end) batches."""
    if item_count < 0:
        raise ValueError("item_count must be >= 0")
    if batch_size <= 0:
        raise ValueError("batch_size must be > 0")
    if batch_size > MAX_ARRAY_ELEMENTS_PER_REQUEST:
        raise ValueError(
            f"batch_size {batch_size} exceeds the per-request cap of "
            f"{MAX_ARRAY_ELEMENTS_PER_REQUEST} elements documented in SKILL.md"
        )

    batches = []
    start = 0
    while start < item_count:
        end = min(start + batch_size, item_count)
        batches.append({"start": start, "end": end, "count": end - start})
        start = end
    return batches


def backoff_delay_seconds(attempt: int, retry_after: float = None,
                           deterministic: bool = False) -> float:
    """
    Compute the wait before a retry, per SKILL.md's rate-limit contract:
    respect Retry-After when present; otherwise exponential backoff starting
    at 1s, doubling each attempt, capped at 30s, plus 0-250ms jitter.

    attempt is 1-indexed (the first retry is attempt=1).
    deterministic=True fixes jitter at 0 for reproducible self-tests.
    """
    if attempt < 1:
        raise ValueError("attempt must be >= 1 (1-indexed)")

    if retry_after is not None:
        return float(retry_after)

    exponential = BACKOFF_BASE_SECONDS * (2 ** (attempt - 1))
    capped = min(exponential, BACKOFF_CAP_SECONDS)
    jitter_ms = 0 if deterministic else random.uniform(0, BACKOFF_JITTER_MAX_MS)
    return round(capped + jitter_ms / 1000.0, 3)


def cmd_plan(args) -> int:
    batches = plan_chunks(args.items, args.batch_size)
    result = {
        "item_count": args.items,
        "batch_size": args.batch_size,
        "batch_count": len(batches),
        "batches": batches,
        "note": "Chunk deterministically (fixed batch size, sequential order) so a "
                "partial failure is easy to resume from a known offset.",
    }
    print(json.dumps(result, indent=2))
    return 0


def cmd_backoff(args) -> int:
    if args.attempt > MAX_RETRY_ATTEMPTS:
        note = (f"attempt {args.attempt} exceeds the recommended max of "
                f"{MAX_RETRY_ATTEMPTS} attempts. Surface the final error to the "
                f"user instead of retrying again.")
    else:
        note = None
    delay = backoff_delay_seconds(args.attempt, args.retry_after, args.deterministic)
    result = {
        "attempt": args.attempt,
        "retry_after_honored": args.retry_after is not None,
        "delay_seconds": delay,
        "exceeds_max_attempts": args.attempt > MAX_RETRY_ATTEMPTS,
    }
    if note:
        result["note"] = note
    print(json.dumps(result, indent=2))
    return 0


def self_test() -> int:
    failures = []

    # Chunk planning: exact boundaries, no off-by-one, remainder handled.
    cases = [
        (0, 100, []),
        (100, 100, [{"start": 0, "end": 100, "count": 100}]),
        (101, 100, [{"start": 0, "end": 100, "count": 100}, {"start": 100, "end": 101, "count": 1}]),
        (250, 100, [
            {"start": 0, "end": 100, "count": 100},
            {"start": 100, "end": 200, "count": 100},
            {"start": 200, "end": 250, "count": 50},
        ]),
    ]
    for items, batch_size, expected in cases:
        got = plan_chunks(items, batch_size)
        if got != expected:
            failures.append(f"plan_chunks({items}, {batch_size}) = {got}, want {expected}")

    try:
        plan_chunks(10, 101)
        failures.append("plan_chunks should reject batch_size > 100")
    except ValueError:
        pass

    # Backoff: deterministic exponential growth, capped at 30s, Retry-After wins.
    backoff_cases = [
        (1, None, 1.0),
        (2, None, 2.0),
        (3, None, 4.0),
        (4, None, 8.0),
        (5, None, 16.0),
        (6, None, 30.0),   # 32 capped to 30
        (10, None, 30.0),  # far past cap, still capped
        (1, 12, 12.0),     # Retry-After overrides exponential entirely
    ]
    for attempt, retry_after, expected in backoff_cases:
        got = backoff_delay_seconds(attempt, retry_after, deterministic=True)
        if got != expected:
            failures.append(f"backoff_delay_seconds({attempt}, {retry_after}) = {got}, want {expected}")

    total = len(cases) + 1 + len(backoff_cases)
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Chunk planning and backoff math for Notion calls.")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    sub = parser.add_subparsers(dest="command")

    p_plan = sub.add_parser("plan", help="Plan sequential batches for N items.")
    p_plan.add_argument("--items", type=int, required=True)
    p_plan.add_argument("--batch-size", type=int, default=MAX_ARRAY_ELEMENTS_PER_REQUEST)
    p_plan.set_defaults(func=cmd_plan)

    p_backoff = sub.add_parser("backoff", help="Compute the wait before a retry attempt.")
    p_backoff.add_argument("--attempt", type=int, required=True, help="1-indexed retry attempt number.")
    p_backoff.add_argument("--retry-after", type=float, default=None,
                            help="Retry-After header value in seconds, if present.")
    p_backoff.add_argument("--deterministic", action="store_true",
                            help="Fix jitter at 0 for reproducible output.")
    p_backoff.set_defaults(func=cmd_backoff)

    args = parser.parse_args()

    if args.self_test:
        return self_test()

    if not getattr(args, "command", None):
        parser.error("a command (plan, backoff) or --self-test is required")
        return 1

    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
