#!/usr/bin/env python3
"""Self-check and quality rubric for OKHP3 Project Compass artifacts.

Read-only. Runs eleven checks (V1-V11) against the .compass state and the human
artifacts it manages, scores the result 0-100, and assigns a band. An
unavailable check is NOT RUN, never PASS.

Usage
-----
  python3 validate_compass.py --root .
  python3 validate_compass.py --root . --json
  python3 validate_compass.py --root . --deny-terms-file .compass/deny-terms.local.txt

Exit codes: 0 PASS gate, 1 HOLD gate, 2 usage error.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import stat
import sys
from pathlib import Path

if __name__ == "__main__":
    sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compass_ids import BUCKETS, ID_FORMAT, verify as verify_ids  # noqa: E402

from compass_state import block_digest, block_spans, excluded, inspect_history, parse_json, read_baseline, target
from github_sync import SCHEMA as MIRROR_SCHEMA, check_index
from detect_mode import valid_slug
from scan_repo import excluded_name

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
    ("corp-host", re.compile(r"\.(corp|internal|intranet)\b", re.I)),
    ("access-marker", re.compile(r"\b(?:sso|vpn|adfs|citrix|okta|pingfed)\b", re.I)),
    ("url-userinfo", re.compile(r"\b[a-z][a-z0-9+.-]*://[^/\s]+@", re.I)),
    ("credential-setting", re.compile(
        r"""\b(?:password|passwd|api[_-]?key|access[_-]?token|client[_-]?secret)["']?\s*[:=]\s*\S""", re.I)),
    ("secretish", re.compile(r"(?:\bAKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|"
                             r"xox[baprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9_-]{16,}|-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----)")),
]
EM_DASH = "\u2014"
WEIGHTS = {"V1": 10, "V2": 12, "V3": 11, "V4": 13, "V5": 11, "V6": 7,
           "V7": 9, "V8": 5, "V9": 6, "V10": 6, "V11": 10}
MIRROR_BODY_CAP = 2000


class InvalidFile(ValueError):
    """An absent, inaccessible, or unsafe input. Messages contain no input text."""


def inside(root, rel, directory=False):
    if not nonblank(rel):
        raise InvalidFile("expected a relative project path")
    try:
        return target(root, rel, directory=directory)
    except (OSError, ValueError, RuntimeError):
        raise InvalidFile("unsafe or inaccessible project path") from None


def read(root, rel):
    path = inside(root, rel)
    if any(excluded_name(part) for part in Path(rel).parts):
        raise InvalidFile("sensitive artifact path")
    try:
        fd = os.open(path, os.O_RDONLY | getattr(os, "O_NONBLOCK", 0)
                     | getattr(os, "O_NOFOLLOW", 0))
        with os.fdopen(fd, encoding="utf-8", newline="") as fh:
            if not stat.S_ISREG(os.fstat(fh.fileno()).st_mode):
                raise InvalidFile("expected a regular file")
            return fh.read()
    except (OSError, UnicodeError):
        raise InvalidFile("file is missing, unreadable or invalid UTF-8") from None


def nonblank(value):
    return isinstance(value, str) and bool(value.strip())


def as_list(value):
    return value if isinstance(value, list) else []


def records(holder, key, result):
    values = holder.get(key, [])
    if not isinstance(values, list):
        result.fail(key + " must be an array")
        return []
    if any(not isinstance(item, dict) for item in values):
        result.fail(key + " contains a non-object entry")
    return [item for item in values if isinstance(item, dict)]


def mapping(holder, key, result):
    value = holder.get(key, {})
    if isinstance(value, dict):
        return value
    result.fail(key + " must be an object")
    return {}


def iso_time(value):
    if not nonblank(value):
        return None
    try:
        when = dt.datetime.fromisoformat(value[:-1] + "+00:00" if value.endswith("Z") else value)
        return when.replace(tzinfo=dt.timezone.utc) if when.tzinfo is None else when.astimezone(dt.timezone.utc)
    except (ValueError, OverflowError):
        return None


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


