#!/usr/bin/env python3
"""Detect the tracking mode for one project root. Only --check-gh checks authentication.

Mode A requires a verified Git worktree and one unambiguous github.com origin.
A previously recorded GitHub identity can be retained unverified in file-only
operation. Scaffolding and links alone give Mode B.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

if __name__ == "__main__":
    sys.dont_write_bytecode = True

SCHEMA = "okhp3.compass.mode/1"
OWNER = r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?"
REPO = r"[A-Za-z0-9_.-]{1,100}"
SLUG = re.compile(OWNER + "/" + REPO, re.ASCII)
GH_URL = re.compile(
    r"(?:https://(?:[^@/\s?#\\]+@)?github\.com(?::443)?/|"
    r"git@github\.com:|ssh://git@github\.com(?::22)?/)"
    r"(" + OWNER + "/" + REPO + r"(?:\.git)?)/?", re.I | re.ASCII)
GH_LINK = re.compile(r"https://github\.com/" + OWNER + "/" + REPO, re.I | re.ASCII)


def valid_slug(value):
    return (isinstance(value, str) and SLUG.fullmatch(value) is not None
            and value.split("/")[1] not in {".", ".."})


def github_slug(url):
    match = GH_URL.fullmatch(url)
    if not match:
        return None
    slug = match.group(1)
    if slug.lower().endswith(".git"):
        slug = slug[:-4]
    return slug if valid_slug(slug) else None


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def local_path(root, relative):
    """Resolve a known relative path without crossing a symlink below root."""
    path = Path(root)
    for name in Path(relative).parts:
        if name == ".." or os.path.isabs(name):
            return None
        path /= name
        if path.is_symlink():
            return None
    return path


def read(path, cap=200_000):
    if not path or not path.is_file() or path.is_symlink():
        return ""
    try:
        with path.open("rb") as stream:
            data = stream.read(cap + 1)
        return data.decode("utf-8", "replace") if len(data) <= cap else ""
    except OSError:
        return ""


def project_file(root, value):
    """Interpret a relative CLI path beneath the explicitly selected root."""
    from compass_state import target
    base = Path(root).absolute()
    path = Path(value)
    if path.is_absolute():
        if base in path.parents:
            path = path.relative_to(base)
        else:
            path = path.relative_to(base.resolve())
    return target(base.resolve(), str(path))


def write_output(path, text, root):
    from compass_state import put
    put(project_file(root, path), text.encode("utf-8"), True)


def run_git(root, *args, timeout=25):
    # An inherited GIT_DIR, work tree, or config override can select another repo.
    env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_") or k in
           {"GIT_CONFIG_GLOBAL", "GIT_CONFIG_NOSYSTEM", "GIT_CEILING_DIRECTORIES"}}
    env.update(GIT_OPTIONAL_LOCKS="0", GIT_TERMINAL_PROMPT="0",
               GIT_NO_LAZY_FETCH="1")
    try:
        out = subprocess.run(["git", "-c", "core.fsmonitor=false", "-C", str(root), *args],
                             capture_output=True, env=env, timeout=timeout)
    except (OSError, subprocess.SubprocessError):
        return None
    return os.fsdecode(out.stdout).rstrip("\n") if out.returncode == 0 else None


def is_worktree(root):
    root = Path(root).resolve()
    marker = local_path(root, ".git")
    if marker is None:
        return False
    common = marker
    if marker.is_file():
        # A linked worktree registers a backlink from its private gitdir.
        # A copied or fabricated gitfile alone cannot claim another repo.
        pointer = read(marker, 8192).strip()
        if not pointer.startswith("gitdir: "):
            return False
        gitdir = root / pointer[8:]
        if gitdir.parent.name != "worktrees" or gitdir.is_symlink():
            return False
        shared = read(gitdir / "commondir", 8192).strip()
        common = gitdir.parent.parent
        if not shared or (gitdir / shared).resolve() != common.resolve():
            return False
        backlink = read(gitdir / "gitdir", 8192).strip()
        if not backlink or (gitdir / backlink).resolve() != marker:
            return False
    elif not marker.is_dir():
        return False
    if not (common / "config").is_file() or (common / "config").is_symlink():
        return False
    top = run_git(root, "rev-parse", "--show-toplevel")
    return bool(top and Path(top).resolve() == root)


def remote_evidence(root):
    """Only return counts and a canonical slug; never export raw URLs or aliases."""
    listing = run_git(root, "remote")
    verified = listing is not None
    names = (listing or "").splitlines()
    origin, github_count = None, 0
    for name in names:
        if not name or name.startswith("-"):
            continue
        configured = run_git(root, "config", "--local", "--no-includes", "--get-all",
                             "remote." + name + ".url")
        fetch = run_git(root, "remote", "get-url", "--all", name)
        push = run_git(root, "remote", "get-url", "--push", "--all", name)
        if not configured or not fetch or not push:
            if name == "origin":
                verified = False
            continue
        slugs = [github_slug(u) for u in (configured + "\n" + fetch + "\n" + push).splitlines()]
        if any(slugs):
            github_count += 1
        if name == "origin" and all(slugs) and len({s.lower() for s in slugs}) == 1:
            origin = slugs[0]
    return {"remote_count": len(names), "github_remote_count": github_count, "verified": verified,
            "origin_owner_repo": origin}


def gh_status(check):
    present = bool(shutil.which("gh"))
    auth = None
    note = "gh CLI unavailable" if not present else "authentication unchecked"
    if present and check:
        try:
            result = subprocess.run(["gh", "auth", "status", "--hostname", "github.com"],
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                    timeout=20)
            auth = result.returncode == 0
        except (OSError, subprocess.SubprocessError):
            auth = False
        note = "authenticated to github.com" if auth else "GitHub authentication unavailable"
    return {"cli_present": present, "authenticated": auth, "note": note}


def recorded_origin(root):
    """Read the last recorded Mode A identity for local continuity only."""
    from compass_state import parse_json, target

    def document(name, schema):
        path = target(root, ".compass/" + name + ".json")
        if not path.is_file():
            return {}
        doc = parse_json(path.read_text(encoding="utf-8"))
        if not isinstance(doc, dict) or doc.get("schema") != schema:
            raise ValueError("unsupported prior record")
        return doc

    try:
        state = document("objectives", "okhp3.compass.objectives/1")
        config = document("config", "okhp3.compass.state/1")
        mode = state.get("mode") or {}
        if not isinstance(mode, dict) or mode.get("detected") == "B":
            return None
        if state and config and state.get("project_key") != config.get("project_key"):
            return None
        saved = document("mode", SCHEMA)
        state_a = mode.get("detected") == "A" and mode.get("sub_case") == "github-origin"
        saved_a = saved.get("mode") == "A" and saved.get("sub_case") == "github-origin"
        if not (state_a or saved_a) or saved.get("mode") == "B":
            return None
        github = config.get("github") or {}
        if not isinstance(github, dict):
            return None
        candidates = [s for s in (mode.get("owner_repo"), github.get("owner_repo"), saved.get("owner_repo"))
                      if s is not None]
        if candidates and all(valid_slug(s) for s in candidates) and len({s.lower() for s in candidates}) == 1:
            return candidates[0]
    except (ValueError, OSError):
        pass
    return None


def detect(root, check_gh=False):
    root = Path(root).resolve()
    signals, questions = [], []

    def sig(name, found, weight, detail=None):
        signals.append({"signal": name, "found": bool(found),
                        "weight": weight, "detail": detail})
        return bool(found)

    has_git = sig("git-worktree", is_worktree(root), "high")
    remotes = remote_evidence(root) if has_git else {}
    from compass_state import excluded, manifest_privacy
    deny, _ = manifest_privacy(root)
    owner_repo = remotes.get("origin_owner_repo")
    if owner_repo and any(excluded(part, deny) for part in owner_repo.split("/")):
        remotes["origin_owner_repo"] = owner_repo = None
    github = sig("github-remote", remotes.get("github_remote_count"), "high", remotes)
    sig("origin-is-github", owner_repo, "high", owner_repo)

    def is_file(rel):
        path = local_path(root, rel)
        return path is not None and path.is_file()

    def file_count(rel, suffixes=None):
        path = local_path(root, rel)
        if path is None or not path.is_dir():
            return 0
        return sum(1 for p in path.iterdir() if not p.is_symlink() and p.is_file()
                   and (not suffixes or p.suffix in suffixes))

    dotgithub = local_path(root, ".github")
    scaffolding = sig("dot-github-directory", dotgithub and dotgithub.is_dir(), "medium")
    for signal, count in (("actions-workflows", file_count(".github/workflows", {".yaml", ".yml"})),
                          ("issue-templates", file_count(".github/ISSUE_TEMPLATE"))):
        sig(signal, count, "medium", count)
    for signal, name in (("pr-template", "pull_request_template.md"), ("codeowners", "CODEOWNERS")):
        scaffolding |= sig(signal, any(is_file(prefix + name) for prefix in ("", ".github/", "docs/")),
                           "medium")
    readme = next((name for name in ("README.md", "README.rst", "README.txt", "readme.md")
                   if is_file(name)), None)
    sig("readme-github-links", readme and GH_LINK.search(read(root / readme)), "low")

    origin_verified = bool(owner_repo)
    prior = None
    if not remotes.get("verified") and (os.path.lexists(root / ".git") or not shutil.which("git")):
        prior = recorded_origin(root)
        if prior and any(excluded(part, deny) for part in prior.split("/")):
            prior = None
    if origin_verified:
        sub, mode, confidence = "github-origin", "A", "high"
    elif prior:
        sub, mode, confidence, owner_repo = "github-origin", "A", "low", prior
        sig("recorded-github-origin", True, "historical", prior)
        questions.append("The recorded GitHub origin is unverified this run. Use local evidence until Git can verify it.")
    elif github:
        sub, mode, confidence = "github-non-origin", "B", "low"
        questions.append("Which remote is authoritative? The configured URLs do not identify one GitHub origin.")
    elif has_git and remotes["remote_count"]:
        sub, mode, confidence = "git-non-github", "B", "high"
    elif has_git:
        sub, mode, confidence = "git-no-remote", "B", "high"
    elif scaffolding:
        sub, mode, confidence = "github-artifacts", "B", "low"
        questions.append("GitHub scaffolding exists without a verified Git worktree.")
    else:
        sub, mode, confidence = "plain-folder", "B", "high"
    if not has_git and os.path.lexists(root / ".git"):
        confidence = "low"
        questions.append("Git could not verify this root as a worktree.")
    gh = gh_status(check_gh and origin_verified)
    gh["usable"] = origin_verified and gh["authenticated"] is True
    if prior:
        gh["note"] = "File-only operation. Current origin unverified; GitHub access disabled."
    return {"schema": SCHEMA, "detected_at": now(), "root": None if excluded(root.name, deny) else root.name, "mode": mode,
            "sub_case": sub, "confidence": confidence, "owner_repo": owner_repo,
            "origin_verified": origin_verified,
            "github_api": gh, "signals": signals, "open_questions": questions,
            "policy": ["Detection makes local observations. Only --check-gh in Mode A checks authentication."]}


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--root", default=".")
    p.add_argument("--check-gh", action="store_true", help="check github.com auth in Mode A only")
    p.add_argument("--out", help="write the verdict locally instead of stdout")
    a = p.parse_args(argv)
    if not os.path.isdir(a.root) or Path(a.root).is_symlink():
        p.error("root must be a directory, not a symbolic link")
    try:
        doc = detect(a.root, a.check_gh)
        text = json.dumps(doc, indent=2, sort_keys=True)
        if a.out:
            write_output(a.out, text + "\n", a.root)
        else:
            print(text)
    except (OSError, ValueError):
        p.error("could not inspect the root or safely write the verdict")
    return 0


if __name__ == "__main__":
    sys.exit(main())
