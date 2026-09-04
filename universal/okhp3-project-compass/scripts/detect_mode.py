#!/usr/bin/env python3
"""Tracking-mode detection for OKHP3 Project Compass.

Read-only. Decides whether a folder is a GitHub-backed repository (Mode A) or a
plain folder (Mode B), reports every signal behind the verdict, and refuses to
guess: ambiguous evidence resolves to Mode B, which is additive and writes
nothing outside the folder.

Sub-cases
---------
  github-origin      .git present, remote 'origin' points at github.com  -> A
  github-non-origin  a github remote exists but origin does not          -> B, ambiguous
  git-non-github     .git present, remote is not github.com              -> B, git evidence available
  git-no-remote      .git present, no remote configured                  -> B, promotable
  github-artifacts   no usable git remote but .github/ scaffolding exists -> B, ambiguous
  plain-folder       no .git at all                                       -> B

Usage
-----
  python3 detect_mode.py --root /path/to/folder
  python3 detect_mode.py --root . --check-gh
"""
from __future__ import annotations

import argparse
import configparser
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys

SCHEMA = "okhp3.compass.mode/1"
GH_URL = re.compile(r"(?:git@github\.com[:/]|https://(?:[^@/]+@)?github\.com/)"
                    r"([\w.-]+)/([\w.-]+?)(?:\.git)?/?$", re.I)
GH_LINK = re.compile(r"https://github\.com/([\w.-]+)/([\w.-]+)")


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def read(path, cap=200_000):
    try:
        if os.path.getsize(path) > cap:
            return ""
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return ""


def parse_remotes(root):
    """Parse .git/config directly so detection works without the git binary."""
    cfg_path = os.path.join(root, ".git", "config")
    remotes = {}
    if not os.path.isfile(cfg_path):
        return remotes
    parser = configparser.ConfigParser(strict=False)
    try:
        parser.read_string(read(cfg_path))
    except configparser.Error:
        return remotes
    for section in parser.sections():
        m = re.match(r'remote\s+"(.+)"', section)
        if m and parser.has_option(section, "url"):
            remotes[m.group(1)] = parser.get(section, "url").strip()
    return remotes


def gh_status(check):
    info = {"cli_present": bool(shutil.which("gh")), "authenticated": None,
            "note": None}
    if not info["cli_present"]:
        info["note"] = ("gh CLI not on PATH; GitHub primitives cannot be read "
                        "or written. Operate file-only.")
        return info
    if not check:
        info["note"] = "gh present; auth not checked (pass --check-gh)"
        return info
    try:
        out = subprocess.run(["gh", "auth", "status"], capture_output=True,
                             text=True, timeout=20)
        info["authenticated"] = out.returncode == 0
        info["note"] = ("gh authenticated" if out.returncode == 0 else
                        "gh present but not authenticated; run `gh auth login`. "
                        "Operate file-only until then.")
    except (OSError, subprocess.SubprocessError) as exc:
        info["authenticated"] = False
        info["note"] = "gh auth status failed: %s" % exc.__class__.__name__
    return info


