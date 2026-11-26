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
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path, PureWindowsPath
import re
import stat
import sys
import tempfile
import unicodedata

# Running this CLI from inside the target must not populate __pycache__ on a preview.
_bytecode_setting = sys.dont_write_bytecode
try:
    sys.dont_write_bytecode = True
    from compass_ids import normalize_project_key
    from detect_mode import is_worktree, run_git
    from scan_repo import SKIP_DIRS, detectors, excluded_name
finally:
    sys.dont_write_bytecode = _bytecode_setting

SCHEMA_STATE = "okhp3.compass.state/1"
SCHEMA_BASE = "okhp3.compass.baseline/1"
SCHEMA_RUN = "okhp3.compass.run/1"
COMPASS_DIR = ".compass"
SKIPPED_NAMES = {name.casefold() for name in SKIP_DIRS}
MANIFEST_MAX_FILES = 8000

BEGIN = "<!-- compass:begin:%s -->"
END = "<!-- compass:end:%s -->"
LOCK = ".compass-state.lock"
TREND_KEYS = ("objectives", "done", "in_progress", "blocked", "drift_open", "score")
HISTORY_COLUMNS = ("run", "mode", *(k.replace("_", " ") for k in TREND_KEYS),
                   "summary", "report")
HISTORY_TABLE = ("| " + " | ".join(HISTORY_COLUMNS) + " |\n"
                 + "|" + "---|" * len(HISTORY_COLUMNS) + "\n")
HISTORY_INTRO = ("# Compass run history\n\nAppend-only. One row per run. A blank "
                 "trend cell means no count was supplied for that run.\n\n")
SCHEMA_OBJECTIVES = "okhp3.compass.objectives/1"


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def stamp():
    return dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")


@contextmanager
def writer_lock(root):
    # Also portable to hosts without flock. A crashed writer leaves a visible lock.
    lock = root / LOCK
    try:
        lock.mkdir(mode=0o700)
    except FileExistsError:
        raise ValueError("%s exists; check for an active or interrupted writer" % lock)
    try:
        yield
    finally:
        lock.rmdir()


def relative_parts(name):
    win = PureWindowsPath(name)
    parts = Path(name).parts
    if (not parts or win.drive or win.root or "\\" in name or ".." in parts
            or any(p.endswith((" ", ".")) or ":" in p or PureWindowsPath(p).is_reserved()
                   or any(ord(c) < 32 for c in p) for p in parts)):
        raise ValueError("expected a safe project-relative path: %r" % name)
    return parts


def target(root, name, directory=False):
    """Check each component before accessing it; missing descendants may be created."""
    parts = relative_parts(name)
    path = root
    for i, part in enumerate(parts):
        if part.casefold() in {".git", LOCK}:
            raise ValueError("reserved project path: %s" % name)
        path = path / part
        try:
            info = path.lstat()
            mode = info.st_mode
        except FileNotFoundError:
            continue
        if redirected(info):
            raise ValueError("refusing redirected project path: %s" % path)
        if i < len(parts) - 1 or directory:
            if not stat.S_ISDIR(mode) or os.path.lexists(path / ".git"):
                raise ValueError("unsafe directory or nested repository: %s" % path)
        elif not stat.S_ISREG(mode) or info.st_nlink != 1:
            raise ValueError("expected an unshared regular file: %s" % path)
    return path


def json_object(pairs):
    doc = {}
    for key, value in pairs:
        if key in doc:
            raise ValueError("duplicate JSON key %r" % key)
        doc[key] = value
    return doc


def invalid_number(value):
    raise ValueError("invalid JSON number %s" % value)


def parse_json(text):
    return json.loads(text, object_pairs_hook=json_object, parse_constant=invalid_number)


def read_doc(path, schema):
    try:
        doc = parse_json(path.read_text(encoding="utf-8"))
    except ValueError as exc:
        raise ValueError("%s: %s" % (path, exc)) from exc
    if not isinstance(doc, dict) or doc.get("schema") != schema:
        raise ValueError("%s: expected a %s document" % (path, schema))
    return doc


