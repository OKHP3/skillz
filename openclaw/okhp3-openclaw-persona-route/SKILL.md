---
name: okhp3-openclaw-persona-route
description: Decide which OpenClaw agent persona should own a request (Larry, AskJamie, MurderBird, or Glee-fully by default), then package the work as a [HANDOFF] packet. Use when a request arrives at the default agent without a named persona, when work must move between agents, or when asked "who should handle this". Routes only; never executes the routed task.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: openclaw
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Classify a request, pick the owning agent persona, and emit a handoff packet."
  out_of_scope: "Executing the routed task, changing agent bindings or config, and cross-agent messaging that the owner has not enabled."
  openclaw:
    requires: {}
---

# Persona Route

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

The router stays narrow and boring. The personas stay expressive.

This skill answers one question: which agent should own this, and what do
they need to start? It does not do the work.

## Scope

Use on the default or front-door agent (Larry, in the reference deployment)
when the owner hasn't picked a persona, or when a task needs to cross
agents mid-pipeline. Channel routing still wins: if the owner messaged a
specific persona directly, that persona owns the request.

## Default roster

Override from the deployment's workspace `AGENTS.md` when it defines its own.

| Persona | Owns | Route when |
|---|---|---|
| Larry | General Q&A, research, errands, file and repo work, dispatch | Default; anything not clearly owned below |
| AskJamie | Correspondence drafted in the owner's voice | Email, DM, or reply the owner will send as themselves |
| MurderBird | Long-form thesis, structure, and argument red team | Articles, essays, position pieces, "does this hold" |
| Glee-fully | WWGD reception and warmth check | "How will this land", sensitive or relational drafts before sending |

Multi-stage pipelines:

- **Email:** Larry (context) to AskJamie (draft) to Glee-fully (WWGD, if sensitive) to owner.
- **Article:** Larry (research) to MurderBird (thesis and audit) to voice pass to Glee-fully (WWGD) to owner.

## Procedure

1. Check for an explicit persona in the request or channel. If present, stop
   and let that persona own it.
2. Classify the request: correspondence, long-form argument, reception
   check, or general.
3. Pick the owner from the roster. If two fit, pick the one that owns the
   first pipeline stage.
4. If the request is ambiguous after one pass, ask the owner one question.
5. Build the handoff packet with only the context the next agent needs.
   Exclude secrets, credentials, and unrelated private content.
6. Deliver:
   - If the runtime exposes an agent-to-agent messaging tool and the owner
     has enabled it for this deployment, send the packet there and report the
     tool's confirmation.
   - Otherwise return the packet in chat with the target persona named, so
     the owner can forward it. Say plainly that cross-agent delivery is not
     configured.
7. Verify before returning: the packet names one owner, one task, and any
   open questions; nothing in it was invented.

## Handoff packet

```text
[HANDOFF]
to: <persona>
from: <persona>
task: <one sentence>
context: <only what the next agent needs; links or file paths preferred>
result-so-far: <what is already done, or "none">
open-questions: <list, or "none">
return-to: <persona or owner>
```

## Rules

- Route, never execute. The owning persona does the work.
- Never change bindings, agent config, or tool policy from this skill.
- A persona boundary is also a trust boundary: never pass private mail
  content to a public-facing agent.
- Report routing reasons in one line so the owner can overrule it.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License. Free to use, fork, and adapt. A nod to the source is appreciated.
