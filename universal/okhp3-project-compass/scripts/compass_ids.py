#!/usr/bin/env python3
"""Deterministic, stable identifier minting for OKHP3 Project Compass.

Read-only. Pure functions plus a small CLI so an agent, a human, and CI all
produce byte-identical identifiers for the same input.

ID contract
-----------
  <PREFIX>-<8 uppercase hex>
  OBJ-  objective
  TSK-  task
  RSK-  risk
  QST-  open question
  DRF-  drift finding

The hash input is  project_key \x1f kind \x1f normalized_title .
Normalization: NFKC, casefold, strip accents, collapse every run of
non-alphanumeric characters to a single space, trim.

MINT-ONCE RULE: an identifier is minted exactly once, when the item first
enters objectives.json, and is then persisted forever. A later title change is
a rename, recorded via title_hash, and never re-mints the identifier. Use
`verify` to detect drift between a stored id and its stored title_hash.

Usage
-----
  python3 compass_ids.py mint --project-key myrepo --kind objective --title "Ship v1"
  python3 compass_ids.py hash --project-key myrepo --kind task --title "Write docs"
  python3 compass_ids.py verify --state .compass/objectives.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import stat
import re
import sys
import unicodedata

PREFIXES = {
    "objective": "OBJ",
    "task": "TSK",
    "risk": "RSK",
    "question": "QST",
    "drift": "DRF",
}

_NON_ALNUM = re.compile(r"[^a-z0-9]+")


def normalize_title(title: str) -> str:
    """Stable text normalization. Same visible title always yields same bytes."""
    text = unicodedata.normalize("NFKC", title or "")
    text = "".join(c for c in unicodedata.normalize("NFD", text)
                   if unicodedata.category(c) != "Mn")
    text = text.casefold()
    text = _NON_ALNUM.sub(" ", text).strip()
    return text


def normalize_project_key(raw: str) -> str:
    key = normalize_title(raw).replace(" ", "-")
    return key or "unnamed-project"


def digest(project_key: str, kind: str, title: str) -> str:
    if kind not in PREFIXES:
        raise ValueError("unknown kind: %s (expected one of %s)"
                         % (kind, ", ".join(sorted(PREFIXES))))
    payload = "\x1f".join(
        [normalize_project_key(project_key), kind, normalize_title(title)]
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()[:8].upper()


def mint(project_key: str, kind: str, title: str, taken=None) -> str:
    """Mint an id, resolving collisions deterministically by salted rehash."""
    taken = set(taken or ())
    base = digest(project_key, kind, title)
    candidate = "%s-%s" % (PREFIXES[kind], base)
    salt = 0
    while candidate in taken:
        salt += 1
        payload = "\x1f".join(
            [normalize_project_key(project_key), kind,
             normalize_title(title), "collision%d" % salt]
        ).encode("utf-8")
        candidate = "%s-%s" % (
            PREFIXES[kind], hashlib.sha256(payload).hexdigest()[:8].upper()
        )
    return candidate


def title_hash(project_key: str, kind: str, title: str) -> str:
    return digest(project_key, kind, title)


BUCKETS = {"objectives": "objective", "tasks": "task", "risks": "risk",
           "open_questions": "question", "drift": "drift"}
ID_FORMAT = re.compile(r"(?:OBJ|TSK|RSK|QST|DRF)-[0-9A-F]{8}")


def verify(state: dict) -> dict:
    """Validate persisted identities. A collision or rename can decouple ID and hash."""
    seen, findings = {}, []

    def finding(level, bucket, ident, message):
        findings.append({"level": level, "bucket": bucket, "id": ident,
                         "message": message})

    if not isinstance(state, dict):
        finding("error", "state", None, "expected an object")
        state = {}
    key = state.get("project_key")
    if not isinstance(key, str) or not key.strip():
        finding("error", "state", None, "missing or invalid project_key")
        key = None

    for bucket, kind in BUCKETS.items():
        items = state.get(bucket, [])
        if not isinstance(items, list):
            finding("error", bucket, None, "expected an array")
            continue
        for pos, item in enumerate(items):
            label = "%s[%d]" % (bucket, pos)
            if not isinstance(item, dict):
                finding("error", label, None, "expected an item object")
                continue
            ident = item.get("id")
            if not isinstance(ident, str) or not ID_FORMAT.fullmatch(ident):
                finding("error", label, None, "missing or malformed id")
                continue
            if ident in seen:
                finding("error", label, ident, "duplicate id, also used by " + seen[ident])
            seen[ident] = label
            if not ident.startswith(PREFIXES[kind] + "-"):
                finding("error", label, ident, "wrong prefix, expected " + PREFIXES[kind])
            title = item.get("summary" if kind == "drift" else "title")
            if not isinstance(title, str) or not title.strip():
                finding("error", label, ident, "missing or invalid identity text")
                continue
            stored = item.get("title_hash")
            if stored is None:
                # Question and drift records predate title_hash on these buckets.
                if kind not in ("question", "drift"):
                    finding("warn", label, ident, "missing title_hash; rename detection unavailable")
            elif not isinstance(stored, str) or not re.fullmatch(r"[0-9A-F]{8}", stored):
                finding("error", label, ident, "invalid title_hash")
            elif key and stored != title_hash(key, kind, title):
                finding("warn", label, ident, "title changed; record the rename and keep the id stable")
    return {"ok": not any(f["level"] == "error" for f in findings),
            "count": len(seen), "findings": findings}


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ("mint", "hash"):
        s = sub.add_parser(name)
        s.add_argument("--project-key", required=True)
        s.add_argument("--kind", required=True, choices=sorted(PREFIXES))
        s.add_argument("--title", required=True)
        s.add_argument("--taken", nargs="*", default=[])
    v = sub.add_parser("verify")
    v.add_argument("--state", required=True)
    a = p.parse_args(argv)
    if a.cmd == "mint":
        print(mint(a.project_key, a.kind, a.title, a.taken))
        return 0
    if a.cmd == "hash":
        print(title_hash(a.project_key, a.kind, a.title))
        return 0
    try:
        if not stat.S_ISREG(os.lstat(a.state).st_mode):
            raise ValueError("expected a regular state file")
        fd = os.open(a.state, os.O_RDONLY | getattr(os, "O_NONBLOCK", 0)
                     | getattr(os, "O_NOFOLLOW", 0))
        with os.fdopen(fd, encoding="utf-8") as fh:
            if not stat.S_ISREG(os.fstat(fh.fileno()).st_mode):
                raise ValueError("expected a regular state file")
            result = verify(json.load(fh))
    except (OSError, ValueError, RecursionError):
        result = {"ok": False, "count": 0, "findings": [
            {"level": "error", "bucket": "state", "id": None,
             "message": "state must be a readable JSON file"}]}
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
