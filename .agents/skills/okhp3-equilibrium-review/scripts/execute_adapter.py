"""Bounded execution helper for an explicitly supplied local adapter."""

from __future__ import annotations

import subprocess


def execute_adapter(argv: list[str], timeout_seconds: int) -> subprocess.CompletedProcess:
    """Run one caller-supplied argument vector without shell interpretation."""
    return subprocess.run(
        argv,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout_seconds,
        shell=False,
    )
