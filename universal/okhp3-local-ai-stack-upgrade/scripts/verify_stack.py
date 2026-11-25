#!/usr/bin/env python3
"""Post-change verification for a local AI stack: health, exposure, remote reach.

Three checks, all read-only:
  1. health   each service URL answers with an expected HTTP status
  2. exposure nothing listens on a watched port beyond the scopes you allow
              (loopback, tailnet 100.64.0.0/10), from lsof and docker port bindings
  3. remote   optional probes such as tailnet URLs published by Tailscale Serve

Usage:
  verify_stack.py --config stack.json [--skip-exposure] [--skip-remote]
Exit code: 0 = all pass, 1 = at least one failure.
"""
from __future__ import annotations

import argparse
import ipaddress
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request

TAILNET = ipaddress.ip_network("100.64.0.0/10")
TAILNET6 = ipaddress.ip_network("fd7a:115c:a1e0::/48")


def scope(addr: str) -> str:
    """Classify a bind address: loopback | tailnet | any | lan."""
    a = addr.strip("[]")
    if a in ("*", "0.0.0.0", "::", ""):
        return "any"
    try:
        ip = ipaddress.ip_address(a.split("%")[0])
    except ValueError:
        return "lan"
    if ip.is_loopback:
        return "loopback"
    if ip in TAILNET or (ip.version == 6 and ip in TAILNET6):
        return "tailnet"
    return "lan"


LSOF_RE = re.compile(r"^(\S+)\s+\d+\s.*?\s(\S+):(\d+)\s+\(LISTEN\)\s*$")


def parse_lsof(text: str) -> list[tuple[str, str, int]]:
    """lsof -nP -iTCP -sTCP:LISTEN output -> [(command, address, port)]."""
    out = []
    for line in text.splitlines()[1:]:
        m = LSOF_RE.match(line)
        if m:
            out.append((m.group(1), m.group(2), int(m.group(3))))
    return out


DOCKER_RE = re.compile(r"(?:(\[[^\]]*\]|[0-9.]+|::):)?(\d+)->\d+/tcp")


def parse_docker_ports(text: str) -> list[tuple[str, str, int]]:
    """docker ps --format '{{.Names}}\\t{{.Ports}}' -> [(container, address, host_port)]."""
    out = []
    for line in text.splitlines():
        if "\t" not in line:
            continue
        name, ports = line.split("\t", 1)
        for m in DOCKER_RE.finditer(ports):
            out.append((name, m.group(1) or "0.0.0.0", int(m.group(2))))
    return out


def http_status(url: str, timeout: int = 8) -> int:
    try:
        with urllib.request.urlopen(urllib.request.Request(url, method="GET"), timeout=timeout) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


def sh(cmd: list[str]) -> str | None:
    """Command stdout, or None when the command is missing, times out or fails."""
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    except (OSError, subprocess.TimeoutExpired):
        return None
    return r.stdout if r.returncode == 0 else None


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--config", required=True)
    ap.add_argument("--skip-exposure", action="store_true")
    ap.add_argument("--skip-remote", action="store_true")
    a = ap.parse_args(argv)
    with open(a.config, encoding="utf-8") as fh:
        cfg = json.load(fh)
    services = cfg.get("services", [])
    fails = 0

    print("## Health")
    for s in services:
        if not s.get("health"):
            continue
        code = http_status(s["health"])
        ok = code in s.get("expect", [200])
        fails += not ok
        print(f"- {'PASS' if ok else 'FAIL'} {s['name']}: HTTP {code or 'no answer'} (expect {s.get('expect', [200])})")

    if not a.skip_exposure:
        print("\n## Exposure")
        allowed = {s["port"]: set(s.get("allow", ["loopback"])) for s in services if s.get("port")}
        binds = []
        lsof_out = sh(["lsof", "-nP", "-iTCP", "-sTCP:LISTEN"])
        docker_out = sh(["docker", "ps", "--format", "{{.Names}}\t{{.Ports}}"])
        for label, out, parser in (("lsof", lsof_out, parse_lsof), ("docker ps", docker_out, parse_docker_ports)):
            if out is None:
                fails += 1
                print(f"- FAIL {label} could not run, so bind addresses are unverified (use --skip-exposure to skip deliberately)")
            else:
                binds += parser(out)
        seen = set()
        for who, addr, port in binds:
            if port not in allowed or (who, addr, port) in seen:
                continue
            seen.add((who, addr, port))
            sc = scope(addr)
            ok = sc in allowed[port]
            fails += not ok
            print(f"- {'PASS' if ok else 'FAIL'} :{port} {who} bound to {sc} (allowed: {', '.join(sorted(allowed[port]))})")
        if not seen:
            print("- no listeners found on watched ports (is lsof available and are services up?)")

    if not a.skip_remote and cfg.get("remote_probes"):
        print("\n## Remote")
        for p in cfg["remote_probes"]:
            code = http_status(p["url"])
            ok = code in p.get("expect", [200])
            fails += not ok
            print(f"- {'PASS' if ok else 'FAIL'} {p['name']}: HTTP {code or 'no answer'}")

    print(f"\nRESULT={'PASS' if fails == 0 else 'FAIL'} ({fails} failing check(s))")
    return 0 if fails == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
