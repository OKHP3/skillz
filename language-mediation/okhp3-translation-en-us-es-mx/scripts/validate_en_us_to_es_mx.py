#!/usr/bin/env python3
"""Validate one en-US to es-MX text-artifact manifest and optional pair.

This helper is deterministic and dependency-free. It never translates, fetches,
publishes, or edits files. It checks one declared language pair, structure, and
protected tokens; it cannot certify idiomatic Mexican Spanish or native review.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


SOURCE_LOCALE = "en-US"
TARGET_LOCALE = "es-MX"
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
ENTRY_HANDLING = {"translate", "adapt", "preserve"}


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


def resolve_control_path(base_dir: Path, raw_path: Any, label: str, errors: List[str]) -> Optional[Path]:
    if not isinstance(raw_path, str) or not raw_path.strip():
        add_error(errors, f"{label} must be a non-empty relative path")
        return None
    candidate = Path(raw_path)
    if candidate.is_absolute() or ".." in candidate.parts:
        add_error(errors, f"{label} must be a relative path without '..': {raw_path}")
        return None
    return (base_dir / candidate).resolve()


def validate_voice_profile(profile: Any) -> List[str]:
    errors: List[str] = []
    if not isinstance(profile, dict):
        return ["source.voice_profile must contain a JSON object"]
    if profile.get("schema_version") != "1.0":
        add_error(errors, "source.voice_profile schema_version must be '1.0'")
    if profile.get("source_locale") != SOURCE_LOCALE:
        add_error(errors, f"source.voice_profile source_locale must be {SOURCE_LOCALE}")
    require_nonempty_string(profile.get("profile_id"), "source.voice_profile profile_id", errors)
    traits = profile.get("traits")
    if not isinstance(traits, dict) or not traits:
        add_error(errors, "source.voice_profile traits must be a non-empty object")
    samples = profile.get("samples")
    if not isinstance(samples, list) or not samples:
        add_error(errors, "source.voice_profile samples must be a non-empty array")
    return errors


def validate_dictionary(dictionary: Any) -> List[str]:
    errors: List[str] = []
    if not isinstance(dictionary, dict):
        return ["target.dictionary must contain a JSON object"]
    if dictionary.get("schema_version") != "1.0":
        add_error(errors, "target.dictionary schema_version must be '1.0'")
    pair = dictionary.get("language_pair")
    if not isinstance(pair, dict) or pair.get("source_locale") != SOURCE_LOCALE or pair.get("target_locale") != TARGET_LOCALE or pair.get("direction") != "one-way":
        add_error(errors, "target.dictionary must declare exactly the en-US to es-MX one-way pair")
    entries = dictionary.get("entries")
    if not isinstance(entries, list) or not entries:
        add_error(errors, "target.dictionary entries must be a non-empty array")
        return errors
    seen = set()
    for index, entry in enumerate(entries):
        label = f"target.dictionary entries[{index}]"
        if not isinstance(entry, dict):
            add_error(errors, f"{label} must be an object")
            continue
        for field in ("source", "target", "context"):
            require_nonempty_string(entry.get(field), f"{label}.{field}", errors)
        if entry.get("handling") not in ENTRY_HANDLING:
            add_error(errors, f"{label}.handling must be one of {sorted(ENTRY_HANDLING)}")
        key = (entry.get("source"), entry.get("context"))
        if all(isinstance(value, str) and value.strip() for value in key):
            if key in seen:
                add_error(errors, f"duplicate target.dictionary entry for source and context: {key[0]!r}, {key[1]!r}")
            seen.add(key)
    return errors


def load_supporting_controls(project: Dict[str, Any], base_dir: Path) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]], List[str]]:
    errors: List[str] = []
    source = project.get("source") if isinstance(project, dict) else None
    target = project.get("target") if isinstance(project, dict) else None
    voice_path = resolve_control_path(base_dir, source.get("voice_profile") if isinstance(source, dict) else None, "source.voice_profile", errors)
    dictionary_path = resolve_control_path(base_dir, target.get("dictionary") if isinstance(target, dict) else None, "target.dictionary", errors)
    voice_profile = None
    dictionary = None
    if voice_path:
        if not voice_path.is_file():
            add_error(errors, f"missing source.voice_profile: {voice_path}")
        else:
            voice_profile = load_json(voice_path, errors)
    if dictionary_path:
        if not dictionary_path.is_file():
            add_error(errors, f"missing target.dictionary: {dictionary_path}")
        else:
            dictionary = load_json(dictionary_path, errors)
    if voice_profile is not None:
        errors.extend(validate_voice_profile(voice_profile))
    if dictionary is not None:
        errors.extend(validate_dictionary(dictionary))
    return voice_profile if isinstance(voice_profile, dict) else None, dictionary if isinstance(dictionary, dict) else None, errors


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
        if source.get("register_state") != "plainspoken":
            add_error(errors, "source.register_state must be 'plainspoken'; specialist sources require a completed register-mediation stage")
        for key in ("root", "voice_profile"):
            require_nonempty_string(source.get(key), f"source.{key}", errors)
        mediation_record = source.get("register_mediation_record")
        if mediation_record is not None:
            if not isinstance(mediation_record, dict):
                add_error(errors, "source.register_mediation_record must be null or an object")
            else:
                if mediation_record.get("output_locale") != SOURCE_LOCALE:
                    add_error(errors, f"source.register_mediation_record.output_locale must be {SOURCE_LOCALE}")
                if mediation_record.get("output_register") != "plainspoken":
                    add_error(errors, "source.register_mediation_record.output_register must be 'plainspoken'")
                if mediation_record.get("status") != "completed":
                    add_error(errors, "source.register_mediation_record.status must be 'completed'")
                require_nonempty_string(mediation_record.get("record"), "source.register_mediation_record.record", errors)
    target = project.get("target")
    if not isinstance(target, dict):
        add_error(errors, "target must be one object for the es-MX output")
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
        add_error(errors, "targets is not allowed; this package permits exactly one es-MX output")
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
        add_error(errors, f"missing es-MX target file: {target_path}")
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
        warnings.append("target is byte-identical to source; confirm that Mexican Spanish translation was performed")
    if not target.strip():
        add_error(errors, "es-MX target file is empty")
    return errors, warnings


def report(errors: List[str], warnings: List[str], output_format: str, project: Path, pair: Optional[Tuple[Path, Path]]) -> int:
    result = {
        "passed": not errors,
        "language_pair": {"source_locale": SOURCE_LOCALE, "target_locale": TARGET_LOCALE, "direction": "one-way"},
        "project": str(project),
        "pair": {"source": str(pair[0]), "target": str(pair[1])} if pair else None,
        "errors": errors,
        "warnings": warnings,
        "scope": "manifest, completed plainspoken-register gate, structure, and protected-token checks only; no Mexican Spanish quality or native-review certification",
    }
    if output_format == "json":
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("PASS" if result["passed"] else "FAIL")
        print("Language pair: en-US -> es-MX")
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
    parser.add_argument("--project", required=True, type=Path, help="single-pair en-US to es-MX project JSON manifest")
    parser.add_argument("--source-file", type=Path, help="optional en-US source artifact to compare")
    parser.add_argument("--target-file", type=Path, help="optional es-MX target artifact to compare")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args(argv)
    if bool(args.source_file) != bool(args.target_file):
        parser.error("--source-file and --target-file must be supplied together")
    errors: List[str] = []
    warnings: List[str] = []
    project = load_json(args.project, errors)
    if project is not None:
        errors.extend(validate_manifest(project, args.project))
        if not errors:
            _, _, control_errors = load_supporting_controls(project, args.project.parent.resolve())
            errors.extend(control_errors)
    pair = (args.source_file, args.target_file) if args.source_file and args.target_file else None
    if pair and project is not None:
        rules = project.get("rules", {}) if isinstance(project, dict) else {}
        pair_errors, pair_warnings = compare_pair(pair[0], pair[1], rules.get("preserve_urls") is True)
        errors.extend(pair_errors)
        warnings.extend(pair_warnings)
    return report(errors, warnings, args.format, args.project, pair)


if __name__ == "__main__":
    sys.exit(main())
