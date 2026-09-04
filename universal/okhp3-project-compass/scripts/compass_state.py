#!/usr/bin/env python3
"""State, baseline, drift, and run-history management for OKHP3 Project Compass.

Every mutating command requires --apply. Without it the command prints exactly
what it would do and changes nothing. Managed edits to human-authored files
happen only inside marked blocks; text outside a block is never touched.

Commands
--------
  init         create .compass/ scaffolding (idempotent, refuses overwrite)
  baseline     compute the evidence manifest; --apply writes baseline.json
  drift        diff the working tree against the stored baseline
  record-run   append a run record and a RUN-HISTORY.md line (--apply)
  block        write or replace one managed block in a human file (--apply)

Usage
-----
  python3 compass_state.py init --root . --project-key widget-forge --apply
  python3 compass_state.py baseline --root . --apply
  python3 compass_state.py drift --root .
  python3 compass_state.py record-run --root . --mode reassess \
      --report .compass/reports/delta-20260902.md --summary "3 done, 1 stalled" \
      --counts '{"objectives":6,"done":1,"in_progress":2,"blocked":1,"drift_open":3,"score":88}' \
      --apply
  python3 compass_state.py block --root . --file docs/CHARTER.md \
      --id objectives --content-file /tmp/objectives.md --apply
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import sys

SCHEMA_STATE = "okhp3.compass.state/1"
SCHEMA_BASE = "okhp3.compass.baseline/1"
SCHEMA_RUN = "okhp3.compass.run/1"
COMPASS_DIR = ".compass"
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", "dist",
             "build", ".next", "target", ".terraform", ".mypy_cache",
             ".pytest_cache", "vendor", ".tox", "coverage"}
HASH_MAX_BYTES = 2_000_000
MANIFEST_MAX_FILES = 8000

BEGIN = "<!-- compass:begin:%s -->"
END = "<!-- compass:end:%s -->"
BLOCK_RE = r"<!-- compass:begin:%s -->.*?<!-- compass:end:%s -->"


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def stamp():
    return dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def cdir(root):
    return os.path.join(root, COMPASS_DIR)


def load_json(path, default=None):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return default


def write_json(path, doc, apply_):
    text = json.dumps(doc, indent=2, sort_keys=True) + "\n"
    if not apply_:
        return "WOULD WRITE %s (%d bytes)" % (path, len(text))
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    return "wrote %s" % path


def file_digest(path):
    try:
        size = os.path.getsize(path)
    except OSError:
        return None, 0
    if size > HASH_MAX_BYTES:
        return "size:%d" % size, size
    h = hashlib.sha256()
    try:
        with open(path, "rb") as fh:
            for chunk in iter(lambda: fh.read(65536), b""):
                h.update(chunk)
    except OSError:
        return None, size
    return h.hexdigest()[:16], size


def manifest(root):
    entries, truncated = {}, False
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
        for name in sorted(filenames):
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root).replace(os.sep, "/")
            if rel == COMPASS_DIR or rel.startswith(COMPASS_DIR + "/"):
                continue  # compass-generated state is not project evidence
            if len(entries) >= MANIFEST_MAX_FILES:
                truncated = True
                break
            digest, size = file_digest(full)
            if digest is None:
                continue
            entries[rel] = {"sha": digest, "bytes": size}
        if truncated:
            break
    return entries, truncated


def git(root, *args):
    try:
        out = subprocess.run(["git", "-C", root, *args], capture_output=True,
                             text=True, timeout=25)
    except (OSError, subprocess.SubprocessError):
        return None
    return out.stdout.strip() if out.returncode == 0 else None


def cmd_init(a):
    d = cdir(a.root)
    actions, project_key = [], a.project_key or os.path.basename(
        os.path.abspath(a.root))
    config = {
        "schema": SCHEMA_STATE,
        "project_key": project_key,
        "created_at": now(),
        "human_artifacts": {
            "charter": "docs/CHARTER.md",
            "backlog": "docs/BACKLOG.md",
            "open_questions": ".compass/OPEN-QUESTIONS.md",
            "run_history": ".compass/RUN-HISTORY.md",
        },
        "thresholds": {
            "stale_objective_days": 60,
            "abandoned_objective_days": 180,
            "stale_doc_days": 120,
        },
        "scope_firewall": {
            "deny_terms_file": ".compass/deny-terms.local.txt",
            "note": "Local, gitignored, never published. Built-in generic "
                    "detectors always run; this file adds private terms.",
        },
        "mode": {
            "detected": None,
            "sub_case": None,
            "confidence": None,
            "locked": False,
            "note": "Set by detect_mode.py each run. locked:true pins the mode "
                    "and turns a detection disagreement into a reportable "
                    "event instead of a switch.",
        },
        "github": {
            "owner_repo": None,
            "enabled": False,
            "write_authorization": "per-run",
            "milestones_from": "objectives",
            "issues_from": "tasks",
            "label_prefix": "compass",
            "close_on": ["done", "abandoned", "superseded"],
            "note": "Mode A only. No external write happens without an "
                    "explicit yes in the same session, and every write is "
                    "recorded in the run log.",
        },
        "mirror": {
            "index": ".compass/github-index.json",
            "policy": "pointers-plus-context",
            "note": "Mode A file mirror. Stores local id to issue and "
                    "milestone number mappings plus enough context to "
                    "reconstruct, never full issue bodies.",
        },
        "ignore": ["**/node_modules/**", "**/dist/**", "**/.venv/**"],
    }
    state = {
        "schema": "okhp3.compass.objectives/1",
        "project_key": project_key,
        "created_at": now(),
        "updated_at": now(),
        "charter_ref": "docs/CHARTER.md",
        "intent": {"purpose": None, "vision": None, "mission": None,
                   "confidence": "unknown", "evidence": []},
        "mode": {"detected": None, "sub_case": None, "confidence": None,
                 "evidence": [], "history": []},
        "objectives": [], "tasks": [], "risks": [], "open_questions": [],
        "drift": [], "labels": [], "runs": 0,
    }
    for rel, doc in ((os.path.join(COMPASS_DIR, "config.json"), config),
                     (os.path.join(COMPASS_DIR, "objectives.json"), state)):
        path = os.path.join(a.root, rel)
        if os.path.exists(path) and not a.force:
            actions.append("SKIP %s (exists; pass --force to replace)" % rel)
            continue
        actions.append(write_json(path, doc, a.apply))
    for rel, header in ((os.path.join(COMPASS_DIR, "RUN-HISTORY.md"),
                         "# Compass run history\n\nAppend-only. One row per "
                         "run. Trend columns come from --counts passed to "
                         "record-run; a blank cell means no count was "
                         "supplied for that run, not zero.\n\n"
                         "| run | mode | objectives | done | in progress | "
                         "blocked | drift open | score | summary | report |\n"
                         "|---|---|---|---|---|---|---|---|---|---|\n"),
                        (os.path.join(COMPASS_DIR, "OPEN-QUESTIONS.md"),
                         "# Open questions\n\nQuestions Compass would have "
                         "asked a human. Answer inline, then rerun.\n\n")):
        path = os.path.join(a.root, rel)
        if os.path.exists(path):
            actions.append("SKIP %s (exists)" % rel)
        elif not a.apply:
            actions.append("WOULD WRITE %s" % rel)
        else:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8", newline="\n") as fh:
                fh.write(header)
            actions.append("wrote %s" % rel)
    if a.apply:
        os.makedirs(os.path.join(d, "runs"), exist_ok=True)
        os.makedirs(os.path.join(d, "reports"), exist_ok=True)
    print("\n".join(actions))
    return 0


def cmd_baseline(a):
    entries, truncated = manifest(a.root)
    doc = {"schema": SCHEMA_BASE, "generated_at": now(),
           "root_basename": os.path.basename(os.path.abspath(a.root)),
           "file_count": len(entries), "truncated": truncated,
           "git_head": git(a.root, "rev-parse", "HEAD"),
           "git_last_commit": git(a.root, "log", "-1", "--format=%aI"),
           "files": entries}
    path = os.path.join(cdir(a.root), "baseline.json")
    print(write_json(path, doc, a.apply))
    if not a.apply:
        print(json.dumps({"file_count": len(entries), "truncated": truncated,
                          "git_head": doc["git_head"]}, indent=2))
    return 0


def cmd_drift(a):
    old = load_json(os.path.join(cdir(a.root), "baseline.json"))
    if not old:
        print(json.dumps({"first_run": True,
                          "reason": "no baseline.json found; run discovery mode"},
                         indent=2))
        return 0
    new, _ = manifest(a.root)
    old_files = old.get("files", {})
    added = sorted(set(new) - set(old_files))
    removed = sorted(set(old_files) - set(new))
    changed = sorted(p for p in set(new) & set(old_files)
                     if new[p]["sha"] != old_files[p]["sha"])
    commits = []
    head_then = old.get("git_head")
    if head_then:
        log = git(a.root, "log", "%s..HEAD" % head_then, "--format=%H%x1f%aI%x1f%s")
        for line in (log or "").splitlines():
            parts = line.split("\x1f")
            if len(parts) == 3:
                commits.append({"sha": parts[0][:12], "date": parts[1],
                                "subject": parts[2]})
    print(json.dumps({
        "first_run": False,
        "baseline_generated_at": old.get("generated_at"),
        "counts": {"added": len(added), "changed": len(changed),
                   "removed": len(removed), "commits_since": len(commits)},
        "added": added[:300], "changed": changed[:300], "removed": removed[:300],
        "commits_since_baseline": commits[:200],
    }, indent=2, sort_keys=True))
    return 0


def cmd_record_run(a):
    run_id = "run-%s" % stamp()
    counts = json.loads(a.counts) if a.counts else {}
    record = {"schema": SCHEMA_RUN, "run_id": run_id, "at": now(),
              "mode": a.mode, "summary": a.summary, "report": a.report,
              "git_head": git(a.root, "rev-parse", "HEAD"),
              "counts": counts,
              "unattended": bool(a.unattended)}
    path = os.path.join(cdir(a.root), "runs", run_id + ".json")
    print(write_json(path, record, a.apply))
    trend_keys = ("objectives", "done", "in_progress", "blocked", "drift_open", "score")
    trend_cells = [str(counts[k]) if k in counts and counts[k] is not None else ""
                   for k in trend_keys]
    row = "| %s | %s | %s | %s | %s |\n" % (
        run_id, a.mode, " | ".join(trend_cells),
        (a.summary or "").replace("|", "/"), a.report or "")
    hist = os.path.join(cdir(a.root), "RUN-HISTORY.md")
    if not a.apply:
        print("WOULD APPEND to %s: %s" % (hist, row.strip()))
        return 0
    os.makedirs(os.path.dirname(hist), exist_ok=True)
    with open(hist, "a", encoding="utf-8", newline="\n") as fh:
        fh.write(row)
    state_path = os.path.join(cdir(a.root), "objectives.json")
    state = load_json(state_path)
    if state is not None:
        state["runs"] = int(state.get("runs", 0)) + 1
        state["updated_at"] = now()
        state["last_run_id"] = run_id
        write_json(state_path, state, True)
    print("appended %s" % hist)
    return 0


def cmd_block(a):
    path = os.path.join(a.root, a.file)
    with open(a.content_file, "r", encoding="utf-8") as fh:
        content = fh.read().rstrip("\n")
    block = "%s\n%s\n%s" % (BEGIN % a.id, content, END % a.id)
    existing = ""
    if os.path.isfile(path):
        with open(path, "r", encoding="utf-8") as fh:
            existing = fh.read()
    pattern = re.compile(BLOCK_RE % (re.escape(a.id), re.escape(a.id)),
                         re.DOTALL)
    if pattern.search(existing):
        updated = pattern.sub(lambda _m: block, existing, count=1)
        action = "replace managed block '%s' in %s" % (a.id, a.file)
    else:
        sep = "" if existing.endswith("\n\n") or not existing else "\n"
        updated = existing + sep + "\n" + block + "\n"
        action = "append managed block '%s' to %s" % (a.id, a.file)
    outside_before = pattern.sub("", existing)
    outside_after = pattern.sub("", updated)
    if existing and outside_before.strip() not in outside_after:
        print("REFUSED: edit would alter human-authored text outside the "
              "managed block", file=sys.stderr)
        return 3
    if not a.apply:
        print("WOULD %s (%d bytes)" % (action, len(block)))
        return 0
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(updated)
    print("did %s" % action)
    return 0


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--root", default=".")
    p.add_argument("--apply", action="store_true",
                   help="actually write; omit for a dry run")
    sub = p.add_subparsers(dest="cmd", required=True)
    i = sub.add_parser("init"); i.add_argument("--project-key")
    i.add_argument("--force", action="store_true"); i.set_defaults(fn=cmd_init)
    b = sub.add_parser("baseline"); b.set_defaults(fn=cmd_baseline)
    d = sub.add_parser("drift"); d.set_defaults(fn=cmd_drift)
    r = sub.add_parser("record-run")
    r.add_argument("--mode", required=True,
                   choices=["discovery", "reassess", "assess-only", "repair"])
    r.add_argument("--summary", default="")
    r.add_argument("--report", default="")
    r.add_argument("--counts", help="JSON object of tallies")
    r.add_argument("--unattended", action="store_true")
    r.set_defaults(fn=cmd_record_run)
    k = sub.add_parser("block")
    k.add_argument("--file", required=True)
    k.add_argument("--id", required=True)
    k.add_argument("--content-file", required=True)
    k.set_defaults(fn=cmd_block)
    a = p.parse_args(argv)
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
