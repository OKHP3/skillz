"""Ephemeral Codex executor. Only a benchmark-specific stdio tool is configured."""
import datetime as dt
import hashlib
import json
import os
import re
import subprocess
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODEL = "gpt-6.2-sol"
FLAGS = ["--disable", "plugins", "--disable", "apps", "--disable", "memories",
         "--disable", "shell_tool", "--disable", "unified_exec", "--disable", "multi_agent",
         "--disable", "hooks", "--disable", "browser_use", "--enable", "skip_host_skill_discovery",
         "-c", "project_doc_max_bytes=0", "-c", 'web_search="disabled"',
         "-c", 'model_reasoning_effort="medium"', "-c", "suppress_unstable_features_warning=true"]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")

def execute(prompt, *, server=None, timeout=240):
    args = ["codex", "exec", "--ignore-user-config", "--skip-git-repo-check", "--ephemeral",
            "-C", "/var/empty", "-s", "read-only", "-m", MODEL, "--json", *FLAGS]
    if server:
        args += ["-c", 'mcp_servers.fixture.command="python3"', "-c", 'mcp_servers.fixture.default_tools_approval_mode="approve"', "-c",
                 "mcp_servers.fixture.args=" + json.dumps(["-B", str(HERE / "fixture_tool.py"), *server])]
    start = dt.datetime.now(dt.timezone.utc)
    proc = subprocess.run(args + ["-"], input=prompt, capture_output=True, text=True,
                          cwd="/var/empty", timeout=timeout)
    messages, activity, issues, usage = [], [], [], {}
    for line in proc.stdout.splitlines():
        if not line.startswith("{"):
            continue
        event = json.loads(line)
        item = event.get("item", {})
        if event.get("type") == "item.completed":
            if item.get("type") == "agent_message":
                messages.append(item["text"])
            elif item.get("type") == "mcp_tool_call" and item.get("server") == "fixture":
                activity.append(item.get("tool"))
            elif item.get("type") not in ("reasoning",):
                issues.append(item.get("type"))
        if event.get("type") == "turn.completed":
            usage = event["usage"]
    if not (proc.returncode == 0 and messages and usage) or issues:
        details = (proc.stderr + proc.stdout)[-1800:]
        raise RuntimeError(f"Unusable execution, exit {proc.returncode}, events {issues}. {details}")
    return messages[-1], dict(model_requested=MODEL, cli=subprocess.check_output(
        ["codex", "--version"], text=True).strip(), started_utc=start.isoformat(),
        elapsed_seconds=round((dt.datetime.now(dt.timezone.utc)-start).total_seconds(), 1),
        prompt_sha256=sha(prompt.encode()), activity=activity, usage=usage)

def parse_json(message):
    return json.loads(re.sub(r"^\s*```(?:json)?\s*|\s*```\s*$", "", message.strip()))