CHECK_NAMES = [
    "state files present and parseable", "identifier integrity",
    "referential integrity", "status and evidence discipline",
    "charter completeness", "confidence discipline", "scope firewall",
    "style and managed-block integrity", "unattended-run safety",
    "staleness surfaced", "mode detection and mirror integrity",
]
DRIFT_KINDS = ("new_goal", "changed_goal", "scope_expansion", "scope_contraction",
               "orphaned_work", "stale_objective", "abandoned_work", "contradiction",
               "sink_divergence", "mode_change")
DEFAULT_DENY = ".compass/deny-terms.local.txt"


def object_file(root, rel, result):
    try:
        doc = parse_json(read(root, rel))
        if isinstance(doc, dict):
            return doc
    except (ValueError, RecursionError):
        pass
    label = rel if rel in (".compass/config.json", ".compass/objectives.json", ".compass/baseline.json",
                           ".compass/github-index.json") else "run record"
    result.fail(label + " must be a readable JSON object within the project")
    return {}


def check_links(buckets, r):
    by_id = {key: {row["id"]: row for row in rows if nonblank(row.get("id"))}
             for key, rows in buckets.items()}
    all_ids = set().union(*by_id.values())
    objectives, tasks = by_id["objectives"], by_id["tasks"]
    parents, direct = {}, {}
    for key, task in tasks.items():
        parent, obj = task.get("parent_id"), task.get("objective_id")
        if parent is not None and (not nonblank(parent) or parent not in tasks):
            r.fail("parent_id must resolve to a task")
        if obj is not None and (not nonblank(obj) or obj not in objectives):
            r.fail("objective_id must resolve to an objective")
        parents[key] = parent if nonblank(parent) and parent in tasks else None
        direct[key] = obj if nonblank(obj) and obj in objectives else None

    # Memoize the nearest objective and visit every edge, even if all nodes
    # declare their own objective. Depth is independent of Python's call stack.
    resolved = {}
    for start in tasks:
        node, chain, visiting = start, [], set()
        while node is not None and node not in resolved and node not in visiting:
            chain.append(node)
            visiting.add(node)
            node = parents[node]
        if node in visiting:
            r.fail("parent_id cycle detected")
        obj = resolved.get(node)
        for key in reversed(chain):
            if direct[key] and obj and direct[key] != obj:
                r.fail("task objective conflicts with its parent chain")
            obj = direct[key] or obj
            resolved[key] = obj

    for key, task in tasks.items():
        orphan = task.get("orphan", False)
        if type(orphan) is not bool:
            r.fail("orphan must be a boolean")
        if orphan is True:
            reason = task.get("orphan_reason")
            if resolved[key] or not nonblank(reason) or len(reason.strip().splitlines()) != 1:
                r.fail("orphan:true requires an unlinked task and an orphan_reason")
        elif not resolved[key]:
            r.fail("task has no objective_id, inherited objective or documented orphan")
        blockers = task.get("blocked_by", [])
        if not isinstance(blockers, list) or any(
                not nonblank(ref) or ref not in all_ids or ref == key for ref in as_list(blockers)):
            r.fail("blocked_by must list resolving IDs other than the task itself")

    for item in buckets["drift"]:
        refs = item.get("refs", [])
        if not isinstance(refs, list) or any(not nonblank(ref) for ref in as_list(refs)):
            r.fail("drift refs must be an array of nonblank strings")
        elif any(re.match(r"^(OBJ|TSK|RSK|QST|DRF)-", ref) and ref not in all_ids for ref in refs):
            r.fail("drift references an unknown Compass ID")
    if not tasks and not buckets["drift"]:
        r.warn("nothing to cross-reference yet")


