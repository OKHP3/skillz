#!/usr/bin/env python3
"""Read GitHub tracking data and plan against a local pointer index.

pull reads github.com using GET, or an offline JSON fixture. --apply saves the
index under --root/.compass. A fixture declares owner_repo, complete: true,
issues and milestones. Fixture plans are simulations. plan reads only local
files. push --apply --authorized renders concrete commands for manual review. It never
executes them or writes a run log. Rendering requires a current V7 firewall pass.
Issue creation uses the verified parent milestone number when one is linked;
a pending milestone is a manual dependency until a fresh pull supplies that number.
"""
from __future__ import annotations

import argparse
from contextlib import nullcontext
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import subprocess
import sys

if __name__ == "__main__":
    sys.dont_write_bytecode = True

from compass_state import encoded, manifest_privacy, parse_json, put, state_pair, target, writer_lock
from scan_repo import detectors
from detect_mode import is_worktree, now, project_file, remote_evidence, valid_slug

SCHEMA = "okhp3.compass.github-index/2"
MARKER = re.compile(r"<!--\s*compass-id:\s*([A-Z]{3}-[0-9A-F]{8})\s*-->")
MARKER_START = re.compile(r"<!--\s*compass-id\b", re.I)
CLOSED_STATUSES = {"done", "abandoned", "superseded"}
STATUSES = CLOSED_STATUSES | {"proposed", "active", "in_progress", "blocked"}
KINDS = (("milestones", "objectives", "OBJ"), ("issues", "tasks", "TSK"))


class Incomplete(ValueError):
    """A public diagnostic containing only fixed text or validated identifiers."""


def require(test, reason):
    if not test:
        raise Incomplete(reason)


def read_json(path):
    try:
        return parse_json(path.read_text(encoding="utf-8"))
    except (ValueError, OSError):
        raise Incomplete("JSON input missing or unreadable") from None


def gh_get(resource, pages=False):
    args = ["gh", "api", "--hostname", "github.com", "--method", "GET"]
    if pages:
        args.extend(["--paginate", "--slurp"])
    try:
        result = subprocess.run([*args, resource], capture_output=True, timeout=90,
                                env=dict(os.environ, GH_PROMPT_DISABLED="1"))
    except (OSError, subprocess.SubprocessError):
        raise Incomplete("GitHub CLI unavailable or read timed out") from None
    require(result.returncode == 0, "GitHub read failed; check access and rate limit")
    try:
        data = parse_json(result.stdout)
    except ValueError:
        raise Incomplete("GitHub returned invalid JSON") from None
    if not pages:
        return data
    require(isinstance(data, list) and data and all(isinstance(p, list) for p in data),
            "GitHub returned incomplete pagination data")
    return [row for page in data for row in page]


def fetch(repo, fixture):
    if fixture:
        data = read_json(fixture)
    else:
        identity = gh_get("repos/" + repo)
        require(isinstance(identity, dict) and valid_slug(identity.get("full_name"))
                and identity["full_name"].lower() == repo.lower(), "GitHub repository identity mismatch")
        data = {"owner_repo": repo, "complete": True}
        for bucket, _, _ in KINDS:
            rows = gh_get("repos/%s/%s?state=all&per_page=100" % (repo, bucket), pages=True)
            require(all(isinstance(row, dict) for row in rows), "invalid GitHub collection")
            data[bucket] = [r for r in rows if bucket != "issues" or "pull_request" not in r]
    require(isinstance(data, dict) and valid_slug(data.get("owner_repo"))
            and data["owner_repo"].lower() == repo.lower(), "snapshot repository missing or mismatched")
    require(data.get("complete") is True and not any(data.get(k) for k in
            ("truncated", "partial", "has_more", "next")), "snapshot completeness unconfirmed")
    return data


def positive(value):
    return type(value) is int and value > 0


def id_matches(value, prefix):
    return isinstance(value, str) and re.fullmatch(prefix + "-[0-9A-F]{8}", value)


def check_row(row):
    require(isinstance(row, dict) and positive(row.get("number"))
            and isinstance(row.get("title"), str) and row["title"].strip()
            and isinstance(row.get("state"), str) and row["state"].lower() in {"open", "closed"},
            "incomplete remote item")


