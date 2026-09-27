---
name: okhp3-openclaw-research-packet
description: Run local-first web research on an OpenClaw agent and return a sourced research packet (findings, evidence tiers, conflicts, gaps) sized for handoff to a drafting or thesis skill. Use when asked to research, look up, or gather sources before an article, email, or decision. Uses the runtime's built-in search and fetch tools; no Frontier provider call.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.1"
  category: openclaw
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Search, fetch, cross-check, and package public sources into a handoff-ready research packet."
  out_of_scope: "Drafting the final artifact, citing unfetched sources, paid data services, and employer-internal sources."
  openclaw:
    requires: {}
---

# Research Packet

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Accuracy beats speed. Cheap tokens think broadly; expensive tokens act precisely.

This is the first stage of most pipelines: gather the facts once, carefully,
so every downstream agent drafts from the same verified packet.

## Scope

Use on any OpenClaw deployment with the built-in `web_search` and
`web_fetch` tools (in the reference lab, search routes through a local
SearXNG instance). Method authority for source quality is
`okhp3-source-backed-research`; claim tiers follow `okhp3-evidence-standard`.
This skill adds the local-first execution and the handoff packet format.

If search or fetch tools are unavailable, say so, list what could not be
checked, and return a packet limited to supplied material. Never fail
silently.

## Procedure

1. Restate the research question in one sentence and list the sub-questions
   the downstream task needs answered.
2. Run at least two searches with different phrasing per sub-question.
3. Open the best two or three results with `web_fetch`. Do not rely on
   snippets.
4. Prefer primary sources: official sites, vendor docs, standards bodies,
   original publishers.
5. Cross-check key numbers, dates, and names across two independent sources.
   When they disagree, keep both.
6. Record retrieval dates. Mark anything time-sensitive "as of <date>".
7. Classify each finding: confirmed, inferred, proposal, or unknown.
   Record what each finding applies to (population, task type, version, or
   date range) so downstream writers can't stretch it past its evidence.
8. Verify before returning: every finding cites a URL actually fetched this
   session; no statistic or quote appears without one.

## Output contract

```text
[RESEARCH PACKET]
question: <one sentence>
retrieved: <YYYY-MM-DD>
findings:
  - claim: <finding>
    tier: confirmed | inferred | proposal | unknown
    applies-to: <scope the source actually covers>
    source: <URL fetched>
conflicts:
  - <claim A (source) vs claim B (source); decisive next check>
gaps:
  - [VERIFY: <what could not be confirmed and how to check it>]
suggested-next: <skill or persona, e.g. okhp3-murderbird-thesis-forge>
```

Follow the packet with a short plain-language summary in chat.

## Handoff targets

| Downstream need | Send the packet to |
|---|---|
| Long-form article or essay | `okhp3-murderbird-thesis-forge` (MurderBird) |
| Correspondence that depends on facts | `okhp3-askjamie-email-draft` (AskJamie) |
| Short LinkedIn post angle | `okhp3-linkedin-angles` |
| Decision or recommendation | `okhp3-evidence-standard` review, then the owner |

When another agent owns the next stage, wrap the packet in the
`okhp3-openclaw-persona-route` handoff format.

## Rules

- Never invent a source, figure, quote, or date. "Couldn't verify" is a valid
  finding.
- Never cite a page that wasn't fetched.
- Exclude employer-internal and private sources; public sources only unless
  the owner supplies material directly.
- Report, don't draft. Stop at the packet.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License. Free to use, fork, and adapt. A nod to the source is appreciated.