def encoded(doc):
    return (json.dumps(doc, indent=2, sort_keys=True, allow_nan=False) + "\n").encode()


def put(path, data, apply_, create=False):
    """Publish complete bytes, keeping existing permission bits. Link for no-clobber."""
    if not apply_:
        return "WOULD WRITE %s (%d bytes)" % (path, len(data))
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as tmp:
        staged = Path(tmp.name)
        try:
            if not create and path.exists():
                os.chmod(staged, stat.S_IMODE(path.stat().st_mode) & 0o777)
            tmp.write(data)
            tmp.close()
            if create:
                os.link(staged, path)
            else:
                os.replace(staged, path)
        finally:
            staged.unlink(missing_ok=True)
    return "wrote %s" % path


def natural(n):
    return type(n) is int and n >= 0


def state_pair(root):
    config_path = target(root, ".compass/config.json")
    state_path = target(root, ".compass/objectives.json")
    config = read_doc(config_path, SCHEMA_STATE)
    state = read_doc(state_path, SCHEMA_OBJECTIVES)
    key = config.get("project_key")
    if (not isinstance(key, str) or not key or state.get("project_key") != key
            or not all(isinstance(state.get(k), list) for k in ("objectives", "tasks"))
            or not natural(state.get("runs", 0))):
        raise ValueError("incomplete or inconsistent config/objectives in %s" % state_path.parent)
    return config, state


def fail_walk(error):
    raise error


def path_key(name):
    # Compare privacy exclusions conservatively across filesystem case and Unicode forms.
    return unicodedata.normalize("NFC", name).casefold()


def manifest_privacy(root):
    default = ".compass/deny-terms.local.txt"
    paths = {default}
    config = target(root, ".compass/config.json")
    if config.exists():
        settings = read_doc(config, SCHEMA_STATE).get("scope_firewall", {})
        if not isinstance(settings, dict):
            raise ValueError("invalid scope_firewall configuration")
        rel = settings.get("deny_terms_file", default)
        if not isinstance(rel, str) or not rel:
            raise ValueError("invalid deny-terms path")
        paths.add(rel)
    terms = set()
    for rel in paths:
        path = target(root, rel)
        if rel == default and not path.exists():
            continue
        with path.open("rb") as stream:
            data = stream.read(400_001)
        if len(data) > 400_000:
            raise ValueError("local deny-terms file exceeds 400000 bytes")
        terms.update(path_key(line.strip()) for line in data.decode().splitlines()
                     if line.strip() and not line.lstrip().startswith("#"))
    return terms, {path_key(Path(rel).as_posix()) for rel in paths}


def restricted_text(name, deny):
    text = unicodedata.normalize("NFC", name)
    words = re.sub(r"[\s./\\_-]+", " ", text)
    return bool(detectors(text, deny) or (words != text and detectors(words, deny)))


def excluded(name, deny):
    return (name.casefold() in SKIPPED_NAMES or name.casefold() == LOCK
            or excluded_name(name) or restricted_text(name, deny))


def private_path(relative, deny, private_paths):
    return (path_key(relative) in private_paths or restricted_text(relative, deny)
            or any(excluded(part, deny) for part in Path(relative).parts))


def redirected(info):
    # Windows junctions can be directories without being POSIX-style symlinks.
    return (stat.S_ISLNK(info.st_mode) or
            bool(getattr(info, "st_file_attributes", 0) & stat.FILE_ATTRIBUTE_REPARSE_POINT))