def evidence_entries(item, r, label):
    entries = item.get("evidence", [])
    if not isinstance(entries, list):
        r.fail(label + " evidence must be an array")
        return []
    valid = []
    for entry in entries:
        if (not isinstance(entry, dict) or not nonblank(entry.get("type"))
                or entry["type"] not in EVIDENCE_TYPES or not nonblank(entry.get("ref"))
                or iso_time(entry.get("observed_at")) is None):
            r.fail(label + " evidence needs a recognized type, nonblank ref and ISO observed_at")
        else:
            valid.append(entry)
    return valid


INCOMPLETE = re.compile(
    r"\b(?:incomplete|unfinished|reopened|still open|work outstanding|outstanding work|"
    r"not (?:yet )?(?:closed|merged|done|complet(?:e|ed)|finished)|"
    r"no (?:(?:evidence|signal) of |verified |actual )?completion|without complet(?:ing|ion)|"
    r"completion (?:pending|unverified)|did(?: not|n't) (?:complete|finish))\b", re.I)
FAILED = re.compile(r"\b(?:fail(?:ed|ing|ure|ures)?|[1-9]\d* errors?|cancel(?:l)?ed|timed out|"
                    r"did(?: not|n't) pass|not (?:yet )?pass(?:ed|ing)|no passing tests)\b", re.I)
ZERO_FAILURES = re.compile(
    r"\b(?:0|zero|no)\s+(?:(?:tests?|checks?)\s+)?(?:failed|failures?|errors?)\b|"
    r"\b(?:failures?|errors?|failed)\s*[:=]\s*0\b", re.I)
PASSED_RERUN = re.compile(r"\b(?:re[- ]?(?:run|test)\s*[:=]?\s+(?:now |has )?(?:passed|succeeded)|"
                          r"(?:passed|succeeded) on (?:the )?re[- ]?run)\b", re.I)


def completion_observation(entry):
    """Return True for support, False for contradiction, None for other activity.

    These checks interpret explicit recorded outcomes. A generic citation still
    needs source inspection to establish that it satisfies the task criterion.
    """
    kind = entry["type"]
    fields = (entry.get(key) for key in ("state", "status", "result", "outcome", "conclusion"))
    outcomes = {field.strip().casefold() for field in fields if nonblank(field)}
    if (outcomes & {"open", "draft", "pending", "blocked", "error", "timed_out"}
            or any(INCOMPLETE.search(value) or FAILED.search(value) for value in outcomes)
            or any(entry.get(key) is False for key in ("passed", "success", "completed"))
            or type(entry.get("exit_code")) is int and entry["exit_code"] != 0):
        return False
    # Refs can embed the observation ("issue:#42 closed"); avoid treating a
    # filename like tests/error.py as a failed run just because it names one.
    ref = entry["ref"].strip()
    ref_observation = ref if re.search(r"\s", ref) or FAILED.fullmatch(ref) or INCOMPLETE.fullmatch(ref) else ""
    wording = " ".join(part for part in (ref_observation, entry.get("note")) if nonblank(part))
    if INCOMPLETE.search(wording):
        return False
    # An explicit passing rerun can resolve a prior failed attempt in one
    # note. A failure reported after that rerun still contradicts completion.
    final_attempt = PASSED_RERUN.split(wording)[-1]
    if FAILED.search(ZERO_FAILURES.sub("", final_attempt)):
        return False
    if kind not in ("issue", "pr"):
        if kind in ("release", "test_signal", "doc_change", "manual"):
            return True
        return None
    if kind == "issue":
        if "closed" in outcomes or re.search(r"\bclosed\b", wording, re.I):
            return True
    elif entry.get("merged") is False:
        return False
    elif "merged" in outcomes or entry.get("merged") is True or re.search(r"\bmerged\b", wording, re.I):
        return True
    return None


def supports_done(entries):
    # Evidence is append-only. Use observation time first, append order on ties.
    ordered = sorted(entries, key=lambda entry: iso_time(entry["observed_at"]))
    for entry in reversed(ordered):
        observation = completion_observation(entry)
        if observation is not None:
            return observation
    return False


