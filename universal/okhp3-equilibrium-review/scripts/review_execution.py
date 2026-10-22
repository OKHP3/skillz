"""Bounded adapter execution and initial concordance classification."""

from __future__ import annotations

import subprocess
import time
from pathlib import Path
from typing import Any, Dict, Optional, Sequence

from execute_adapter import execute_adapter
from review_support import ROLES, normalize_result, substitute


def run_role(role: str, command: Optional[Sequence[str]], prompt_path: Path, output_path: Path, artifact: Path, question: str, review_dir: Path, timeout_seconds: int, dry_run: bool) -> Dict[str, Any]:
    if dry_run or command is None:
        result = {"role": role, "status": "not-run", "returncode": None, "decision": "defer-for-evidence", "structured": False, "prompt_file": str(prompt_path), "output_file": str(output_path), "notes": "Prompt generated without an agent command."}
        output_path.write_text(json_text(result), encoding="utf-8")
        return result
    values = {"role": role, "prompt_file": str(prompt_path), "output_file": str(output_path), "artifact": str(artifact), "question": question, "review_dir": str(review_dir)}
    argv = substitute(command, values)
    started = time.monotonic()
    stderr_path = output_path.with_suffix(".stderr.txt")
    try:
        completed = execute_adapter(argv, timeout_seconds)
        output_path.write_text(completed.stdout, encoding="utf-8")
        stderr_path.write_text(completed.stderr, encoding="utf-8")
        status = "completed" if completed.returncode == 0 else "error"
        result = normalize_result(role, completed.stdout, status, completed.returncode)
        result.update({"prompt_file": str(prompt_path), "output_file": str(output_path), "stderr_file": str(stderr_path), "duration_seconds": round(time.monotonic() - started, 3)})
        return result
    except subprocess.TimeoutExpired as exc:
        output_path.write_text(exc.stdout or "", encoding="utf-8")
        stderr_path.write_text(exc.stderr or "", encoding="utf-8")
        return {"role": role, "status": "timeout", "returncode": None, "decision": "defer-for-evidence", "structured": False, "prompt_file": str(prompt_path), "output_file": str(output_path), "stderr_file": str(stderr_path), "duration_seconds": round(time.monotonic() - started, 3), "notes": f"Agent exceeded {timeout_seconds} seconds."}
    except OSError as exc:
        return {"role": role, "status": "error", "returncode": None, "decision": "defer-for-evidence", "structured": False, "prompt_file": str(prompt_path), "output_file": str(output_path), "duration_seconds": round(time.monotonic() - started, 3), "notes": f"Agent command could not start: {exc}"}


def json_text(value: Dict[str, Any]) -> str:
    import json
    return json.dumps(value, indent=2) + "\n"


def classify_concordance(results: Sequence[Dict[str, Any]]) -> str:
    if len(results) != len(ROLES) or any(item.get("status") != "completed" for item in results):
        return "unknown"
    decisions = [item.get("decision") for item in results]
    if any(decision in {"disagree", "defer-for-evidence"} for decision in decisions):
        return "material-disagreement"
    return "material-agreement" if len(set(decisions)) == 1 else "material-disagreement"
