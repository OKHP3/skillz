#!/usr/bin/env python3
"""Detect drift between an English source site and its translated locales.

This script never translates and never writes a page. It reuses the site's
own generated page inventory (``assets/data/search-index.json``, the same
artifact the search-index builder already scours and catalogs) as the
canonical list of real content pages, and compares each one against its
counterpart under every configured target-locale root using a persisted
ledger (``i18n/sync-state.json``). It reports which routes are missing a
translation, which are stale because the English source changed since the
translation was last confirmed, and which existing translations have no
ledger record yet.

Three modes:

  --report   Read-only. Print the drift report. Never writes.
  --check    Same as --report, but exits 1 if actionable drift exists
             (missing or stale routes). Intended for CI. Never writes.
  --adopt    Write mode. For every target-locale page that already exists
             but has no ledger record, record its current source hash as the
             confirmed baseline. Run this once to bootstrap an existing
             locale, and again after a human or agent completes a real
             translation update for specific routes (pass --routes to limit
             it). Never invents or edits page content.

A route flagged ``missing`` or ``stale`` should be handed to the matching
``okhp3-translation-en-us-<pair>`` skill to produce or update the draft, then
confirmed here with --adopt. This script performs the detection stage only;
it does not perform or substitute for the translation stage.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional


DEFAULT_CONFIG = "i18n/sync.config.json"
SCHEMA_VERSION = "1.0"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def route_to_source_path(route: str) -> str:
    trimmed = route.strip("/")
    return f"{trimmed}/index.html" if trimmed else "index.html"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_config(root: Path, config_path: Path) -> Optional[Dict[str, Any]]:
    if not config_path.is_file():
        return None
    config = load_json(config_path)
    if config.get("schema_version") != SCHEMA_VERSION:
        raise ValueError(f"{config_path}: schema_version must be '{SCHEMA_VERSION}'")
    if not isinstance(config.get("target_locales"), dict) or not config["target_locales"]:
        raise ValueError(f"{config_path}: target_locales must be a non-empty object")
    for key, entry in config["target_locales"].items():
        for field in ("locale", "root", "skill"):
            if not isinstance(entry.get(field), str) or not entry[field].strip():
                raise ValueError(f"{config_path}: target_locales.{key}.{field} must be a non-empty string")
    in_scope_routes = config.get("in_scope_routes")
    if in_scope_routes is not None and (
        not isinstance(in_scope_routes, list) or not all(isinstance(r, str) for r in in_scope_routes)
    ):
        raise ValueError(f"{config_path}: in_scope_routes must be a list of route strings, or omitted for full-site scope")
    return config


def discover_english_pages(
    root: Path,
    search_index_path: Path,
    target_roots: List[str],
    in_scope_routes: Optional[List[str]],
) -> List[str]:
    if not search_index_path.is_file():
        raise FileNotFoundError(
            f"missing {search_index_path}; run the site's search-index builder first"
        )
    index = load_json(search_index_path)
    entries = index.get("entries")
    if not isinstance(entries, list):
        raise ValueError(f"{search_index_path}: expected an 'entries' array")
    locale_prefixes = tuple(f"/{r.strip('/')}/" for r in target_roots)
    scope = set(in_scope_routes) if in_scope_routes is not None else None
    routes: List[str] = []
    seen = set()
    for entry in entries:
        url = entry.get("url")
        if not isinstance(url, str) or "#" in url:
            continue
        if url.startswith(locale_prefixes):
            continue
        if scope is not None and url not in scope:
            continue
        if url in seen:
            continue
        source_path = root / route_to_source_path(url)
        if not source_path.is_file():
            continue
        seen.add(url)
        routes.append(url)
    return sorted(routes)


def load_ledger(state_path: Path) -> Dict[str, Any]:
    if not state_path.is_file():
        return {"schema_version": SCHEMA_VERSION, "pages": {}}
    ledger = load_json(state_path)
    ledger.setdefault("schema_version", SCHEMA_VERSION)
    ledger.setdefault("pages", {})
    return ledger


def save_ledger(state_path: Path, ledger: Dict[str, Any]) -> None:
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps(ledger, indent=2, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")


def scan(root: Path, config: Dict[str, Any], ledger: Dict[str, Any], only_routes: Optional[List[str]]) -> Dict[str, Any]:
    target_locales = config["target_locales"]
    search_index_path = root / config.get("search_index", "assets/data/search-index.json")
    in_scope_routes = config.get("in_scope_routes")
    routes = discover_english_pages(
        root,
        search_index_path,
        [entry["root"] for entry in target_locales.values()],
        in_scope_routes,
    )
    if only_routes is not None:
        routes = [route for route in routes if route in set(only_routes)]

    results: Dict[str, List[Dict[str, Any]]] = {
        "missing": [],
        "stale": [],
        "needs_baseline": [],
        "in_sync": [],
        "orphan": [],
    }

    pages_ledger: Dict[str, Any] = ledger["pages"]
    seen_routes = set(routes)

    for route in routes:
        source_rel = route_to_source_path(route)
        source_path = root / source_rel
        source_hash = sha256_file(source_path)
        page_record = pages_ledger.get(route, {})
        targets_record = page_record.get("targets", {}) if isinstance(page_record, dict) else {}

        for locale_key, locale_config in target_locales.items():
            target_rel = f"{locale_config['root'].strip('/')}/{source_rel}"
            target_path = root / target_rel
            entry_record = targets_record.get(locale_key)
            base = {
                "route": route,
                "locale": locale_key,
                "target_locale": locale_config["locale"],
                "source_path": source_rel,
                "target_path": target_rel,
                "skill": locale_config["skill"],
            }
            if not target_path.is_file():
                results["missing"].append(base)
                continue
            if entry_record is None:
                results["needs_baseline"].append(base)
                continue
            if entry_record.get("synced_source_sha256") != source_hash:
                results["stale"].append(base)
                continue
            results["in_sync"].append(base)

    for route, page_record in pages_ledger.items():
        if route in seen_routes or not isinstance(page_record, dict):
            continue
        for locale_key in page_record.get("targets", {}):
            locale_config = target_locales.get(locale_key)
            if locale_config is None:
                continue
            results["orphan"].append(
                {
                    "route": route,
                    "locale": locale_key,
                    "target_locale": locale_config["locale"],
                    "note": "English source page no longer appears in the search index",
                }
            )

    return results


def adopt(root: Path, config: Dict[str, Any], ledger: Dict[str, Any], only_routes: Optional[List[str]]) -> Dict[str, Any]:
    results = scan(root, config, ledger, only_routes)
    adopted: List[Dict[str, Any]] = []
    pages_ledger = ledger["pages"]
    for item in results["needs_baseline"]:
        route = item["route"]
        locale_key = item["locale"]
        source_path = root / item["source_path"]
        target_path = root / item["target_path"]
        source_hash = sha256_file(source_path)
        target_hash = sha256_file(target_path)
        page_record = pages_ledger.setdefault(route, {"targets": {}})
        page_record.setdefault("targets", {})[locale_key] = {
            "synced_source_sha256": source_hash,
            "target_sha256": target_hash,
        }
        adopted.append(item)
    return {"adopted": adopted}


def report(results: Dict[str, Any], output_format: str) -> None:
    if output_format == "json":
        print(json.dumps(results, indent=2, ensure_ascii=False))
        return
    total_drift = len(results["missing"]) + len(results["stale"])
    print(f"i18n page sync: {total_drift} route(s) need action")
    for status in ("missing", "stale"):
        for item in results[status]:
            print(f"  {status.upper():14} {item['route']:30} -> {item['locale']}  (use {item['skill']})")
    if results["needs_baseline"]:
        print(f"  {len(results['needs_baseline'])} translated route(s) exist without a ledger record; run --adopt to bootstrap them")
        for item in results["needs_baseline"]:
            print(f"    UNBASELINED    {item['route']:30} -> {item['locale']}")
    if results["orphan"]:
        print(f"  {len(results['orphan'])} translated route(s) reference an English source no longer in the search index")
        for item in results["orphan"]:
            print(f"    ORPHAN         {item['route']:30} -> {item['locale']}")
    if total_drift == 0 and not results["needs_baseline"]:
        print("  All configured locales are in sync.")


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--root", type=Path, default=Path("."), help="site repository root")
    parser.add_argument("--config", type=Path, default=None, help=f"path to sync config (default: <root>/{DEFAULT_CONFIG})")
    parser.add_argument("--mode", choices=("report", "check", "adopt"), default="report")
    parser.add_argument("--routes", nargs="*", default=None, help="limit to these routes (adopt mode: only adopt these)")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args(argv)

    root = args.root.resolve()
    config_path = args.config.resolve() if args.config else root / DEFAULT_CONFIG

    try:
        config = load_config(root, config_path)
    except (ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: invalid {config_path}: {exc}", file=sys.stderr)
        return 2

    if config is None:
        if args.format == "json":
            print(json.dumps({"configured": False, "config_path": str(config_path)}))
        else:
            print(f"i18n page sync: no config at {config_path}; nothing to check.")
        return 0

    state_path = root / config.get("state_file", "i18n/sync-state.json")

    try:
        ledger = load_ledger(state_path)
    except (ValueError, json.JSONDecodeError) as exc:
        print(f"ERROR: invalid {state_path}: {exc}", file=sys.stderr)
        return 2

    try:
        if args.mode == "adopt":
            outcome = adopt(root, config, ledger, args.routes)
            save_ledger(state_path, ledger)
            if args.format == "json":
                print(json.dumps(outcome, indent=2, ensure_ascii=False))
            else:
                print(f"Adopted {len(outcome['adopted'])} route/locale pair(s) as the new baseline in {state_path}.")
                for item in outcome["adopted"]:
                    print(f"  {item['route']:30} -> {item['locale']}")
            return 0

        results = scan(root, config, ledger, args.routes)
        report(results, args.format)
        if args.mode == "check":
            return 1 if (results["missing"] or results["stale"]) else 0
        return 0
    except (FileNotFoundError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