def check_status(buckets, r):
    tracked = {row["id"] for bucket in ("objectives", "tasks", "risks") for row in buckets[bucket]
               if nonblank(row.get("id")) and ID_FORMAT.fullmatch(row["id"])}
    for name in ("objectives", "tasks", "risks", "drift"):
        for item in buckets[name]:
            valid = evidence_entries(item, r, name)
            if name == "drift":
                if (item.get("kind") not in DRIFT_KINDS or item.get("resolution", "open")
                        not in ("open", "accepted", "rejected", "deferred")):
                    r.fail("invalid drift kind or resolution")
                continue
            status = item.get("status")
            if not nonblank(status) or status not in VALID_STATUS:
                r.fail(name + " has invalid status")
            elif status in EVIDENCE_REQUIRED and not valid:
                r.fail(name + " needs valid evidence for this status")
            elif status == "done" and not supports_done(valid):
                r.fail(name + " needs completion evidence consistent with its latest recorded outcome")
            elif status == "abandoned" and not any(entry["type"] == "absence" for entry in valid):
                r.fail(name + " needs absence evidence")
            elif status == "superseded":
                refs = as_list(item.get("refs"))
                if not refs or any(not nonblank(ref) or ref == item.get("id") or ref not in tracked
                                   for ref in refs):
                    r.fail(name + " needs refs to one or more known successor items other than itself")
    for item in buckets["open_questions"]:
        if item.get("status") not in ("open", "answered", "withdrawn"):
            r.fail("invalid question status")
    if not buckets["objectives"] and not buckets["tasks"]:
        r.warn("no objectives or tasks recorded")


def check_claim(holder, r, label, *, pooled=False):
    tier = holder.get("confidence")
    evidence = evidence_entries(holder, r, label)
    if not nonblank(tier) or tier not in CONFIDENCE:
        r.fail(label + " needs its own legal confidence tier")
    elif tier == "declared" and not (nonblank(holder.get("source")) or evidence):
        r.fail(label + " is declared without a source")
    elif tier in ("inferred-weak", "inferred-strong"):
        if not evidence:
            r.fail(label + " needs supporting observations")
        if tier == "inferred-strong" and not pooled:
            # File operations are one signal family. Explicit families allow
            # sources with a common evidence type to distinguish their origins.
            families = set()
            for entry in evidence:
                family = entry.get("family", entry["type"])
                if nonblank(family):
                    families.add("file" if family.startswith("file_") else family.strip().casefold())
            refs = {entry["ref"].strip() for entry in evidence}
            if min(len(families), len(refs)) < 3 or not nonblank(holder.get("alternative")):
                r.fail(label + " needs three signal families and an alternative reading")


INTENT_FIELDS = ("purpose", "vision", "mission", "goal", "non-goal", "success-criterion")


def check_intent(state, objectives, r):
    intent = mapping(state, "intent", r)
    claims = records(intent, "claims", r)
    covered = set()
    for i, claim in enumerate(claims):
        label = "intent.claims[%d]" % i
        field = claim.get("field")
        if field not in INTENT_FIELDS:
            r.fail(label + " needs a recognized claim field")
        else:
            covered.add(field)
        if "text" not in claim or not (nonblank(claim["text"]) or
                claim.get("confidence") == "unknown" and claim["text"] is None):
            r.fail(label + " needs nonblank text or an explicit unknown with null text")
        if "evidence" not in claim:
            r.fail(label + " needs its own evidence array")
        elif claim.get("confidence") == "declared" and not as_list(claim["evidence"]):
            r.fail(label + " is declared without its own evidence entry")
        if claim.get("confidence") == "inferred-weak" and not nonblank(claim.get("alternative")):
            r.fail(label + " needs a plausible alternative reading")
        check_claim(claim, r, label)

    legacy_fields = set()
    for field in INTENT_FIELDS[:3]:
        if intent.get(field) is not None:
            if nonblank(intent[field]):
                legacy_fields.add(field)
            else:
                r.fail("legacy intent fields require text or null")
    if legacy_fields - covered:
        r.warn("legacy pooled intent; attribute confidence and evidence to each claim")
    if "confidence" in intent:
        check_claim(intent, r, "legacy intent", pooled=True)
    elif "evidence" in intent:
        evidence_entries(intent, r, "legacy intent")
    if not claims and not legacy_fields:
        r.warn("no individual confidence-tagged intent claims recorded")
    for obj in objectives:
        if "confidence" in obj:
            check_claim(obj, r, "objective")
        else:
            r.warn("objective lacks a confidence tier")