def detect(root, check_gh=False):
    root = os.path.abspath(root)
    signals, questions = [], []

    def sig(name, found, weight, detail=None):
        signals.append({"signal": name, "found": bool(found),
                        "weight": weight, "detail": detail})
        return bool(found)

    has_git = sig("dot-git-directory", os.path.isdir(os.path.join(root, ".git")),
                  "high")
    remotes = parse_remotes(root)
    gh_remotes = {n: u for n, u in remotes.items() if GH_URL.search(u)}
    origin_is_gh = "origin" in gh_remotes
    sig("github-remote", bool(gh_remotes), "high",
        {"remotes": remotes, "github_remotes": sorted(gh_remotes)})
    sig("origin-is-github", origin_is_gh, "high",
        gh_remotes.get("origin"))

    dotgithub = os.path.join(root, ".github")
    has_dotgithub = sig("dot-github-directory", os.path.isdir(dotgithub), "medium")
    workflows = []
    wf_dir = os.path.join(dotgithub, "workflows")
    if os.path.isdir(wf_dir):
        workflows = sorted(f for f in os.listdir(wf_dir)
                           if f.endswith((".yml", ".yaml")))
    sig("actions-workflows", bool(workflows), "medium", workflows[:20])
    tmpl_dir = os.path.join(dotgithub, "ISSUE_TEMPLATE")
    templates = sorted(os.listdir(tmpl_dir)) if os.path.isdir(tmpl_dir) else []
    sig("issue-templates", bool(templates), "medium", templates[:20])
    sig("pr-template", any(os.path.isfile(os.path.join(root, p)) for p in (
        ".github/pull_request_template.md", "pull_request_template.md",
        "docs/pull_request_template.md")), "medium")
    codeowners = [p for p in ("CODEOWNERS", ".github/CODEOWNERS",
                              "docs/CODEOWNERS")
                  if os.path.isfile(os.path.join(root, p))]
    sig("codeowners", bool(codeowners), "medium", codeowners)

    readme_links = []
    for name in ("README.md", "README.rst", "README.txt", "readme.md"):
        path = os.path.join(root, name)
        if os.path.isfile(path):
            readme_links = ["/".join(m) for m in GH_LINK.findall(read(path))]
            break
    sig("readme-github-links", bool(readme_links), "low",
        sorted(set(readme_links))[:10])

    owner_repo = None
    if gh_remotes:
        pick = gh_remotes.get("origin") or sorted(gh_remotes.values())[0]
        m = GH_URL.search(pick)
        if m:
            owner_repo = "%s/%s" % (m.group(1), m.group(2))
    elif readme_links:
        owner_repo = sorted(set(readme_links))[0]

    if has_git and origin_is_gh:
        sub, mode, confidence = "github-origin", "A", "high"
    elif has_git and gh_remotes:
        sub, mode, confidence = "github-non-origin", "B", "low"
        questions.append(
            "A GitHub remote exists but 'origin' does not point at GitHub "
            "(%s). Which remote is authoritative? Compass stayed in Mode B."
            % ", ".join(sorted(gh_remotes)))
    elif has_git and remotes:
        sub, mode, confidence = "git-non-github", "B", "high"
    elif has_git:
        sub, mode, confidence = "git-no-remote", "B", "high"
    elif has_dotgithub or workflows or templates or codeowners:
        sub, mode, confidence = "github-artifacts", "B", "low"
        questions.append(
            "GitHub scaffolding is present but there is no .git directory. "
            "This may be a copy, an export, or a template. Compass stayed in "
            "Mode B and made no external calls.")
    else:
        sub, mode, confidence = "plain-folder", "B", "high"

    gh = gh_status(check_gh)
    api_ready = mode == "A" and gh["cli_present"] and gh.get("authenticated") is not False
    if mode == "A" and not api_ready:
        questions.append(
            "Mode A detected but the GitHub CLI is unavailable or "
            "unauthenticated. Compass operated file-only this run; GitHub "
            "primitives were not read or written.")

    return {
        "schema": SCHEMA,
        "detected_at": now(),
        "root": root,
        "mode": mode,
        "sub_case": sub,
        "confidence": confidence,
        "owner_repo": owner_repo,
        "github_api": {
            "usable": bool(api_ready),
            "cli_present": gh["cli_present"],
            "authenticated": gh.get("authenticated"),
            "note": gh["note"],
        },
        "signals": signals,
        "open_questions": questions,
        "policy": [
            "Ambiguous or conflicting signals resolve to Mode B, which is "
            "additive and makes no external writes.",
            "Mode A never writes to GitHub without explicit authorization, and "
            "every external write is recorded in the run log.",
            "Mode A always keeps the lightweight file mirror in the repository "
            "so the project survives loss of API access.",
        ],
    }


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--root", default=".")
    p.add_argument("--check-gh", action="store_true",
                   help="run `gh auth status` (network call)")
    p.add_argument("--out")
    a = p.parse_args(argv)
    if not os.path.isdir(a.root):
        print("error: not a directory: %s" % a.root, file=sys.stderr)
        return 2
    doc = detect(a.root, a.check_gh)
    text = json.dumps(doc, indent=2, sort_keys=True)
    if a.out:
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        with open(a.out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text + "\n")
        print("wrote %s (mode %s, %s)" % (a.out, doc["mode"], doc["sub_case"]),
              file=sys.stderr)
    else:
        print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