def manifest(root, deny, private_paths):
    entries, nested, skipped = {}, [], set()
    for directory, dirs, files in os.walk(root, onerror=fail_walk):
        parent = Path(directory)
        keep = []
        for name in sorted(dirs):
            path = parent / name
            rel = path.relative_to(root).as_posix()
            if private_path(rel, deny, private_paths):
                continue
            if redirected(path.lstat()):
                skipped.add(rel)
            elif os.path.lexists(path / ".git"):
                nested.append(rel)
                skipped.add(rel)
            else:
                keep.append(name)
        dirs[:] = keep
        for name in sorted(files):
            path = parent / name
            rel = path.relative_to(root).as_posix()
            if private_path(rel, deny, private_paths):
                continue
            info = path.lstat()
            if redirected(info) or not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
                skipped.add(rel)
                continue
            if len(entries) >= MANIFEST_MAX_FILES:
                return entries, True, nested, skipped
            digest, size = hashlib.sha256(), 0
            with path.open("rb") as fh:
                for chunk in iter(lambda: fh.read(256 * 1024), b""):
                    digest.update(chunk)
                    size += len(chunk)
            entries[rel] = {"sha": digest.hexdigest()[:16], "bytes": size}
    return entries, False, nested, skipped


GIT_OID = re.compile(r"(?:[0-9a-f]{40}|[0-9a-f]{64})")
GIT_DATE = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:Z|[+-][0-9]{2}:[0-9]{2})")
BASELINE_TIME = re.compile(r"[0-9]{4}-[0-9]{2}-[0-9]{2}(?:T[0-9]{2}:[0-9]{2}:[0-9]{2}"
                           r"(?:\.[0-9]+)?(?:Z|[+-][0-9]{2}:[0-9]{2})?)?")


def read_baseline(path):
    old = read_doc(path, SCHEMA_BASE)
    files = old.get("files")
    if (not isinstance(files, dict) or not natural(old.get("file_count"))
            or old["file_count"] != len(files) or type(old.get("truncated")) is not bool
            or not isinstance(old.get("generated_at"), str)
            or not BASELINE_TIME.fullmatch(old["generated_at"])):
        raise ValueError("%s: incomplete baseline metadata" % path)
    head = old.get("git_head")
    if head is not None and not (isinstance(head, str)
                                 and GIT_OID.fullmatch(head)):
        raise ValueError("%s: invalid git_head" % path)
    for name, entry in files.items():
        if (not name or name.startswith("/") or ".." in Path(name).parts
                or not isinstance(entry, dict) or not natural(entry.get("bytes"))
                or not isinstance(entry.get("sha"), str)
                or not (re.fullmatch(r"[0-9a-f]{16}", entry["sha"])
                        or entry["sha"] == "size:%d" % entry["bytes"])):
            raise ValueError("invalid baseline manifest entry")
    return old


def git(root, *args):
    if not is_worktree(root):
        return None  # Do not discover a repository above the selected root.
    return run_git(root, *args)


def cmd_init(a):
    project_key = normalize_project_key(a.project_key or a.root.name)
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
        "sinks": [{"id": "files", "type": "files", "enabled": True}],
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
        "schema": SCHEMA_OBJECTIVES,
        "project_key": project_key,
        "created_at": now(),
        "updated_at": now(),
        "charter_ref": "docs/CHARTER.md",
        "intent": {"claims": [{"field": field, "text": None, "confidence": "unknown",
                               "evidence": []} for field in ("purpose", "vision", "mission")]},
        "mode": {"detected": None, "sub_case": None, "confidence": None,
                 "evidence": [], "history": []},
        "objectives": [], "tasks": [], "risks": [], "open_questions": [],
        "drift": [], "labels": [], "runs": 0,
    }
    config_path = target(a.root, ".compass/config.json")
    state_path = target(a.root, ".compass/objectives.json")
    hist = target(a.root, ".compass/RUN-HISTORY.md")
    questions = target(a.root, ".compass/OPEN-QUESTIONS.md")
    runs = target(a.root, ".compass/runs", directory=True)
    reports = target(a.root, ".compass/reports", directory=True)
    ignore_path = target(a.root, ".compass/.gitignore")
    ignore = ignore_path.read_bytes() if ignore_path.exists() else b""
    rules = [line for line in ignore.splitlines() if line and not line.startswith(b"#")]
    rule = b"/deny-terms.local.txt"
    # Check all destinations before writing any of the scaffold.
    if config_path.exists() or state_path.exists():
        if a.force:
            raise ValueError("--force cannot replace existing tracking state; use reassessment")
        _, prior_state = state_pair(a.root)
        if not (hist.exists() and runs.is_dir()):
            raise ValueError("incomplete tracking scaffold; review missing history or runs")
        inspect_history(a.root, hist, runs, prior_state, verify_reports=False)
    elif hist.exists() or (runs.exists() and any(runs.iterdir())):
        raise ValueError("existing run history without config/objectives; review before init")
    if not rules or rules[-1] not in (rule, rule[1:]):
        newline = b"\r\n" if b"\r\n" in ignore else b"\n"
        prefix = newline if ignore and not ignore.endswith(b"\n") else b""
        print(put(ignore_path, ignore + prefix + rule + newline, a.apply,
                  create=not ignore_path.exists()))
    for path, data in (
        (config_path, encoded(config)), (state_path, encoded(state)),
        (hist, (HISTORY_INTRO + HISTORY_TABLE).encode()),
        (questions, b"# Open questions\n\nQuestions Compass would have asked a human. "
                    b"Answer inline, then rerun.\n\n"),
    ):
        if path.exists():
            print("SKIP %s (exists)" % path)
        else:
            print(put(path, data, a.apply, create=True))
    if a.apply:
        runs.mkdir(exist_ok=True)
        reports.mkdir(exist_ok=True)
    return 0