def check_charter(body, r):
    if body is None:
        r.fail("charter is missing or unreadable")
        r.ratio = 0
        return
    sections, fence = set(), None
    for line in body.splitlines():
        marker = re.match(r"^ {0,3}(\x60{3,}|~{3,})", line)
        if marker:
            token = marker.group(1)
            if fence is None:
                fence = token
            elif token.startswith(fence):
                fence = None
        elif not fence:
            heading = re.match(r"^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$", line)
            if heading:
                title = heading.group(1).strip().lower()
                sections.add("success" if title == "success criteria" else title)
    missing = [key for key in CHARTER_SECTIONS if key not in sections]
    for key in missing:
        r.fail("missing charter heading: " + key)
    r.ratio = 1 - len(missing) / len(CHARTER_SECTIONS)


def scan_artifacts(root, human, state, firewall, style, terms, private):
    paths = {".compass/objectives.json", ".compass/config.json", ".compass/baseline.json"}
    for rel in list(human.values()) + [state.get("charter_ref", human.get("charter"))]:
        if rel is None:
            continue
        try:
            path = inside(root, rel)
            if path.exists() or (root / rel).is_symlink():
                paths.add(rel)
        except (InvalidFile, OSError):
            firewall.fail("managed artifact path is invalid or outside the project")
    for rel in ("docs/CHARTER.md", "docs/BACKLOG.md", "docs/ROADMAP.md"):
        try:
            if inside(root, rel).is_file():
                paths.add(rel)
        except InvalidFile:
            firewall.fail("default human artifact path is unsafe")

    # Include older and nested reports, run receipts, evidence exports and
    # the mirror. Directory links are never followed during enumeration.
    pending = [".compass"]
    while pending:
        directory = pending.pop()
        try:
            for entry in inside(root, directory, directory=True).iterdir():
                rel = directory + "/" + entry.name
                if entry.is_symlink():
                    firewall.fail("managed artifact tree contains a symlink")
                    continue
                if entry.is_dir():
                    pending.append(rel)
                    continue
                paths.add(rel)
        except (OSError, InvalidFile):
            firewall.fail("unable to enumerate all managed artifacts")

    # record-run also accepts an owner-selected report elsewhere under root.
    for receipt in tuple(paths):
        if not (receipt.startswith(".compass/runs/") and receipt.endswith(".json")):
            continue
        try:
            record = parse_json(read(root, receipt))
            if isinstance(record, dict) and "report" in record:
                rel = record["report"]
                inside(root, rel)
                paths.add(rel)
        except (InvalidFile, ValueError, RecursionError):
            firewall.fail("run receipt or its report path cannot be scanned")

    def violation(line):
        for detector, pattern in FIREWALL:
            if pattern.search(line):
                return detector
        if any(term in line.casefold() for term in terms):
            return "configured deny term"
        return None

    for rel in sorted(paths):
        label = rel
        if violation(rel) or any(excluded_name(part) for part in Path(rel).parts) or not rel.isprintable():
            label = "[redacted artifact path]"
            firewall.fail(label + " failed the filename check")
        try:
            if inside(root, rel) in private:
                if rel in human.values() or rel in (state.get("charter_ref"), ".compass/config.json",
                                                    ".compass/objectives.json", ".compass/baseline.json"):
                    firewall.fail("private deny list overlaps a managed artifact")
                continue
            body = read(root, rel)
        except InvalidFile:
            firewall.fail("cannot scan " + label)
            style.fail("cannot inspect " + label)
            continue
        # Decode JSON escapes as well as scanning the serialized file. A
        # JSON string may contain U+2014, a private term, or a secret after decoding.
        decoded = ""
        if rel.endswith(".json"):
            try:
                parsed = parse_json(body)
                if rel == ".compass/baseline.json" and isinstance(parsed, dict):
                    files = parsed.get("files")
                    if isinstance(files, dict) and any(
                            any(excluded(part, terms) for part in Path(name).parts) for name in files):
                        firewall.fail("baseline indexes a sensitive or excluded path")
                decoded = json.dumps(parsed, ensure_ascii=False, indent=2)
            except (ValueError, RecursionError):
                firewall.fail("cannot inspect decoded JSON in " + label)
        for source, content in (("", body), (" (decoded JSON)", decoded)):
            for number, line in enumerate(content.splitlines(), 1):
                detector = violation(line)
                if detector:
                    firewall.fail("%s:%d%s matched %s" % (label, number, source, detector))
                    break
            else:
                continue
            break
        if EM_DASH in body or EM_DASH in decoded:
            style.fail(label + " contains an em dash")
        if not rel.lower().endswith((".json", ".gitignore")):
            try:
                lines = body.splitlines(keepends=True)
                for start, end, checksum in block_spans(lines).values():
                    if checksum and block_digest("".join(lines[start + 2:end])) != checksum:
                        style.fail(label + " contains an edited signed block")
            except ValueError:
                style.fail(label + " has malformed or unbalanced managed block markers")