def item_url(repo, bucket, number):
    return "https://github.com/%s/%s/%d" % (repo, "milestone" if bucket == "milestones" else bucket, number)


def check_urls(row, repo, bucket):
    url = item_url(repo, bucket, row["number"])
    api = "https://api.github.com/repos/%s/%s/%d" % (repo, bucket, row["number"])
    for k in ("url", "html_url"):
        if row.get(k) is not None:
            require(isinstance(row[k], str) and row[k].lower() in {url.lower(), api.lower()},
                    "remote item URL disagrees with its repository or number")
    return url


def local_items(state):
    ids = set()
    for _, local, prefix in KINDS:
        require(isinstance(state.get(local), list), "local state missing a collection")
        for row in state[local]:
            require(isinstance(row, dict) and id_matches(row.get("id"), prefix)
                    and isinstance(row.get("status"), str) and row["status"] in STATUSES
                    and isinstance(row.get("title"), str) and row["title"].strip(),
                    "local item missing a valid ID, title or status")
            require(row["id"] not in ids, "duplicate local ID " + row["id"])
            ids.add(row["id"])
    return ids


def private_metadata(value, deny):
    return (len(value) > 2000 or detectors(value, deny) or "://" in value
            or any(ord(c) < 32 for c in value))


def build_index(repo, remote, state, source, deny=()):
    local = local_items(state)
    index = {"schema": SCHEMA, "owner_repo": repo, "project_key": state["project_key"],
             "source": source, "complete": True, "synced_at": None if source == "fixture" else now(),
             "unmatched_remote": {}, "counts": {}, "anomalies": {}}
    marked, withheld = set(), []
    for bucket, _, prefix in KINDS:
        rows = remote.get(bucket)
        require(isinstance(rows, list), "snapshot missing " + bucket)
        index[bucket], index["unmatched_remote"][bucket] = {}, []
        index["counts"][bucket] = len(rows)
        numbers = set()
        field = "body" if bucket == "issues" else "description"
        for row in rows:
            check_row(row)
            n = row["number"]
            require(n not in numbers, "duplicate remote number in " + bucket)
            numbers.add(n)
            require(field in row and (row[field] is None or isinstance(row[field], str)),
                    "remote item missing marker-bearing field")
            text = row["title"] + "\n" + (row[field] or "")
            markers = MARKER.findall(text)
            require(len(markers) == len(MARKER_START.findall(text)) and len(markers) <= 1,
                    "malformed or multiple markers on %s #%d" % (bucket, n))
            entry = {"number": n, "title": row["title"], "state": row["state"].lower(),
                     "url": check_urls(row, repo, bucket)}
            redacted = private_metadata(entry["title"], deny)
            if redacted:
                entry["title"] = "[withheld]"
            if bucket == "milestones":
                counts = [row.get(k) for k in ("open_issues", "closed_issues")]
                require(all(type(v) is int and v >= 0 for v in counts), "missing milestone rollup counts")
                opened, closed = counts
                entry.update(open_issues=opened, closed_issues=closed,
                             percent_complete=round(100 * closed / sum(counts)) if sum(counts) else 0,
                             due_on=row.get("due_on"))
                due = entry["due_on"]
                if due is not None and not (isinstance(due, str) and re.fullmatch(r"[0-9T.:Z+-]{10,35}", due)):
                    entry["due_on"], redacted = None, True
            else:
                labels = row.get("labels")
                require(isinstance(labels, list), "issue labels missing")
                names = [v.get("name") if isinstance(v, dict) else v for v in labels]
                require(all(isinstance(v, str) for v in names), "invalid issue labels")
                ms = row.get("milestone")
                require(ms is None or (isinstance(ms, dict) and positive(ms.get("number"))),
                        "invalid issue milestone")
                safe_names = [name for name in names if not private_metadata(name, deny)]
                redacted = redacted or len(safe_names) != len(names)
                entry.update(labels=safe_names, milestone_number=ms["number"] if ms else None)
            if redacted:
                withheld.append({"collection": bucket, "number": n})
            if markers:
                cid = markers[0]
                require(id_matches(cid, prefix), "wrong marker kind on %s #%d" % (bucket, n))
                require(cid not in marked, "duplicate remote marker " + cid)
                marked.add(cid)
                index[bucket][cid] = entry
            else:
                index["unmatched_remote"][bucket].append(entry)
    if withheld:
        index["anomalies"]["withheld_metadata"] = withheld
    index["unmatched_local"] = sorted(local - marked)
    if marked - local:
        index["anomalies"]["marker_not_in_local_state"] = sorted(marked - local)
    return index


