#!/usr/bin/env python3
"""Compare installed versions of a local AI stack against upstream releases.

Reads a stack config (see assets/stack.example.json). Upstream versions come from
APIs, never from rendered release pages, which can be cached and stale:
  github  -> https://api.github.com/repos/<repo>/releases/latest
  dockerhub -> https://hub.docker.com/v2/repositories/<repo>/tags (newest matching tag)
Installed versions come from docker inspect, brew, npm, or a version command.

Read-only and unauthenticated: no token or credential is read or sent. The
anonymous GitHub API limit (60 requests an hour) covers a stack of this size.
Network destinations: api.github.com and hub.docker.com only.

Usage:
  check_versions.py --config stack.json [--json] [--no-installed]
Exit code: 0 = everything current, 10 = at least one update available, 1 = error.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import urllib.request
from typing import Optional

UA = {"User-Agent": "okhp3-local-ai-stack-upgrade/0.1", "Accept": "application/json"}


def norm(v: Optional[str]) -> Optional[tuple]:
    """'v0.13.5' -> (0, 13, 5); '2026.11.20-abc123' -> (2026, 11, 20). None if unparseable."""
    if not v:
        return None
    m = re.search(r"(\d+(?:\.\d+)+)", v)
    return tuple(int(x) for x in m.group(1).split(".")) if m else None


def compare(installed: Optional[str], latest: Optional[str]) -> str:
    a, b = norm(installed), norm(latest)
    if a is None or b is None:
        return "unknown"
    width = max(len(a), len(b))
    a, b = a + (0,) * (width - len(a)), b + (0,) * (width - len(b))
    if a == b:
        return "current"
    return "update" if a < b else "ahead"


def http_json(url: str, timeout: int = 15):
    if not url.startswith(("https://api.github.com/", "https://hub.docker.com/")):
        raise ValueError("upstream lookups are limited to api.github.com and hub.docker.com")
    with urllib.request.urlopen(urllib.request.Request(url, headers=dict(UA)), timeout=timeout) as r:
        return json.load(r)


def latest_version(src: dict) -> tuple[Optional[str], Optional[str]]:
    """Return (version, url) for the upstream source."""
    kind = src.get("type")
    if kind == "github":
        d = http_json(f"https://api.github.com/repos/{src['repo']}/releases/latest")
        return d.get("tag_name"), d.get("html_url")
    if kind == "dockerhub":
        d = http_json(
            f"https://hub.docker.com/v2/repositories/{src['repo']}/tags?page_size=50&ordering=last_updated"
        )
        pat = re.compile(src.get("tag_regex", r"^v?\d+(\.\d+)+$"))
        tags = [t["name"] for t in d.get("results", []) if pat.search(t["name"])]
        tags.sort(key=lambda t: norm(t) or (), reverse=True)
        return (tags[0] if tags else None), f"https://hub.docker.com/r/{src['repo']}/tags"
    if kind == "manual":
        return None, src.get("url")
    raise ValueError(f"unknown latest.type {kind!r}")


def run(cmd: list[str]) -> Optional[str]:
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.TimeoutExpired):
        return None
    return out.stdout.strip() if out.returncode == 0 else None


def installed_version(inst: dict) -> Optional[str]:
    kind = inst.get("type")
    if kind == "docker":
        img = run(["docker", "inspect", "-f", "{{.Config.Image}}", inst["container"]])
        if not img:
            return None
        tag = img.rsplit(":", 1)[1] if ":" in img.rsplit("/", 1)[-1] else "latest"
        if tag == "latest" or norm(tag) is None:  # fall back to the image's OCI version label
            label = run(["docker", "inspect", "-f",
                         '{{index .Config.Labels "org.opencontainers.image.version"}}', inst["container"]])
            return label or tag
        return tag
    if kind == "brew":
        out = run(["brew", "list", "--versions", inst["formula"]])
        return out.split()[-1] if out else None
    if kind == "npm":
        out = run(["npm", "ls", "-g", inst["package"], "--depth=0", "--json"])
        try:
            return json.loads(out)["dependencies"][inst["package"]]["version"] if out else None
        except (KeyError, ValueError):
            return None
    if kind == "command":
        out = run(inst["cmd"])
        if not out:
            return None
        m = re.search(inst.get("regex", r"(\d+(?:\.\d+)+)"), out)
        return m.group(1) if m else out.splitlines()[0]
    raise ValueError(f"unknown installed.type {kind!r}")


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--config", required=True)
    ap.add_argument("--json", action="store_true", help="emit JSON instead of a Markdown table")
    ap.add_argument("--no-installed", action="store_true", help="skip host probes (upstream only)")
    a = ap.parse_args(argv)
    with open(a.config, encoding="utf-8") as fh:
        cfg = json.load(fh)

    rows = []
    for comp in cfg["components"]:
        row = {"name": comp["name"], "installed": None, "latest": None, "status": "unknown",
               "notes": comp.get("notes", ""), "url": None}
        try:
            row["latest"], row["url"] = latest_version(comp["latest"])
        except Exception as e:  # network, rate limit, schema
            row["notes"] = f"latest lookup failed: {e.__class__.__name__}"
        if not a.no_installed and comp.get("installed"):
            try:
                row["installed"] = installed_version(comp["installed"])
            except Exception as e:
                row["notes"] = f"installed lookup failed: {e.__class__.__name__}"
        row["status"] = "manual" if comp["latest"].get("type") == "manual" else compare(row["installed"], row["latest"])
        rows.append(row)

    if a.json:
        print(json.dumps(rows, indent=2))
    else:
        print("| Component | Installed | Latest | Status | Notes |")
        print("|---|---|---|---|---|")
        for r in rows:
            latest = f"[{r['latest']}]({r['url']})" if r["latest"] and r["url"] else (r["latest"] or "?")
            print(f"| {r['name']} | {r['installed'] or '?'} | {latest} | {r['status']} | {r['notes']} |")
    return 10 if any(r["status"] == "update" for r in rows) else 0


if __name__ == "__main__":
    sys.exit(main())