def check_firewall(root, config, human, state, r, style, supplied, explicit):
    terms = {term.casefold() for term in supplied if nonblank(term)}
    private = set()
    settings = mapping(config, "scope_firewall", r)
    configured = settings.get("deny_terms_file", DEFAULT_DENY)
    if explicit and Path(explicit).is_absolute():
        try:
            explicit = str(Path(explicit).relative_to(root))
        except ValueError:
            r.fail("explicit deny-terms file is outside the project")
            explicit = None
    for rel in (DEFAULT_DENY, configured, explicit):
        if rel is None:
            continue
        try:
            path = inside(root, rel)
            if path in private:
                continue
            # A missing default list is normal. An explicitly selected file is required.
            if not path.exists() and rel == DEFAULT_DENY and explicit != rel and not (root / rel).is_symlink():
                continue
            content = read(root, rel)
            private.add(path)
            terms.update(line.strip().casefold() for line in content.splitlines()
                         if line.strip() and not line.lstrip().startswith("#"))
        except (OSError, InvalidFile):
            r.fail("private deny-terms file is invalid, unsafe or unreadable")
    scan_artifacts(root, human, state, r, style, terms, private)


def check_runs(root, human, state, questions, r):
    try:
        read(root, human.get("open_questions", ".compass/OPEN-QUESTIONS.md"))
    except InvalidFile:
        r.fail("open-questions file is missing, unreadable or unsafe")
    try:
        hist = inside(root, human.get("run_history", ".compass/RUN-HISTORY.md"))
        directory = inside(root, ".compass/runs", directory=True)
        _, _, ids = inspect_history(root, hist, directory, state)
        if not ids:
            r.warn("no run records yet")
    except (ValueError, OSError, RecursionError):
        r.fail("invalid or inconsistent run records, state counters or history rows")
    if any(q.get("status") == "open" and q.get("blocking") is True for q in questions):
        r.warn("blocking question awaiting a human answer")