def cmd_baseline(a):
    path = target(a.root, ".compass/baseline.json")
    old = read_baseline(path) if path.exists() else None
    deny, private_paths = manifest_privacy(a.root)
    entries, truncated, nested, _ = manifest(a.root, deny, private_paths)
    head = git(a.root, "rev-parse", "HEAD") or ""
    date = git(a.root, "log", "-1", "--format=%aI") or ""
    doc = {"schema": SCHEMA_BASE, "root_basename": None if excluded(a.root.name, deny) else a.root.name,
           "file_count": len(entries), "truncated": truncated, "nested_repos": nested,
           "git_head": head if GIT_OID.fullmatch(head) else None,
           "git_last_commit": date if GIT_DATE.fullmatch(date) else None,
           "files": entries}
    if old and old == dict(doc, generated_at=old["generated_at"]):
        print("SKIP .compass/baseline.json (unchanged)")
    else:
        doc["generated_at"] = now()
        put(path, encoded(doc), a.apply, create=old is None)
        print(("wrote" if a.apply else "WOULD WRITE") + " .compass/baseline.json")
    if not a.apply:
        print(json.dumps({"file_count": len(entries), "truncated": truncated,
                          "git_head": doc["git_head"]}, indent=2))
    return 0


def cmd_drift(a):
    path = target(a.root, ".compass/baseline.json")
    if not path.exists():
        print(json.dumps({"first_run": True,
                          "reason": "no baseline.json found; run discovery mode"}, indent=2))
        return 0
    old = read_baseline(path)
    deny, private_paths = manifest_privacy(a.root)
    new, truncated, nested, skipped = manifest(a.root, deny, private_paths)
    # Never follow paths from an old manifest. A previous version may have
    # indexed a linked file, a nested worktree or a now-excluded name.
    before = {name: entry for name, entry in old["files"].items()
              if not private_path(name, deny, private_paths)}
    # One-sided differences cannot establish absence in an incomplete inventory.
    added = [] if old["truncated"] else sorted(new.keys() - before.keys())
    removed, unverified = [], []
    for name in sorted(before.keys() - new.keys()):
        if truncated or name in skipped or any(p.as_posix() in skipped for p in Path(name).parents):
            unverified.append(name)
        else:
            removed.append(name)
    changed = []
    for name in sorted(new.keys() & before.keys()):
        if new[name]["bytes"] != before[name]["bytes"]:
            changed.append(name)
        elif before[name]["sha"].startswith("size:"):
            unverified.append(name)
        elif new[name]["sha"] != before[name]["sha"]:
            changed.append(name)
    commits = []
    head_then = old.get("git_head")
    if head_then:
        log = git(a.root, "log", "%s..HEAD" % head_then, "--format=%H%x1f%aI")
        for line in (log or "").splitlines():
            parts = line.split("\x1f")
            if len(parts) == 2 and GIT_OID.fullmatch(parts[0]) and GIT_DATE.fullmatch(parts[1]):
                commits.append({"sha": parts[0][:12], "date": parts[1]})
    print(json.dumps({
        "first_run": False, "baseline_generated_at": old["generated_at"],
        "baseline_truncated": old["truncated"], "current_truncated": truncated,
        "nested_repos": nested, "unverified": sorted(unverified)[:300],
        "counts": {"added": len(added), "changed": len(changed), "removed": len(removed),
                   "unverified": len(unverified), "commits_since": len(commits)},
        "added": added[:300], "changed": changed[:300], "removed": removed[:300],
        "commits_since_baseline": commits[:200],
    }, indent=2, sort_keys=True))
    return 0


