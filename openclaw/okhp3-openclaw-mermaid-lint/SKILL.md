---
name: okhp3-openclaw-mermaid-lint
description: Check a Mermaid file against documented renderer gotchas before it goes into a repo or gets published. Use when asked to "check this diagram", "lint this mermaid file", or before committing a .mmd/.mermaid file.
metadata:
  openclaw:
    requires: {}
---

# Mermaid Lint

A pre-flight check against the renderer gotchas already documented in the
OKHP3 ReFolDec/mermaid-diagram-bpmn work, so a diagram doesn't get committed
or published only to break in Mermaid Enterprise or GitHub's renderer.

## Input

A path to a `.mmd`/`.mermaid` file, or a Mermaid code block pasted directly
in chat.

## What to check

Read the diagram text and flag, without guessing beyond what's written:

- Node IDs or edge labels containing unescaped special characters known to
  break specific renderers (parentheses, pipes, quotes inside labels without
  proper quoting).
- Subgraph or class-definition ordering issues that have previously caused
  silent render failures (declare classes before they're referenced).
- Direction/orientation directives that conflict between a parent and a
  subgraph.
- Anything that looks like it's relying on a renderer-specific feature
  without a fallback noted (call this out explicitly rather than silently
  passing it).
- Line length or node count that's grown past what's comfortable to render
  in a chat/README context (a soft flag, not a hard fail).

If OKHP3's `mermaid-diagram-bpmn` or `okhp3-mermaid-repair`/`okhp3-mermaid-core`
skills are reachable in the skillz repo, defer to whatever specific gotcha
list they document rather than re-deriving your own; read their `SKILL.md`
first if available.

## Output

A short pass/fail per check, not a rewritten diagram unless asked. If
everything's clean, say so in one line. If something's flagged, show the
exact line and what's wrong with it, not a vague "this might be an issue."

## What this skill never does

Never silently rewrites the diagram and calls it fixed. Show what's wrong;
let Jamie or a follow-up request make the edit.