def check_index(index, repo, state):
    require(isinstance(index, dict) and index.get("schema") == SCHEMA,
            "missing or legacy index; pull a complete snapshot")
    require(valid_slug(index.get("owner_repo")) and index["owner_repo"].lower() == repo.lower()
            and index.get("project_key") == state["project_key"], "index repository or project mismatch")
    require(index.get("complete") is True and index.get("source") in ("github", "fixture")
            and isinstance(index.get("unmatched_remote"), dict) and isinstance(index.get("counts"), dict)
            and index.get("anomalies") == {}, "index incomplete or contains unresolved anomalies")
    local = local_items(state)
    for bucket, local_key, prefix in KINDS:
        matched = index.get(bucket)
        unmatched = index["unmatched_remote"].get(bucket)
        count = index["counts"].get(bucket)
        require(isinstance(matched, dict) and isinstance(unmatched, list) and type(count) is int
                and count == len(matched) + len(unmatched), "index collection missing or incomplete")
        require(all(id_matches(cid, prefix) and cid in local for cid in matched),
                "index carries an unknown or incorrect marker")
        seen = set()
        for row in [*matched.values(), *unmatched]:
            check_row(row)
            require(row.get("url") == item_url(index["owner_repo"], bucket, row["number"]),
                    "index item identity mismatch")
            require(row["number"] not in seen, "duplicate remote number in index")
            seen.add(row["number"])
        for row in state[local_key]:
            ref = row.get("github")
            if ref is None:
                continue
            require(isinstance(ref, dict), "invalid local GitHub reference")
            number = ref.get("issue_number" if bucket == "issues" else "milestone_number")
            if number is not None or ref.get("url"):
                match = matched.get(row["id"], {})
                require(positive(match.get("number")) and (number is None or number == match["number"])
                        and (not ref.get("url") or ref["url"] == match["url"]),
                        "local GitHub pointer disagrees with the index")


def task_objective(task_id, tasks, objective_ids, resolved):
    """Resolve the objective inherited through parent tasks, caching each visited edge."""
    chain, visited = [], set()
    node = task_id
    while node is not None and node not in resolved:
        require(node not in visited, "cycle in issue's parent task chain")
        visited.add(node)
        chain.append(tasks[node])
        node = tasks[node].get("parent_id")
        require(node is None or (isinstance(node, str) and node in tasks),
                "issue's parent task is unresolved")
    objective = resolved.get(node)
    for task in reversed(chain):
        direct = task.get("objective_id")
        if direct is not None:
            require(isinstance(direct, str) and direct in objective_ids, "issue's objective is unresolved")
            require(objective is None or objective == direct, "issue's objective conflicts with its parent")
            objective = direct
        resolved[task["id"]] = objective
    return objective


