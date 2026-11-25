#!/usr/bin/env python3
"""List and retire stopped rollback containers (NAME-prev) after a soak period.

Dry run by default: prints what it would remove. With --apply it removes each
rollback container older than --older-than days and then its image, but only
when no other container (running or stopped) still uses that image.

Usage:
  prune_rollbacks.py [--suffix -prev] [--older-than 7] [--apply]
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import subprocess
import sys


def docker(*args: str) -> str:
    r = subprocess.run(["docker", *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or f"docker {' '.join(args)} failed")
    return r.stdout


def parse_ts(s: str) -> dt.datetime | None:
    """Docker RFC3339 with nanoseconds -> aware datetime. Zero time -> None."""
    if not s or s.startswith("0001-"):
        return None
    s = s.rstrip("Z")
    if "." in s:
        head, frac = s.split(".", 1)
        s = f"{head}.{frac[:6]}"
    return dt.datetime.fromisoformat(s).replace(tzinfo=dt.timezone.utc)


def age_days(finished: str, created: str, now: dt.datetime) -> float:
    t = parse_ts(finished) or parse_ts(created)
    return (now - t).total_seconds() / 86400 if t else 0.0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--suffix", default="-prev")
    ap.add_argument("--older-than", type=float, default=7.0, help="days since the rollback was stopped")
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args(argv)
    now = dt.datetime.now(dt.timezone.utc)

    names = [n for n in docker("ps", "-a", "--format", "{{.Names}}").split() if n.endswith(a.suffix)]
    if not names:
        print("No rollback containers found."); return 0
    info = json.loads(docker("inspect", *names))
    rc = 0
    for c in info:
        name = c["Name"].lstrip("/")
        running = c["State"]["Running"]
        days = age_days(c["State"].get("FinishedAt", ""), c.get("Created", ""), now)
        img = c["Config"]["Image"]
        due = not running and days >= a.older_than
        verdict = "running, skip" if running else ("due" if due else f"keep ({a.older_than - days:.1f} days left)")
        print(f"- {name}  {img}  stopped {days:.1f} days  -> {verdict}")
        if not (due and a.apply):
            continue
        try:
            docker("rm", name)
            users = docker("ps", "-a", "-q", "--filter", f"ancestor={img}").split()
            if users:
                print(f"  removed container; image still used by {len(users)} container(s), kept")
            else:
                docker("rmi", img)
                print("  removed container and image")
        except RuntimeError as e:
            print(f"  FAILED: {e}"); rc = 1
    if not a.apply:
        print("\nDry run. Re-run with --apply to remove the containers marked due.")
    return rc


if __name__ == "__main__":
    sys.exit(main())