REPORT_RUN = re.compile(r"^Run[ \t]+(run-[a-zA-Z0-9][a-zA-Z0-9_.-]*)(?=[ \t]|$)", re.M)


def report_identity(root, reference):
    if not isinstance(reference, str) or not reference or "|" in reference:
        raise ValueError("expected a project-relative Markdown report path")
    path = target(root, reference)
    if path.suffix.lower() != ".md":
        raise ValueError("expected a Markdown report")
    with path.open(encoding="utf-8") as stream:
        ids = [match.group(1) for line in stream for match in REPORT_RUN.finditer(line)]
    if len(ids) != 1:
        raise ValueError("report needs exactly one 'Run <run-id>' line")
    run_id = ids[0]
    if (path.stem.startswith(("delta-run-", "baseline-run-"))
            and path.stem.split("-", 1)[1] != run_id):
        raise ValueError("delta report filename and run identity disagree")
    return run_id


def inspect_history(root, hist, runs, state, *, verify_reports=True):
    """An interrupted append must be reconciled before creating another run."""
    text = hist.read_bytes().decode("utf-8")
    columns = ()
    ids = []
    report_cells = {}
    for line in text.splitlines():
        if not line.startswith("|"):
            continue
        cells = tuple(cell.strip() for cell in line.strip("|").split("|"))
        if cells[0].lower() in ("run", "run id"):
            columns = tuple(s.lower() for s in cells)
        elif cells[0].startswith("run-"):
            ids.append(cells[0])
            if columns and columns[-1] == "report":
                report_cells[cells[0]] = cells[-1]
    if columns not in (HISTORY_COLUMNS, HISTORY_COLUMNS[:-1], ("run", "mode", "summary", "report")):
        raise ValueError("%s: missing or unrecognized history table" % hist)
    records = {}
    for file in runs.iterdir():
        if file.suffix != ".json" or not file.name.startswith("run-"):
            continue
        path = target(root, file.relative_to(root).as_posix())
        record = read_doc(path, SCHEMA_RUN)
        if record.get("run_id") != file.stem:
            raise ValueError("%s: run identity does not match filename" % path)
        if verify_reports:
            ref = record.get("report")
            if (report_identity(root, ref) != file.stem
                    or report_cells.get(file.stem, ref) != ref):
                raise ValueError("run record, history and report do not identify the same run")
        records[file.stem] = record
    if (len(ids) != len(records) or set(ids) != records.keys()
            or state.get("runs", len(ids)) != len(ids)
            or ("last_run_id" in state and state["last_run_id"] != (ids[-1] if ids else None))):
        raise ValueError("inconsistent run records, history or objectives counter; "
                         "reconcile the existing artifacts before recording another run")
    return text, columns, records


def table_cell(value):
    return " ".join(value.splitlines()).replace("|", "/").strip()


