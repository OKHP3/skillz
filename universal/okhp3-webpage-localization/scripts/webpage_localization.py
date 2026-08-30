#!/usr/bin/env python3
"""Create provenance records and verify structural parity for localized HTML."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


FROZEN_TAGS = {"script", "style", "pre", "code"}


class StructureParser(HTMLParser):
    """Collect deterministic structure only; this is not a translation-quality check."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.tags: list[str] = []
        self.frozen: list[dict[str, str]] = []
        self.text_nodes = 0
        self.lang: str | None = None
        self._frozen_stack: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        normalized = tag.lower()
        self.tags.append(f"<{normalized}>")
        if normalized == "html":
            self.lang = dict(attrs).get("lang")
        if normalized in FROZEN_TAGS:
            self._frozen_stack.append(normalized)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        normalized = tag.lower()
        self.tags.append(f"<{normalized}/>")
        if normalized == "html":
            self.lang = dict(attrs).get("lang")

    def handle_endtag(self, tag: str) -> None:
        normalized = tag.lower()
        self.tags.append(f"</{normalized}>")
        if self._frozen_stack and self._frozen_stack[-1] == normalized:
            self._frozen_stack.pop()

    def handle_data(self, data: str) -> None:
        if self._frozen_stack:
            self.frozen.append({"tag": self._frozen_stack[-1], "data": data})
        elif data.strip():
            self.text_nodes += 1


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_html(path: Path) -> StructureParser:
    parser = StructureParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    return parser


def build_job(args: argparse.Namespace) -> int:
    source = Path(args.source).resolve()
    output = Path(args.output).resolve()
    if not source.is_file():
        print(json.dumps({"result": "blocked", "reason": f"Source does not exist: {source}"}, indent=2))
        return 2
    if output.exists() and not args.force:
        print(json.dumps({"result": "blocked", "reason": f"Job already exists: {output}. Use --force only after review."}, indent=2))
        return 2
    structure = parse_html(source)
    if not structure.lang:
        print(json.dumps({"result": "blocked", "reason": "Source HTML has no html[lang] declaration."}, indent=2))
        return 2
    if structure.lang.lower() != "en-us":
        print(json.dumps({"result": "blocked", "reason": f"Source lang must be en-US, found {structure.lang}."}, indent=2))
        return 2
    job = {
        "schema_version": "1.0",
        "status": "pending-translation",
        "direction": "en-US-to-target-only",
        "page_id": args.page_id,
        "source": {
            "locale": "en-US",
            "path": str(source),
            "url": args.source_url,
            "sha256": sha256_file(source),
            "html_structure_sha256": hashlib.sha256("\n".join(structure.tags).encode()).hexdigest(),
            "text_node_count": structure.text_nodes
        },
        "target": {"locale": args.target_locale},
        "limitations": ["This job authorizes neither overwrite, commit, deployment, nor native-speaker certification."]
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(job, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"result": "created", "job": str(output), "source_sha256": job["source"]["sha256"]}, indent=2))
    return 0


def verify(args: argparse.Namespace) -> int:
    source, target, job_path = (Path(args.source).resolve(), Path(args.target).resolve(), Path(args.job).resolve())
    errors: list[str] = []
    if not source.is_file():
        errors.append(f"Source does not exist: {source}")
    if not target.is_file():
        errors.append(f"Target does not exist: {target}")
    if not job_path.is_file():
        errors.append(f"Job does not exist: {job_path}")
    job: dict[str, Any] = {}
    if not errors:
        try:
            job = json.loads(job_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"Job is invalid JSON: {exc}")
    if not errors:
        if job.get("direction") != "en-US-to-target-only":
            errors.append("Job does not declare one-way en-US source direction.")
        if job.get("source", {}).get("sha256") != sha256_file(source):
            errors.append("Source hash differs from job; create a fresh job and refresh the translation.")
        if job.get("target", {}).get("locale") != args.target_locale:
            errors.append("Target locale differs from job.")
        source_doc, target_doc = parse_html(source), parse_html(target)
        if target_doc.lang != args.target_locale:
            errors.append(f"Target html[lang] must be {args.target_locale}, found {target_doc.lang!r}.")
        if source_doc.tags != target_doc.tags:
            errors.append("HTML tag sequence differs from source; review the structural change.")
        if source_doc.frozen != target_doc.frozen:
            errors.append("Frozen script/style/pre/code contents differ from source.")
        if target_doc.text_nodes == 0:
            errors.append("Target has no visible prose text nodes.")
    result = {"result": "passed" if not errors else "failed", "errors": errors, "source": str(source), "target": str(target), "job": str(job_path)}
    print(json.dumps(result, indent=2))
    return 0 if not errors else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    plan = commands.add_parser("plan", help="Create a no-overwrite job packet from an en-US HTML source.")
    plan.add_argument("--source", required=True)
    plan.add_argument("--page-id", required=True)
    plan.add_argument("--target-locale", required=True)
    plan.add_argument("--source-url", required=True)
    plan.add_argument("--output", required=True)
    plan.add_argument("--force", action="store_true", help="Replace an existing job only after review.")
    plan.set_defaults(func=build_job)
    check = commands.add_parser("verify", help="Verify target HTML against a job packet and its en-US source.")
    check.add_argument("--source", required=True)
    check.add_argument("--target", required=True)
    check.add_argument("--job", required=True)
    check.add_argument("--target-locale", required=True)
    check.set_defaults(func=verify)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
