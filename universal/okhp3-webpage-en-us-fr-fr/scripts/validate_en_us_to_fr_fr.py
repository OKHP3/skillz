#!/usr/bin/env python3
"""Validate one en-US to fr-FR webpage translation manifest and optional pair.

This helper is deterministic and dependency-free. It never translates, fetches,
publishes, or edits files. It checks one declared language pair, structure, and
protected tokens; it cannot certify idiomatic French or native review.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


SOURCE_LOCALE = "en-US"
TARGET_LOCALE = "fr-FR"
URL_RE = re.compile(r"https?://[^\s)\]>\"']+", re.IGNORECASE)
PLACEHOLDER_RE = re.compile(
    r"\{\{[^{}]+\}\}|\$\{[^{}]+\}|%\([A-Za-z_][A-Za-z0-9_.-]*\)[a-z]|"
    r"\{[A-Za-z_][A-Za-z0-9_.-]*\}|(?<!\w):[A-Za-z][A-Za-z0-9_-]*"
)
HTML_TAG_RE = re.compile(r"<(/?)([A-Za-z][A-Za-z0-9:-]*)\b[^>]*>")
FENCE_RE = re.compile(r"```[^\n]*\n(.*?)```", re.DOTALL)
INLINE_CODE_RE = re.compile(r"(?<!`)`([^`\n]+)`(?!`)")
HEADING_RE = re.compile(r"^\s{0,3}(#{1,6})\s+.+$", re.MULTILINE)
TARGET_STATUSES = {"draft", "ready-for-native-review", "approved"}


def add_error(errors: List[str], message: str) -> None:
    errors.append(message)


def load_json(path: Path, errors: List[str]) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        add_error(errors, f"missing JSON file: {path}")
    except json.JSONDecodeError as exc:
        add_error(errors, f"invalid JSON in {path}: {exc}")
    return None


def require_nonempty_string(value: Any, label: str, errors: List[str]) -> None:
    if not isinstance(value, str) or not value.strip():
        add_error(errors, f"{label} must be a non-empty string")


def validate_manifest(project: Any, path: Path) -> List[str]:
    errors: List[str] = []
    if not isinstance(project, dict):
        return [f"project manifest must be an object: {path}"]
    if project.get("schema_version") != "2.0":
        add_error(errors, "project schema_version must be '2.0'")
    require_nonempty_string(project.get("project_id"), "project_id", errors)
    pair = project.get("language_pair")
    if not isinstance(pair, dict):
        add_error(errors, "language_pair must be an object")
    else:
        if pair.get("source_locale") != SOURCE_LOCALE:
            add_error(errors, f"language_pair.source_locale must be {SOURCE_LOCALE}")
        if pair.get("target_locale") != TARGET_LOCALE:
            add_error(errors, f"language_pair.target_locale must be {TARGET_LOCALE}")
        if pair.get("direction") != "one-way":
            add_error(errors, "language_pair.direction must be 'one-way'")
    source = project.get("source")
    if not isinstance(source, dict):
        add_error(errors, "source must be an object")
    else:
        if source.get("locale") != SOURCE_LOCALE:
            add_error(errors, f"source.locale must be {SOURCE_LOCALE}")
        for key in ("root", "voice_profile"):
            require_nonempty_string(source.get(key), f"source.{key}", errors)
    target = project.get("target")
    if not isinstance(target, dict):
        add_error(errors, "target must be one object for the fr-FR output")
    else:
        if target.get("locale") != TARGET_LOCALE:
            add_error(errors, f"target.locale must be {TARGET_LOCALE}")
        for key in ("root", "dictionary"):
            require_nonempty_string(target.get(key), f"target.{key}", errors)
        if target.get("status") not in TARGET_STATUSES:
            add_error(errors, "target.status must be draft, ready-for-native-review, or approved")
        if not isinstance(target.get("needs_native_review"), bool):
            add_error(errors, "target.needs_native_review must be boolean")
        if target.get("status") == "approved" and not isinstance(target.get("review_record"), dict):
            add_error(errors, "target.review_record is required for approved output")
    if "targets" in project:
        add_error(errors, "targets is not allowed; this package permits exactly one fr-FR output")
    rules = project.get("rules")
    if not isinstance(rules, dict):
        add_error(errors, "rules must be an object")
    else:
        if rules.get("slug_policy") not in {"stable", "localized", "explicit-mapping"}:
            add_error(errors, "rules.slug_policy must be stable, localized, or explicit-mapping")
        if not isinstance(rules.get("preserve_urls"), bool):
            add_error(errors, "rules.preserve_urls must be boolean")
        if rules.get("default_status") not in {"machine-drafted", "ready-for-native-review"}:
            add_error(errors, "rules.default_status must be machine-drafted or ready-for-native-review")
        extensions = rules.get("allowed_extensions")
        if not isinstance(extensions, list) or not extensions or not all(isinstance(item, str) and item.startswith(".") for item in extensions):
            add_error(errors, "rules.allowed_extensions must be a non-empty array of extensions")
    return errors


def tokens(text: str) -> Dict[str, List[Any]]:
    return {
        "urls": URL_RE.findall(text),
        "placeholders": PLACEHOLDER_RE.findall(text),
        "inline_code": INLINE_CODE_RE.findall(text),
        "fenced_code": FENCE_RE.findall(text),
        "html_structure": [f"{slash}{name.lower()}" for slash, name in HTML_TAG_RE.findall(text)],
        "headings": [match.group(1).count("#") for match in HEADING_RE.finditer(text)],
    }


def compare_pair(source_path: Path, target_path: Path, preserve_urls: bool) -> Tuple[List[str], List[str]]:
    errors: List[str] = []
    warnings: List[str] = []
    if not source_path.is_file():
        add_error(errors, f"missing en-US source file: {source_path}")
        return errors, warnings
    if not target_path.is_file():
        add_error(errors, f"missing fr-FR target file: {target_path}")
        return errors, warnings
    if source_path.resolve() == target_path.resolve():
        add_error(errors, "source and target must be different files")
        return errors, warnings
    try:
        source = source_path.read_text(encoding="utf-8")
        target = target_path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        add_error(errors, f"source and target must be UTF-8 text: {exc}")
        return errors, warnings
    source_tokens = tokens(source)
    target_tokens = tokens(target)
    for key in ("placeholders", "inline_code", "fenced_code", "html_structure", "headings"):
        if source_tokens[key] != target_tokens[key]:
            add_error(errors, f"{key} drift: source={source_tokens[key]!r} target={target_tokens[key]!r}")
    if preserve_urls and source_tokens["urls"] != target_tokens["urls"]:
        add_error(errors, f"URL drift: source={source_tokens['urls']!r} target={target_tokens['urls']!r}")
    if source == target:
        warnings.append("target is byte-identical to source; confirm that France French translation was performed")
    if not target.strip():
        add_error(errors, "fr-FR target file is empty")
    return errors, warnings


def report(errors: List[str], warnings: List[str], output_format: str, project: Path, pair: Optional[Tuple[Path, Path]]) -> int:
    result = {
        "passed": not errors,
        "language_pair": {"source_locale": SOURCE_LOCALE, "target_locale": TARGET_LOCALE, "direction": "one-way"},
        "project": str(project),
        "pair": {"source": str(pair[0]), "target": str(pair[1])} if pair else None,
        "errors": errors,
        "warnings": warnings,
        "scope": "manifest, structure, and protected-token checks only; no French-quality or native-review certification",
    }
    if output_format == "json":
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("PASS" if result["passed"] else "FAIL")
        print("Language pair: en-US -> fr-FR")
        print(f"Project: {project}")
        if pair:
            print(f"Pair: {pair[0]} -> {pair[1]}")
        for message in errors:
            print(f"ERROR: {message}")
        for message in warnings:
            print(f"WARNING: {message}")
        print(result["scope"])
    return 0 if not errors else 1


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True, type=Path, help="single-pair en-US to fr-FR project JSON manifest")
    parser.add_argument("--source-file", type=Path, help="optional en-US source page to compare")
    parser.add_argument("--target-file", type=Path, help="optional fr-FR target page to compare")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args(argv)
    if bool(args.source_file) != bool(args.target_file):
        parser.error("--source-file and --target-file must be supplied together")
    errors: List[str] = []
    warnings: List[str] = []
    project = load_json(args.project, errors)
    if project is not None:
        errors.extend(validate_manifest(project, args.project))
    pair = (args.source_file, args.target_file) if args.source_file and args.target_file else None
    if pair and project is not None:
        rules = project.get("rules", {}) if isinstance(project, dict) else {}
        pair_errors, pair_warnings = compare_pair(pair[0], pair[1], rules.get("preserve_urls") is True)
        errors.extend(pair_errors)
        warnings.extend(pair_warnings)
    return report(errors, warnings, args.format, args.project, pair)


if __name__ == "__main__":
    sys.exit(main())
