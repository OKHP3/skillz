#!/usr/bin/env python3
"""Audit distribution-skill maturity, evidence, and Git provenance.

The script is intentionally read-only. It consumes the generated Forge catalog,
then adds first-observed and last-modified Git records plus package-resource
flags. It does not infer production quality from file age, line count, or a
version number.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "artifacts" / "forge" / "public" / "data" / "catalog.json"
RESOURCE_NAMES = ("agents", "assets", "benchmarks", "evals", "examples", "references", "scripts", "tests")


def git_record(path: str, creation: bool = False) -> dict[str, str | None]:
    args = ["git", "log", "-1"]
    if creation:
        args.append("--diff-filter=A")
    args.extend(["--format=%aI%x09%h", "--", path])
    result = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, check=False)
    value = result.stdout.strip()
    if not value:
        return {"date": None, "commit": None}
    date, _, commit = value.partition("\t")
    return {"date": date or None, "commit": commit or None}


def package_resources(path: str) -> list[str]:
    package = ROOT / Path(path).parent
    return [name for name in RESOURCE_NAMES if (package / name).exists()]


def audit() -> dict:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    skills = []
    for skill in catalog["skills"]:
        path = skill["path"]
        skills.append(
            {
                "name": skill["name"],
                "family": skill["family"],
                "path": path,
                "version": skill.get("version"),
                "maturity": skill["maturity"],
                "evidence_status": skill.get("evidenceStatus", "not-yet-indexed"),
                "evidence_note": skill.get("evidenceNote", ""),
                "created": git_record(path, creation=True),
                "last_modified": git_record(path),
                "resources": package_resources(path),
            }
        )
    return {
        "audit_date": "2026-07-29",
        "source_catalog": str(CATALOG.relative_to(ROOT)),
        "source_commit": catalog.get("sourceCommit"),
        "skill_count": catalog.get("skillCount"),
        "family_count": catalog.get("familyCount"),
        "maturity_counts": {
            level: sum(1 for skill in skills if skill["maturity"] == level)
            for level in ("placeholder", "skeleton", "draftable", "usable", "validated", "published")
        },
        "evidence_counts": {
            status: sum(1 for skill in skills if skill["evidence_status"] == status)
            for status in sorted({skill["evidence_status"] for skill in skills})
        },
        "skills": skills,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit distribution skill maturity and Git provenance without writing files.")
    parser.add_argument("--markdown", action="store_true", help="Print a compact Markdown inventory instead of JSON.")
    parser.add_argument("--json", action="store_true", help="Print JSON output (the default; explicit for automation).")
    args = parser.parse_args()
    result = audit()
    if not args.markdown:
        print(json.dumps(result, indent=2))
        return
    print(f"# Skill maturity audit ({result['audit_date']})")
    print()
    print(f"Source catalog: `{result['source_catalog']}` at `{result['source_commit']}`")
    print()
    print("| Skill | Version | Maturity | Evidence | Created | Last modified | Resources |")
    print("|---|---:|---|---|---|---|---|")
    for skill in result["skills"]:
        created = skill["created"]["date"] or "unknown"
        modified = skill["last_modified"]["date"] or "unknown"
        resources = ", ".join(skill["resources"]) or "none"
        print(f"| `{skill['name']}` | {skill['version'] or '-'} | {skill['maturity']} | {skill['evidence_status']} | {created} | {modified} | {resources} |")


if __name__ == "__main__":
    main()
