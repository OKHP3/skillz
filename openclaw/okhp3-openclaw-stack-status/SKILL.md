---
name: okhp3-openclaw-stack-status
description: One-shot health report on the local AI stack -- Ollama, LM Studio, and the Docker-hosted Open WebUI/SearXNG/Qdrant containers. Use when asked "how's my local AI stack", "is Ollama running", "check Docker containers", or before loading a big model.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.1"
  category: openclaw
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Report local AI service and container health."
  out_of_scope: "Restarting, stopping, or reconfiguring services without an explicit request."
  openclaw:
    requires:
      bins: [curl, docker, jq]
---

# Stack Status

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

A single command that answers "is my local-first AI lab healthy right now,"
without opening five different apps.

## What to check

1. **Ollama**: `curl -s http://127.0.0.1:11434/api/ps` for currently loaded
   models (empty response array means idle, which is normal and good), and
   `curl -s http://127.0.0.1:11434/api/tags | jq -r '.models[].name'` for the
   full local model roster count. If the connection is refused, say plainly
   that Ollama isn't running or isn't listening on 11434, don't guess why.
2. **Docker containers**: `docker ps --format '{{.Names}}\t{{.Status}}\t{{.Image}}'`
   filtered to the expected local-AI containers (open-webui, searxng,
   qdrant). Flag any of the three that are expected but not running.
3. **Docker resource ceiling**: `docker system info --format '{{.MemTotal}}'`
   or equivalent, to confirm the VM's memory cap is still in place (should be
   a fixed number, not unbounded). This is a known guardrail from an earlier
   review; if it's gone, flag it.
4. **Optional host memory signal**: on macOS, if `vm_stat` is available,
   report compressed pages converted using its reported page size, not a
   hard-coded size. Free pages near zero alone do not establish pressure.
   On Windows, if PowerShell CIM is available, use
   `Get-CimInstance Win32_OperatingSystem` to report `FreePhysicalMemory`
   and `TotalVisibleMemorySize` (both KiB). These are capacity figures, not
   equivalent to macOS compression or proof of memory pressure. If neither
   probe is available, report memory status as unknown and continue the
   Ollama and Docker checks. Never gate this portable skill on `vm_stat`.

## Output

A compact status table: component, state, detail. End with one plain-English
verdict: "stack healthy" or a specific named problem plus the two or three
components involved. Don't pad a healthy result with reassurance; a one-line
"all clear" is the correct length when everything's fine.

## What this skill never does

Never restarts, stops, or reconfigures a container or the Ollama service.
Report, don't remediate, unless explicitly asked to fix something after
seeing the report.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