def check_stale(config, objectives, r):
    th = mapping(config, "thresholds", r)
    stale, abandoned = th.get("stale_objective_days", 60), th.get("abandoned_objective_days", 180)
    if (type(stale) is not int or type(abandoned) is not int or not 0 <= stale <= abandoned):
        r.fail("expected nonnegative integer thresholds, stale <= abandoned")
        return
    now = dt.datetime.now(dt.timezone.utc)
    for item in objectives:
        if item.get("status") in ("done", "abandoned", "superseded"):
            continue
        value = item.get("last_evidence_at") or item.get("updated_at") or item.get("created_at")
        when = iso_time(value)
        if when is None:
            r.warn("objective lacks a usable staleness timestamp")
        elif (now - when).days >= abandoned and item.get("flagged_abandoned") is not True:
            r.fail("objective past abandonment threshold lacks flag")
        elif (now - when).days >= stale and item.get("flagged_stale") is not True and item.get("flagged_abandoned") is not True:
            r.warn("stale objective lacks flag")


def check_mirror(root, config, state, buckets, r):
    mode = mapping(state, "mode", r)
    detected = mode.get("detected")
    if detected not in ("A", "B"):
        r.fail("record the A or B detection verdict")
    if not records(mode, "evidence", r):
        r.warn("mode verdict lacks detection signals")
    history = records(mode, "history", r)
    previous = None
    changed = False
    for entry in history:
        target = entry.get("to")
        if (target not in ("A", "B") or iso_time(entry.get("at")) is None
                or entry.get("from") not in (None, "A", "B")
                or previous is not None and entry.get("from") != previous):
            r.fail("invalid mode history entry or transition")
        changed |= entry.get("from") in ("A", "B") and entry["from"] != target
        previous = target
    if history and previous != detected:
        r.fail("mode history disagrees with current verdict")
    if changed and not any(d.get("kind") == "mode_change" for d in buckets["drift"]):
        r.warn("mode change lacks a drift entry")

    gh = mapping(config, "github", r)
    if detected == "B" and gh.get("enabled"):
        r.fail("Mode B cannot have github.enabled")
    if detected == "A" and not valid_slug(gh.get("owner_repo")):
        r.fail("Mode A requires github.owner_repo")
    rel = ".compass/github-index.json"
    try:
        path = inside(root, rel)
        present = path.exists() or (root / rel).is_symlink()
    except (OSError, InvalidFile):
        r.fail("mirror path is unsafe")
        return
    if not present:
        if detected == "A":
            r.warn("Mode A has no file mirror")
        return
    index = object_file(root, rel, r)
    if detected == "B":
        r.warn("Mode B retains a historical mirror")
    if detected == "A":
        repo = gh.get("owner_repo")
        if not valid_slug(repo) or not valid_slug(index.get("owner_repo")) or index["owner_repo"].lower() != repo.lower():
            r.fail("mirror owner_repo disagrees with config")
        elif index.get("schema") == MIRROR_SCHEMA:
            try:
                check_index(index, repo, state)
            except (ValueError, TypeError, KeyError):
                r.fail("invalid or inconsistent snapshot for this project")
            if object_file(root, ".compass/github-pull-status.json", r).get("ready") is not True:
                r.fail("mirror pull status is incomplete")
        elif index.get("schema") == "okhp3.compass.github-index/1":
            r.warn("legacy mirror; pull a complete snapshot before planning")
        else:
            r.fail("unrecognized mirror schema")
    for bucket, local in (("milestones", "objectives"), ("issues", "tasks")):
        known = {item["id"] for item in buckets[local] if nonblank(item.get("id"))}
        for key, entry in mapping(index, bucket, r).items():
            if not isinstance(entry, dict) or detected == "A" and key not in known:
                r.fail(bucket + " contains an invalid entry or unresolved marker")
    if index.get("unmatched_local"):
        r.warn("local items lack GitHub counterparts")
    anomalies = mapping(index, "anomalies", r)
    if any(anomalies.values()):
        r.fail("mirror reports marker anomalies")
    # Inspect nested/unmatched entries as well as matched pointers.
    pending = [index]
    while pending:
        value = pending.pop()
        if isinstance(value, dict):
            if any(k.casefold() in ("body", "description", "bodytext", "bodyhtml") for k in value):
                r.fail("mirror contains a body or description field")
                break
            pending.extend(value.values())
        elif isinstance(value, list):
            pending.extend(value)
        elif isinstance(value, str) and len(value) > MIRROR_BODY_CAP:
            r.fail("mirror contains an oversized field")
            break


