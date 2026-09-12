---
name: okhp3-openclaw-capture-note
description: Append a quick capture note to a dated local inbox file, for later triage into Notion. Use when Jamie says "capture this", "note this down", or "remind me to look at this later" and it doesn't need an immediate answer.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "0.1.0"
  category: openclaw
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Append user-supplied notes to the local OpenClaw inbox."
  out_of_scope: "Task execution, automatic Notion publication, and external posting."
  openclaw:
    requires: {}
---

# Capture Note

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

A zero-friction way to get a thought out of Jamie's head and into a durable
place without derailing the current conversation into a full task.

## What to do

1. Take whatever Jamie just said as the note content, verbatim or lightly
   cleaned up for readability (fix obvious dictation errors, don't
   editorialize or expand on it).
2. Append it, with a timestamp, to
   `~/.openclaw/workspace/inbox/<YYYY-MM-DD>.md` (create the file with a
   `# Inbox -- <date>` heading if it doesn't exist yet for today).
3. Tag it with a best-guess one-word category in brackets at the start of
   the line if the content makes one obvious (`[okhp3]`, `[bfs]`, `[wgu]`,
   `[personal]`) -- skip the tag entirely rather than force one that doesn't
   fit.

## Output

One line back: confirm it's captured and where. Don't summarize it back at
length, don't ask follow-up questions, don't try to act on it now. The whole
point is this took less time than saying "remind me later."

## Relationship to the Notion capture loop

This is a local landing pad, not a replacement for the Notion
Inbox/Chat-Threads capture-loop database. Nothing here pushes to Notion
automatically. Triage from the dated inbox file into Notion stays a
separate, deliberate step Jamie or another tool in the Council of AIs does
later.

## What this skill never does

Never treats a captured note as a task to execute now. If what Jamie said
actually needs action right away, say so and ask whether he wants that
instead of a capture.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
