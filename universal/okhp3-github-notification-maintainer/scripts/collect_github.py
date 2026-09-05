#!/usr/bin/env python3
"""Read-only, visible-to-credentials GitHub estate inventory using only stdlib and gh.

Exit 0: requested accessible inventory complete within stated coverage.
Exit 1: partial inventory, zero repositories, API/schema failure, or Actions cap.
Exit 2: invalid arguments or output failure. No GitHub mutation is implemented.
"""

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from urllib.parse import quote, urlencode


PAGE_SIZE = 100
ACTIONS_CAP = 1000
LOGIN = re.compile(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?\Z")
REPO = re.compile(r"[A-Za-z0-9_.-]{1,100}\Z")
SHA = re.compile(r"[0-9a-fA-F]{40}\Z")
SENSITIVE = re.compile(
    r"(?:https?://|ssh://|git@)[^\s\"<>]+|"
    r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|"
    r"(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+)|"
    r"(?:Bearer\s+\S+)|(?:[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,})",
    re.IGNORECASE,
)


class InventoryError(Exception):
    """Only controlled error codes, never response bodies or command stderr."""


def owner_value(value):
    if not LOGIN.fullmatch(value):
        raise argparse.ArgumentTypeError("owner must be a GitHub login, not a URL or option")
    return value


def bounded(low, high):
    def parse(value):
        try:
            result = int(value)
        except ValueError:
            raise argparse.ArgumentTypeError("expected an integer") from None
        if not low <= result <= high:
            raise argparse.ArgumentTypeError(f"expected {low} through {high}")
        return result
    return parse


def required_string(value):
    if not isinstance(value, str) or not value or any(ord(c) < 32 for c in value):
        raise InventoryError("invalid_string")
    return value


def full_sha(value):
    if not isinstance(value, str) or not SHA.fullmatch(value):
        raise InventoryError("invalid_full_sha")
    return value


def integer(value):
    if type(value) is not int or value < 0:
        raise InventoryError("invalid_integer")
    return value


def optional_string(value):
    return required_string(value) if value is not None else None


def boolean(value):
    if type(value) is not bool:
        raise InventoryError("invalid_boolean")
    return value


def identity(repo):
    owner = required_string(repo["owner"]["login"])
    name = required_string(repo["name"])
    if not LOGIN.fullmatch(owner) or not REPO.fullmatch(name) or name in (".", ".."):
        raise InventoryError("invalid_repository_identity")
    full_name = required_string(repo["full_name"])
    if full_name.casefold() != f"{owner}/{name}".casefold():
        raise InventoryError("inconsistent_repository_identity")
    return full_name


def sanitize(value):
    """Defense in depth after allowlisting; never serialize raw GitHub objects."""
    if isinstance(value, str):
        return SENSITIVE.sub("[REDACTED]", value)
    if isinstance(value, list):
        return [sanitize(item) for item in value]
    if isinstance(value, dict):
        return {key: sanitize(item) for key, item in value.items()}
    return value


class GitHub:
    def __init__(self, timeout=30):
        self.timeout = timeout

    def get(self, path, params=None):
        # Paths are constructed internally; never follow response URLs or Link URLs.
        if not path.startswith("/") or path.startswith("//") or any(
            char in path for char in "?#{}\\\r\n"
        ):
            raise InventoryError("unsafe_endpoint")
        endpoint = path + ("?" + urlencode(params) if params else "")
        args = ["gh", "api", "--hostname", "github.com", "--method", "GET",
                "--header", "Accept: application/vnd.github+json", endpoint]
        env = os.environ.copy()
        # Prevent inherited debugging from logging credentials. Auth stays in gh.
        env.pop("GH_DEBUG", None)
        env["GH_PROMPT_DISABLED"] = "1"
        try:
            result = subprocess.run(args, shell=False, capture_output=True, text=True,
                                    timeout=self.timeout, env=env, stdin=subprocess.DEVNULL)
        except subprocess.TimeoutExpired:
            raise InventoryError("rest_timeout") from None
        except OSError:
            raise InventoryError("gh_unavailable") from None
        if result.returncode:
            status = re.search(r"\bHTTP (\d{3})\b", result.stderr or "")
            code = f"rest_failure_exit_{result.returncode}"
            if status:
                code += f"_http_{status.group(1)}"
            raise InventoryError(code)
        try:
            return json.loads(result.stdout)
        except (ValueError, TypeError):
            raise InventoryError("invalid_json") from None


def failure(errors, operation, exc, page=None):
    entry = {"operation": operation,
             "code": str(exc) if isinstance(exc, InventoryError) else "invalid_response_schema"}
    if page is not None:
        entry["page"] = page
    errors.append(entry)


SCHEMA_ERRORS = (InventoryError, KeyError, TypeError, ValueError, AttributeError)


def paginate(api, path, params, errors, operation, key=None, cap=None):
    items, page = [], 1
    coverage = {"complete": False, "pages": 0, "cap": cap, "cap_reached": False}
    while True:
        try:
            data = api.get(path, {**params, "per_page": PAGE_SIZE, "page": page})
            rows = data[key] if key else data
            if not isinstance(rows, list) or len(rows) > PAGE_SIZE:
                raise InventoryError("invalid_page")
            if key:
                coverage["reported_total"] = integer(data["total_count"])
            if rows and items and rows == items[-len(rows):]:
                raise InventoryError("repeated_page")
            items.extend(rows)
            coverage["pages"] += 1
            if cap is not None and (len(items) >= cap):
                coverage["cap_reached"] = True
                raise InventoryError("actions_search_cap_reached")
            if len(rows) < PAGE_SIZE:
                if key and len(items) < coverage["reported_total"]:
                    raise InventoryError("reported_total_exceeds_collected")
                coverage["complete"] = True
                break
            page += 1
        except SCHEMA_ERRORS as exc:
            failure(errors, operation, exc, page)
            break
    coverage["collected"] = len(items)
    return items, coverage


def normalize_pr(raw, full_name):
    if identity(raw["base"]["repo"]).casefold() != full_name.casefold():
        raise InventoryError("foreign_pr_base")
    head = raw["head"]
    return {
        "number": integer(raw["number"]), "state": required_string(raw["state"]),
        "merged_at": optional_string(raw["merged_at"]), "head_ref": required_string(head["ref"]),
        "head_sha": full_sha(head["sha"]),
        "head_repository": identity(head["repo"]) if head["repo"] is not None else None,
        "base_ref": required_string(raw["base"]["ref"]),
    }


def collect_repo(api, raw, since, until):
    full_name = identity(raw)
    prefix = "/repos/" + "/".join(quote(part, safe="") for part in full_name.split("/"))
    errors = []
    result = {"full_name": full_name, "owner": raw["owner"]["login"],
              "owner_type": required_string(raw["owner"]["type"]), "ownership": "owned_by_requested_owner",
              "fork": boolean(raw["fork"]), "archived": boolean(raw["archived"]),
              "private": boolean(raw["private"]), "default_branch": optional_string(raw["default_branch"]),
              "pull_requests_enabled": raw.get("has_pull_requests"),
              "pull_request_creation_policy": raw.get("pull_request_creation_policy"),
              "main_sha": None, "main_status": "unknown", "branches": [],
              "open_prs": [], "recent_action_runs": [], "coverage": {}, "errors": errors}
    branches, branch_cov = paginate(api, prefix + "/branches", {}, errors, "branches")
    result["coverage"]["branches"] = branch_cov
    for branch in branches:
        try:
            result["branches"].append({"name": required_string(branch["name"]),
                                       "sha": full_sha(branch["commit"]["sha"]),
                                       "protected": boolean(branch["protected"])})
        except SCHEMA_ERRORS as exc:
            failure(errors, "branch_metadata", exc)
            branch_cov["complete"] = False
    main = [b for b in result["branches"] if b["name"] == "main"]
    if len(main) == 1:
        result.update(main_sha=main[0]["sha"], main_status="present")
    elif not main and branch_cov["complete"]:
        result["main_status"] = "absent"
    else:
        failure(errors, "main", InventoryError("main_unresolved"))
    default = [b for b in result["branches"] if b["name"] == result["default_branch"]]
    result["default_branch_sha"] = default[0]["sha"] if len(default) == 1 else None

    prs, pr_cov = paginate(api, prefix + "/pulls", {"state": "open"}, errors, "open_prs")
    result["coverage"]["open_prs"] = pr_cov
    for raw_pr in prs:
        try:
            pr = normalize_pr(raw_pr, full_name)
            if pr["state"] != "open":
                raise InventoryError("unexpected_pr_state")
            result["open_prs"].append(pr)
        except SCHEMA_ERRORS as exc:
            failure(errors, "open_pr_metadata", exc)
            pr_cov["complete"] = False

    for branch in result["branches"]:
        if branch["name"] == "main":
            branch["pr_mapping"] = {"status": "main_excluded"}
            continue
        candidates = [p for p in result["open_prs"] if p["head_ref"] == branch["name"]
                      and (p["head_repository"] is None or
                           p["head_repository"].casefold() == full_name.casefold())]
        mapping = {"status": "unknown", "open_prs": candidates, "closed_prs": []}
        branch["pr_mapping"] = mapping
        if candidates:
            mapping["status"] = ("open" if len(candidates) == 1 and
                                 candidates[0]["head_repository"] else "ambiguous")
            continue
        closed, closed_cov = paginate(api, prefix + "/pulls",
            {"state": "closed", "head": raw["owner"]["login"] + ":" + branch["name"]},
            errors, "closed_prs:" + branch["name"])
        mapping["coverage"] = closed_cov
        for raw_pr in closed:
            try:
                pr = normalize_pr(raw_pr, full_name)
                if pr["state"] != "closed":
                    raise InventoryError("unexpected_pr_state")
                if pr["head_ref"] == branch["name"] and (pr["head_repository"] is None or
                        pr["head_repository"].casefold() == full_name.casefold()):
                    mapping["closed_prs"].append(pr)
            except SCHEMA_ERRORS as exc:
                failure(errors, "closed_pr_metadata:" + branch["name"], exc)
                closed_cov["complete"] = False
        matches = mapping["closed_prs"]
        if closed_cov["complete"] and pr_cov["complete"]:
            if len(matches) > 1 or any(p["head_repository"] is None for p in matches):
                mapping["status"] = "ambiguous"
            elif matches:
                mapping["status"] = "merged" if matches[0]["merged_at"] else "closed_unmerged"
            else:
                mapping["status"] = "no_pr_found"

    runs, run_cov = paginate(api, prefix + "/actions/runs", {"created": since + ".." + until},
                              errors, "recent_action_runs", "workflow_runs", ACTIONS_CAP)
    run_cov.update(since=since, until=until,
                   limitation="Bounded recent runs only; not proof all workflows are healthy. "
                              "No jobs, logs, checks, deployments, or never-run workflows inspected.")
    result["coverage"]["recent_action_runs"] = run_cov
    for run in runs:
        try:
            if identity(run["repository"]).casefold() != full_name.casefold():
                raise InventoryError("foreign_action_repository")
            result["recent_action_runs"].append({
                "id": integer(run["id"]), "workflow_id": integer(run["workflow_id"]),
                "head_sha": full_sha(run["head_sha"]), "head_branch": optional_string(run["head_branch"]),
                "status": required_string(run["status"]), "conclusion": optional_string(run["conclusion"]),
                "created_at": required_string(run["created_at"]),
                "updated_at": required_string(run["updated_at"]),
            })
        except SCHEMA_ERRORS as exc:
            failure(errors, "action_metadata", exc)
    result["complete"] = not errors
    return result


def collect(owner, workers=4, days=30, timeout=30, api=None):
    owner_value(owner)
    if not 1 <= workers <= 16 or not 1 <= days <= 90 or not 1 <= timeout <= 120:
        raise ValueError("invalid collection bounds")
    api = api or GitHub(timeout)
    now = datetime.now(timezone.utc).replace(microsecond=0)
    until = now.isoformat().replace("+00:00", "Z")
    since = (now - timedelta(days=days)).isoformat().replace("+00:00", "Z")
    errors = []
    result = {"schema_version": 1, "owner": owner, "host": "github.com", "mode": "audit",
              "started_at": until, "workers": workers, "repositories": [],
              "unread_notifications": [], "errors": errors, "coverage": {
                  "access_boundary": "Only repositories visible to the current gh credentials. "
                                     "Hidden repositories cannot be proven absent.",
                  "consistency": "Live paginated observations, not an atomic GitHub snapshot.",
                  "privacy": "Allowlisted metadata only; no titles, bodies, emails, logs, or URLs.",
                  "actions_window_days": days,
                  "pr_history": "Uncapped paginated closed/merged lookup per non-main branch "
                                "without an open match. Reused names and deleted heads may be ambiguous. "
                                "No ancestry or safe-deletion conclusion is made."}}
    repos = []
    try:
        target = api.get("/users/" + owner)
        if target["login"].casefold() != owner.casefold():
            raise InventoryError("owner_identity_mismatch")
        if target["type"] == "Organization":
            path, params = "/orgs/" + owner + "/repos", {"type": "all"}
        elif target["type"] == "User":
            viewer = api.get("/user")
            if viewer["login"].casefold() == owner.casefold():
                path, params = "/user/repos", {"affiliation": "owner", "visibility": "all"}
            else:
                path, params = "/users/" + owner + "/repos", {"type": "owner"}
                failure(errors, "repositories", InventoryError("other_user_public_only"))
        else:
            raise InventoryError("unsupported_owner_type")
        repos, cov = paginate(api, path, {**params, "sort": "full_name", "direction": "asc"},
                              errors, "repositories")
        result["coverage"]["repositories"] = cov
    except SCHEMA_ERRORS as exc:
        failure(errors, "owner_preflight", exc)
    accepted, seen = [], set()
    for repo in repos:
        try:
            name = identity(repo)
            if repo["owner"]["login"].casefold() != owner.casefold():
                raise InventoryError("foreign_repository_rejected")
            if name.casefold() in seen:
                raise InventoryError("duplicate_repository")
            seen.add(name.casefold())
            accepted.append(repo)
        except SCHEMA_ERRORS as exc:
            failure(errors, "repository_scope", exc)
    if not accepted:
        failure(errors, "repositories", InventoryError("zero_repositories"))

    def worker(repo):
        try:
            return collect_repo(api, repo, since, until)
        except SCHEMA_ERRORS as exc:
            local_errors = []
            failure(local_errors, "repository_metadata", exc)
            return {"full_name": identity(repo), "complete": False, "errors": local_errors}
    with ThreadPoolExecutor(max_workers=workers) as pool:
        result["repositories"] = sorted(pool.map(worker, accepted), key=lambda r: r["full_name"].casefold())

    notes, note_cov = paginate(api, "/notifications", {"all": "false", "participating": "false"},
                               errors, "unread_notifications")
    note_cov["foreign_owner_excluded"] = 0
    for note in notes:
        try:
            repo_name = identity(note["repository"])
            if note["repository"]["owner"]["login"].casefold() != owner.casefold():
                note_cov["foreign_owner_excluded"] += 1
                continue
            if repo_name.casefold() not in seen:
                raise InventoryError("notification_repository_missing_from_inventory")
            if note["unread"] is not True:
                raise InventoryError("unexpected_read_notification")
            thread_id = required_string(note["id"])
            if not thread_id.isascii() or not thread_id.isdecimal():
                raise InventoryError("invalid_thread_id")
            result["unread_notifications"].append({"thread_id": thread_id,
                "repository": repo_name, "unread": True,
                "reason": required_string(note["reason"]),
                "subject_type": required_string(note["subject"]["type"]),
                "updated_at": required_string(note["updated_at"])})
        except SCHEMA_ERRORS as exc:
            failure(errors, "notification_metadata", exc)
    result["coverage"]["unread_notifications"] = note_cov
    result["complete"] = not errors and all(r["complete"] for r in result["repositories"])
    result["finished_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    return sanitize(result)


def atomic_json(output, data):
    """Replace only the explicit destination, with a mode-0600 sibling temporary."""
    output = Path(output).absolute()
    if output.is_symlink():
        raise OSError("symlink output refused")
    temp = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=output.parent,
                                         prefix=".github-inventory-", suffix=".tmp", delete=False) as handle:
            temp = Path(handle.name)
            json.dump(data, handle, indent=2, ensure_ascii=True, allow_nan=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp, output)
    finally:
        if temp is not None and temp.exists():
            temp.unlink()


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, allow_abbrev=False)
    parser.add_argument("--owner", required=True, type=owner_value)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--workers", default=4, type=bounded(1, 16))
    parser.add_argument("--days", default=30, type=bounded(1, 90))
    parser.add_argument("--timeout", default=30, type=bounded(1, 120))
    args = parser.parse_args(argv)
    data = collect(args.owner, args.workers, args.days, args.timeout)
    try:
        atomic_json(args.output, data)
    except (OSError, ValueError):
        print("Inventory output failed; destination not replaced.", file=sys.stderr)
        return 2
    print(json.dumps({"complete": data["complete"], "repositories": len(data["repositories"]),
                      "unread_notifications": len(data["unread_notifications"]),
                      "failed_repositories": sum(not r["complete"] for r in data["repositories"]),
                      "top_level_errors": len(data["errors"]), "actions_window_days": args.days}))
    return 0 if data["complete"] else 1


if __name__ == "__main__":
    sys.exit(main())