def cmd_record_run(a):
    _, state = state_pair(a.root)
    state_path = target(a.root, ".compass/objectives.json")
    hist = target(a.root, ".compass/RUN-HISTORY.md")
    runs = target(a.root, ".compass/runs", directory=True)
    history, columns, records = inspect_history(a.root, hist, runs, state, verify_reports=False)
    counts = parse_json(a.counts) if a.counts is not None else {}
    if (not isinstance(counts, dict)
            or any(counts.get(k) is not None and not natural(counts[k]) for k in TREND_KEYS)):
        raise ValueError("--counts must be a JSON object with nonnegative integer or null tallies")
    base = "run-%s" % stamp()
    run_id = base
    suffix = 1
    while run_id in records:
        suffix += 1
        run_id = "%s-%d" % (base, suffix)
    if a.report:
        run_id = report_identity(a.root, a.report)
        if run_id in records:
            raise ValueError("this report's run ID is already recorded")
    else:
        kind = "baseline" if a.mode == "discovery" else "delta"
        a.report = ".compass/reports/%s-%s.md" % (kind, run_id)
        if not a.apply and not target(a.root, a.report).exists():
            print("WOULD REQUIRE %s with a 'Run %s' line" % (a.report, run_id))
        elif report_identity(a.root, a.report) != run_id:
            raise ValueError("report identity disagrees with the next run ID")
    # Do not reassign a legacy report filename even if its contents have changed.
    report_key = Path(a.report).as_posix().casefold()
    if any(isinstance(prior.get("report"), str)
           and Path(prior["report"]).as_posix().casefold() == report_key
           for prior in records.values()):
        raise ValueError("this report path already belongs to a recorded run")
    path = target(a.root, ".compass/runs/%s.json" % run_id)
    record = {"schema": SCHEMA_RUN, "run_id": run_id, "at": now(), "mode": a.mode,
              "summary": a.summary, "report": a.report, "git_head": git(a.root, "rev-parse", "HEAD"),
              "counts": counts, "unattended": bool(a.unattended)}
    newline = "\r\n" if history.endswith("\r\n") else "\n"
    suffix_text = "" if history.endswith("\n") else newline
    if columns != HISTORY_COLUMNS:
        suffix_text += newline + HISTORY_TABLE.replace("\n", newline)
    trend = ["" if counts.get(k) is None else str(counts[k]) for k in TREND_KEYS]
    cells = [run_id, a.mode, *trend, table_cell(a.summary), table_cell(a.report)]
    row = "| " + " | ".join(cells) + " |" + newline
    state.update(runs=len(records) + 1, last_run_id=run_id, updated_at=record["at"])
    record_data, state_data = encoded(record), encoded(state)
    print(put(path, record_data, a.apply, create=True))
    if not a.apply:
        print("WOULD APPEND to %s: %s" % (hist, row.strip()))
        print("WOULD UPDATE %s" % state_path)
        return 0
    # Each publish is atomic. Roll back ordinary I/O failures; inspect_history
    # detects a process death between publishes on the next invocation.
    try:
        put(hist, (history + suffix_text + row).encode(), True)
        try:
            put(state_path, state_data, True)
        except OSError:
            put(hist, history.encode(), True)
            raise
    except OSError:
        # Keep the record if history rollback failed, for manual reconciliation.
        if hist.read_bytes() == history.encode():
            path.unlink()
        raise
    print("appended %s" % hist)
    return 0


MARKER_LIKE = re.compile(r"<!--\s*compass\s*:", re.I)
BOUNDARY = re.compile(r"<!-- compass:(begin|end):([\w.-]+) -->")
SIGNATURE = re.compile(r"<!-- compass:sha256:([0-9a-f]{64}) -->")


def block_spans(lines):
    spans = {}
    opened = None
    for index, line in enumerate(lines):
        if not MARKER_LIKE.search(line):
            continue
        token = line.rstrip("\r\n")
        match = BOUNDARY.fullmatch(token)
        if match:
            kind, name = match.groups()
            if kind == "begin" and opened is None and name not in spans:
                opened = (name, index, None)
                continue
            if kind == "end" and opened and opened[0] == name:
                _, start, checksum = opened
                spans[name] = (start, index, checksum)
                opened = None
                continue
        signature = SIGNATURE.fullmatch(token)
        if signature and opened and index == opened[1] + 1:
            opened = (opened[0], opened[1], signature.group(1))
            continue
        raise ValueError("ambiguous or malformed Compass marker on line %d" % (index + 1))
    if opened:
        raise ValueError("missing end marker for %s" % opened[0])
    return spans


def block_digest(body):
    return hashlib.sha256(body.encode("utf-8")).hexdigest()


