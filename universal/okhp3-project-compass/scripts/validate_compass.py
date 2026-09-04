#!/usr/bin/env python3
"""Self-check and quality rubric for OKHP3 Project Compass artifacts.

Read-only. Runs ten checks (V1-V10) against the .compass state and the human
artifacts it manages, scores the result 0-100, and assigns a band. An
unavailable check is NOT RUN, never PASS.

Usage
-----
  python3 validate_compass.py --root .
  python3 validate_compass.py --root . --json
  python3 validate_compass.py --root . --deny-terms-file .compass/deny-terms.local.txt

Exit codes: 0 clean or warnings only, 1 one or more FAIL, 2 usage error.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    from compass_ids import verify as verify_ids  # noqa: E402
except ImportError:  # pragma: no cover
    verify_ids = None

VALID_STATUS = {"proposed", "active", "in_progress", "blocked", "done",
                "abandoned", "superseded"}
EVIDENCE_REQUIRED = {"active", "in_progress", "blocked", "done", "abandoned",
                     "superseded"}
EVIDENCE_TYPES = {"commit", "pr", "issue", "file_added", "file_changed",
                  "file_removed", "doc_change", "test_signal", "dep_change",
                  "release", "manual", "absence"}
CONFIDENCE = {"declared", "inferred-strong", "inferred-weak", "unknown"}
CHARTER_SECTIONS = ["purpose", "vision", "mission", "goals", "non-goals",
                    "success"]
FIREWALL = [
    ("confidentiality-marker",
     re.compile(r"\b(confidential|internal use only|do not distribute)\b", re.I)),
    ("ticket-key", re.compile(r"\b[A-Z]{2,6}-\d{2,6}\b")),
    ("corp-host", re.compile(r"\b[\w.-]+\.(corp|internal|intranet)\b", re.I)),
    ("secretish", re.compile(r"\b(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|"
                             r"-----BEGIN [A-Z ]*PRIVATE KEY-----)")),
]
COMPASS_ID_RE = re.compile(r"\b(OBJ|TSK|RSK|QST|DRF)-[0-9A-F]{8}\b")
EM_DASH = "—"
WEIGHTS = {"V1": 10, "V2": 12, "V3": 11, "V4": 13, "V5": 11, "V6": 7,
           "V7": 9, "V8": 5, "V9": 6, "V10": 6, "V11": 10}
MIRROR_BODY_CAP = 2000


def load(path):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return None


def read(path):
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return None


def days_since(iso_text):
    if not iso_text:
        return None
    try:
        when = dt.datetime.fromisoformat(str(iso_text).replace("Z", "+00:00"))
    except ValueError:
        return None
    if when.tzinfo is None:
        when = when.replace(tzinfo=dt.timezone.utc)
    return (dt.datetime.now(dt.timezone.utc) - when).days


class Result:
    def __init__(self, cid, name):
        self.id, self.name = cid, name
        self.status, self.findings, self.ratio = "PASS", [], 1.0

    def fail(self, msg):
        self.status = "FAIL"
        self.findings.append({"level": "error", "message": msg})

    def warn(self, msg):
        if self.status == "PASS":
            self.status = "WARN"
        self.findings.append({"level": "warn", "message": msg})

    def notrun(self, msg):
        self.status = "NOT RUN"
        self.ratio = 0.0
        self.findings.append({"level": "info", "message": msg})

    def score(self):
        if self.status == "FAIL":
            return WEIGHTS[self.id] * min(self.ratio, 0.4)
        if self.status == "WARN":
            return WEIGHTS[self.id] * min(self.ratio, 0.8)
        if self.status in ("NOT RUN", "BLOCKED"):
            return 0.0
        return WEIGHTS[self.id] * self.ratio

    def as_dict(self):
        return {"id": self.id, "check": self.name, "status": self.status,
                "weight": WEIGHTS[self.id], "score": round(self.score(), 2),
                "findings": self.findings}


def managed_files(root, config, state):
    paths = set()
    for value in (config.get("human_artifacts") or {}).values():
        if value:
            paths.add(value)
    if state.get("charter_ref"):
        paths.add(state["charter_ref"])
    for rel in (".compass/objectives.json", ".compass/config.json"):
        paths.add(rel)
    reports = os.path.join(root, ".compass", "reports")
    if os.path.isdir(reports):
        for name in sorted(os.listdir(reports))[:50]:
            paths.add(".compass/reports/" + name)
    return sorted(p for p in paths if os.path.isfile(os.path.join(root, p)))


def validate(root, deny_terms=()):
    results = []
    cfg_path = os.path.join(root, ".compass", "config.json")
    st_path = os.path.join(root, ".compass", "objectives.json")
    base_path = os.path.join(root, ".compass", "baseline.json")
    config, state, baseline = load(cfg_path), load(st_path), load(base_path)

    r = Result("V1", "state files present and parseable")
    for label, doc, path in (("config.json", config, cfg_path),
                             ("objectives.json", state, st_path),
                             ("baseline.json", baseline, base_path)):
        if doc is None:
            r.fail("missing or unparseable: %s" % path)
    if state is not None and not state.get("project_key"):
        r.fail("objectives.json has no project_key; ids cannot be reproduced")
    results.append(r)
    if state is None:
        for cid, name in (("V2", "identifier integrity"),
                          ("V3", "referential integrity"),
                          ("V4", "status and evidence discipline"),
                          ("V5", "charter completeness"),
                          ("V6", "confidence discipline"),
                          ("V7", "scope firewall"),
                          ("V8", "style and managed-block integrity"),
                          ("V9", "unattended-run safety"),
                          ("V10", "staleness surfaced"),
                          ("V11", "mode detection and mirror integrity")):
            x = Result(cid, name)
            x.notrun("no objectives.json; run discovery mode first")
            results.append(x)
        return assemble(results, root)

    config = config or {}
    objectives = state.get("objectives") or []
    tasks = state.get("tasks") or []
    ids = {o.get("id") for o in objectives} | {t.get("id") for t in tasks}

    r = Result("V2", "identifier integrity")
    if verify_ids is None:
        r.notrun("compass_ids.py not importable next to this script")
    else:
        out = verify_ids(state)
        for f in out["findings"]:
            (r.fail if f["level"] == "error" else r.warn)(
                "%s %s: %s" % (f.get("bucket"), f.get("id"), f["message"]))
        if out["count"] == 0:
            r.warn("no identified items yet")
    results.append(r)

    r = Result("V3", "referential integrity")
    checked = 0
    tasks_by_id = {t.get("id"): t for t in tasks if t.get("id")}

    def inherits_objective(task, seen=None):
        """True if this task's parent_id chain eventually reaches a task
        with a resolving objective_id. Bounded by len(tasks) to tolerate a
        cycle without looping; the cycle itself is reported separately."""
        seen = seen or set()
        node_id = task.get("id")
        if node_id in seen or len(seen) > len(tasks_by_id):
            return False
        seen = seen | {node_id}
        parent_id = task.get("parent_id")
        parent = tasks_by_id.get(parent_id)
        if parent is None:
            return False
        if parent.get("objective_id") in ids and parent.get("objective_id"):
            return True
        return inherits_objective(parent, seen)

    for t in tasks:
        checked += 1
        parent = t.get("objective_id")
        if not parent:
            if not t.get("orphan") and not inherits_objective(t):
                r.fail("task %s has no objective_id, is not flagged "
                       "orphan:true, and its parent_id chain never reaches "
                       "a task with a resolving objective_id"
                       % t.get("id"))
        elif parent not in ids:
            r.fail("task %s references unknown objective %s"
                   % (t.get("id"), parent))
        sub_parent = t.get("parent_id")
        if sub_parent and sub_parent not in ids:
            r.fail("task %s has parent_id %s that does not resolve"
                   % (t.get("id"), sub_parent))
        if sub_parent == t.get("id"):
            r.fail("task %s is its own parent" % t.get("id"))
    for d in state.get("drift") or []:
        for ref in d.get("refs") or []:
            checked += 1
            if COMPASS_ID_RE.fullmatch(ref) and ref not in ids:
                r.fail("drift item %s references unknown id %s"
                       % (d.get("id"), ref))
    parents = {t.get("id"): t.get("parent_id") for t in tasks
               if t.get("parent_id")}
    for start in list(parents):
        seen_chain, node = set(), start
        while node in parents:
            if node in seen_chain:
                r.fail("parent_id cycle detected involving %s" % start)
                break
            seen_chain.add(node)
            node = parents[node]
    if checked == 0:
        r.warn("nothing to cross-reference yet")
    results.append(r)

    r = Result("V4", "status and evidence discipline")
    total, ok = 0, 0
    for item in objectives + tasks:
        total += 1
        status = item.get("status")
        good = True
        if status not in VALID_STATUS:
            r.fail("%s has invalid status %r" % (item.get("id"), status))
            good = False
        ev = item.get("evidence") or []
        if status in EVIDENCE_REQUIRED and not ev:
            r.fail("%s is %s with no evidence entry" % (item.get("id"), status))
            good = False
        for e in ev:
            if e.get("type") not in EVIDENCE_TYPES:
                r.warn("%s has evidence of unknown type %r"
                       % (item.get("id"), e.get("type")))
                good = False
            if not e.get("ref"):
                r.warn("%s has an evidence entry with no ref"
                       % item.get("id"))
                good = False
        if good:
            ok += 1
    r.ratio = (ok / total) if total else 1.0
    if total == 0:
        r.warn("no objectives or tasks recorded")
    results.append(r)

    r = Result("V5", "charter completeness")
    charter_rel = state.get("charter_ref") or (
        config.get("human_artifacts", {}) or {}).get("charter")
    text = read(os.path.join(root, charter_rel)) if charter_rel else None
    if text is None:
        r.fail("charter not found at %r" % charter_rel)
        r.ratio = 0.0
    else:
        low = text.lower()
        missing = [s for s in CHARTER_SECTIONS if s not in low]
        r.ratio = 1.0 - (len(missing) / len(CHARTER_SECTIONS))
        for s in missing:
            r.fail("charter is missing a %s section" % s)
    results.append(r)

    r = Result("V6", "confidence discipline")
    claims, good = 0, 0
    intent = state.get("intent") or {}
    holders = [("intent", intent)] + [("objective %s" % o.get("id"), o)
                                      for o in objectives]
    for label, holder in holders:
        conf = holder.get("confidence")
        if conf is None:
            continue
        claims += 1
        if conf not in CONFIDENCE:
            r.fail("%s has unknown confidence %r" % (label, conf))
        elif conf == "declared" and not (holder.get("evidence")
                                         or holder.get("source")):
            r.fail("%s is marked declared with no source reference" % label)
        else:
            good += 1
    if claims == 0:
        r.warn("no confidence-tagged claims found; intent is untagged")
        r.ratio = 0.5
    else:
        r.ratio = good / claims
    results.append(r)

    files = managed_files(root, config, state)
    r = Result("V7", "scope firewall")
    hits = 0
    for rel in files:
        body = read(os.path.join(root, rel)) or ""
        for i, line in enumerate(body.splitlines(), 1):
            for label, pattern in FIREWALL:
                if pattern.search(line):
                    hits += 1
                    r.fail("%s:%d matched %s detector" % (rel, i, label))
                    break
            for term in deny_terms:
                if term and term.lower() in line.lower():
                    hits += 1
                    r.fail("%s:%d matched a configured deny term" % (rel, i))
                    break
    if not files:
        r.notrun("no managed artifacts to scan")
    results.append(r)

    r = Result("V8", "style and managed-block integrity")
    for rel in files:
        body = read(os.path.join(root, rel)) or ""
        if EM_DASH in body:
            r.fail("%s contains an em dash" % rel)
        opens = re.findall(r"<!-- compass:begin:([\w.-]+) -->", body)
        closes = re.findall(r"<!-- compass:end:([\w.-]+) -->", body)
        if sorted(opens) != sorted(closes):
            r.fail("%s has unbalanced managed block markers" % rel)
        if len(set(opens)) != len(opens):
            r.fail("%s has duplicate managed block ids" % rel)
    results.append(r)

    r = Result("V9", "unattended-run safety")
    oq_rel = (config.get("human_artifacts", {}) or {}).get(
        "open_questions", ".compass/OPEN-QUESTIONS.md")
    if not os.path.isfile(os.path.join(root, oq_rel)):
        r.fail("open-questions file missing at %s" % oq_rel)
    run_dir = os.path.join(root, ".compass", "runs")
    run_files = sorted(f for f in os.listdir(run_dir)) if os.path.isdir(run_dir) else []
    hist = read(os.path.join(root, ".compass", "RUN-HISTORY.md")) or ""
    for f in run_files:
        if f.replace(".json", "") not in hist:
            r.warn("run record %s has no RUN-HISTORY.md row" % f)
    unanswered = [q for q in state.get("open_questions") or []
                  if q.get("status", "open") == "open"
                  and q.get("blocking")]
    if unanswered:
        r.warn("%d blocking open question(s) awaiting a human answer"
               % len(unanswered))
    if not run_files:
        r.warn("no run records yet")
    results.append(r)

    r = Result("V10", "staleness surfaced")
    th = (config.get("thresholds") or {})
    stale_days = int(th.get("stale_objective_days", 60))
    aband_days = int(th.get("abandoned_objective_days", 180))
    for o in objectives:
        if o.get("status") in ("done", "abandoned", "superseded"):
            continue
        age = days_since(o.get("last_evidence_at") or o.get("updated_at")
                         or o.get("created_at"))
        if age is None:
            r.warn("%s has no timestamp; staleness cannot be judged"
                   % o.get("id"))
        elif age >= aband_days and not o.get("flagged_abandoned"):
            r.fail("%s has no evidence for %d days and is not flagged "
                   "abandoned" % (o.get("id"), age))
        elif age >= stale_days and not o.get("flagged_stale"):
            r.warn("%s has no evidence for %d days and is not flagged stale"
                   % (o.get("id"), age))
    results.append(r)

    r = Result("V11", "mode detection and mirror integrity")
    mode_block = state.get("mode") or {}
    detected = mode_block.get("detected")
    if detected not in ("A", "B"):
        r.fail("state.mode.detected is %r; run detect_mode.py and record the "
               "verdict each run" % detected)
    if not mode_block.get("evidence"):
        r.warn("mode verdict recorded without the signals behind it")
    history = mode_block.get("history") or []
    if history:
        last = history[-1]
        if last.get("to") != detected:
            r.fail("mode history ends at %r but current detected mode is %r"
                   % (last.get("to"), detected))
        if len(history) > 1 and not any(
                d.get("kind") == "mode_change" for d in state.get("drift") or []):
            r.warn("mode changed across runs with no mode_change drift item")
    index_path = os.path.join(root, ".compass", "github-index.json")
    index = load(index_path)
    gh_cfg = (config.get("github") or {})
    if detected == "A":
        if not gh_cfg.get("owner_repo"):
            r.fail("Mode A with no github.owner_repo in config.json")
        if index is None:
            r.warn("Mode A with no .compass/github-index.json; the file mirror "
                   "is what survives loss of API access")
        else:
            if gh_cfg.get("owner_repo") and index.get("owner_repo") != gh_cfg["owner_repo"]:
                r.fail("mirror owner_repo %r does not match config %r"
                       % (index.get("owner_repo"), gh_cfg.get("owner_repo")))
            oversized = 0
            for bucket in ("milestones", "issues"):
                for cid, entry in (index.get(bucket) or {}).items():
                    for value in entry.values():
                        if isinstance(value, str) and len(value) > MIRROR_BODY_CAP:
                            oversized += 1
            if oversized:
                r.fail("mirror holds %d oversized field(s); it is a pointer "
                       "index, not a copy of the tracker" % oversized)
            if index.get("unmatched_local"):
                r.warn("%d local item(s) have no GitHub counterpart"
                       % len(index["unmatched_local"]))
            for cid in (index.get("anomalies") or {}).get(
                    "marker_not_in_local_state", []):
                r.fail("mirror carries marker %s that is absent from local "
                       "state" % cid)
    elif detected == "B":
        if gh_cfg.get("enabled"):
            r.fail("Mode B but github.enabled is true")
        if index is not None:
            r.warn("Mode B with a github-index.json present; record the "
                   "demotion or remove the stale mirror")
    results.append(r)
    return assemble(results, root)


def assemble(results, root):
    total = round(sum(x.score() for x in results), 1)
    band = ("A" if total >= 90 else "B" if total >= 75
            else "C" if total >= 60 else "D")
    return {
        "schema": "okhp3.compass.validation/1",
        "root": os.path.abspath(root),
        "score": total,
        "band": band,
        "gate": "PASS" if band in ("A", "B") and not any(
            x.status == "FAIL" for x in results) else "HOLD",
        "checks": [x.as_dict() for x in results],
        "failed": [x.id for x in results if x.status == "FAIL"],
        "not_run": [x.id for x in results if x.status == "NOT RUN"],
    }


def render(report):
    lines = ["Compass validation: score %.1f/100, band %s, gate %s"
             % (report["score"], report["band"], report["gate"]), ""]
    lines.append("| check | name | status | score |")
    lines.append("|---|---|---|---|")
    for c in report["checks"]:
        lines.append("| %s | %s | %s | %.1f/%d |"
                     % (c["id"], c["check"], c["status"], c["score"],
                        c["weight"]))
    for c in report["checks"]:
        if c["findings"]:
            lines.append("")
            lines.append("%s %s" % (c["id"], c["check"]))
            for f in c["findings"]:
                lines.append("  [%s] %s" % (f["level"], f["message"]))
    return "\n".join(lines)


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--root", default=".")
    p.add_argument("--json", action="store_true")
    p.add_argument("--deny-terms-file")
    a = p.parse_args(argv)
    if not os.path.isdir(a.root):
        print("error: not a directory: %s" % a.root, file=sys.stderr)
        return 2
    deny = []
    if a.deny_terms_file and os.path.isfile(a.deny_terms_file):
        with open(a.deny_terms_file, "r", encoding="utf-8") as fh:
            deny = [ln.strip() for ln in fh
                    if ln.strip() and not ln.startswith("#")]
    report = validate(a.root, deny)
    print(json.dumps(report, indent=2, sort_keys=True) if a.json
          else render(report))
    return 1 if report["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
