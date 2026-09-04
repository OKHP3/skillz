#!/usr/bin/env python3
"""Mode A GitHub bridge for OKHP3 Project Compass.

Three verbs. `pull` and `plan` never mutate anything. `push` mutates GitHub and
requires both --apply and --authorized in the same invocation, because an
external write is a decision a human makes each time.

The file mirror written here is a POINTER INDEX plus context: local stable id
to issue number, milestone number, state, labels, and rollup counts. It never
copies issue bodies into the repository. Losing GitHub access degrades the
project to Mode B without losing the identifier history.

Usage
-----
  python3 github_sync.py pull --root . --repo owner/name --apply
  python3 github_sync.py pull --root . --repo owner/name --fixture fixture.json --apply
  python3 github_sync.py plan --root . --repo owner/name
  python3 github_sync.py push --root . --repo owner/name --apply --authorized

Requires the GitHub CLI (`gh`) for live calls. Without it, every verb reports
`degraded: file-only` and exits 0 so a scheduled run still completes.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys

SCHEMA = "okhp3.compass.github-index/1"
MARKER = re.compile(r"<!--\s*compass-id:\s*([A-Z]{3}-[0-9A-F]{8})\s*-->")
CLOSED_STATUSES = {"done", "abandoned", "superseded"}


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def load(path, default=None):
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


def gh_json(args, timeout=45):
    """Run a gh command expecting JSON on stdout. Returns (data, error)."""
    if not shutil.which("gh"):
        return None, "gh CLI not on PATH"
    try:
        out = subprocess.run(["gh", *args], capture_output=True, text=True,
                             timeout=timeout)
    except (OSError, subprocess.SubprocessError) as exc:
        return None, "gh invocation failed: %s" % exc.__class__.__name__
    if out.returncode != 0:
        err = (out.stderr or "").strip()[:300]
        low = err.lower()
        if "rate limit" in low:
            return None, "rate limited by GitHub: %s" % err
        if "auth" in low or "login" in low:
            return None, "gh not authenticated: %s" % err
        return None, "gh error: %s" % err
    try:
        return json.loads(out.stdout or "null"), None
    except ValueError:
        return None, "gh returned non-JSON output"


def fetch(repo, fixture):
    """Return ({'issues':[...], 'milestones':[...]}, error)."""
    if fixture:
        data = load(fixture)
        if data is None:
            return None, "fixture unreadable: %s" % fixture
        return data, None
    issues, err = gh_json(["issue", "list", "--repo", repo, "--state", "all",
                           "--limit", "500", "--json",
                           "number,title,body,state,labels,milestone,url"])
    if err:
        return None, err
    milestones, err = gh_json(["api", "repos/%s/milestones?state=all&per_page=100" % repo])
    if err:
        return None, err
    return {"issues": issues or [], "milestones": milestones or []}, None


def marker_of(text):
    m = MARKER.search(text or "")
    return m.group(1) if m else None


def build_index(repo, remote, state):
    local_ids = {o["id"] for o in state.get("objectives", []) if o.get("id")}
    local_ids |= {t["id"] for t in state.get("tasks", []) if t.get("id")}
    milestones, issues = {}, {}
    unmatched_remote = {"issues": [], "milestones": []}

    for ms in remote.get("milestones", []):
        cid = marker_of(ms.get("description", "")) or marker_of(ms.get("title", ""))
        openc = int(ms.get("open_issues", 0) or 0)
        closedc = int(ms.get("closed_issues", 0) or 0)
        total = openc + closedc
        entry = {"number": ms.get("number"), "title": ms.get("title"),
                 "state": ms.get("state"), "open_issues": openc,
                 "closed_issues": closedc,
                 "percent_complete": round(100 * closedc / total) if total else 0,
                 "due_on": ms.get("due_on"), "url": ms.get("html_url")}
        if cid:
            milestones[cid] = entry
        else:
            unmatched_remote["milestones"].append(entry)

    for issue in remote.get("issues", []):
        cid = marker_of(issue.get("body", ""))
        labels = [l.get("name") if isinstance(l, dict) else l
                  for l in (issue.get("labels") or [])]
        ms = issue.get("milestone") or {}
        entry = {"number": issue.get("number"), "title": issue.get("title"),
                 "state": issue.get("state"), "labels": labels,
                 "milestone_number": ms.get("number") if isinstance(ms, dict) else None,
                 "url": issue.get("url") or issue.get("html_url")}
        if cid:
            issues[cid] = entry
        else:
            unmatched_remote["issues"].append(
                {k: entry[k] for k in ("number", "title", "state", "url")})

    matched = set(milestones) | set(issues)
    duplicates = {}
    for bucket in (milestones, issues):
        for cid in bucket:
            if cid not in local_ids:
                duplicates.setdefault("marker_not_in_local_state", []).append(cid)
    return {
        "schema": SCHEMA,
        "owner_repo": repo,
        "synced_at": now(),
        "policy": "pointers-plus-context; issue bodies are never mirrored",
        "milestones": milestones,
        "issues": issues,
        "unmatched_remote": {k: v[:100] for k, v in unmatched_remote.items()},
        "unmatched_local": sorted(local_ids - matched),
        "anomalies": duplicates,
    }


def plan_actions(state, index):
    actions = []
    ms, iss = index.get("milestones", {}), index.get("issues", {})
    for o in state.get("objectives", []):
        cid, status = o.get("id"), o.get("status")
        if cid not in ms:
            actions.append({"op": "create-milestone", "id": cid,
                            "title": o.get("title"),
                            "reason": "objective has no GitHub milestone"})
            continue
        remote_state = ms[cid].get("state")
        want = "closed" if status in CLOSED_STATUSES else "open"
        if remote_state != want:
            actions.append({"op": "update-milestone-state", "id": cid,
                            "number": ms[cid]["number"], "to": want,
                            "reason": "local status %s implies %s" % (status, want)})
    for t in state.get("tasks", []):
        cid, status = t.get("id"), t.get("status")
        if cid not in iss:
            actions.append({"op": "create-issue", "id": cid,
                            "title": t.get("title"),
                            "reason": "task has no GitHub issue"})
            continue
        remote_state = (iss[cid].get("state") or "").lower()
        want = "closed" if status in CLOSED_STATUSES else "open"
        if remote_state != want:
            if want == "open" and remote_state == "closed":
                actions.append({"op": "flag-divergence", "id": cid,
                                "number": iss[cid]["number"],
                                "reason": "remote closed while local is %s; a "
                                          "human closed it. Do not reopen "
                                          "automatically" % status})
            else:
                actions.append({"op": "close-issue", "id": cid,
                                "number": iss[cid]["number"],
                                "reason": "local status %s" % status})
    for cid in index.get("unmatched_local", []):
        if not any(a.get("id") == cid for a in actions):
            actions.append({"op": "review", "id": cid,
                            "reason": "local item has no GitHub counterpart"})
    for entry in index.get("unmatched_remote", {}).get("issues", [])[:50]:
        actions.append({"op": "adopt-or-ignore", "number": entry["number"],
                        "title": entry["title"],
                        "reason": "GitHub issue carries no compass-id marker"})
    return actions


def cmd_pull(a):
    state = load(os.path.join(a.root, ".compass", "objectives.json"), {}) or {}
    remote, err = fetch(a.repo, a.fixture)
    if err:
        print(json.dumps({"degraded": "file-only", "reason": err,
                          "action": "Mode A ran without GitHub this pass; the "
                                    "file mirror is unchanged and still valid."},
                         indent=2))
        return 0
    index = build_index(a.repo, remote, state)
    print(write_json(os.path.join(a.root, ".compass", "github-index.json"),
                     index, a.apply))
    print(json.dumps({"matched_milestones": len(index["milestones"]),
                      "matched_issues": len(index["issues"]),
                      "unmatched_local": len(index["unmatched_local"]),
                      "unmatched_remote_issues":
                          len(index["unmatched_remote"]["issues"])}, indent=2))
    return 0


def cmd_plan(a):
    state = load(os.path.join(a.root, ".compass", "objectives.json"), {}) or {}
    index = load(os.path.join(a.root, ".compass", "github-index.json"))
    if index is None:
        print(json.dumps({"degraded": "no-index",
                          "reason": "run `pull` first, or accept file-only "
                                    "operation"}, indent=2))
        return 0
    actions = plan_actions(state, index)
    print(json.dumps({"repo": a.repo, "planned_at": now(),
                      "action_count": len(actions), "actions": actions,
                      "note": "plan never mutates. push requires --apply and "
                              "--authorized."}, indent=2))
    return 0


def cmd_push(a):
    if not (a.apply and a.authorized):
        print("REFUSED: push requires both --apply and --authorized in the "
              "same invocation, and a human yes in the same session.",
              file=sys.stderr)
        return 3
    if not shutil.which("gh"):
        print(json.dumps({"degraded": "file-only",
                          "reason": "gh CLI not on PATH; nothing was pushed"},
                         indent=2))
        return 0
    print(json.dumps({
        "refused": True,
        "reason": "This build ships plan-only. Execute the approved plan with "
                  "explicit gh commands so every external write appears "
                  "verbatim in the run log.",
        "example_create_issue": "gh issue create --repo %s --title '<title>' "
                                "--body '<body>\\n\\n<!-- compass-id: TSK-XXXXXXXX -->' "
                                "--label compass" % a.repo,
        "example_close_issue": "gh issue close <number> --repo %s "
                               "--comment 'Compass: status done, evidence "
                               "commit:<sha>'" % a.repo,
        "example_create_milestone": "gh api repos/%s/milestones -f title='<title>' "
                                    "-f description='<!-- compass-id: OBJ-XXXXXXXX -->'"
                                    % a.repo,
    }, indent=2))
    return 0


def main(argv=None) -> int:
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--root", default=".")
    common.add_argument("--repo", help="owner/name; defaults to "
                        "config.json github.owner_repo")
    common.add_argument("--apply", action="store_true")
    common.add_argument("--authorized", action="store_true",
                        help="human authorized this specific external write")
    common.add_argument("--fixture",
                        help="offline JSON fixture instead of gh calls")
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("pull", parents=[common]).set_defaults(fn=cmd_pull)
    sub.add_parser("plan", parents=[common]).set_defaults(fn=cmd_plan)
    sub.add_parser("push", parents=[common]).set_defaults(fn=cmd_push)
    a = p.parse_args(argv)
    if not a.repo:
        cfg = load(os.path.join(a.root, ".compass", "config.json"), {}) or {}
        a.repo = (cfg.get("github") or {}).get("owner_repo")
    if not a.repo:
        print("error: no repo. Pass --repo owner/name or set "
              "github.owner_repo in .compass/config.json", file=sys.stderr)
        return 2
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