def validate(root, deny_terms=(), deny_terms_file=None):
    root = Path(root).resolve()
    checks = [Result("V%d" % i, name) for i, name in enumerate(CHECK_NAMES, 1)]
    shape, identity, links, status, charter, confidence, privacy, style, runs, stale, mirror = checks
    config = object_file(root, ".compass/config.json", shape)
    state = object_file(root, ".compass/objectives.json", shape)
    try:
        read_baseline(inside(root, ".compass/baseline.json"))
    except (OSError, ValueError, RecursionError):
        shape.fail("baseline.json must contain a valid project evidence manifest")
    for doc, name in ((config, "state"), (state, "objectives")):
        if doc.get("schema") != "okhp3.compass.%s/1" % name:
            shape.fail("missing or unsupported " + name + " schema")
    if not nonblank(state.get("project_key")) or config.get("project_key") != state.get("project_key"):
        shape.fail("project keys must be present and agree")
    if type(state.get("runs", 0)) is not int or state.get("runs", 0) < 0:
        shape.fail("runs must be a nonnegative integer")
    for key in ("objectives", "tasks"):
        if key not in state:
            shape.fail("state requires " + key)
    buckets = {key: records(state, key, shape) for key in BUCKETS}
    for label in records(state, "labels", shape):
        if not nonblank(label.get("name")):
            shape.fail("label requires a name")
    human = mapping(config, "human_artifacts", shape)
    for value in human.values():
        if not nonblank(value):
            shape.fail("human artifact locations must be nonblank paths")
    if "sinks" in config:
        sinks = records(config, "sinks", shape)
        seen = set()
        for sink in sinks:
            key = sink.get("id")
            if (not nonblank(key) or key in seen or not nonblank(sink.get("type"))
                    or type(sink.get("enabled")) is not bool):
                shape.fail("invalid sink identity, type or enabled flag")
            else:
                seen.add(key)

    if state:
        result = verify_ids(state)
        for finding in result["findings"]:
            report = identity.fail if finding["level"] == "error" else identity.warn
            report("%s: %s" % (finding["bucket"], finding["message"]))
        if not result["count"]:
            identity.warn("no identified items yet")
        check_links(buckets, links)
        check_status(buckets, status)
        check_intent(state, buckets["objectives"], confidence)
        check_stale(config, buckets["objectives"], stale)
        check_mirror(root, config, state, buckets, mirror)
    else:
        for check in (identity, links, status, confidence, stale, mirror):
            check.notrun("objectives state is unavailable")
    try:
        body = read(root, state.get("charter_ref", human.get("charter")))
    except InvalidFile:
        body = None
    check_charter(body, charter)
    check_firewall(root, config, human, state, privacy, style, deny_terms, deny_terms_file)
    check_runs(root, human, state, buckets["open_questions"], runs)
    return assemble(checks, root)


def assemble(results, root):
    total = round(sum(x.score() for x in results), 1)
    band = ("A" if total >= 90 else "B" if total >= 75
            else "C" if total >= 60 else "D")
    return {
        "schema": "okhp3.compass.validation/1",
        "root": ".",
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
    if not os.path.isdir(a.root) or os.path.islink(a.root):
        print("error: root must be a directory", file=sys.stderr)
        return 2
    report = validate(a.root, deny_terms_file=a.deny_terms_file)
    print(json.dumps(report, indent=2, sort_keys=True) if a.json
          else render(report))
    return 0 if report["gate"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