def plan_actions(state, index, repo):
    check_index(index, repo, state)
    tasks = {row["id"]: row for row in state["tasks"]}
    objective_ids = {row["id"] for row in state["objectives"]}
    resolved = {}
    actions = []
    for bucket, local, _ in KINDS:
        kind = "issue" if bucket == "issues" else "milestone"
        for row in state[local]:
            cid = row["id"]
            match = index[bucket].get(cid)
            if not match and row["status"] in CLOSED_STATUSES:
                actions.append({"op": "review", "id": cid, "reason": "terminal local item has no remote marker"})
                continue
            if not match:
                action = {"op": "create-" + kind, "id": cid, "title": row["title"],
                          "reason": "no matching marker in complete snapshot"}
                if kind == "issue":
                    objective = task_objective(cid, tasks, objective_ids, resolved)
                    if objective is not None:
                        action["objective_id"] = objective
                        milestone = index["milestones"].get(objective)
                        if milestone:
                            action["milestone_number"] = milestone["number"]
                        else:
                            action.update(op="manual-dependency", pending_op="create-issue",
                                          reason="Create or link the parent milestone with its objective marker, "
                                                 "then run pull --apply and plan again before creating the issue.")
                actions.append(action)
                continue
            want = "closed" if row["status"] in CLOSED_STATUSES else "open"
            if match["state"].lower() == want:
                continue
            if want == "open":
                actions.append({"op": "flag-divergence", "id": cid, "number": match["number"],
                                "reason": "remote closed while local status is " + row["status"]})
                continue
            op = "close-issue" if kind == "issue" else "update-milestone-state"
            actions.append({"op": op, "id": cid, "number": match["number"], "to": want,
                            "reason": "local status %s, remote %s" % (row["status"], match["state"])})
        for row in index["unmatched_remote"][bucket]:
            actions.append({"op": "adopt-or-ignore", "kind": kind, "number": row["number"],
                            "title": row["title"], "reason": "remote item has no Compass marker"})
    return actions


class FirewallBlocked(Exception):
    """The shared V7 check failed or could not verify all managed artifacts."""


def render_commands(root, config, state, repo, actions):
    """Recheck V7 immediately before constructing any external command."""
    # The validator imports check_index for V11. Load its V7 entry point at runtime.
    from validate_compass import Result, check_firewall, mapping

    firewall = Result("V7", "scope firewall")
    human = mapping(config, "human_artifacts", firewall)
    try:
        check_firewall(root, config, human, state, firewall, Result("V8", "style"), (), None)
    except (OSError, ValueError, RecursionError) as exc:
        raise FirewallBlocked from exc
    if firewall.status != "PASS":
        raise FirewallBlocked

    commands = []
    gh_repo = "github.com/" + repo
    for action in actions:
        op = action["op"]
        if op == "create-issue":
            marker = "<!-- compass-id: %s -->" % action["id"]
            if "objective_id" in action:
                argv = ["gh", "api", "--hostname", "github.com", "--method", "POST",
                        "repos/%s/issues" % repo, "-f", "title=" + action["title"],
                        "-f", "body=" + marker, "-F", "milestone=%d" % action["milestone_number"]]
            else:
                argv = ["gh", "issue", "create", "--repo", gh_repo, "--title", action["title"],
                        "--body", marker]
        elif op == "close-issue":
            argv = ["gh", "issue", "close", str(action["number"]), "--repo", gh_repo]
        elif op == "create-milestone":
            argv = ["gh", "api", "--hostname", "github.com", "--method", "POST",
                    "repos/%s/milestones" % repo, "-f", "title=" + action["title"],
                    "-f", "description=<!-- compass-id: %s -->" % action["id"]]
        elif op == "update-milestone-state":
            argv = ["gh", "api", "--hostname", "github.com", "--method", "PATCH",
                    "repos/%s/milestones/%d" % (repo, action["number"]), "-f", "state=closed"]
        else:
            continue
        commands.append({"op": op, "id": action["id"], "argv": argv, "command": shlex.join(argv)})
    return commands


