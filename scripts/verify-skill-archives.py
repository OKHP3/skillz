"""Verify preserved cleanup payloads without interpreting or executing them."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
MANIFESTS = [
    "docs/archive/skill-organization-2026-09-19/manifest.json",
    *[f"docs/archive/skill-redundancy-2026-09-19/{group}-manifest.json"
      for group in ("brands", "browser-refactor", "docs-data", "specifications", "support")],
]


def verify_manifest(root: Path, manifest: dict, check_index: bool = False) -> tuple[int, int]:
    entries = manifest["files"]
    assert len(entries) == manifest["fileCount"], "Manifest file count differs"
    assert sum(item["bytes"] for item in entries) == manifest["totalBytes"], "Manifest byte total differs"
    seen = set()
    archive = (root / "docs/archive").resolve()
    for entry in entries:
        relative = entry["destination"]
        assert relative not in seen, f"Duplicate archive destination: {relative}"
        seen.add(relative)
        target = root / relative
        # Check the parent without dereferencing a preserved historical symlink.
        assert not Path(relative).is_absolute() and target.parent.resolve().is_relative_to(archive), f"Unsafe archive destination: {relative}"
        assert target.is_symlink() or target.is_file(), f"Missing archive payload: {relative}"
        payload = os.fsencode(os.readlink(target)) if target.is_symlink() else target.read_bytes()
        assert len(payload) == entry["bytes"], f"Changed byte length: {relative}"
        assert hashlib.sha256(payload).hexdigest() == entry["sha256"], f"Changed SHA-256: {relative}"
        if check_index:
            indexed = subprocess.check_output(["git", "show", f":{relative}"], cwd=root)
            mode = subprocess.check_output(["git", "ls-files", "--stage", "--", relative], cwd=root, text=True).split()[0]
            assert hashlib.sha256(indexed).hexdigest() == entry["sha256"], f"Index changed raw bytes: {relative}"
            assert mode == entry["originalGitMode"], f"Index changed file mode: {relative}"
    return len(entries), manifest["totalBytes"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--index", action="store_true", help="Also check staged Git objects and modes")
    options = parser.parse_args()
    count = size = 0
    for path in MANIFESTS:
        files, bytes_ = verify_manifest(ROOT, json.loads((ROOT / path).read_text(encoding="utf-8")), options.index)
        count += files
        size += bytes_
    print(f"Verified {count} preserved payloads / {size:,} original bytes across {len(MANIFESTS)} manifests" + (" including Git index bytes and modes" if options.index else ""))
