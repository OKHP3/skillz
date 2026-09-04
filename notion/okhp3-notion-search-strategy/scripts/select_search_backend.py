#!/usr/bin/env python3
"""
select_search_backend.py - okhp3-notion-search-strategy tooling

Apply this file's backend-selection rule and plan-gated filter list
deterministically, so "which backend, which filters survive" is computed
the same way every time instead of re-derived from memory.

This script never calls Notion. Supply the requested filters and the
workspace's capability map (or a plain business_or_enterprise: true/false
flag as a stand-in) and it returns the backend choice plus which requested
filters are safe to apply versus must be dropped.

Prerequisites: Python 3.9+, standard library only. No network access.

Usage:
    python3 select_search_backend.py \\
        --requested-filters last_edited_date,creator \\
        --business-or-enterprise false

    python3 select_search_backend.py --force ai --target-in-connected-app true
    python3 select_search_backend.py --self-test

Exit status: 0 on success or a passing self-test, 2 on a failing self-test.
"""

import argparse
import json
import sys

# Available on every plan.
UNGATED_FILTERS = {"location_scope", "creator", "created_date_range"}

# Requires Business/Enterprise (full Notion MCP).
GATED_FILTERS = {"editor", "last_edited_date", "multiple_teamspaces",
                  "title_only", "content_status", "sort_by_date"}


def select_backend(force: str = None, target_in_connected_app: bool = False,
                    needs_exact_filter_or_non_relevance_sort: bool = False,
                    ai_search_available: bool = True) -> dict:
    if force in ("workspace", "ai"):
        return {"backend": force, "reason": "Explicitly forced by caller."}

    if needs_exact_filter_or_non_relevance_sort:
        return {"backend": "workspace",
                "reason": "Exact-filter or non-relevance-sort need. These cannot combine "
                          "with AI search."}

    if target_in_connected_app:
        if not ai_search_available:
            return {"backend": "workspace",
                    "reason": "Target is explicitly in a connected app, but AI search is not "
                              "available on this workspace (requires Notion AI). Falling back "
                              "to workspace search will not find it - report this limitation "
                              "rather than silently searching the wrong backend."}
        return {"backend": "ai", "reason": "Target is explicitly in a connected app."}

    if ai_search_available:
        return {"backend": "ai", "reason": "Default: AI search available and no forcing "
                                            "condition applies."}
    return {"backend": "workspace", "reason": "Default: AI search not available on this "
                                               "workspace."}


def filter_gate(requested_filters: list, business_or_enterprise: bool) -> dict:
    applied, dropped = [], []
    for f in requested_filters:
        if f in UNGATED_FILTERS:
            applied.append(f)
        elif f in GATED_FILTERS:
            (applied if business_or_enterprise else dropped).append(f)
        else:
            dropped.append(f)  # unrecognized filter name - do not silently apply it
    return {
        "applied": applied,
        "dropped": dropped,
        "note": (
            "Fall back to a broader unfiltered search and state the limitation explicitly "
            "rather than silently dropping a filter and returning misleading results."
            if dropped else "All requested filters are available on this plan."
        ),
    }


def self_test() -> int:
    failures = []

    # Backend selection
    b = select_backend(needs_exact_filter_or_non_relevance_sort=True, ai_search_available=True)
    if b["backend"] != "workspace":
        failures.append(f"exact-filter need should force workspace, got {b}")

    b = select_backend(target_in_connected_app=True, ai_search_available=True)
    if b["backend"] != "ai":
        failures.append(f"connected-app target should select ai, got {b}")

    b = select_backend(target_in_connected_app=True, ai_search_available=False)
    if b["backend"] != "workspace":
        failures.append(f"connected-app target without AI search should fall back to workspace, got {b}")

    b = select_backend(ai_search_available=False)
    if b["backend"] != "workspace":
        failures.append(f"no AI search available should default to workspace, got {b}")

    b = select_backend(ai_search_available=True)
    if b["backend"] != "ai":
        failures.append(f"default with AI search available should select ai, got {b}")

    b = select_backend(force="workspace", ai_search_available=True)
    if b["backend"] != "workspace":
        failures.append(f"explicit force should win, got {b}")

    # Filter gating
    g = filter_gate(["creator", "editor"], business_or_enterprise=False)
    if g["applied"] != ["creator"] or g["dropped"] != ["editor"]:
        failures.append(f"filter_gate non-B/E should drop gated filter, got {g}")

    g = filter_gate(["creator", "editor"], business_or_enterprise=True)
    if set(g["applied"]) != {"creator", "editor"} or g["dropped"]:
        failures.append(f"filter_gate B/E should apply all recognized filters, got {g}")

    g = filter_gate(["made_up_filter"], business_or_enterprise=True)
    if g["applied"] or "made_up_filter" not in g["dropped"]:
        failures.append(f"unrecognized filter should never be silently applied, got {g}")

    total = 9
    passed = total - len(failures)
    print(f"{passed}/{total} self-test cases passed.")
    for f in failures:
        print(f"  FAIL {f}")
    return 0 if not failures else 2


def _str2bool(v: str) -> bool:
    return str(v).strip().lower() in ("1", "true", "yes", "y")


def main() -> int:
    parser = argparse.ArgumentParser(description="Select a search backend and gate filters by plan.")
    parser.add_argument("--force", choices=["workspace", "ai"], default=None)
    parser.add_argument("--target-in-connected-app", default="false")
    parser.add_argument("--needs-exact-filter-or-non-relevance-sort", default="false")
    parser.add_argument("--ai-search-available", default="true")
    parser.add_argument("--business-or-enterprise", default="false")
    parser.add_argument("--requested-filters", default="",
                         help="Comma-separated filter names, e.g. creator,editor,title_only")
    parser.add_argument("--self-test", action="store_true", help="Run built-in assertions and exit.")
    args = parser.parse_args()

    if args.self_test:
        return self_test()

    backend = select_backend(
        force=args.force,
        target_in_connected_app=_str2bool(args.target_in_connected_app),
        needs_exact_filter_or_non_relevance_sort=_str2bool(args.needs_exact_filter_or_non_relevance_sort),
        ai_search_available=_str2bool(args.ai_search_available),
    )
    filters = [f.strip() for f in args.requested_filters.split(",") if f.strip()]
    gate = filter_gate(filters, business_or_enterprise=_str2bool(args.business_or_enterprise))

    print(json.dumps({"backend": backend, "filters": gate}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
