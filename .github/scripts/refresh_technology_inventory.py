#!/usr/bin/env python3
"""Refresh externally sourced technology versions in the repository inventory.

The script sends only public package and runtime metadata requests. It never
uploads repository content and it updates only the generated section of
docs/TECHNOLOGY-INVENTORY.md plus the CI runtime version files.
"""

from __future__ import annotations

import json
import re
import gzip
from datetime import UTC, datetime
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "docs" / "TECHNOLOGY-INVENTORY.md"
START_MARKER = "<!-- technology-latest:start -->"
END_MARKER = "<!-- technology-latest:end -->"
USER_AGENT = "OKHP3-skillz-technology-inventory/1.0"


def get_json(url: str) -> object:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Encoding": "gzip, identity"})
    with urlopen(request, timeout=30) as response:  # nosec B310: fixed HTTPS sources
        body = response.read()
        if response.headers.get("Content-Encoding") == "gzip":
            body = gzip.decompress(body)
        return json.loads(body.decode("utf-8"))


def get_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept-Encoding": "gzip, identity"})
    with urlopen(request, timeout=30) as response:  # nosec B310: fixed HTTPS sources
        body = response.read()
        if response.headers.get("Content-Encoding") == "gzip":
            body = gzip.decompress(body)
        return body.decode("utf-8")


def pypi_version(package: str) -> str:
    data = get_json(f"https://pypi.org/pypi/{package}/json")
    return data["info"]["version"]


def npm_version(package: str) -> str:
    data = get_json(f"https://registry.npmjs.org/{package}/latest")
    return data["version"]


def node_versions() -> tuple[str, str]:
    releases = get_json("https://nodejs.org/dist/index.json")
    current = releases[0]["version"].removeprefix("v")
    lts = next(release["version"].removeprefix("v") for release in releases if release["lts"])
    return current, lts


def python_version() -> str:
    page = get_text("https://www.python.org/downloads/")
    match = re.search(r"Download Python ([0-9]+\.[0-9]+\.[0-9]+)", page)
    if not match:
        raise RuntimeError("Could not find the current stable Python version")
    return match.group(1)


def write_if_changed(path: Path, content: str) -> bool:
    if path.read_text(encoding="utf-8") == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True


def build_table(node_current: str, node_lts: str, python: str) -> str:
    observed = datetime.now(UTC).date().isoformat()
    rows = [
        ("Node.js", node_current, "latest stable Current release"),
        ("Node.js LTS", node_lts, "recommended tracked runtime"),
        ("Python", python, "latest stable release"),
        ("npm", npm_version("npm"), "npm registry latest tag"),
        ("Anthropic Python SDK", pypi_version("anthropic"), "PyPI latest release"),
        ("MCP Python SDK", pypi_version("mcp"), "PyPI latest release"),
        ("PyYAML", pypi_version("PyYAML"), "PyPI latest release"),
        ("Mermaid CLI", npm_version("@mermaid-js/mermaid-cli"), "npm latest tag"),
        ("TypeScript", npm_version("typescript"), "reference-only technology"),
        ("Vite", npm_version("vite"), "reference-only technology"),
        ("React", npm_version("react"), "reference-only technology"),
        ("Tailwind CSS", npm_version("tailwindcss"), "reference-only technology"),
        ("pnpm", npm_version("pnpm"), "template bootstrap tool"),
    ]
    table = [
        START_MARKER,
        f"Last checked: {observed} (UTC).",
        "",
        "| Technology | Latest stable | Basis |",
        "| --- | --- | --- |",
    ]
    table.extend(f"| {name} | {version} | {basis} |" for name, version, basis in rows)
    table.extend([END_MARKER, ""])
    return "\n".join(table)


def main() -> int:
    node_current, node_lts = node_versions()
    python = python_version()
    latest_section = build_table(node_current, node_lts, python)

    document = INVENTORY.read_text(encoding="utf-8")
    pattern = re.compile(f"{re.escape(START_MARKER)}.*?{re.escape(END_MARKER)}\\n", re.DOTALL)
    if not pattern.search(document):
        raise RuntimeError("Technology inventory markers are missing")

    changed = write_if_changed(INVENTORY, pattern.sub(latest_section, document))
    changed = write_if_changed(ROOT / ".github" / "node-version", f"{node_lts}\n") or changed
    changed = write_if_changed(ROOT / ".github" / "python-version", f"{python}\n") or changed
    print("Technology inventory updated." if changed else "Technology inventory is current.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
