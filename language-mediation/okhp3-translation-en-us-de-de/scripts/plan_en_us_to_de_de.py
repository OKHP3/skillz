#!/usr/bin/env python3
"""Plan en-US source artifacts and de-DE targets without writing files."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

from validate_en_us_to_de_de import (
    SOURCE_LOCALE,
    TARGET_LOCALE,
    load_json,
    load_supporting_controls,
    validate_manifest,
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resolve_root(base_dir: Path, raw_root: str, label: str) -> Path:
    candidate = Path(raw_root)
    if candidate.is_absolute() or ".." in candidate.parts:
        raise ValueError(f"{label} must be a relative path without '..': {raw_root}")
    return (base_dir / candidate).resolve()


def build_plan(project: Dict[str, Any], base_dir: Path, voice_profile: Dict[str, Any], dictionary: Dict[str, Any]) -> Dict[str, Any]:
    source_root = resolve_root(base_dir, project["source"]["root"], "source.root")
    target_root = resolve_root(base_dir, project["target"]["root"], "target.root")
    if not source_root.is_dir():
        raise ValueError(f"missing en-US source root: {source_root}")
    extensions = set(project["rules"]["allowed_extensions"])
    source_files = sorted(
        path for path in source_root.rglob("*")
        if path.is_file()
        and path.suffix in extensions
        and not any(part.startswith(".") for part in path.relative_to(source_root).parts)
    )
    artifacts: List[Dict[str, Any]] = []
    for source_path in source_files:
        relative = source_path.relative_to(source_root)
        target_path = target_root / relative
        entry: Dict[str, Any] = {
            "source_path": str(source_path.relative_to(base_dir)),
            "target_path": str(target_path.relative_to(base_dir)),
            "source_sha256": sha256(source_path),
            "state": "existing" if target_path.is_file() else "missing",
            "target_status": project["target"]["status"],
            "needs_native_review": project["target"]["needs_native_review"],
        }
        if target_path.is_file():
            entry["target_sha256"] = sha256(target_path)
        artifacts.append(entry)
    return {
        "schema_version": "1.0",
        "language_pair": {"source_locale": SOURCE_LOCALE, "target_locale": TARGET_LOCALE, "direction": "one-way"},
        "project_id": project["project_id"],
        "source_register_state": project["source"]["register_state"],
        "source_artifact_count": len(source_files),
        "artifacts": artifacts,
        "writes_performed": False,
        "translation_performed": False,
    }


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", required=True, type=Path, help="single-pair en-US to de-DE project JSON manifest")
    parser.add_argument("--base-dir", type=Path, default=Path("."), help="directory against which manifest roots are resolved")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    args = parser.parse_args(argv)
    errors: List[str] = []
    project = load_json(args.project, errors)
    if project is not None:
        errors.extend(validate_manifest(project, args.project))
    controls = None
    if not errors and isinstance(project, dict):
        voice_profile, dictionary, control_errors = load_supporting_controls(project, args.base_dir.resolve())
        errors.extend(control_errors)
        if not control_errors and voice_profile is not None and dictionary is not None:
            controls = (voice_profile, dictionary)
    if errors:
        output: Dict[str, Any] = {"passed": False, "errors": errors, "writes_performed": False, "translation_performed": False}
    else:
        try:
            output = {"passed": True, "plan": build_plan(project, args.base_dir.resolve(), *controls)}
        except (KeyError, OSError, ValueError) as exc:
            output = {"passed": False, "errors": [str(exc)], "writes_performed": False, "translation_performed": False}
    if args.format == "json":
        print(json.dumps(output, indent=2, ensure_ascii=False))
    else:
        print("PASS" if output["passed"] else "FAIL")
        print("Language pair: en-US -> de-DE")
        if output["passed"]:
            plan = output["plan"]
            missing = sum(artifact["state"] == "missing" for artifact in plan["artifacts"])
            print(f"Source artifacts: {plan['source_artifact_count']}")
            print(f"Missing de-DE targets: {missing}")
        else:
            for error in output["errors"]:
                print(f"ERROR: {error}")
        print("Writes performed: false")
        print("Translation performed: false")
    return 0 if output["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