def cmd_block(a):
    if not re.fullmatch(r"[\w.-]+", a.id):
        raise ValueError("invalid managed block ID")
    path = target(a.root, a.file)
    parts = tuple(p.casefold() for p in path.relative_to(a.root).parts)
    if parts[0] == COMPASS_DIR and (path.suffix.lower() != ".md" or parts[1:2] == ("runs",)
                                   or parts == (COMPASS_DIR, "run-history.md")):
        raise ValueError("reserved Compass state target: %s" % a.file)
    source = Path(a.content_file)
    if not stat.S_ISREG(source.lstat().st_mode):
        raise ValueError("--content-file must be a regular non-symlink file")
    content = source.read_text(encoding="utf-8").rstrip("\n")
    if MARKER_LIKE.search(content):
        raise ValueError("proposed content contains a reserved Compass marker")
    existing = path.read_bytes().decode("utf-8") if path.exists() else ""
    # Keep exact line terminators outside the span, including mixed EOL files.
    lines = re.findall(r"[^\r\n]*(?:\r\n|\n|\r)|[^\r\n]+$", existing)
    span = block_spans(lines).get(a.id)
    match = re.search(r"\r\n|\r|\n", lines[span[0]] if span else existing)
    newline = match.group() if match else "\n"
    body = content.replace("\n", newline) + newline
    signature = "<!-- compass:sha256:%s -->" % block_digest(body)
    if span:
        start, end, checksum = span
        before = "".join(lines[start + (2 if checksum else 1):end])
        if checksum and block_digest(before) != checksum:
            raise ValueError("managed block '%s' contains edits; reconcile by hand" % a.id)
        if not checksum and before != body:
            raise ValueError("unsigned legacy block '%s' differs; review its current text "
                             "and adopt matching content before replacing it" % a.id)
        if checksum and before == body:
            print("SKIP %s in %s (unchanged)" % (a.id, a.file))
            return 0
        lines[start + 1:end] = [signature + newline, body]
        updated = "".join(lines)
        action = "update"
    else:
        separator = "" if not existing or existing.endswith(("\r", "\n")) else newline
        if existing and not existing.endswith(newline * 2):
            separator += newline
        updated = (existing + separator + BEGIN % a.id + newline + signature + newline
                   + body + END % a.id + newline)
        action = "append"
    print("%s managed block '%s': %s" %
          (action, a.id, put(path, updated.encode(), a.apply, create=not path.exists())))
    return 0


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--root", default=".")
    p.add_argument("--apply", action="store_true",
                   help="actually write; omit for a dry run")
    sub = p.add_subparsers(dest="cmd", required=True)
    i = sub.add_parser("init"); i.add_argument("--project-key")
    i.add_argument("--force", action="store_true", help="legacy option; refuses existing state"); i.set_defaults(fn=cmd_init)
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
    # Accept common options on either side of the verb (both forms ship in docs).
    for parser in (i, b, d, r, k):
        parser.add_argument("--root", default=argparse.SUPPRESS)
        parser.add_argument("--apply", action="store_true", default=argparse.SUPPRESS)
    a = p.parse_args(argv)
    try:
        raw_root = Path(a.root)
        if not a.root.strip() or not raw_root.is_dir() or redirected(raw_root.lstat()):
            raise ValueError("--root must name an existing non-symlink directory")
        a.root = raw_root.resolve(strict=True)
        if a.root == a.root.parent or ".git" in (p.casefold() for p in a.root.parts):
            raise ValueError("refusing filesystem root or Git metadata as project root")
        if a.apply and a.cmd != "drift":
            with writer_lock(a.root):
                return a.fn(a)
        return a.fn(a)
    except (ValueError, OSError, RecursionError) as exc:
        # Manifest I/O errors can carry a sensitive legacy filename or root.
        detail = "invalid or inaccessible manifest input" if a.cmd in ("baseline", "drift") else str(exc)
        print("REFUSED: %s" % detail, file=sys.stderr)
        return 3


if __name__ == "__main__":
    sys.exit(main())
