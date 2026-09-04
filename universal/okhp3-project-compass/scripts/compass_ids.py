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
  python3 compass_id.py hash --project-key myrepo --kind task --title "Write docs"
  python3 compass_ids.py verify --state .compass/objectives.json
"""
from __future__ import annotations

import argparse
import hashlib
import json
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


def _iter_items(state):
    for bucket, kind in (("objectives", "objective"), ("tasks", "task"),
                         ("risks", "risk"), ("open_questions", "question")):
        for item in state.get(bucket, []) or []:
            yield bucket, kind, item


def verify(state: dict) -> dict:
    """Check uniqueness, prefix correctness, and detect unrecorded renames."""
    project_key = state.get("project_key", "")
    seen, findings = {}, []
    for bucket, kind, item in _iter_items(state):
        ident = item.get("id", "")
        title = item.get("title", "")
        if not ident:
            findings.append({"level": "error", "bucket": bucket,
                             "id": None, "message": "item has no id",
                             "title": title})
            continue
        if ident in seen:
            findings.append({"level": "error", "bucket": bucket, "id": ident,
                             "message": "duplicate id, also used by %s"
                                        % seen[ident]})
        seen[ident] = bucket
        want = PREFIXES[kind]
        if not ident.startswith(want + "-"):
            findings.append({"level": "error", "bucket": bucket, "id": ident,
                             "message": "wrong prefix, expected %s-" % want})
        if not re.fullmatch(r"[A-Z]{3}-[0-9A-F]{8}", ident):
            findings.append({"level": "error", "bucket": bucket, "id": ident,
                             "message": "malformed id, expected PRE-XXXXXXXX"})
        stored = item.get("title_hash")
        current = title_hash(project_key, kind, title)
        if stored and stored != current:
            findings.append({
                "level": "warn", "bucket": bucket, "id": ident,
                "message": "title changed since mint; record a rename entry "
                           "and keep the id stable",
                "stored_title_hash": stored, "current_title_hash": current})
        if not stored:
            findings.append({"level": "warn", "bucket": bucket, "id": ident,
                             "message": "missing title_hash; rename detection "
                                        "is disabled for this item"})
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
    with open(a.state, "r", encoding="utf-8") as fh:
        result = verify(json.load(fh))
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
