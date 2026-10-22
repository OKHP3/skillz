"""Bounded execution helper for an explicitly supplied local adapter."""

from __future__ import annotations

import subprocess
from typing import Sequence


def execute_adapter(argv: Sequence[str], timeout_seconds: int) -> subprocess.CompletedProcess[str]:
    """Run one caller-supplied argument vector without shell interpretation."""
    return subprocess.run(
        list(argv),
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout_seconds,
        shell=False,
    )