def run(a, root):
    config, state = state_pair(root)
    github = config.get("github")
    require(isinstance(github, dict), "invalid GitHub config")
    configured = github.get("owner_repo")
    repo = a.repo or configured
    require(valid_slug(repo), "supply a valid github.com owner/name")
    deny, _ = manifest_privacy(root)
    require(not private_metadata(repo, deny) and not private_metadata(state["project_key"], deny),
            "repository or project identity needs private review")
    mode = state.get("mode") or {}
    require(isinstance(mode, dict), "invalid state mode")
    origin = remote_evidence(root) if is_worktree(root) else {}
    for identity in (configured, mode.get("owner_repo"), origin.get("origin_owner_repo")):
        if identity is not None:
            require(valid_slug(identity) and identity.lower() == repo.lower(),
                    "requested repository conflicts with project identity")
    mirror = target(root, ".compass/github-index.json")
    status = target(root, ".compass/github-pull-status.json")
    if a.cmd == "pull":
        if a.apply:
            # If acquisition fails or the process stops, the previous mirror remains
            # available for reference but cannot be reused as a fresh planning basis.
            put(status, encoded({"ready": False}), True)
        if not a.fixture:
            require(origin.get("origin_owner_repo"), "live read requires a verified GitHub origin")
        fixture = Path(a.fixture) if a.fixture else None
        if fixture:
            if fixture.is_absolute():
                # An explicitly supplied external fixture can be a sibling of the project.
                # Validate every descendant of the common base, including the file.
                base = Path(os.path.commonpath((Path(a.root).absolute(), fixture)))
                fixture = target(base, str(fixture.relative_to(base)))
            else:
                fixture = project_file(root, fixture)
        if fixture:
            require(not fixture.is_symlink() and fixture.is_file(), "invalid fixture file")
        remote = fetch(repo, fixture)
        index = build_index(repo, remote, state, "fixture" if fixture else "github", deny)
        data = encoded(index)
        put(mirror, data, a.apply)
        if a.apply:
            put(status, encoded({"ready": True, "sha256": hashlib.sha256(data).hexdigest()}), True)
        return {"mirror": (".compass/github-index.json" if a.apply else "preview"), "source": index["source"], "counts": index["counts"],
                "anomalies": index["anomalies"]}
    receipt = read_json(status)
    require(isinstance(receipt, dict) and receipt.get("ready") is True,
            "no completed applied pull; run pull --apply")
    data = mirror.read_bytes()
    require(receipt.get("sha256") == hashlib.sha256(data).hexdigest(), "mirror differs from pull receipt")
    index = parse_json(data)
    for _, local, _ in KINDS:
        require(all(isinstance(row, dict) and isinstance(row.get("title"), str)
                    and not private_metadata(row["title"], deny) for row in state[local]),
                "local titles need private review")
    if isinstance(index, dict) and index.get("source") == "github":
        require(origin.get("origin_owner_repo"), "current GitHub origin unavailable")
    actions = plan_actions(state, index, repo)
    for bucket, _, _ in KINDS:
        for row in [*index[bucket].values(), *index["unmatched_remote"][bucket]]:
            require(not private_metadata(row["title"], deny), "cached remote titles need private review")
    result = {"repo": repo, "source": index["source"], "synced_at": index["synced_at"],
              "simulation": index["source"] == "fixture", "action_count": len(actions), "actions": actions}

    if a.cmd == "push":
        result.update(executed=False, commands=render_commands(root, config, state, repo, actions))
    return result


def main(argv=None):
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--root", default=".")
    common.add_argument("--repo", help="github.com owner/name; must agree with configured identity")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="cmd", required=True)
    pull = sub.add_parser("pull", parents=[common], help="read both collections, optionally save locally")
    pull.add_argument("--fixture", help="offline JSON snapshot with owner_repo, complete, issues and milestones")
    pull.add_argument("--apply", action="store_true", help="save the local mirror and pull status")
    sub.add_parser("plan", parents=[common], help="plan from a complete matching local mirror")
    push = sub.add_parser("push", parents=[common], help="report the plan-only boundary")
    push.add_argument("--apply", action="store_true")
    push.add_argument("--authorized", action="store_true")
    a = parser.parse_args(argv)
    if a.cmd == "push" and not (a.apply and a.authorized):
        print(json.dumps({"refused": True, "reason": "rendering requires --apply and --authorized"}))
        return 3
    try:
        require(os.path.isdir(a.root) and not Path(a.root).is_symlink(), "invalid project root")
        root = Path(a.root).resolve()
        with writer_lock(root) if a.cmd == "pull" and a.apply else nullcontext():
            output = run(a, root)
    except FirewallBlocked:
        print(json.dumps({"blocked": True, "check": "V7", "executed": False, "commands": [],
                          "actions": [], "action_count": 0,
                          "reason": "The V7 scope firewall did not pass. Review the current managed "
                                    "artifacts with validate_compass.py before rendering commands."},
                         indent=2, sort_keys=True))
        return 3
    except (ValueError, OSError) as exc:
        output = {"degraded": "file-only", "action_count": 0, "actions": [],
                  "reason": str(exc) if isinstance(exc, Incomplete) else "invalid project state or unsafe path"}
    print(json.dumps(output, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
